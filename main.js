import { Game } from './game/Game.js';

class KnightOnlineWeb {
    constructor() {
        this.game = null;
        this.socket = null;
        this.playerData = null;
        
        this.initLogin();
    }
    
    initLogin() {
        const loginBtn = document.getElementById('loginBtn');
        const classOptions = document.querySelectorAll('.class-option');
        
        // Seleção de classe
        classOptions.forEach(option => {
            option.addEventListener('click', () => {
                classOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Primeira classe selecionada por padrão
        classOptions[0].classList.add('selected');
        
        // Login
        loginBtn.addEventListener('click', () => {
            const username = document.getElementById('username').value;
            const selectedClass = document.querySelector('.class-option.selected').dataset.class;
            
            if (!username.trim()) {
                alert('Digite um nome para o personagem!');
                return;
            }
            
            this.playerData = {
                name: username,
                class: selectedClass,
                level: 1,
                exp: 0,
                position: { x: 0, y: 0, z: 0 }
            };
            
            this.connectToServer();
        });
    }
    
    connectToServer() {
        // Conectar ao servidor WebSocket automaticamente ao host atual (suporta HTTP/HTTPS)
        this.socket = io({
            transports: ['websocket', 'polling']
        });
        
        this.socket.on('connect', () => {
            console.log('Conectado ao servidor!');
            
            // Enviar dados do jogador
            this.socket.emit('playerLogin', this.playerData);
            
            // Iniciar o jogo
            this.startGame();
        });
        
        this.socket.on('worldState', (data) => {
            if (this.game) {
                this.game.updateWorldState(data);
            }
        });
        
        this.socket.on('playerCount', (count) => {
            document.getElementById('playerCount').textContent = 
                `Jogadores Online: ${count}`;
        });
    }
    
    startGame() {
        // Esconder tela de login
        document.getElementById('loginScreen').style.display = 'none';
        
        // Inicializar o jogo
        this.game = new Game(this.socket, this.playerData);
        this.game.init();
    }
}

// Iniciar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new KnightOnlineWeb();
});
