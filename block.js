// 테트리스 블럭들에 관한 스크립트

class Block {
    x;
    y;
    color;
    shape;
    ctx;

    constructor(ctx) {
        this.ctx = ctx;
        this.spawn();
    };

    spawn() {
        this.x = 0;
        this.y = 0;
        this.id = this.randomBlock(COLOR.length);
        this.color = COLOR[this.id];
        this.shape = SHAPES[this.id];
    }

    randomBlock(num){
        return Math.floor(Math.random()*num);
    }
    draw() {
        this.ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
                }
            })
        })
    }

    move(b) {
       this.x = b.x;
       this.y = b.y;
       this.shape = b.shape;
    }

}