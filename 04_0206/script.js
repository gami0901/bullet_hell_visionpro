/* ---- 変数 ---- */
let isGameActive = false; // ゲームの状態を管理する変数

let isDragging = false; // ドラッグの管理が必要らしい
let lastX = 0; // マウスカーソルの位置の取得。Vision Proでちゃんと動くのかしら？笑
let currentX = 0; // 同様にマウスカーソルの位置の取得。Vision Proでちゃんと動くのかしら？笑

let bullets = []; //弾丸を収める場所
let circles = []; //照射範囲を収める場所
let animationFrameId = null; //アニメーション管理

const gameArea = document.getElementById('game-area'); //ゲームエリアの取得
const gameAreaRect = gameArea.getBoundingClientRect(); //ゲームエリアのサイズなどを収める

//const layArea = document.getElementById('game-overlay'); //オーバーレイエリアの取得
//const layAreaRect = layArea.getBoundingClientRect(); //オーバーレイエリアのサイズなどを収める

const mask = document.querySelector('svg #circle-hole'); //オーバーレイのsvgを更新する
const lay_radius = 100; // svgのマスクサイズ
const shine_radius = 30; // 照射範囲の半径


/* ---- セットアップ ---- */

// ゲームをリセットする関数。プレイヤーキャラクターを初期位置に配置し全ての敵オブジェクトを削除する
function resetGame() {

  // ボタン関連
  isGameActive = false;
  const startButton = document.getElementById('start-button');
  startButton.textContent = isGameActive ? 'Game Finish' : 'Game Start';

  //各種消去
  bullets = bullets.filter(bullet => {
    bullet.remove();
    return false;
  });

}

// 画面のロード
window.onload = function startGame(){
   // ボタン関連
   isGameActive = false;
   const startButton = document.getElementById('start-button');
   startButton.textContent = isGameActive ? 'Game Finish' : 'Game Start';
 
 
   // ゲームエリアの中央にプレイヤーキャラクターを配置
   const playerCharacter = document.getElementById('player-character');
 
   playerCharacter.style.left = `${(gameArea.clientWidth - 60) / 2}px`; // X座標
   playerCharacter.style.top = `${gameArea.clientHeight - 61}px`; // Y座標
};


/* ---- ゲームスタート ---- */
// ゲームスタートボタンおよび終了ボタン
function toggleGameStatus() {
  //ゲーム開始時
  if (!isGameActive) {
    // ボタンの管理
    isGameActive = !isGameActive;
    const startButton = document.getElementById('start-button');
    startButton.textContent = isGameActive ? 'Game Finish' : 'Game Start';  

    // テスト用。ゲームエリアの中心に弾を設定
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');

    bullet.style.left = `${gameAreaRect.width / 2 - 15}px`; // 横の中心
    bullet.style.top = `${gameAreaRect.height / 2 - 15}px`; // 縦の中心

    gameArea.appendChild(bullet); // 弾を画面に配置
    bullets.push(bullet); //弾を配列に追加
    animateBullet(); // アニメーション開始

  } else {
    //ゲーム終了時
    resetGame();
  }
}


// 弾丸の動き。テスト用
function animateBullet() {
  bullets.forEach(bullet => {
    // 現在の位置を更新
    let currentTop = parseInt(bullet.style.top);
    currentTop += 2; // 下に動く速度
    bullet.style.top = `${currentTop}px`;
  
    // 衝突判定。ライフは1
    if (isColliding(document.getElementById('player-character'), bullet)) {
      cancelAnimationFrame(animationFrameId);

      resetGame();
    }
  });

  // 画面外の弾を消去
  bullets = bullets.filter(bullet => {
    if (parseInt(bullet.style.top) > gameAreaRect.height) {
      bullet.remove();
      return false;
    }
    return true;
  });

  // 弾が存在しなくなったら、アニメーションを止める
  if (bullets.length === 0) {
    cancelAnimationFrame(animationFrameId);
  } else animationFrameId = requestAnimationFrame(animateBullet);
}


// 衝突判定のロジック
function isColliding(circle1, circle2) {
  const circle1Rect = circle1.getBoundingClientRect();
  const circle2Rect = circle2.getBoundingClientRect();

  // 円の中心座標
  const circle1X = circle1Rect.left + circle1.offsetWidth / 2;
  const circle1Y = circle1Rect.top + circle1.offsetHeight / 2;
  const circle2X = circle2Rect.left + circle2.offsetWidth / 2;
  const circle2Y = circle2Rect.top + circle2.offsetHeight / 2;

  // 両円の中心間の距離
  const distanceX = circle1X - circle2X;
  const distanceY = circle1Y - circle2Y;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // 衝突判定（半径の合計はキャラクター30px + 弾15px）
  return distance <= (30 + 15);
}


/* ---- 照射範囲の反映 および 移動情報の取得---- */

function onGameAreaClick(event) {  
  /* ---- 照射範囲の反映 ---- */

  // 円要素を作成
  const circle = document.createElement('div');
  circle.classList.add('circle');

  // 円の位置を計算（クリックされた位置から左上に半径分オフセット）
  const circleX = event.clientX - gameAreaRect.left - shine_radius;
  const circleY = event.clientY - gameAreaRect.top - shine_radius;
  
  circle.style.left = `${circleX}px`;
  circle.style.top = `${circleY}px`;

  // ゲームエリアに円を追加
  this.appendChild(circle);
  circles.push(circle);

  // 2秒後に円を削除
  setTimeout(() => {
    circle.remove();
  }, 2000);

  /* ---- svgの更新 ---- */
  const layCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const layX = event.clientX - gameAreaRect.left;
  const layY = event.clientY - gameAreaRect.top;
  layCircle.setAttribute(`cx`, layX);
  layCircle.setAttribute(`cy`, layY);
  layCircle.setAttribute(`r`, lay_radius);
  layCircle.setAttribute(`fill`, `black`);

  mask.appendChild(layCircle);
  setTimeout(() => {
    layCircle.remove();
  }, 500);


  /* ---- ドラッグのためのフラグおよびアニメーション関数の開始 ---- */
  isDragging = true;
  lastX = event.clientX;
  currentX = event.clientX;
  event.preventDefault();
  requestAnimationFrame(updateDrag);

}

/* ---- マウスの移動量取得とキャラクターへの反映のための関数 ---- */
function updateDrag() {
  if (!isDragging) return;
  // 現在のマウス位置と前のフレームのマウス位置との差を計算
  const dx = currentX - lastX;

  // キャラクターの位置を更新
  const playerCharacter = document.getElementById('player-character');
  const currentLeft = playerCharacter.offsetLeft;
  let newLeft = currentLeft + dx;
  const radius = 64;

  newLeft = Math.max(0, Math.min(newLeft, gameAreaRect.width - radius));

  playerCharacter.style.left = `${newLeft}px`;

  // 現在のマウス位置を更新
  lastX = currentX;
  requestAnimationFrame(updateDrag);
}


/* ---- クリックやドラッグなどの、各種イベントの設定 ---- */
document.getElementById('toggle-overlay-button').addEventListener('click', function() {
  const overlay = document.getElementById('game-overlay');
  const button = this;

  if (overlay.style.display === 'none' || overlay.style.display === '') {
      overlay.style.display = 'block'; // オーバーレイを表示
      button.textContent = 'Show';
  } else {
      overlay.style.display = 'none'; // オーバーレイを非表示
      button.textContent = "Hide";
  }
});

document.getElementById('start-button').addEventListener('click', toggleGameStatus);

document.getElementById('game-area').addEventListener('mousedown', onGameAreaClick);
document.getElementById('game-area').addEventListener('touchstart', onGameAreaClick);


document.addEventListener('mousemove', function(event) {
  if (!event.target.closest('#game-area')) {
    // gameArea外での操作の場合は、ページのスクロールを防止
    event.preventDefault();
  }
  if (isDragging) {
    currentX = event.clientX;
  }
}, { passive: false});

document.addEventListener('touchmove', function(event) {
  if (!event.target.closest('#game-area')) {
    // gameArea外での操作の場合は、ページのスクロールを防止
    event.preventDefault();
  }
  if (isDragging) {
    currentX = event.clientX;
  }
}, { passive: false});


document.addEventListener('mouseup', function() {
  isDragging = false;
});

document.addEventListener('touchend', function() {
  isDragging = false;
});

