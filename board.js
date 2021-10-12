// 게임 보드 내의 상황을 다루는 스크립트

class Board {
    cells;

    constructor(ctx, ctxNext) {
        this.ctx = ctx;
        this.ctxNext = ctxNext;
        this.init();
    }

    init() {
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    drop(){
        let b = moves[KEY.DOWN](this.block);
        if (this.valid(b)){
            this.block.move(b);
        }
        else{
            this.update();
            this.clear();
            if(this.block.y === 0){
                return false;
            }
            this.block = this.next;
            this.block.ctx = this.ctx;
            this.block.x = 3;
            this.getNextBlock();
        }

        return true;
    }

    clear(){
        let line = 0;
        this.cells.forEach((row, y) => {
            if (row.every(value => value > 0)){
                this.cells.splice(y, 1);
                this.cells.unshift(Array(COLS).fill(0));
                line++;
            }
        });
        if (line > 0){
            info.score += this.pointsByLine(line);
            info.lines+=line;

            if (info.lines >= LINES_PER_LEVEL) {
                info.level++;
                info.lines -= LINES_PER_LEVEL;
                time.level = LEVEL[info.level];
            }
        }
    }

    pointsByLine(line){
        return line === 1 ? POINT.SINGLE :
        line === 2 ? POINT.DOUBLE :
        line === 3 ? POINT.TRIPLE :
        line === 4? POINT.TETRIS :
        0;
    }

    draw(){
        this.drawBoard();
        this.block.draw();
    }
    update(){
        this.block.shape.forEach((row, y)=>{
            row.forEach((value, x) => {
                if (value>0){
                    this.cells[y+this.block.y][x+this.block.x] = value;
                }
            });
        });
        console.table(this.cells);
    }

    drawBoard(){
        this.cells.forEach((row,y)=>{
            row.forEach((value, x)=>{
                if (value>0){
                    this.ctx.fillStyle = COLOR[value-1];
                    this.ctx.fillRect(x,y,1,1);
                }
            });
        });
    }
    reset() {
        this.cells = this.getNewBoard();
        this.block = new Block(this.ctx);
        this.block.x = 3;
        this.getNextBlock();

    }

    getNextBlock(){
        const {width, height} = this.ctxNext.canvas;
        this.next = new Block(this.ctxNext);
        this.ctxNext.clearRect(0,0,width, height);
        this.next.draw();
    }
    getNewBoard() {
        return Array.from(
            { length: ROWS }, () => Array(COLS).fill(0)
        );
    }

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
    inBoard(x, y) {
        return 0 <= x && x <= COLS && y <= ROWS;
    }

    isEmpty(x, y) {
        return this.cells[y] && this.cells[y][x] === 0;
    }

}
