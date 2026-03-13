// サーバーへの接続
const socket = io("http://localhost:3000"); // サーバーURLに合わせて変更

// 1. シーンの準備
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// 床の設置
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ color: 0x8b8559 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 2. プレイヤー情報の管理
const otherPlayers = {}; // 他プレイヤーのモデルを格納

// サーバーから他プレイヤーの位置情報を受け取る
socket.on('updatePlayers', (players) => {
    Object.keys(players).forEach((id) => {
        if (id === socket.id) return; // 自分はスキップ

        if (!otherPlayers[id]) {
            // まだ画面にいないプレイヤーならモデルを追加
            const geometry = new THREE.BoxGeometry(1, 2, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            otherPlayers[id] = new THREE.Mesh(geometry, material);
            scene.add(otherPlayers[id]);
        }
        // 位置を更新
        otherPlayers[id].position.set(players[id].x, players[id].y, players[id].z);
    });
});

// 3. 自分の動きを送信（移動ロジックと連携）
function sendMovement(x, y, z) {
    socket.emit('playerMove', { x, y, z });
}

// レンダリングループ
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
