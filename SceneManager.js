export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
    }
    
    init() {
        // 1. Criar cena
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
        
        // 2. Criar câmera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // 3. Criar renderizador
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 4. Configurar luzes
        this.setupLights();
        
        // 5. Criar terreno
        this.createTerrain();
        
        // 6. Configurar controles de câmera
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // 7. Configurar resize da janela
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLights() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direcional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
    }
    
    createTerrain() {
        // Terreno básico
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        
        // Adicionar variação de altura simples
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 2; // Altura Z
        }
        
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x3a7c3a,
            side: THREE.DoubleSide
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Adicionar algumas árvores simples
        for (let i = 0; i < 50; i++) {
            const tree = this.createTree();
            tree.position.set(
                Math.random() * 180 - 90,
                0,
                Math.random() * 180 - 90
            );
            this.scene.add(tree);
        }
    }
    
    createTree() {
        const group = new THREE.Group();
        
        // Tronco
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        
        // Copa
        const crownGeometry = new THREE.ConeGeometry(2, 4, 8);
        const crownMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 4;
        crown.castShadow = true;
        
        group.add(trunk);
        group.add(crown);
        
        return group;
    }
    
    addCharacter(mesh) {
        mesh.castShadow = true;
        this.scene.add(mesh);
    }
    
    removeCharacter(mesh) {
        this.scene.remove(mesh);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
