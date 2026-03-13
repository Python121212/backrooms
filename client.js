// --- 1. 初期設定 ---
const socket = io("http://localhost:3000");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e68c);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// --- 2. 空間構築 (Level 0) ---
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ color: 0x8b8559 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- 3. 同期ロジック ---
const otherPlayers = {};
socket.on('updatePlayers', (players) => {
    Object.keys(players).forEach((id) => {
        if (id === socket.id) return;
        if (!otherPlayers[id]) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
            otherPlayers[id] = mesh;
            scene.add(mesh);
        }
        otherPlayers[id].position.set(players[id].x, players[id].y, players[id].z);
    });
});

// --- 4. 移動操作 ---
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function update() {
    const speed = 0.2;
    if (keys['w']) camera.position.z -= speed;
    if (keys['s']) camera.position.z += speed;
    if (keys['a']) camera.position.x -= speed;
    if (keys['d']) camera.position.x += speed;

    // サーバーへ位置を送信
    socket.emit('playerMove', { 
        x: camera.position.x, 
        y: camera.position.y, 
        z: camera.position.z 
    });
}

// --- 5. メインループ ---
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}
animate();
