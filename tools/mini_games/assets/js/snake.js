class SnakeGame {
  #dirMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  }
  #canvas
  #ctx
  #grid
  #snake
  #apple
  #dir
  #nextDir
  #score = {
    player: 0,
    computer: 0
  };
  #recordElement = document.getElementById('record');
  #recordKey = 'snakeRecord';
  #record = {
    save : () => {
      const currentRecord = localStorage.getItem(this.#recordKey) || '0';
      if (this.#score.player > parseInt(currentRecord, 10)) {
        localStorage.setItem(this.#recordKey, this.#score.player);
        this.#recordElement.textContent = this.#score.player;
      }
    },
    load : () => {
      const record = localStorage.getItem(this.#recordKey);
      this.#recordElement.textContent = record || '0';
    }
  }; // Record score, not used in this implementation
  #alive
  #boundLoop
  #startX = 0
  #startY = 0
  #tileSize = 20
  #lastFrameTime = 0
  #animFrameId = null
  #removeControls = null
  #recordKey = 'snakeRecord'
  #speed = 120

  constructor(){}

  // Public method to start the game
  // This method initializes the game with a canvas and grid count,
  // and sets up the game loop and controls. Allows lazy initialization
  // of the game state, so it can be called multiple times without
  // needing to reset the game. If the game is already running, it will reset the game state.
  /**
   * Initializes the game with the specified canvas and grid count.
   * @param {string} canvasId - The ID of the canvas element to render the game.
   * @param {number} gridCount - The number of tiles in the grid (default is 20).
   */
  start(canvasId, gridCount = 20) {
    this.#canvas = document.getElementById(canvasId);
    if (!this.#canvas) {
      throw new Error(`Canvas with id ${canvasId} not found`);
    }
    this.#canvas.classList.add('active');
    this.#ctx = this.#canvas.getContext("2d");
    this.#grid = { count: gridCount };
    this.#tileSize = Math.floor(this.#canvas.width / gridCount);
    // Atualiza painel
    this.#score = 0;
    this.#record = parseInt(localStorage.getItem('snakeRecord') || '0', 10);
    document.getElementById('score').textContent = this.#score;
    document.getElementById('record').textContent = this.#record;
    // Remove listeners antigos
    this.#removeControls && this.#removeControls();
    // Initialize game state
    this.reset();
    // Bind the game loop
    this.#boundLoop = this.#loop.bind(this);
    // Setup controls
    this.#removeControls = this.#setupControls();
    // Start the game loop
    if (this.#alive) {
      if (this.#animFrameId) cancelAnimationFrame(this.#animFrameId);
      this.#animFrameId = requestAnimationFrame(this.#boundLoop);
    }
  }

  reset() {
    this.#snake = [{ x: 5, y: 5 }]
    this.#dir = { x: 1, y: 0 }
    this.#nextDir = { x: 1, y: 0 }
    this.#score = 0
    this.#alive = true
    this.#spawnApple()
    this.#draw()
    this.#lastFrameTime = 0
    requestAnimationFrame(this.#boundLoop)
  }

  // Public method to spawn an apple
  // This can be called externally to reset the apple position
  spawnApple() {
    if (!this.#alive) return
    if (this.#apple) {
      this.#apple = null
    }
    this.#spawnApple()
  }

  // Private method to handle apple spawning logic
  #spawnApple() {
    // Ensure apple is not already spawned
    if (this.#apple && this.#alive) {
      return
    }

    // Reset apple if the game is not alive
    if (!this.#apple) {
      this.#apple = { x: 0, y: 0 }
    }

    // Ensure apple does not spawn on the snake
    this.#apple = null
    if (!this.#alive) return
    if (!this.#apple) {
      this.#apple = { x: 0, y: 0 }
    }

    // Randomly place apple on the grid
    this.#apple = {
      x: Math.floor(Math.random() * this.#grid.count),
      y: Math.floor(Math.random() * this.#grid.count)
    }

    // Ensure apple does not spawn on the snake
    if (this.#snake.some(s => s.x === this.#apple.x && s.y === this.#apple.y)) {
      this.#spawnApple()
    }

    // Ensure apple is not placed outside the grid
    if (this.#apple.x < 0 || this.#apple.y < 0 || 
        this.#apple.x >= this.#grid.count || this.#apple.y >= this.#grid.count) {
      this.#spawnApple()
    }

    do {
      this.#apple = {
        x: Math.floor(Math.random() * (this.#grid.count - 1)),
        y: Math.floor(Math.random() * (this.#grid.count - 1))
      }
    } while (this.#snake.some(s => s.x === this.#apple.x && s.y === this.#apple.y))

    // Ensure apple is not placed outside the grid
    if (this.#apple.x < 0 || this.#apple.y < 0 || 
        this.#apple.x >= this.#grid.count || this.#apple.y >= this.#grid.count) {
      this.#spawnApple()
    }
    this.#ctx.fillStyle = "#f00"
    this.#ctx.fillRect(this.#apple.x * this.#tileSize, this.#apple.y * this.#tileSize, this.#tileSize, this.#tileSize)
  }

  #loop(time) {
    if (!this.#alive) return;
    if (!this.#speed) this.#speed = 120;
    if (time - this.#lastFrameTime >= this.#speed) {
      this.#lastFrameTime = time;
      this.#update();
      this.#draw();
    }
    this.#animFrameId = requestAnimationFrame(this.#boundLoop);
  }

  #update() {
    this.#dir = this.#nextDir
    const head = {
      x: this.#snake[0].x + this.#dir.x,
      y: this.#snake[0].y + this.#dir.y
    }

    // collision
    if (
      head.x < 0 || head.y < 0 ||
      head.x >= this.#grid.count || head.y >= this.#grid.count ||
      this.#snake.some(s => s.x === head.x && s.y === head.y)
    ) {
      this.#alive = false
      this.#ctx.fillStyle = "#f00"
      this.#ctx.font = "bold 30px sans-serif"
      this.#ctx.fillText("💀 GAME OVER", 60, this.#canvas.height / 2)
      return
    }

    this.#snake.unshift(head)

    if (head.x === this.#apple.x && head.y === this.#apple.y) {
      this.#score++
      document.getElementById("score").textContent = this.#score
      if (this.#score > this.#record) {
        this.#record = this.#score
        localStorage.setItem("snakeRecord", this.#record)
        document.getElementById("record").textContent = this.#record
      }
      new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg").play()
      this.#spawnApple()
    } else {
      this.#snake.pop()
    }
  }

  #draw() {
    this.#ctx.fillStyle = "#000"
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height)

    this.#ctx.fillStyle = "#0f0"
    for (const s of this.#snake) {
      this.#ctx.fillRect(s.x * this.#tileSize, s.y * this.#tileSize, this.#tileSize, this.#tileSize)
    }

    this.#ctx.fillStyle = "#f00"
    this.#ctx.fillRect(this.#apple.x * this.#tileSize, this.#apple.y * this.#tileSize, this.#tileSize, this.#tileSize)
  }

  #arrowKeyHandler(e) {
    if (this.#alive && this.#dirMap[e.key]) {
      const newDir = this.#dirMap[e.key]
      // Prevent 180-degree turn
      if (newDir.x !== -this.#dir.x || newDir.y !== -this.#dir.y) {
        this.#nextDir = newDir
      }
    }
  }

  #touchHandler(e) {
    const touch = e.touches[0]
    const dx = touch.clientX - this.#canvas.offsetLeft
    const dy = touch.clientY - this.#canvas.offsetTop
    const gridX = Math.floor(dx / this.#tileSize)
    const gridY = Math.floor(dy / this.#tileSize)

    if (gridX < 0 || gridY < 0 || gridX >= this.#grid.count || gridY >= this.#grid.count) return

    // Determine direction based on touch position
    if (Math.abs(dx) > Math.abs(dy)) {
      this.#nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 }
    } else {
      this.#nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 }
    }
  }

  #touchStartHandler(e) {
    const touch = e.touches[0]
    this.#startX = touch.clientX
    this.#startY = touch.clientY
  }

  #setupControls() {
    const keyHandler = this.#arrowKeyHandler.bind(this);
    const touchStartHandler = e => {
      this.#startX = e.touches[0].clientX;
      this.#startY = e.touches[0].clientY;
    };
    const touchMoveHandler = e => {
      const dx = e.touches[0].clientX - this.#startX;
      const dy = e.touches[0].clientY - this.#startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.#nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        this.#nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }
      this.#startX = this.#startY = 0;
    };
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("touchstart", touchStartHandler);
    window.addEventListener("touchmove", touchMoveHandler);
    // Função para remover listeners
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("touchstart", touchStartHandler);
      window.removeEventListener("touchmove", touchMoveHandler);
    };
  }

  stop() {
    this.#alive = false;
    if (this.#removeControls) this.#removeControls();
    if (this.#animFrameId) cancelAnimationFrame(this.#animFrameId);
  }
  start() {
    if (!this.#alive) {
      this.reset()
    }
  }
  getState() {
    return {
      snake: this.#snake,
      apple: this.#apple,
      score: this.#score,
      record: this.#record,
      alive: this.#alive
    }
  }
  setState(state) {
    this.#snake = state.snake
    this.#apple = state.apple
    this.#score = state.score
    this.#record = state.record
    this.#alive = state.alive
    document.getElementById("score").textContent = this.#score
    document.getElementById("record").textContent = this.#record
    this.#draw()
  }
  isRunning() {
    return this.#alive;
  }

  get recordKey() {
    return this.#recordKey;
  }
  
  record = {
    save: this.#record.save,
    load: this.#record.load
  };

  // Dificuldade: easy, medium, hard
  setDifficulty(level) {
    switch(level) {
      case 'easy':
        this.#speed = 180; // maior valor = mais lento
        break;
      case 'hard':
        this.#speed = 70; // menor valor = mais rápido
        break;
      case 'medium':
      default:
        this.#speed = 120;
        break;
    }
    // Reinicia o jogo com a nova dificuldade
    this.reset();
  }
}
