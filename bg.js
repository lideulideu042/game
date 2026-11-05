
// 배경 이미지
const backgroundImage = new Image();

let backgroundX = 0;
let backgroundWidth = 0;

const backgroundSpeed = 9;

// 배경 이미지 로딩
export function loadBackground() {
    return new Promise((resolve, reject) => {

        backgroundImage.onload = () => {
            resolve();
        };

        backgroundImage.onerror = () => {
            reject(new Error("배경 이미지 로딩 실패: " + backgroundImage.src));
        };

        backgroundImage.src = "images/background/bg.png";
    });
}

// 배경 그리기
export function drawBackground(ctx, canvas, isStunned) {

    // 배경 크기 계산
    backgroundWidth =
        backgroundImage.width *
        (canvas.height / backgroundImage.height);

    // 충돌 중이 아닐 때만 배경 이동
    if (!isStunned) {
        backgroundX -= backgroundSpeed;
    }

    // 배경이 완전히 화면 밖으로 나가면 처음 위치로
    if (backgroundX <= -backgroundWidth) {
        backgroundX += backgroundWidth;
    }

    // 배경 두 장 이어서 그리기
    ctx.drawImage(
        backgroundImage,
        backgroundX,
        0,
        backgroundWidth,
        canvas.height
    );

    ctx.drawImage(
        backgroundImage,
        backgroundX + backgroundWidth,
        0,
        backgroundWidth,
        canvas.height
    );
}
