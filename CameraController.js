export class CameraController {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target;
        this.distance = 10;
        this.height = 5;
        this.angle = 0;
    }
    
    update() {
        // Seguir o jogador com câmera em terceira pessoa
        const targetPosition = this.target.position.clone();
        
        // Calcular posição da câmera
        const offset = new THREE.Vector3(
            Math.sin(this.angle) * this.distance,
            this.height,
            Math.cos(this.angle) * this.distance
        );
        
        this.camera.position.copy(targetPosition).add(offset);
        this.camera.lookAt(targetPosition);
        
        // Ajustar ângulo baseado no movimento do mouse
        // (implementação básica)
    }
}
