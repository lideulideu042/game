import {
    loadPlayerImages,
    setupPlayerControls,
    updatePlayer,
    isPlayerStunned,
    pausePlayer,
    resumePlayer,
    setPlayerControlsEnabled
} from "./player.js";

import {
    loadBackground,
    drawBackground
} from "./bg.js";

import {
    drawTimer,
    pauseTimer,
    resumeTimer
} from "./ui.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 화면 크기 설정
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 게임 상태
let gameState = "ready";

// 카운트다운 시작 시간
let countdownStartTime = 0;

// 화면 어둡게 만들기
function drawOverlay(title, subtitle) {
    ctx.save();

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = '50px "MyGameFont", sans-serif';
    ctx.fillText(
        title,
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.font = '22px "MyGameFont", sans-serif';
    ctx.fillText(
        subtitle,
        canvas.width / 2,
        canvas.height / 2 + 60
    );

    ctx.restore();
}

// 키 입력
window.addEventListener("keydown", (event) => {

    // 시작 화면에서 ENTER
    if (event.code === "Enter" && !event.repeat) {

        if (gameState === "ready") {
            event.preventDefault();

            gameState = "countdown";
            countdownStartTime = performance.now();
        }
    }

    // ESC 일시정지 / 재개
    if (event.code === "Escape" && !event.repeat) {

        const currentTime = performance.now();

        if (gameState === "running") {

            gameState = "paused";

            pauseTimer(currentTime);
            pausePlayer(currentTime);
            setPlayerControlsEnabled(false);

            drawOverlay(
                "PAUSED",
                "Press ESC to continue"
            );

        } else if (gameState === "paused") {

            gameState = "running";

            resumeTimer(currentTime);
            resumePlayer(currentTime);
            setPlayerControlsEnabled(true);
        }
    }
});

// 게임 실행
function gameLoop(timestamp) {

    // 시작 대기 또는 카운트다운
    if (
        gameState === "ready" ||
        gameState === "countdown"
    ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 움직이지 않는 게임 화면 그리기
        drawBackground(ctx, canvas, true);
        updatePlayer(ctx, timestamp, canvas, true);

        if (gameState === "ready") {

            drawOverlay(
                "READY?",
                "Press ENTER to start"
            );

        } else {

            const elapsed = timestamp - countdownStartTime;

            if (elapsed < 1000) {
                drawOverlay("3", "");
            } else if (elapsed < 2000) {
                drawOverlay("2", "");
            } else if (elapsed < 3000) {
                drawOverlay("1", "");
            } else if (elapsed < 3600) {
                drawOverlay("START!", "");
            } else {
                // 카운트다운 종료
                gameState = "running";
                setPlayerControlsEnabled(true);
            }
        }

        if (gameState !== "running") {
            requestAnimationFrame(gameLoop);
            return;
        }
    }

    // 일시정지 중
    if (gameState === "paused") {
        requestAnimationFrame(gameLoop);
        return;
    }

    // 실제 게임 진행
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isStunned = isPlayerStunned(timestamp);

    drawBackground(ctx, canvas, isStunned);

    updatePlayer(ctx, timestamp, canvas);

    drawTimer(ctx, timestamp);

    requestAnimationFrame(gameLoop);
}

// 게임 시작 준비
async function startGame() {
    try {
        await Promise.all([
            loadPlayerImages(),
            loadBackground()
        ]);

        setupPlayerControls();

        requestAnimationFrame(gameLoop);

    } catch (error) {
        console.error(error);
    }
}

startGame();