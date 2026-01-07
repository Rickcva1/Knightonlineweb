export class InputHandler {
    constructor() {
        this.keys = {};
        this.movement = { x: 0, z: 0 };
        this.mouse = { x: 0, y: 0 };
    }
    
    init() {
        // Controles de teclado
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Controles de mouse
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Bloquear pointer em tela cheia
        document.addEventListener('click', () => {
            if (document.pointerLockElement !== document.body) {
                document.body.requestPointerLock();
            }
        });
    }
    
    onKeyDown(e) {
        this.keys[e.code] = true;
        this.updateMovement();
    }
    
    onKeyUp(e) {
        this.keys[e.code] = false;
        this.updateMovement();
    }
    
    onMouseMove(e) {
        if (document.pointerLockElement === document.body) {
            this.mouse.x += e.movementX * 0.002;
            this.mouse.y += e.movementY * 0.002;
        }
    }
    
    updateMovement() {
        this.movement.x = 0;
        this.movement.z = 0;
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) this.movement.z -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) this.movement.z += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.movement.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) this.movement.x += 1;
        
        // Normalizar movimento diagonal
        if (this.movement.x !== 0 && this.movement.z !== 0) {
            const length = Math.sqrt(
                this.movement.x * this.movement.x + 
                this.movement.z * this.movement.z
            );
            this.movement.x /= length;
            this.movement.z /= length;
        }
    }
    
    getMovement() {
        return { ...this.movement };
    }
    
    getMouse() {
        return { ...this.mouse };
    }
}
