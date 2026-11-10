const stopFrameCount = 7; // 設定停止圖集的影格數量
const stopSheetWidth = 744; // 設定停止圖集的總寬度
const stopSheetHeight = 212; // 設定停止圖集的總高度
const walkFrameCount = 8; // 設定走路圖集的影格數量
const walkSheetWidth = 1107; // 設定走路圖集的總寬度
const walkSheetHeight = 197; // 設定走路圖集的總高度
const magicFrameCount = 4; // 設定施法圖集的影格數量
const magicSheetWidth = 1036; // 設定施法圖集的總寬度
const magicSheetHeight = 146; // 設定施法圖集的總高度
const effectFrameCount = 5; // 設定魔法特效圖集的影格數量
const effectSheetWidth = 740; // 設定魔法特效圖集的總寬度
const effectSheetHeight = 19; // 設定魔法特效圖集的總高度
const frameDuration = 100; // 設定角色動畫每格播放的毫秒數
const backgroundColor = "#d8c3a5"; // 設定米黃色奶茶色背景
let stopSpriteSheet; // 宣告停止動作的精靈圖集變數
let walkSpriteSheet; // 宣告走路動作的精靈圖集變數
let magicSpriteSheet; // 宣告施法動作的精靈圖集變數
let effectSpriteSheet; // 宣告飛行特效的精靈圖集變數
let characterXRatio = 2 / 3; // 設定角色初始水平位置為畫布寬度的三分之二
let facingLeft = false; // 記錄角色目前是否朝向左方
let isCasting = false; // 記錄角色是否正在播放施法動畫
let castStartedAt = 0; // 記錄施法動畫開始的時間
let spaceDown = false; // 記錄空白鍵是否已經按下以避免重複觸發
let effectIsActive = false; // 記錄畫面上是否有正在飛行的魔法特效
let effectX = 0; // 記錄魔法特效目前的水平位置
let effectY = 0; // 記錄魔法特效目前的垂直位置
let effectDirection = 1; // 記錄魔法特效的飛行方向
function preload() { // 在畫布啟動前載入所有角色圖片
  stopSpriteSheet = loadImage("1/stop/stop.png"); // 載入七格停止動作精靈圖集
  walkSpriteSheet = loadImage("1/walk/walk.png"); // 載入八格走路動作精靈圖集
  magicSpriteSheet = loadImage("1/magic/magic.png"); // 載入四格施法動作精靈圖集
  effectSpriteSheet = loadImage("1/magic effect/magic effect.png"); // 載入五格魔法飛行特效圖集
} // 結束圖片預載函式
function setup() { // 初始化 p5.js 畫布
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的畫布
  imageMode(CORNER); // 將圖片定位方式設為左上角
} // 結束初始化函式
function draw() { // 每個動畫影格執行一次繪圖
  background(backgroundColor); // 使用米黃色奶茶色填滿畫布背景
  const leftPressed = keyIsDown(LEFT_ARROW); // 偵測左方向鍵是否正被按住
  const rightPressed = keyIsDown(RIGHT_ARROW); // 偵測右方向鍵是否正被按住
  const movementDirection = leftPressed !== rightPressed ? (leftPressed ? -1 : 1) : 0; // 取得角色移動方向並處理同時按鍵的情況
  if (movementDirection !== 0) facingLeft = movementDirection < 0; // 移動時依方向更新角色朝向
  const castFinished = isCasting && millis() - castStartedAt >= magicFrameCount * frameDuration; // 判斷單次施法動畫是否已經播放完畢
  if (castFinished) isCasting = false; // 施法動畫結束後切換回一般動作
  const isWalking = !isCasting && movementDirection !== 0; // 角色未施法且按住方向鍵時播放走路動畫
  const currentFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : stopFrameCount; // 依角色狀態選擇影格數
  const currentSheetWidth = isCasting ? magicSheetWidth : isWalking ? walkSheetWidth : stopSheetWidth; // 依角色狀態選擇圖集寬度
  const currentSheetHeight = isCasting ? magicSheetHeight : isWalking ? walkSheetHeight : stopSheetHeight; // 依角色狀態選擇圖集高度
  const currentSpriteSheet = isCasting ? magicSpriteSheet : isWalking ? walkSpriteSheet : stopSpriteSheet; // 依角色狀態選擇對應精靈圖集
  const frameWidth = currentSheetWidth / currentFrameCount; // 計算目前圖集單格影格的寬度
  const scaleFactor = min(height * 0.82 / currentSheetHeight, width * 0.38 / frameWidth); // 依畫布高寬等比例縮放角色
  const displayWidth = frameWidth * scaleFactor; // 計算角色影格的顯示寬度
  const displayHeight = currentSheetHeight * scaleFactor; // 計算角色影格的顯示高度
  const characterX = constrain(width * characterXRatio + movementDirection * 5, displayWidth / 2, width - displayWidth / 2); // 移動角色並限制在畫布左右邊界
  characterXRatio = characterX / width; // 儲存角色相對位置以適應畫布縮放
  if (castFinished) { // 施法動畫完成時建立飛行中的魔法特效
    const effectFrameWidth = effectSheetWidth / effectFrameCount; // 計算特效圖集單格影格的寬度
    const effectScale = min(height * 0.12 / effectSheetHeight, width * 0.28 / effectFrameWidth); // 依畫布大小適度縮放魔法特效
    const effectDisplayWidth = effectFrameWidth * effectScale; // 計算特效的顯示寬度
    const effectDisplayHeight = effectSheetHeight * effectScale; // 計算特效的顯示高度
    effectDirection = facingLeft ? -1 : 1; // 依角色朝向設定特效的飛行方向
    effectX = effectDirection > 0 ? characterX + displayWidth / 2 : characterX - displayWidth / 2 - effectDisplayWidth; // 將特效放在角色面向的一側
    effectY = height - displayHeight + (displayHeight - effectDisplayHeight) / 2; // 將特效垂直對齊角色身體中央
    effectIsActive = true; // 啟動魔法特效的飛行動畫
  } // 結束特效建立判斷
  const frameIndex = isCasting ? floor((millis() - castStartedAt) / frameDuration) : floor(millis() / frameDuration) % currentFrameCount; // 施法影格只播放一次，其餘動作循環播放
  const sourceX = frameIndex * frameWidth; // 計算目前影格在圖集中的水平起點
  const displayX = characterX - displayWidth / 2; // 計算角色影格的左側顯示位置
  const displayY = height - displayHeight; // 將角色底部對齊畫布底部
  drawSpriteFrame(currentSpriteSheet, displayX, displayY, displayWidth, displayHeight, sourceX, frameWidth, currentSheetHeight, facingLeft); // 依角色朝向繪製目前的動畫影格
  if (effectIsActive) { // 魔法特效啟動時更新並繪製飛行動畫
    const effectFrameWidth = effectSheetWidth / effectFrameCount; // 計算特效圖集單格影格的寬度
    const effectScale = min(height * 0.12 / effectSheetHeight, width * 0.28 / effectFrameWidth); // 依畫布大小適度縮放魔法特效
    const effectDisplayWidth = effectFrameWidth * effectScale; // 計算特效的顯示寬度
    const effectDisplayHeight = effectSheetHeight * effectScale; // 計算特效的顯示高度
    effectX += effectDirection * 8; // 讓特效朝角色面向的方向持續移動
    if ((effectDirection > 0 && effectX > width) || (effectDirection < 0 && effectX + effectDisplayWidth < 0)) effectIsActive = false; // 特效完全離開畫布後將其移除
    if (effectIsActive) { // 特效尚未離開畫布時繼續繪製
      const effectFrameIndex = floor(millis() / 80) % effectFrameCount; // 每 80 毫秒切換一次特效影格
      const effectSourceX = effectFrameIndex * effectFrameWidth; // 計算目前特效影格在圖集中的水平起點
      drawSpriteFrame(effectSpriteSheet, effectX, effectY, effectDisplayWidth, effectDisplayHeight, effectSourceX, effectFrameWidth, effectSheetHeight, effectDirection < 0); // 依飛行方向繪製特效影格
    } // 結束特效繪製判斷
  } // 結束特效更新判斷
} // 結束繪圖函式
function drawSpriteFrame(spriteSheet, displayX, displayY, displayWidth, displayHeight, sourceX, sourceWidth, sourceHeight, shouldFlip) { // 繪製精靈圖集中的單一影格
  if (shouldFlip) { // 需要朝左時水平翻轉圖片
    push(); // 儲存目前畫布的轉換狀態
    translate(displayX + displayWidth, 0); // 將翻轉基準移至圖片右側
    scale(-1, 1); // 沿水平軸翻轉圖片
    image(spriteSheet, 0, displayY, displayWidth, displayHeight, sourceX, 0, sourceWidth, sourceHeight); // 繪製翻轉後的精靈影格
    pop(); // 還原畫布的轉換狀態
  } else { // 不需要翻轉時維持圖片原方向
    image(spriteSheet, displayX, displayY, displayWidth, displayHeight, sourceX, 0, sourceWidth, sourceHeight); // 繪製原方向的精靈影格
  } // 結束圖片方向判斷
} // 結束精靈影格繪製函式
function keyPressed() { // 偵測鍵盤按下事件
  if (keyCode === 32 && !spaceDown && !isCasting && !effectIsActive) { // 空白鍵按下且沒有施法或飛行特效時開始施法
    isCasting = true; // 啟動施法動畫
    castStartedAt = millis(); // 記錄施法動畫開始時間
  } // 結束空白鍵施法判斷
  if (keyCode === 32) spaceDown = true; // 記錄空白鍵目前處於按下狀態
  return false; // 阻止空白鍵捲動網頁
} // 結束鍵盤按下事件
function keyReleased() { // 偵測鍵盤放開事件
  if (keyCode === 32) spaceDown = false; // 空白鍵放開後允許下次施法
  return false; // 阻止方向鍵觸發瀏覽器預設行為
} // 結束鍵盤放開事件
function windowResized() { // 瀏覽器視窗尺寸改變時更新畫布
  resizeCanvas(windowWidth, windowHeight); // 讓畫布重新符合目前視窗尺寸
} // 結束視窗縮放處理函式
