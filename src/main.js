import { Tetris } from './tetris.js';

const canvas = document.getElementById('game');
const nextCanvas = document.getElementById('next');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');

const game = new Tetris(canvas, nextCanvas);

tick();

function tick() {
  if (game.running && !game.paused) {
    scoreEl.textContent = game.score;
    levelEl.textContent = game.level;
    linesEl.textContent = game.lines;
  }
  requestAnimationFrame(tick);
}

function startGame() {
  game.reset();
  requestAnimationFrame(t => game.update(t));
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', () => game.togglePause());

document.addEventListener('keydown', event => {
  if (!game.running) return;
  switch (event.code) {
    case 'ArrowLeft':
      game.move(-1);
      break;
    case 'ArrowRight':
      game.move(1);
      break;
    case 'ArrowDown':
      game.drop();
      break;
    case 'ArrowUp':
      game.rotate();
      break;
    case 'Space':
      game.hardDrop();
      break;
    case 'KeyP':
      game.togglePause();
      break;
    default:
      return;
  }
  event.preventDefault();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.paused = true;
});
