// 게임의 실행에 관한 스크립트

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('nextBlock');
const ctxNext = canvasNext.getContext('2d');
let time = null;
let rafid = null;

let userInfo = {
    score:0,
    lines:0,
    level:0
};

function updateInfo(key, value){
    let elem = document.getElementById(key);
    if (elem){
        elem.textContent = value;
    }
}

initNextBlock();

function initNextBlock(){
    ctxNext.canvas.width = 4*BLOCK_SIZE;
    ctxNext.canvas.height = 4*BLOCK_SIZE;
    ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);

}
let info = new Proxy(userInfo, {
    set : (target, key, value)=> {
        target[key] = value;
        updateInfo(key, value);
        return true;
    }
});

// Board 클래스로부터 인스턴스 생성
let board = new Board(ctx, ctxNext);

function play() {
    resetGame();
    animate();
}

function auto(){
    resetGame();
    animate();
}

function resetGame() {
    info.score = 0;
    info.lines = 0;
    info.level = 0;
    board.reset();
    time = {start:0, elapsed: 0, level: 800};
}

// 매번 event.code에 따라 case를 분리하기 번거로움 ex) "ArrowUp"
const moves = {
    [KEY.LEFT]: b => ({ ...b, x: b.x - 1 }),
    [KEY.RIGHT]: b => ({ ...b, x: b.x + 1 }),
    [KEY.DOWN]: b => ({ ...b, y: b.y + 1 }),
    [KEY.SPACE]: b => ({ ...b, y: b.y + 1 }),
    [KEY.UP]: b => board.rotate(b)
    
}

function gameOver(){
    cancelAnimationFrame(rafid);
    ctx.fillStyle='black';
    ctx.fillRect(1,3,8,1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle='red';
    ctx.fillText('Game Over', 2.4, 4);
}
// parameter 'now' indicates the current time (based on the number of milliseconds since time origin)
function animate(now = 0){
    time.elapsed = now-time.start;

    if (time.elapsed > time.level){
        time.start = now;
        if(!board.drop()){
            gameOver();
            return;
        }
    }
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //board.genShadow();
    board.updateShadow();
    board.draw();
    rafid = requestAnimationFrame(animate);

}


document.addEventListener('keydown', event => {
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
            if (event.code === KEY.DOWN){
                info.score+=POINT.SOFT_DROP;
            }
            //board.draw() <= requestAnimationFrame() 에서 약 1/60 초 마다 갱신됨
        }
    }
})

