import { Tetris } from './tetris.js';

const players = [
  {
    id: 'p1',
    game: new Tetris(
      document.getElementById('p1-game'),
      document.getElementById('p1-next')
    ),
    stats: {
      score: document.getElementById('p1-score'),
      level: document.getElementById('p1-level'),
      lines: document.getElementById('p1-lines'),
      status: document.getElementById('p1-status'),
    },
    buttons: {
      start: document.getElementById('p1-start'),
      pause: document.getElementById('p1-pause'),
    },
    controls: {
      ArrowLeft: () => playerAction('p1', 'move', -1),
      ArrowRight: () => playerAction('p1', 'move', 1),
      ArrowDown: () => playerAction('p1', 'drop'),
      ArrowUp: () => playerAction('p1', 'rotate'),
      Space: () => playerAction('p1', 'hardDrop'),
      KeyP: () => playerAction('p1', 'togglePause'),
    },
  },
  {
    id: 'p2',
    game: new Tetris(
      document.getElementById('p2-game'),
      document.getElementById('p2-next')
    ),
    stats: {
      score: document.getElementById('p2-score'),
      level: document.getElementById('p2-level'),
      lines: document.getElementById('p2-lines'),
      status: document.getElementById('p2-status'),
    },
    buttons: {
      start: document.getElementById('p2-start'),
      pause: document.getElementById('p2-pause'),
    },
    controls: {
      KeyA: () => playerAction('p2', 'move', -1),
      KeyD: () => playerAction('p2', 'move', 1),
      KeyS: () => playerAction('p2', 'drop'),
      KeyW: () => playerAction('p2', 'rotate'),
      Enter: () => playerAction('p2', 'hardDrop'),
      KeyL: () => playerAction('p2', 'togglePause'),
    },
  },
];

const controlMap = new Map();
players.forEach(player => {
  Object.entries(player.controls).forEach(([key, handler]) => {
    controlMap.set(key, handler);
  });
});

function playerAction(id, action, value) {
  const player = players.find(p => p.id === id);
  if (!player) return;
  const game = player.game;
  if (!game.running && action !== 'reset') return;
  switch (action) {
    case 'move':
      game.move(value);
      break;
    case 'drop':
      game.drop();
      break;
    case 'rotate':
      game.rotate();
      break;
    case 'hardDrop':
      game.hardDrop();
      break;
    case 'togglePause':
      game.togglePause();
      break;
    case 'reset':
      startGame(player);
      break;
  }
}

function startGame(player) {
  player.game.reset();
  player.stats.status.textContent = 'En cours';
  requestAnimationFrame(t => player.game.update(t));
}

players.forEach(player => {
  player.buttons.start.addEventListener('click', () => startGame(player));
  player.buttons.pause.addEventListener('click', () => {
    player.game.togglePause();
    player.stats.status.textContent = player.game.paused ? 'En pause' : 'En cours';
  });
});

document.addEventListener('keydown', event => {
  const handler = controlMap.get(event.code);
  if (handler) {
    event.preventDefault();
    handler();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    players.forEach(player => {
      player.game.paused = true;
      player.stats.status.textContent = 'En pause';
    });
  }
});

function tick() {
  players.forEach(({ game, stats }) => {
    if (game.running && !game.paused) {
      stats.score.textContent = game.score;
      stats.level.textContent = game.level;
      stats.lines.textContent = game.lines;
      stats.status.textContent = 'En cours';
    } else if (game.running && game.paused) {
      stats.status.textContent = 'En pause';
    } else if (!game.running && game.active) {
      stats.status.textContent = 'Terminé';
    }
  });
  requestAnimationFrame(tick);
}

tick();
