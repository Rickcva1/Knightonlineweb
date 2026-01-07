import { SceneManager } from '../renderer/SceneManager.js';
import { InputHandler } from './InputHandler.js';
import { CameraController } from './CameraController.js';
import { Player } from './Player.js';

export class Game {
    constructor(socket, playerData) {
        this.socket = socket;
        this.playerData = playerData;
        this.sceneManager = null;
        this.inputHandler = null;
        this.cameraController = null;
        this.player = null;
        this.otherPlayers = new Map();
        this.lastUpdate = 0;
        this.updateInterval = 1000 / 20; // 20 FPS para updates de rede
    }
    
    init() {
        // 1. Inicializar gerenciador de cena
        this.sceneManager = new SceneManager();
        this.sceneManager.init();
        
        // 2. Criar jogador local
        this.player = new Player(this.playerData);
        this.player.init();
        this.sceneManager.addCharacter(this.player.mesh);
        
        // 3. Configurar controles
        this.inputHandler = new InputHandler();
        this.inputHandler.init();
        
        // 4. Configurar câmera
        this.cameraController = new CameraController(
            this.sceneManager.camera,
            this.player.mesh
        );
        
        // 5. Configurar listeners de rede
        this.setupNetworkListeners();
        
        // 6. Iniciar game loop
        this.gameLoop();
    }
    
    setupNetworkListeners() {
        // Receber atualizações de outros jogadores
        this.socket.on('playerJoined', (playerData) => {
            this.addOtherPlayer(playerData);
        });
        
        this.socket.on('playerLeft', (playerId) => {
            this.removeOtherPlayer(playerId);
        });
        
        this.socket.on('playerMoved', (data) => {
            this.updateOtherPlayer(data);
        });
    }
    
    addOtherPlayer(playerData) {
        const player = new Player(playerData);
        player.init();
        player.mesh.position.set(
            playerData.position.x,
            playerData.position.y,
            playerData.position.z
        );
        
        // Cor diferente para outros jogadores
        player.mesh.material.color.setHex(0xff0000);
        
        this.otherPlayers.set(playerData.id, player);
        this.sceneManager.addCharacter(player.mesh);
    }
    
    removeOtherPlayer(playerId) {
        const player = this.otherPlayers.get(playerId);
        if (player) {
            this.sceneManager.removeCharacter(player.mesh);
            this.otherPlayers.delete(playerId);
        }
    }
    
    updateOtherPlayer(data) {
        const player = this.otherPlayers.get(data.id);
        if (player) {
            player.updatePosition(data.position);
        }
    }
    
    updateWorldState(worldState) {
        // Atualizar outros jogadores do estado do mundo
        worldState.players.forEach(playerData => {
            if (playerData.id !== this.socket.id) {
                if (!this.otherPlayers.has(playerData.id)) {
                    this.addOtherPlayer(playerData);
                } else {
                    this.updateOtherPlayer(playerData);
                }
            }
        });
    }
    
    gameLoop(timestamp = 0) {
        requestAnimationFrame((ts) => this.gameLoop(ts));
        
        const deltaTime = timestamp - this.lastUpdate;
        
        if (deltaTime > this.updateInterval) {
            this.lastUpdate = timestamp;
            
            // Atualizar input
            const movement = this.inputHandler.getMovement();
            
            if (movement.x !== 0 || movement.z !== 0) {
                // Mover jogador local
                this.player.move(movement);
                
                // Enviar movimento para servidor
                this.socket.emit('playerMove', {
                    position: {
                        x: this.player.mesh.position.x,
                        y: this.player.mesh.position.y,
                        z: this.player.mesh.position.z
                    },
                    rotation: this.player.mesh.rotation.y
                });
            }
            
            // Atualizar câmera
            this.cameraController.update();
            
            // Atualizar interface
            this.updateUI();
        }
        
        // Renderizar
        this.sceneManager.render();
    }
    
    updateUI() {
        document.getElementById('hpValue').textContent = this.player.stats.hp;
        document.getElementById('mpValue').textContent = this.player.stats.mp;
        document.getElementById('levelValue').textContent = this.player.level;
        document.getElementById('expValue').textContent = this.player.exp;
    }
}
