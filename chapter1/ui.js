// 타이머 설정
const gameDuration = 90 * 1000;

let gameStartTime = null;
let remainingTime = gameDuration;

let pauseStartTime = null;
let totalPausedTime = 0;

// 타이머 일시정지
export function pauseTimer(timestamp) {
    pauseStartTime = timestamp;
}

// 타이머 재개
export function resumeTimer(timestamp) {
    if (pauseStartTime !== null) {
        totalPausedTime += timestamp - pauseStartTime;
        pauseStartTime = null;
    }
}

// 타이머 그리기
export function drawTimer(ctx, timestamp) {

    if (gameStartTime === null) {
        gameStartTime = timestamp;
    }

    const elapsedTime =
        timestamp - gameStartTime - totalPausedTime;

    remainingTime = Math.max(0, gameDuration - elapsedTime);

    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    const milliseconds = Math.floor(remainingTime % 1000);

    const timeText =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + ":" +
        String(milliseconds).padStart(3, "0");

    ctx.fillStyle = "white";
    ctx.font = '32px "MyGameFont", sans-serif';
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillText(timeText, 30, 25);
}