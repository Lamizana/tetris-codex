const COLS = 10;
const ROWS = 20;
const BLOCK = 24; // px

const COLORS = {
  I: '#67e8f9',
  J: '#93c5fd',
  L: '#fcd34d',
  O: '#fbbf24',
  S: '#86efac',
  T: '#c084fc',
  Z: '#fca5a5',
  X: '#111827',
};

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

export class Tetris {
  constructor(canvas, nextCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas.getContext('2d');
    this.board = this.createBoard();
    this.active = null;
    this.next = this.randomPiece();
    this.dropCounter = 0;
    this.dropInterval = 900;
    this.lastTime = 0;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.running = false;
    this.paused = false;
  }

  createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  randomPiece() {
    const keys = Object.keys(SHAPES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    return {
      type,
      shape: SHAPES[type].map(row => [...row]),
      pos: { x: 3, y: 0 },
    };
  }

  reset() {
    this.board = this.createBoard();
    this.active = this.randomPiece();
    this.next = this.randomPiece();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropInterval = 900;
    this.running = true;
    this.paused = false;
    this.lastTime = 0;
    this.draw();
    this.drawNext();
  }

  update(time = 0) {
    if (!this.running || this.paused) return;
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.dropCounter += delta;

    if (this.dropCounter > this.dropInterval) {
      this.drop();
    }
    this.draw();
    requestAnimationFrame(t => this.update(t));
  }

  drop() {
    this.active.pos.y++;
    if (this.collide()) {
      this.active.pos.y--;
      this.merge();
      this.sweep();
      this.spawnNext();
    }
    this.dropCounter = 0;
  }

  hardDrop() {
    while (!this.collide()) {
      this.active.pos.y++;
    }
    this.active.pos.y--;
    this.merge();
    this.sweep();
    this.spawnNext();
    this.dropCounter = 0;
  }

  move(offset) {
    this.active.pos.x += offset;
    if (this.collide()) {
      this.active.pos.x -= offset;
    }
  }

  rotate() {
    const m = this.active.shape;
    const rotated = m[0].map((_, i) => m.map(row => row[i]).reverse());
    const previous = this.active.shape;
    this.active.shape = rotated;
    const offsets = [0, -1, 1, -2, 2];
    for (const offset of offsets) {
      this.active.pos.x += offset;
      if (!this.collide()) {
        return;
      }
      this.active.pos.x -= offset;
    }
    this.active.shape = previous;
  }

  spawnNext() {
    this.active = this.next;
    this.active.pos = { x: 3, y: 0 };
    this.next = this.randomPiece();
    this.drawNext();
    if (this.collide()) {
      this.running = false;
      this.drawGameOver();
    }
  }

  merge() {
    this.active.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const px = this.active.pos.x + x;
          const py = this.active.pos.y + y;
          this.board[py][px] = this.active.type;
        }
      });
    });
  }

  sweep() {
    let lines = 0;
    outer: for (let y = ROWS - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(COLS).fill(null));
        lines++;
        y++;
      }
    }
    if (lines > 0) {
      this.lines += lines;
      this.score += [0, 100, 300, 500, 800][lines];
      this.level = 1 + Math.floor(this.lines / 10);
      this.dropInterval = Math.max(200, 900 - (this.level - 1) * 70);
    }
  }

  collide() {
    const { shape, pos } = this.active;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const boardY = pos.y + y;
        const boardX = pos.x + x;
        if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
        if (boardY >= 0 && this.board[boardY][boardX]) return true;
      }
    }
    return false;
  }

  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    if (!this.paused) {
      this.lastTime = performance.now();
      requestAnimationFrame(t => this.update(t));
    }
  }

  drawCell(x, y, type) {
    const color = COLORS[type] ?? '#111827';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
    this.ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    this.ctx.strokeRect(x * BLOCK + 0.5, y * BLOCK + 0.5, BLOCK - 1, BLOCK - 1);
  }

  drawBoard() {
    this.ctx.fillStyle = COLORS.X;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = this.board[y][x];
        if (cell) this.drawCell(x, y, cell);
      }
    }
  }

  drawPiece(piece) {
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) this.drawCell(piece.pos.x + x, piece.pos.y + y, piece.type);
      });
    });
  }

  draw() {
    this.drawBoard();
    if (this.active) this.drawPiece(this.active);
  }

  drawNext() {
    const ctx = this.nextCtx;
    ctx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    const { shape, type } = this.next;
    const offsetX = Math.floor((this.nextCanvas.width / BLOCK - shape[0].length) / 2);
    const offsetY = Math.floor((this.nextCanvas.height / BLOCK - shape.length) / 2);
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillStyle = COLORS[type];
          ctx.fillRect((offsetX + x) * BLOCK, (offsetY + y) * BLOCK, BLOCK, BLOCK);
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.strokeRect((offsetX + x) * BLOCK + 0.5, (offsetY + y) * BLOCK + 0.5, BLOCK - 1, BLOCK - 1);
        }
      });
    });
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#fca5a5';
    this.ctx.font = 'bold 24px Inter';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Partie terminée', this.canvas.width / 2, this.canvas.height / 2 - 12);
    this.ctx.fillStyle = '#e5e7eb';
    this.ctx.font = '16px Inter';
    this.ctx.fillText('Appuyez sur "Nouvelle partie" pour rejouer', this.canvas.width / 2, this.canvas.height / 2 + 12);
  }
}
