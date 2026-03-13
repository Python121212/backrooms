const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

// 接続中の全プレイヤー情報を保持
const players = {};

io.on('connection', (socket) => {
  console.log('プレイヤーが入室しました:', socket.id);

  // 新規プレイヤーの初期化
  players[socket.id] = { x: 0, y: 0, z: 0, rotation: 0 };

  // プレイヤーが移動した際のデータ受信
  socket.on('playerMove', (data) => {
    if (players[socket.id]) {
      players[socket.id] = data; // 位置と回転情報を更新
    }
    // 全プレイヤーに現在の状態を配信
    io.emit('updatePlayers', players);
  });

  // 切断時の処理
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('updatePlayers', players);
    console.log('プレイヤーが退出しました:', socket.id);
  });
});

http.listen(3000, () => {
  console.log('サーバーがポート3000で起動しました');
});
