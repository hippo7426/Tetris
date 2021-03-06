// 게임 보드 내의 상황을 다루는 script

// Auto Play를 위한 tree의 Node 클래스
class treeNode {
    constructor(lv) {
        this.lv = lv;
        this.acmScore = 0;
        this.recField;
    }
}

// Board Class
class Board {
    cells;
    nextBlocks = [];
    // Auto Play variables
    recX;
    recY;
    recShape;

    constructor(ctx, ctxNext) {
        this.ctx = ctx;
        this.ctxNext = ctxNext;
        this.init();
    }

    // canvas의 크기와 pixel 사이즈 조절
    init() {
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    // 게임 재시작 시 초기화
    reset() {
        this.cells = this.getNewBoard();
        this.block = new Block(this.ctx);
        this.block.x = (this.id === 3) ? 4 : 3;

        const { width, height } = this.ctxNext.canvas;
        this.ctxNext.clearRect(0, 0, width, height);
        this.initNextBlocks();
        this.next = this.nextBlocks[0];
        this.next.draw();

        this.genShadow();
    }

    // reset for Auto play : reset() 메소드를 수정
    reset4Auto() {
        // reset() 과 동일
        this.cells = this.getNewBoard();
        this.block = new Block(this.ctx);
        this.block.x = (this.id === 3) ? 4 : 3;

        const { width, height } = this.ctxNext.canvas;
        this.ctxNext.clearRect(0, 0, width, height);
        this.initNextBlocks();
        this.next = this.nextBlocks[0];
        this.next.draw();

        this.genShadow();

        // Auto 
        this.recRoot = new treeNode(0);
        this.recRoot.recField = JSON.parse(JSON.stringify(this.cells));
        this.recommend(this.recRoot);
    }

    // ROWS*COLS 크기의 이차원 배열 return, 모두 0으로 초기화됨
    getNewBoard() {
        return Array.from(
            { length: ROWS }, () => Array(COLS).fill(0)
        );
    }

    // 다음 블럭 생성 
    getNextBlock() {
        const { width, height } = this.ctxNext.canvas;

        this.nextBlocks.splice(0, 1);
        let newBlock = new Block(this.ctxNext);
        this.nextBlocks.push(newBlock);
        this.next = this.nextBlocks[0];

        this.ctxNext.clearRect(0, 0, width, height);
        this.next.draw();
    }

    // VISIBLE_BLOCKS의 값에 따라 Next Block 배열 초기화
    initNextBlocks() {
        for (let i = 0; i < VISIBLE_BLOCKS-1; i++) {
            let newBlock = new Block(this.ctxNext);
            this.nextBlocks.push(newBlock);
        }
    }

    // 아래로 떨어질 수 있으면 이를 실행, 불가능 할땐 보드 갱신 or game over 신호 return
    drop() {
        let b = moves[KEY.DOWN](this.block);
        if (this.valid(b)) {
            this.block.move(b);
        }
        else {
            this.update();
            this.clear();
            if (this.block.y === 0) {
                return false;
            }
            this.block = this.next;
            this.block.ctx = this.ctx;
            this.block.x = (this.id === 3) ? 4 : 3;
            this.getNextBlock();
            this.genShadow();
        }

        return true;
    }

    // 해당 위치로 이동할 수 있는지 체크
    valid(b) {
        return b.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = b.x + dx;
                let y = b.y + dy;
                if (value === 0)
                    return 1;
                else if (this.inBoard(x, y) && this.isEmpty(x, y))
                    return 1;

            });
        });
    }

    // 블럭이 보드 안에 위치하는가
    inBoard(x, y) {
        return 0 <= x && x <= COLS && y <= ROWS;
    }

    // 블럭이 이동할 위치가 비어있는가
    isEmpty(x, y) {
        return this.cells[y] && this.cells[y][x] === 0;
    }

    // 블럭의 회전
    rotate(b) {
        let bb = JSON.parse(JSON.stringify(b));
        for (let y = 0; y < bb.shape.length; y++) {
            for (let x = 0; x < y; x++) {
                [bb.shape[x][y], bb.shape[y][x]] = [bb.shape[y][x], bb.shape[x][y]]; // Destructuring assignment
            }
        }

        bb.shape.forEach(row => row.reverse());

        return bb;
    }

    // 라인 완성 시 제거, 점수 추가
    clear() {
        let line = 0;
        this.cells.forEach((row, y) => {
            if (row.every(value => value > 0)) {
                this.cells.splice(y, 1);
                this.cells.unshift(Array(COLS).fill(0));
                line++;
            }
        });
        if (line > 0) {
            info.score += this.pointsByLine(line);
            info.lines += line;

            if (info.lines >= LINES_PER_LEVEL) {
                info.level++;
                info.lines -= LINES_PER_LEVEL;
                time.level = LEVEL[info.level];
            }
        }
    }

    // 제거되는 라인 수 별 포인트
    pointsByLine(line) {
        return line === 1 ? POINT.SINGLE :
            line === 2 ? POINT.DOUBLE :
                line === 3 ? POINT.TRIPLE :
                    line === 4 ? POINT.TETRIS :
                        0;
    }

    // 보드에 변경사항 갱신, 추가 점수 기믹
    update() {
        let below = 0;
        this.block.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0 && ((y + this.block.y + 1 < ROWS && this.cells[y + this.block.y + 1][x + this.block.x] > 0) || y + this.block.y + 1 === ROWS)) {
                    below++;
                }
                if (value > 0) {
                    this.cells[y + this.block.y][x + this.block.x] = value;
                }
            });
        });

        info.score += below*10;

    }

    // 보드 새로 그리기
    draw() {
        this.drawBoard();
        this.shadow.draw();
        this.block.draw();
    }

    // 보드만 새로 그리기
    drawBoard() {
        this.cells.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLOR[value - 1];
                    this.ctx.fillRect(x, y, 1, 1);
                }
            });
        });
    }


    // 추가 기능 : 그림자

    // 새로운 그림자 생성
    genShadow() {
        this.shadow = new Block(this.ctx);
        this.shadow.x = this.block.x;
        this.shadow.shape = this.block.shape;
        this.shadow.color = 'gray';
        let s = moves[KEY.DOWN](this.shadow);
        while (this.valid(s)) {
            this.shadow.move(s);
            s = moves[KEY.DOWN](this.shadow);
        }
    }

    // 그림자 실시간 업데이트
    updateShadow() {
        this.shadow.x = this.block.x;
        this.shadow.shape = this.block.shape;
        let s = moves[KEY.DOWN](this.block);
        while (this.valid(s)) {
            this.shadow.move(s);
            s = moves[KEY.DOWN](this.shadow);

        }
    }

    // additional function : Auto Play

    //this.block의 위치를 this.shadow의 위치로 변경, 다음 블럭의 그림자의 위치를 recommend() 메소드로 변경
    drop4Auto() {
        this.block.move(this.shadow);
        if (this.block.y === 0){
            return false;
        }
        this.update();
        this.clear();

        this.block = this.next;
        this.block.ctx = this.ctx;
        this.block.x = (this.id === 3) ? 4 : 3;
        this.getNextBlock();
        this.genShadow();

        this.recRoot = new treeNode(0);
        this.recRoot.recField = JSON.parse(JSON.stringify(this.cells));
        this.recommend(this.recRoot);

        return true;
    }

    //this.block의 그림자,  즉 this.shadow의 위치를 변경
    recommend(parentNode) {
        let max = 0, tmpMax = 0;
        let curBlock;

        console.log(parentNode.lv);
        // 현재 Tree 레벨에서 확인할 블럭
        if (parentNode.lv === 0) {
            curBlock = JSON.parse(JSON.stringify(this.block));
        }
        else {
            curBlock = JSON.parse(JSON.stringify(this.nextBlocks[parentNode.lv - 1]));
        }

        // 회전에 의한 4가지 모양, X 좌표에 따른 Check
        for (let Shape = 0; Shape < 4; Shape++) {
            if (Shape > 0) {
                curBlock = this.rotate(curBlock);
            }
            for (let X = -2; X < COLS; X++) {
                let flag = false;
                curBlock.x = X;
                curBlock.y = 0;
                // 해당 모양과 X 좌표의 최대 y좌표 계산, 한번이라도 내려갔는지를 flag로 확인
                while (this.valid(curBlock)) {
                    flag = true;
                    curBlock.y++;
                }
                curBlock.y--;

                // valid 한 블럭이었다면 
                if (flag === true) {
                    let NewNode = new treeNode(parentNode.lv + 1);
                    NewNode.recField = JSON.parse(JSON.stringify(parentNode.recField));
                    NewNode.acmScore += this.simulScore(curBlock, NewNode.recField);
                   

                    if (NewNode.lv === VISIBLE_BLOCKS) {
                        if (max < NewNode.acmScore)
                            max = NewNode.acmScore;
                    }
                    else if (NewNode.lv === 1){
                        tmpMax = NewNode.acmScore + this.recommend(NewNode);

                        if (max < tmpMax){
                            max = tmpMax;
                            // 그림자 정보 수정 - x좌표, y좌표, Shape
                            this.shadow.move(curBlock);
                        }
            
                    }
                    else {
                        tmpMax = NewNode.acmScore + this.recommend(NewNode);

                        if (max < tmpMax)
                            max = tmpMax;
                    }
                }
            }
        }

        return max;
    }

    // recommend 내에서 각각의 Node들의 필드 변화에 따른 점수를 예측해주는 함수
    // this.cells를 사용한 update와 clear를 통합, 수정
    simulScore(block, field) {
        let score = 0;

        // update() part
        let below = 0;
        block.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0 && ((y + block.y + 1 < ROWS && field[y + block.y + 1][x + block.x + 1] > 0) || y + block.y + 1 === ROWS)){
                    below++;
                }
                if (value >0){
                    field[y+block.y][x+block.x] = value;
                }
            });
        });

        score += below*10;

        // clear() part
        let line = 0;
        field.forEach((row,y)=>{
            if(row.every(value=>value>0)){
                field.splice(y, 1);
                field.unshift(Array(COLS).fill(0));
                line++;
            }
        });
        if (line >0){
            score+=this.pointsByLine(line);
        }

        return score;
    }
}
