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

    // 새로운 블럭 생성
    spawn() {
        this.y = 0;
        this.id = this.randomBlock(COLOR.length);
        this.color = COLOR[this.id];
        this.shape = SHAPES[this.id];
        this.x = (this.id===3) ? 4 : 3;
    }

    // 블럭 랜덤 생성 함수
    randomBlock(num){
        return Math.floor(Math.random()*num);
    }

    // 블럭(this) 그리기
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

    // 블럭 이동, 회전
    move(b) {
       this.x = b.x;
       this.y = b.y;
       this.shape = b.shape;
    }

}