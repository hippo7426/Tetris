// 게임 보드 내의 상황을 다루는 스크립트

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

ctx.canvas.width=COLS*BLOCK_SIZE;
ctx.canvas.height=ROWS*BLOCK_SIZE;

ctx.scale(BLOCK_SIZE,BLOCK_SIZE);
