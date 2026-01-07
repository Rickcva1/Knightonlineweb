import { CharacterClasses } from './CharacterClasses.js';

export class Player {
    constructor(data) {
        this.id = data.id || Math.random().toString(36).substr(2, 9);
        this.name = data.name;
        this.class = data.class;
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.position = data.position || { x: 0, y: 0, z: 0 };
        
        // Stats baseados na classe
        this.stats = CharacterClasses.getStats(this.class, this.level);
        
        // Objeto Three.js
        this.mesh = null;
    }
    
    init() {
        // Criar mesh baseado na classe
        const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const color = this.getClassColor();
        const material = new THREE.MeshLambertMaterial({ color });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        // Nome acima do personagem
        this.createNameTag();
    }
    
    getClassColor() {
        const colors = {
            warrior: 0x8B0000,    // Vermelho escuro
            rogue: 0x2F4F4F,      // Cinza escuro
            mage: 0x4B0082,       // Indigo
            priest: 0xFFD700      // Dourado
        };
        return colors[this.class] || 0xFFFFFF;
    }
    
    createNameTag() {
        // Implementar tag de nome com CSS2DRenderer ou sprite
        // Para MVP, vamos apenas logar
        console.log(`Personagem ${this.name} (${this.class}) criado`);
    }
    
    move(direction) {
        const speed = 0.1;
        
        this.mesh.position.x += direction.x * speed;
        this.mesh.position.z += direction.z * speed;
        
        // Rotacionar na direção do movimento
        if (direction.x !== 0 || direction.z !== 0) {
            this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
        }
    }
    
    updatePosition(position) {
        // Interpolação suave para outros jogadores
        this.mesh.position.lerp(
            new THREE.Vector3(position.x, position.y, position.z),
            0.2
        );
    }
}
