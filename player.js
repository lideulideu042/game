
// 캐릭터 이미지
const playerImages = [];

// 주인공 설정
const player = {
    x: 150,
    y: 0,
    width: 250,
    height: 250,

    isJumping: false,
    velocityY: 0,
    gravity: 0.8,
    jumpPower: -16
};

// 장애물 설정
const obstacle = {
    x: 0,
    y: 0,
    width: 80,
    height: 100,
    speed: 9,
    hit: false
};

// 애니메이션 설정
let frameIndex = 0;
let lastFrameTime = 0;

const frameDuration = 120;

// 충돌 효과 설정
let hitStopUntil = 0;
let slowUntil = 0;

// 일시정지 설정
let playerPauseTime = null;

// 점프 입력 활성화 여부
let controlsEnabled = false;


// 캐릭터 이미지 로딩
export function loadPlayerImages() {
    const promises = [];

    for (let i = 1; i <= 6; i++) {
        const img = new Image();

        const promise = new Promise((resolve, reject) => {
            img.onload = () => resolve();

            img.onerror = () => {
                reject(new Error("캐릭터 이미지 로딩 실패: " + img.src));
            };
        });

        img.src = `images/player/run${i}.png`;

        playerImages.push(img);
        promises.push(promise);
    }

    return Promise.all(promises);
}


// 스페이스바 점프
export function setupPlayerControls() {
    window.addEventListener("keydown", (event) => {

        if (event.code === "Space") {
            event.preventDefault();

            if (
                controlsEnabled &&
                !player.isJumping &&
                performance.now() >= hitStopUntil
            ) {
                player.isJumping = true;
                player.velocityY = player.jumpPower;
            }
        }
    });
}


// 점프 입력 활성화 / 비활성화
export function setPlayerControlsEnabled(enabled) {
    controlsEnabled = enabled;
}


// 캐릭터와 장애물 업데이트 및 그리기
export function updatePlayer(ctx, timestamp, canvas, freeze = false) {

    // 원래 서 있어야 할 위치
    const groundY = canvas.height - player.height - 150;

    // 시작 대기 및 카운트다운 중
    if (freeze) {

        player.y = groundY;
        obstacle.y = canvas.height - obstacle.height - 150;

        if (obstacle.x === 0) {
            obstacle.x = canvas.width;
        }

        ctx.fillStyle = "red";
        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );

        ctx.drawImage(
            playerImages[frameIndex],
            player.x,
            player.y,
            player.width,
            player.height
        );

        return true;
    }

    // 충돌로 멈춰 있는지 확인
    const isStunned = timestamp < hitStopUntil;

    // 점프 계산
    if (!isStunned) {

        if (player.isJumping) {

            player.y += player.velocityY;
            player.velocityY += player.gravity;

            // 바닥에 착지
            if (player.y >= groundY) {
                player.y = groundY;
                player.isJumping = false;
                player.velocityY = 0;
            }

        } else {
            player.y = groundY;
        }
    }

    // 장애물 위치 설정
    obstacle.y = canvas.height - obstacle.height - 150;

    // 충돌 중이 아닐 때만 장애물 이동
    if (!isStunned) {
        obstacle.x -= obstacle.speed;
    }

    // 장애물이 화면 밖으로 나가면 재등장
    if (obstacle.x + obstacle.width < 0) {
        obstacle.x = canvas.width;
        obstacle.hit = false;
    }

    // 캐릭터 충돌 판정 범위
    const hitbox = {
        x: player.x + 60,
        y: player.y + 50,
        width: player.width - 100,
        height: player.height - 120
    };

    // 충돌 판정
    if (!obstacle.hit && !isStunned) {

        if (
            hitbox.x < obstacle.x + obstacle.width &&
            hitbox.x + hitbox.width > obstacle.x &&
            hitbox.y < obstacle.y + obstacle.height &&
            hitbox.y + hitbox.height > obstacle.y
        ) {
            obstacle.hit = true;

            // 2초 동안 정지
            hitStopUntil = timestamp + 2000;

            // 이후 1초 동안 느린 애니메이션
            slowUntil = timestamp + 3000;
        }
    }

    // 애니메이션 속도 설정
    const currentFrameDuration =
        timestamp < slowUntil ? 260 : frameDuration;

    // 멈춰 있는 동안 애니메이션 정지
    if (
        !isStunned &&
        timestamp - lastFrameTime >= currentFrameDuration
    ) {
        frameIndex = (frameIndex + 1) % 6;
        lastFrameTime = timestamp;
    }

    // 장애물 그리기
    ctx.fillStyle = "red";

    ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
    );

    // 주인공 그리기
    ctx.drawImage(
        playerImages[frameIndex],
        player.x,
        player.y,
        player.width,
        player.height
    );

    return isStunned;
}


// 충돌 정지 상태 확인
export function isPlayerStunned(timestamp) {
    return timestamp < hitStopUntil;
}


// 일시정지 시작
export function pausePlayer(timestamp) {
    playerPauseTime = timestamp;
}


// 일시정지 종료
export function resumePlayer(timestamp) {

    if (playerPauseTime !== null) {

        const pausedDuration = timestamp - playerPauseTime;

        hitStopUntil += pausedDuration;
        slowUntil += pausedDuration;
        lastFrameTime += pausedDuration;

        playerPauseTime = null;
    }
}
