/* ---- 変数 ---- */
let isGameActive = false; // ゲームの状態を管理する変数

let isDragging = false; // ドラッグの管理が必要らしい
let lastX = 0; // マウスカーソルの位置の取得。Vision Proでちゃんと動くのかしら？笑
let currentX = 0; // 同様にマウスカーソルの位置の取得。Vision Proでちゃんと動くのかしら？笑

let enemy_01; //一番左の敵
let enemyAnimation; // enemy_01のアニメーションを参照する変数
let movementTimeout; // 移動後の停止を制御するsetTimeoutを参照する変数
let shootInterval = null; // 弾のアニメーション

let bullets = []; //弾丸を収める場所
let animationFrameId = null; //アニメーション管理

const gameArea = document.getElementById('game-area'); //ゲームエリアの取得
const gameAreaRect = gameArea.getBoundingClientRect(); //ゲームエリアのサイズなどを収める

const layArea = document.getElementById('game-overlay'); //オーバーレイエリアの取得
const layAreaRect = layArea.getBoundingClientRect(); //オーバーレイエリアのサイズなどを収める

const shine_radius = 125; // 照射範囲の半径
const shine_time = 3000; // 照射時間

let startTime, endTime, gameTimeInterval; // ゲーム時間
const gameTimeDisplay = document.getElementById('game-time'); // ゲームの時間


// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
/* ---- セットアップ ---- */

// ゲームをリセットする関数。プレイヤーキャラクターを初期位置に配置し全ての敵オブジェクトを削除する
function resetGame() {

  // ボタン関連
  isGameActive = false;
  const startButton = document.getElementById('start-button');
  startButton.textContent = isGameActive ? 'Game Finish' : 'Game Start';

  // 時間関連
  clearInterval(gameTimeInterval); // 経過時間更新を停止
  endTime = new Date(); // 終了時間を記録
  gameTimeDisplay.textContent = `Time: ${((endTime - startTime) / 1000).toFixed(1)}s`; // 最終経過時間を表示

  //各種消去
  enemy_01.remove();

  // キャラクター関連
  if (enemyAnimation) {
    enemyAnimation.cancel();
  }

  if (movementTimeout) {
    clearTimeout(movementTimeout);
  }

  clearInterval(shootInterval);

  // 敵キャラクターの位置をリセット
  enemy_01.style.left = '-180px';

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
   
   // マスクを正常動作させるために必要
   refresh();

};


// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
/* ---- ゲームスタート ---- */
// ゲームスタートボタンおよび終了ボタン
function toggleGameStatus() {
  //ゲーム開始時
  if (!isGameActive) {
    // ボタンの管理
    isGameActive = !isGameActive;
    const startButton = document.getElementById('start-button');
    startButton.textContent = isGameActive ? 'Game Finish' : 'Game Start';  

    // テスト用。ゲームエリアの少し外に弾を設定
    enemy_01 = document.createElement('div');
    enemy_01.classList.add('enemy');

    enemy_01.style.left = `${-180}px`; // 横の中心
    enemy_01.style.top = `${gameAreaRect.height / 2 - 30}px`; // 縦の中心

    layArea.appendChild(enemy_01);

    // テスト用。ゲームエリアの中心に弾を設定
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');

    bullet.style.left = `${gameAreaRect.width / 2 - 15}px`; // 横の中心
    bullet.style.top = `${gameAreaRect.height / 2 - 15}px`; // 縦の中心

    layArea.appendChild(bullet); // 弾を画面に配置
    bullets.push(bullet); //弾を配列に追加

    createAndAnimateEnemy(); // 敵キャラクターを作成しアニメーションを開始
    animateBullet(); // アニメーション開始

    startTime = new Date(); // 開始時間を記録
    gameTimeInterval = setInterval(updateGameTime, 50); // 0.05秒ごとに経過時間を更新

  } else {
    //ゲーム終了時
    resetGame();
  }
}

// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
/* ---- 弾丸関連 ---- */
// 敵キャラクターの作成とアニメーション
function createAndAnimateEnemy() {
  // アニメーションの状態を管理する変数
  let moveRight = true; // 最初は右に移動

  // 弾の発射
  shootInterval = setInterval(() => {
    shootBulletFromEnemy(enemy_01);
    animateBullet(); // 弾のアニメーションを開始
  }, 1000); // 1000ミリ秒 = 1秒
  

  function animateEnemy() {
    const moveDistance = 300; // 移動距離
    const duration = 4000; // 移動にかかる時間

    if (moveRight) {
        // 右に移動するアニメーション
        enemyAnimation = enemy_01.animate([
            { left: `${parseInt(enemy_01.style.left, 10)}px` },
            { left: `${parseInt(enemy_01.style.left, 10) + moveDistance}px` }
        ], {
            duration: duration,
            fill: 'forwards'
        });

        enemyAnimation.onfinish = () => {
            enemy_01.style.left = `${parseInt(enemy_01.style.left, 10) + moveDistance}px`; // アニメーション終了後にleftを更新
            movementTimeout = setTimeout(() => {
                moveRight = false;
                animateEnemy();
            }, 1000); // 1秒停止
        };
      
      } else {
        // 左に移動するアニメーション
        enemyAnimation = enemy_01.animate([
            { left: `${parseInt(enemy_01.style.left, 10)}px` },
            { left: `${parseInt(enemy_01.style.left, 10) - moveDistance}px` }
        ], {
            duration: duration,
            fill: 'forwards'
        });
        
        enemyAnimation.onfinish = () => {
            enemy_01.style.left = `${parseInt(enemy_01.style.left, 10) - moveDistance}px`; // アニメーション終了後にleftを更新
            movementTimeout = setTimeout(() => {
                moveRight = true;
                animateEnemy();
            }, 1000); // 1秒停止
        };
      }
    }

  animateEnemy(); // アニメーション開始
}

// 弾の位置の調整
function shootBulletFromEnemy(enemy) {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  layArea.appendChild(bullet);

  // 敵キャラクターの現在の位置を取得
  const rect = enemy.getBoundingClientRect();
  const gameAreaRect = gameArea.getBoundingClientRect();

  // 弾の初期位置を敵キャラクターの現在位置に設定
  bullet.style.left = `${rect.left - gameAreaRect.left}px`; // 敵キャラクターの左端からの相対位置
  bullet.style.top = `${rect.top - gameAreaRect.top + enemy.offsetHeight}px`; // 敵キャラクターの下端からの相対位置

  bullets.push(bullet); // 弾を配列に追加
  animateBullet(); // 弾のアニメーションを開始
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


// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
/* ---- 照射範囲の反映 および 移動情報の取得---- */

function onGameAreaClick(event) {  
  /* ---- 照射範囲の反映 ---- */
  // 円の位置を計算（クリックされた位置から左上に半径分オフセット）
  let clientX, clientY;

  if (event.type === 'mousedown'){
    // マウスイベントの場合
    clientX = event.clientX;
    clientY = event.clientY;
  } else if (event.type === 'touchstart') {
    // タッチイベントの場合
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }

  const circleX = clientX - gameAreaRect.left;
  const circleY = clientY - gameAreaRect.top;

  /* ---- svgの更新 ---- */
  var mask = document.querySelector('svg #circle-mask'); // mask要素を取得

   var newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
   newCircle.setAttribute("cx", circleX);
   newCircle.setAttribute("cy", circleY);
   newCircle.setAttribute("r", shine_radius);
   newCircle.setAttribute("fill", "black");
      
   // mask要素に新しいcircleを追加
   mask.appendChild(newCircle);
   // 5秒後にcircle要素を削除する
   setTimeout(() => {
    mask.removeChild(newCircle);
    newCircle.remove();
  }, shine_time);


  /* ---- ドラッグのためのフラグおよびアニメーション関数の開始 ---- */
  isDragging = true;
  lastX = clientX;
  currentX = clientX;
  event.preventDefault();
  requestAnimationFrame(updateDrag);

}


// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
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

// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
/* ---- maskを処理するための、強制関数 ---- */
function refresh() {
  const redPixel = document.createElement('div');
  redPixel.style.position = 'absolute';
  redPixel.style.width = '1px';
  redPixel.style.height = '1px';
  redPixel.style.backgroundColor = 'red';
  
  // ゲームエリアの取得
  const gameArea = document.getElementById('game-area');
  const gameAreaHeight = gameArea.offsetHeight;

  // 赤いピクセルをゲームエリアの特定の位置に配置
  redPixel.style.top = `${gameAreaHeight * 0.895}px`;
  redPixel.style.left = '300px'; // 左端に配置。必要に応じて変更してください
  
  // 赤いピクセルをゲームエリアに追加
  layArea.appendChild(redPixel);

  // 0.05秒ごとに赤いピクセルの表示・非表示を切り替える
  let isPixelVisible = true;
  setInterval(function() {
    if (isPixelVisible) {
      redPixel.style.display = 'none';
    } else {
      redPixel.style.display = 'block';
    }
    isPixelVisible = !isPixelVisible;
  }, 50); // 50ミリ秒 = 0.05秒
}

// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
/* ---- ゲームの経過時間 ---- */
function updateGameTime() {
  const currentTime = new Date();
  const elapsedTime = ((currentTime - startTime) / 1000).toFixed(1); // 秒単位に変換
  document.getElementById('game-time').textContent = `Time: ${elapsedTime}s`;
}

// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
/* ---- クリックやドラッグなどの、各種イベントの設定 ---- */
document.getElementById('toggle-overlay-button').addEventListener('click', function() {
  const button = this;
  const mask = document.querySelector('mask');
  let rect = document.querySelector('mask > rect');

  if (rect) {
    // rectが存在するとき、rectを消去する
    mask.removeChild(rect);
    button.textContent = 'Show';
  } else {
    // rectが存在しないとき、rectを作る
    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '600');
    rect.setAttribute('height', '600');
    rect.setAttribute('fill', 'white');
    mask.appendChild(rect);
    button.textContent = 'Hide';
  }
});

document.getElementById('start-button').addEventListener('click', toggleGameStatus);

document.getElementById('game-area').addEventListener('mousedown', onGameAreaClick);
document.getElementById('game-area').addEventListener('touchstart', onGameAreaClick);


document.addEventListener('mousemove', function(event) {
  if (isDragging) {
    currentX = event.clientX;
  }
});

document.addEventListener('touchmove', function(event) {
  if (!event.target.closest('#game-area')) {
    // gameArea外での操作の場合は、ページのスクロールを防止
    event.preventDefault();
  }
  if (isDragging) {
    currentX = event.touches[0].clientX;
  }
}, { passive: false});


document.addEventListener('mouseup', function() {
  isDragging = false;
});

document.addEventListener('touchend', function() {
  isDragging = false;
});

