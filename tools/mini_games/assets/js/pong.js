/**
   * PongGame class represents a simple Pong game implementation.
   * It handles the game state, rendering, and user controls.
   * The game can be started, stopped, and reset.
   * 
   * @class
   */
class PongGame {
  #paddle = { width: 12, height: 90 };
  #ball = { size: 16, x: 0, y: 0, speedX: 0, speedY: 0 };
  #player = { x: 20, y: 0 };
  #computer = { x: 0, y: 0 };

  #tileSize = 0; // Tile size, not used in this implementation
  #grid = { count: 20 }; // Grid count for the game, not used in this implementation
  #score = { player: 0, computer: 0 }; // Score tracking, not used in this implementation
  #alive = true; // Game state, not used in this implementation
  #lastFrameTime = 0; // Last frame time, not used in this implementation
  #ballSpeed = 6; // Ball speed, not used in this implementation
  #aiSpeed = 4; // AI speed, not used in this implementation
  
  #ctx;
  #canvas;
  #boundGameLoop;
  #boundHandleMouseMove;
  #boundHandleTouchMove;
  #animFrameId = null;

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
  #recordKey =  'pongRecord'; // Key for storing the record score in localStorage
  #recordElement = document.getElementById('record'); // Element to display the record score
  #restartButton = document.getElementById('restart'); // Button to restart the game

  constructor(){
    this.#restartButton.addEventListener('click', () => this.#init());
  }

  // Private method to initialize the game state
  #init() {
      this.#player.y = this.#canvas.height / 2 - this.#paddle.height / 2;
      this.#computer.y = this.#canvas.height / 2 - this.#paddle.height / 2;

      this.#player.x = 20; // Player paddle position
      this.#computer.x = this.#canvas.width - 20 - this.#paddle.width; // AI paddle position

      this.#ball.x = this.#canvas.width / 2 - this.#ball.size / 2; // Ball initial position
      this.#ball.y = this.#canvas.height / 2 - this.#ball.size / 2; // Ball initial position

      this.#ball.speedX = this.#ballSpeed * (Math.random() > 0.5 ? 1 : -1); // Random initial speed
      this.#ball.speedY = (this.#ballSpeed - 2) * (Math.random() * 2 - 1); // Random initial speed

      this.#ctx = this.#canvas.getContext('2d'); // Get canvas context
      this.#ctx.fillStyle = '#fff'; // Set default fill style
      this.#ctx.strokeStyle = '#fff'; // Set default stroke style
      this.#ctx.lineWidth = 2; // Set default line width

      this.#boundGameLoop = this.#gameLoop.bind(this); // Bind game loop
      this.#boundHandleMouseMove = this.#handleMouseMove.bind(this); // Bind mouse move handler
      this.#boundHandleTouchMove = this.#handleTouchMove.bind(this); // Bind touch move handler

      this.#canvas.addEventListener('mousemove', this.#boundHandleMouseMove); // Add mouse move event listener
      this.#canvas.addEventListener('touchmove', this.#boundHandleTouchMove); // Add touch move event listener
      this.#canvas.addEventListener('touchstart', (e) => e.preventDefault()); // Prevent default touch behavior
      this.#canvas.addEventListener('touchend', (e) => e.preventDefault()); // Prevent default touch behavior
      this.#canvas.addEventListener('touchcancel', (e) => e.preventDefault()); // Prevent default touch behavior

      this.#score = { player: 0, computer: 0 }; // Reset score
      this.#alive = true; // Game is alive
      this.#lastFrameTime = performance.now(); // Initialize frame time
      this.#tileSize = Math.floor(this.#canvas.height / this.#grid.count); // Responsive tile size
      
      this.#resetBall();
      this.#animFrameId = null; // Reset animation frame ID
  }

  // Private method to start the game loop
  // This method is called internally to start the game loop using requestAnimationFrame.
  // It ensures that the game loop is only running once at a time.
  /**
   * Starts the game loop using requestAnimationFrame.
   * This method is private and should not be called directly.
   */
  /*
   * @private
   */
  #startGameLoop() {
      if (this.#animFrameId) {
          cancelAnimationFrame(this.#animFrameId);
      }
      this.#animFrameId = requestAnimationFrame(this.#boundGameLoop);
  }

  // Private method to reset the ball position and speed
  /**
   * Resets the ball position and speed to the center of the canvas.
   * This method is private and should not be called directly.
   */
  /*
   * @private
   */
  #resetBall() {
      this.#ball.x = this.#canvas.width / 2 - this.#ball.size / 2;
      this.#ball.y = this.#canvas.height / 2 - this.#ball.size / 2;
      this.#ball.speedX = this.#ballSpeed * (Math.random() > 0.5 ? 1 : -1); // Use #ballSpeed
      this.#ball.speedY = (this.#ballSpeed - 2) * (Math.random() * 2 - 1);
  }

  // Private method to update the game state
  /**
   * Updates the game state, including player and AI paddle positions,
   * ball position and speed, and collision detection.
   * This method is private and should not be called directly.
   */
  /*
   * @private
   */
  #update() {
      if (!this.#alive) return; // Only update if game is alive
      // Frame delta for smoothness
      const now = performance.now();
      const delta = (now - this.#lastFrameTime) / 16.67; // Normalize to 60fps

      this.#lastFrameTime = now;

      this.#ball.x += this.#ball.speedX * delta;
      this.#ball.y += this.#ball.speedY * delta;

      if (this.#ball.y <= 0 || this.#ball.y + this.#ball.size >= this.#canvas.height) {
          this.#ball.speedY *= -1;
      }

      // Player collision
      if (
          this.#ball.x <= this.#player.x + this.#paddle.width &&
          this.#ball.y + this.#ball.size >= this.#player.y &&
          this.#ball.y <= this.#player.y + this.#paddle.height
      ) {
          this.#ball.x = this.#player.x + this.#paddle.width;
          this.#ball.speedX *= -1;
          const impact = ((this.#ball.y + this.#ball.size / 2) - (this.#player.y + this.#paddle.height / 2)) / (this.#paddle.height / 2);
          this.#ball.speedY += impact * 2;
      }

      // AI collision
      if (
          this.#ball.x + this.#ball.size >= this.#computer.x &&
          this.#ball.y + this.#ball.size >= this.#computer.y &&
          this.#ball.y <= this.#computer.y + this.#paddle.height
      ) {
          this.#ball.x = this.#computer.x - this.#ball.size;
          this.#ball.speedX *= -1;
          const impact = ((this.#ball.y + this.#ball.size / 2) - (this.#computer.y + this.#paddle.height / 2)) / (this.#paddle.height / 2);
          this.#ball.speedY += impact * 2;
      }

      // Score logic
      if (this.#ball.x < 0) {
          this.#score.computer++;
          this.#resetBall();
      } else if (this.#ball.x > this.#canvas.width) {
          this.#score.player++;
          this.#resetBall();
      }

      // AI movement
      const aiCenter = this.#computer.y + this.#paddle.height / 2;
      if (aiCenter < this.#ball.y + this.#ball.size / 2 - 10) {
          this.#computer.y += this.#aiSpeed * delta;
      } else if (aiCenter > this.#ball.y + this.#ball.size / 2 + 10) {
          this.#computer.y -= this.#aiSpeed * delta;
      }
      this.#computer.y = Math.max(0, Math.min(this.#canvas.height - this.#paddle.height, this.#computer.y));
  }

  // Private method to draw the game state on the canvas
  /**
   * Draws the current game state on the canvas, including paddles, ball, and center line.
   * This method is private and should not be called directly.
   */
  /*
   * @private
   */
  #draw() {
      this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
      this.#drawRect(this.#player.x, this.#player.y, this.#paddle.width, this.#paddle.height);
      this.#drawRect(this.#computer.x, this.#computer.y, this.#paddle.width, this.#paddle.height);
      for (let i = 0; i < this.#canvas.height; i += 30) {
          this.#drawRect(this.#canvas.width / 2 - 2, i, 4, 20, '#888');
      }
      this.#drawBall(this.#ball.x, this.#ball.y, this.#ball.size);

      // Draw score
      this.#ctx.font = '32px Arial';
      this.#ctx.fillStyle = '#fff';
      this.#ctx.fillText(this.#score.player, this.#canvas.width / 2 - 60, 50);
      this.#ctx.fillText(this.#score.computer, this.#canvas.width / 2 + 40, 50);

      // Draw paused overlay
      if (!this.#alive) {
          this.#ctx.fillStyle = 'rgba(0,0,0,0.5)';
          this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
          this.#ctx.fillStyle = '#fff';
          this.#ctx.font = '48px Arial';
          this.#ctx.fillText('Pausado', this.#canvas.width / 2 - 90, this.#canvas.height / 2);
      }
  }

  // Private method to run the game loop
  /**
   * The main game loop that updates the game state and draws it on the canvas.
   * This method is private and should not be called directly.
   */
  /*
   * @private
   */
  #gameLoop() {
      this.#update();
      this.#draw();
      this.#animFrameId = requestAnimationFrame(this.#boundGameLoop);
  }

  // Private methods to draw shapes on the canvas

  // Private method to draw a rectangle on the canvas
  /**
   * Draws a rectangle on the canvas.
   * This method is private and should not be called directly.
   * @param {number} x - The x-coordinate of the rectangle.
   * @param {number} y - The y-coordinate of the rectangle.
   * @param {number} w - The width of the rectangle.
   * @param {number} h - The height of the rectangle.
   * @param {string} color - The retangle background color. (default is white).
   * */
  /*
   * @private
   */
  #drawRect(x, y, w, h, color = '#000') {
      this.#ctx.fillStyle = color;
      this.#ctx.fillRect(x, y, w, h);
  }

  // Private method to draw a ball on the canvas
  /**
   * Draws a ball on the canvas.
   * This method is private and should not be called directly.
   * @param {number} x - The x-coordinate of the ball.
   * @param {number} y - The y-coordinate of the ball.
   * @param {number} size - The diameter of the ball.
   * @param {string} color - The ball color (default is white).
   */
  /*
   * @private
   */
  #drawBall(x, y, size, color = '#000') {
      this.#ctx.fillStyle = color;
      this.#ctx.beginPath();
      this.#ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      this.#ctx.fill();
  }

  // Event handlers for mouse and touch controls

  // Mouse event handler for desktop devices
  /**
   * Handles mouse move events to update the player's paddle position.
   * This method is private and should not be called directly.
   * @param {MouseEvent} e - The mouse event object.
   */
  /*
   * @private
   */
  #handleMouseMove(e) {
      if (!this.#canvas) return; // Ensure canvas is initialized
      if (!this.#canvas.getBoundingClientRect) return; // Ensure getBoundingClientRect is available
      if (!this.#paddle) return; // Ensure paddle is initialized
      if (!this.#player) return; // Ensure player is initialized
      if (!this.#player.y) this.#player.y = 0; // Ensure player.y is initialized
      if (!this.#paddle.height) this.#paddle.height = 90; // Ensure paddle height is initialized
      if (!this.#canvas.height) this.#canvas.height = 600; // Ensure canvas height is initialized
      if (!this.#canvas.width) this.#canvas.width = 800; // Ensure canvas width is initialized
      if (!this.#ctx) this.#ctx = this.#canvas.getContext('2d'); // Ensure context is initialized
      if (!this.#ctx.fillStyle) this.#ctx.fillStyle = '#fff'; // Ensure fill style is initialized
      if (!this.#ctx.strokeStyle) this.#ctx.strokeStyle = '#fff'; // Ensure stroke style is initialized
      if (!this.#ctx.lineWidth) this.#ctx.lineWidth = 2; // Ensure line width is initialized
      if (!this.#ctx.arc) return; // Ensure arc method is available
      if (!this.#ctx.fillRect) return; // Ensure fillRect method is available
      if (!this.#ctx.fill) return; // Ensure fill method is available
      if (!this.#ctx.beginPath) return; // Ensure beginPath method is available
      if (!this.#ctx.clearRect) return; // Ensure clearRect method is available
      if (!this.#ctx.font) this.#ctx.font = '32px Arial'; // Ensure font is initialized
      if (!this.#ctx.fillText) return; // Ensure fillText method is available

      const rect = this.#canvas.getBoundingClientRect();
      const mouseY =  e.clientY - rect.top;

      this.#player.y = Math.max(
        this.#paddle.height, 
        Math.min(
          this.#canvas.height - this.#paddle.height, 
          mouseY - this.#paddle.height / 2
        )
      );

      // Verifica se o paddle do jogador está dentro dos limites do canvas
      if (this.#player.y < 0) {
          this.#player.y = 0; // Limita o paddle ao topo do canvas
      } else if (this.#player.y + this.#paddle.height > this.#canvas.height) {
          this.#player.y = this.#canvas.height - this.#paddle.height; // Limita o paddle à parte inferior do canvas
      } else {
          // Paddle está dentro dos limites do canvas
          this.#player.y = Math.max(0, Math.min(this.#canvas.height - this.#paddle.height, mouseY - this.#paddle.height / 2));
      }
  }

  // Touch event handler for mobile devices
  /**
   * Handles touch move events to update the player's paddle position.
   * This method is private and should not be called directly.
   * @param {TouchEvent} e - The touch event object.
   */
  /*
   * @private
   */
  #handleTouchMove(e) {
      e.preventDefault();
      // movePaddle Isso seria usado onde?
      if (e.touches.length === 0) return; // No touch points
      if (e.touches.length > 1) {
          // If there are multiple touches, ignore them
          return;
      }
      // Get the first touch point
      if (!this.#canvas) return; // Ensure canvas is initialized
      if (!this.#canvas.getBoundingClientRect) return; // Ensure getBoundingClientRect is available
      if (!this.#paddle) return; // Ensure paddle is initialized
      if (!this.#player) return; // Ensure player is initialized
      if (!this.#player.y) this.#player.y = 0; // Ensure player.y is initialized
      if (!this.#paddle.height) this.#paddle.height = 90; // Ensure paddle height is initialized
      if (!this.#canvas.height) this.#canvas.height = 600; // Ensure canvas height is initialized
      if (!this.#canvas.width) this.#canvas.width = 800; // Ensure canvas width is initialized
      if (!this.#ctx) this.#ctx = this.#canvas.getContext('2d'); // Ensure context is initialized
      if (!this.#ctx.fillStyle) this.#ctx.fillStyle = '#fff'; // Ensure fill style is initialized
      if (!this.#ctx.strokeStyle) this.#ctx.strokeStyle = '#fff'; // Ensure stroke style is initialized
      if (!this.#ctx.lineWidth) this.#ctx.lineWidth = 2; // Ensure line width is initialized
      if (!this.#ctx.arc) return; // Ensure arc method is available
      if (!this.#ctx.fillRect) return; // Ensure fillRect method is available
      if (!this.#ctx.fill) return; // Ensure fill method is available
      if (!this.#ctx.beginPath) return; // Ensure beginPath method is available
      if (!this.#ctx.clearRect) return; // Ensure clearRect method is available
      if (!this.#ctx.font) this.#ctx.font = '32px Arial'; // Ensure font is initialized
      if (!this.#ctx.fillText) return; // Ensure fillText method is available

      const rect = this.#canvas.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;

      this.#player.y = Math.max(0, Math.min(this.#canvas.height - this.#paddle.height, touchY - this.#paddle.height / 2));
  }

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
    this.#canvas.classList.add('active'); // Ensure the canvas is visible
    this.#ctx = this.#canvas.getContext("2d");
    this.#grid.count = gridCount;
    this.#boundGameLoop = this.#gameLoop.bind(this);
    this.#boundHandleMouseMove = this.#handleMouseMove.bind(this);
    this.#boundHandleTouchMove = this.#handleTouchMove.bind(this);
    this.#canvas.removeEventListener('mousemove', this.#boundHandleMouseMove);
    this.#canvas.removeEventListener('touchmove', this.#boundHandleTouchMove);
    this.#canvas.addEventListener('mousemove', this.#boundHandleMouseMove);
    this.#canvas.addEventListener('touchmove', this.#boundHandleTouchMove);
    this.reset();
    this.#alive = true; // Garante que o jogo está ativo
    if (this.#ctx && this.#canvas.width > 0 && this.#canvas.height > 0) {
      if (this.#animFrameId) {
        cancelAnimationFrame(this.#animFrameId);
      }
      this.#animFrameId = requestAnimationFrame(this.#boundGameLoop);
    }
  }

  // Public methods to control the game
  stop() {
      this.#alive = false;
      this.#canvas.removeEventListener('mousemove', this.#boundHandleMouseMove);
      this.#canvas.removeEventListener('touchmove', this.#boundHandleTouchMove);
      if (this.#animFrameId) {
          cancelAnimationFrame(this.#animFrameId);
          this.#animFrameId = null;
      }
  }

  // Public method to reset the game state
  // This method resets the game state, including the player and AI positions,
  // the ball position and speed, and the animation frame ID. It can be called
  // externally to reset the game without needing to restart it.
  /**
   * Resets the game state, including player and AI positions, ball position and speed.
   * This method can be called externally to reset the game without needing to restart it.
   */
  reset() {
      this.#init();
      this.#alive = true;
      if (this.#ctx && this.#canvas.width > 0 && this.#canvas.height > 0) {
        if (this.#animFrameId) {
          cancelAnimationFrame(this.#animFrameId);
        }
        this.#animFrameId = requestAnimationFrame(this.#boundGameLoop);
      }
  }

  // Public method to move the player's paddle
  /**
   * Moves the player's paddle by a specified distance.
   * This method can be called externally to move the paddle up or down.
   * @param {number} dy - The distance to move the paddle (positive for down, negative for up).
   */
  /*
   * @public
   */
  movePaddle(dy) {
    // Supondo que this.paddle1.y é a posição Y do paddle
    // this.paddleHeight é a altura do paddle
    // this.canvas.height é a altura total do canvas
    const newY = this.#player.y + dy;
    // Corrige para não ultrapassar os limites do canvas
    this.#player.y = Math.max(
        0,
        Math.min(this.#canvas.height - this.#paddle.height, newY)
    );
  }

  // Public method to get the current game state
  // This method returns the current state of the game, including the player,
  // AI, and ball positions and speeds. It can be called externally to get
  // the current game state without needing to access the private properties directly.
  /**
   * Gets the current game state, including player, AI, and ball positions and speeds.
   * @returns {Object} The current game state.
   */
  getState() {
      return {
          player: { ...this.#player },
          ai: { ...this.#computer },
          ball: { ...this.#ball }
      };
  }

  // Public method to check if the game is running
  // This method returns true if the game is currently running, and false otherwise.
  /**
   * Checks if the game is currently running.
   * @returns {boolean} True if the game is running, false otherwise.
   */
  isRunning() {
      return this.#animFrameId !== null;
  }

  // Public method to get the canvas element
  /**
   * Gets the canvas element used for rendering the game.
   * @returns {HTMLCanvasElement} The canvas element.
   */
  getCanvas() {
      return this.#canvas;
  }

  // Public method to get the canvas context
  /**
   * Gets the canvas context used for rendering the game.
   * @returns {CanvasRenderingContext2D} The canvas context.
   */
  getContext() {
      return this.#ctx;
  }

  // Public method to get the paddle dimensions
  /**
   * Gets the dimensions of the paddles used in the game.
   * @returns {Object} An object containing the width and height of the paddles.
   */
  getPaddleDimensions() {
      return { width: this.#paddle.width, height: this.#paddle.height };
  }

  // Public method to get the ball dimensions
  /**
   * Gets the dimensions of the ball used in the game.
   * @returns {Object} An object containing the size of the ball.
   */
  getBallDimensions() {
      return { size: this.#ball.size }; 
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
        this.#ballSpeed = 4;
        this.#aiSpeed = 2.5;
        break;
      case 'hard':
        this.#ballSpeed = 8;
        this.#aiSpeed = 6;
        break;
      case 'medium':
      default:
        this.#ballSpeed = 6;
        this.#aiSpeed = 4;
        break;
    }
    // Reinicia o jogo com a nova dificuldade
    this.reset();
  }
}
