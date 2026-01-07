const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

class GameServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true
            },
            allowEIO3: true
        });
        
        this.players = new Map();
        this.worldState = {
            players: [],
            monsters: [],
            timestamp: Date.now()
        };
        
        this.setupMiddleware();
        this.setupSocketHandlers();
    }
    
    setupMiddleware() {
        // Servir arquivos estáticos do cliente
        this.app.use(express.static(path.join(__dirname, '../client')));
        
        // Rota principal
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/index.html'));
        });
    }
    
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Novo jogador conectado: ${socket.id}`);
            
            // Login do jogador
            socket.on('playerLogin', (playerData) => {
                this.handlePlayerLogin(socket, playerData);
            });
            
            // Movimento do jogador
            socket.on('playerMove', (movementData) => {
                this.handlePlayerMove(socket.id, movementData);
            });
            
            // Desconexão
            socket.on('disconnect', () => {
                this.handlePlayerDisconnect(socket.id);
            });
        });
        
        // Atualizar estado do mundo periodicamente
        setInterval(() => this.broadcastWorldState(), 1000 / 20); // 20 FPS
    }
    
    handlePlayerLogin(socket, playerData) {
        const player = {
            id: socket.id,
            name: playerData.name,
            class: playerData.class,
            level: playerData.level,
            exp: playerData.exp,
            position: {
                x: Math.random() * 20 - 10, // Posição inicial aleatória
                y: 0,
                z: Math.random() * 20 - 10
            },
            rotation: 0,
            stats: this.getBaseStats(playerData.class)
        };
        
        // Adicionar ao mapa de jogadores
        this.players.set(socket.id, player);
        
        // Enviar estado inicial para o jogador
        socket.emit('worldState', {
            players: Array.from(this.players.values()),
            timestamp: Date.now()
        });
        
        // Notificar outros jogadores
        socket.broadcast.emit('playerJoined', player);
        
        // Atualizar contador
        this.broadcastPlayerCount();
    }
    
    handlePlayerMove(playerId, movementData) {
        const player = this.players.get(playerId);
        if (player) {
            player.position = movementData.position;
            player.rotation = movementData.rotation;
            
            // Broadcast para outros jogadores
            this.io.emit('playerMoved', {
                id: playerId,
                position: player.position,
                rotation: player.rotation
            });
        }
    }
    
    handlePlayerDisconnect(playerId) {
        if (this.players.has(playerId)) {
            this.players.delete(playerId);
            
            // Notificar outros jogadores
            this.io.emit('playerLeft', playerId);
            
            // Atualizar contador
            this.broadcastPlayerCount();
            
            console.log(`Jogador desconectado: ${playerId}`);
        }
    }
    
    getBaseStats(className) {
        const baseStats = {
            warrior: { hp: 150, mp: 50, attack: 15, defense: 20 },
            rogue: { hp: 100, mp: 80, attack: 20, defense: 10 },
            mage: { hp: 80, mp: 150, attack: 25, defense: 5 },
            priest: { hp: 120, mp: 120, attack: 10, defense: 15 }
        };
        
        return baseStats[className] || baseStats.warrior;
    }
    
    broadcastWorldState() {
        this.worldState.players = Array.from(this.players.values());
        this.worldState.timestamp = Date.now();
        
        this.io.emit('worldState', this.worldState);
    }
    
    broadcastPlayerCount() {
        this.io.emit('playerCount', this.players.size);
    }
    
    start(port = 3000) {
        const finalPort = process.env.PORT || port;
        this.server.listen(finalPort, '0.0.0.0', () => {
            console.log(`Servidor rodando na porta ${finalPort}`);
        });
    }
}

// Iniciar servidor
const gameServer = new GameServer();
gameServer.start(3000);
