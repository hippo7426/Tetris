// 게임의 실행에 관한 스크립트

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('nextBlock');
const ctxNext = canvasNext.getContext('2d');
let time = null;
let rafid = null;
let begin = false;

// 화면에 표시되는 플레이어 정보
let userInfo = {
    score: 0,
    lines: 0,
    level: 0
};

// userInfo의 property가 변경될 때 작동하는 Proxy
let info = new Proxy(userInfo, {
    set: (target, key, value) => {
        target[key] = value;
        updateInfo(key, value);
        return true;
    }
});

// new Board
let board = new Board(ctx, ctxNext);

// next block을 보여주는 canvas 초기화
function initNextBoard() {
    ctxNext.canvas.width = 4 * BLOCK_SIZE;
    ctxNext.canvas.height = 4 * BLOCK_SIZE;
    ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
}

// info Proxy에서 호출되는 정보 갱신 함수
function updateInfo(key, value) {
    let elem = document.getElementById(key);
    if (elem) {
        elem.textContent = value;
    }
}

initNextBoard();

// 게임 시작
function play() {

    addEventListener();
    resetGame();

    if (rafid) {
        cancelAnimationFrame(rafid);
    }

    animate();
}

// DFS를 통한 Auto Play
function auto() {

    document.removeEventListener('keydown', KeyDown);
    resetGame4Auto();

    if (rafid) {
        cancelAnimationFrame(rafid);
    }
    animate4Auto();
}

function resetGame() {
    info.score = 0;
    info.lines = 0;
    info.level = 0;
    begin = false;
    board.reset();
    time = { start: 0, elapsed: 0, level: 800 };
}

function resetGame4Auto(){

}

// 매번 event.code에 따라 case를 분리하기 번거로움 ex) "ArrowUp"
// 펼침 연산자를 활용한 얕은 복사
const moves = {
    [KEY.LEFT]: b => ({ ...b, x: b.x - 1 }),
    [KEY.RIGHT]: b => ({ ...b, x: b.x + 1 }),
    [KEY.DOWN]: b => ({ ...b, y: b.y + 1 }),
    [KEY.SPACE]: b => ({ ...b, y: b.y + 1 }),
    [KEY.UP]: b => board.rotate(b)

}

// 게임 종료
function gameOver() {
    cancelAnimationFrame(rafid);
    ctx.fillStyle = 'black';
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('Game Over', 2.4, 4);
}

// requestAnimationFrame() 을 활용해 Drop 구현
// parameter 'now' indicates the current time (based on the number of milliseconds since time origin)
function animate(now = 0) {
    time.elapsed = now - time.start;

    if (time.elapsed > time.level) {
        if (!begin) {
            begin = true;
            time.start = now;
        }
        else {
            console.log(now);
            time.start = now;
            if (!board.drop()) {
                gameOver();
                return;
            }
        }
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //board.genShadow();
    board.updateShadow();
    board.draw();
    rafid = requestAnimationFrame(animate);

}

// Auto play를 위한 함수
function animate4Auto(now = 0) {
    time.elapsed = now - time.start;

    if (time.elapsed > time.level) {
        time.start = now;
        if (!board.dropAuto()) {
            gameOver();
            return;
        }
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    board.draw();
    rafid = requestAnimationFrame(animateAuto);
}

function addEventListener() {
    document.removeEventListener('keydown', KeyDown);
    document.addEventListener('keydown', KeyDown);
}


// 키보드 입력에 대한 EventListener, parameter에 event를 추가해야함, 그렇지 않은 경우는 deprecated 되었음
function KeyDown(event) {
    if (moves[event.code]) {
        // 이벤트 버블링 방지
        event.preventDefault();

        let b = moves[event.code](board.block);
        if (event.code === KEY.SPACE) {
            while (board.valid(b)) {
                info.score += POINT.HARD_DROP;
                board.block.move(b);
                b = moves[KEY.DOWN](board.block);
            }
        }
        else if (board.valid(b)) {
            board.block.move(b);
            if (event.code === KEY.DOWN) {
                info.score += POINT.SOFT_DROP;
            }
            //board.draw() <= requestAnimationFrame() 에서 약 1/60 초 마다 호출됨
        }
    }
}

