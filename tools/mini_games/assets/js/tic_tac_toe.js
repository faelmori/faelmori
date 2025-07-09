class TicTacToe {
    #canvas;
    #ctx;
    #size;
    #cellSize;
    #board;
    #current;
    #winner;
    #boundHandleClick;
    #score = {
        player: 0,
        computer: 0
    };
    #recordElement = document.getElementById('record');
    #recordKey = 'tttRecord';
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

    constructor(canvas) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Canvas inválido ou não encontrado.');
        }
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');
        this.#size = Math.min(canvas.width, canvas.height);
        this.#cellSize = this.#size / 3;
        this.#boundHandleClick = this.#handleClick.bind(this);
        this.#canvas.addEventListener('click', this.#boundHandleClick);
        this.#init();
        // Atualiza painel
        this.#recordElement = document.getElementById('record');
        this.#score = { player: 0, computer: 0 };
        this.#updatePanel();
    }

    #init() {
        this.#board = Array.from({ length: 3 }, () => ['', '', '']);
        this.#current = 'X';
        this.#winner = null;
        this.#draw();
        this.#updatePanel();
    }

    #handleClick(e) {
        if (this.#winner) return;
        const rect = this.#canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const row = Math.floor(y / this.#cellSize);
        const col = Math.floor(x / this.#cellSize);
        if (this.#board[row][col] === '') {
            this.#board[row][col] = this.#current;
            if (this.#checkWinner()) {
                this.#winner = this.#current;
                if (this.#current === 'X') {
                    this.#score.player++;
                } else {
                    this.#score.computer++;
                }
                this.#record.save();
            } else if (this.#isDraw()) {
                this.#winner = 'draw';
            } else {
                this.#current = this.#current === 'X' ? 'O' : 'X';
            }
            this.#draw();
            this.#updatePanel();
        }
    }

    #checkWinner() {
        const b = this.#board;
        for (let i = 0; i < 3; i++) {
            if (b[i][0] && b[i][0] === b[i][1] && b[i][1] === b[i][2]) return true;
            if (b[0][i] && b[0][i] === b[1][i] && b[1][i] === b[2][i]) return true;
        }
        if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) return true;
        if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) return true;
        return false;
    }

    #isDraw() {
        return this.#board.flat().every(cell => cell !== '');
    }

    #draw() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        // Grade
        this.#ctx.strokeStyle = '#fff';
        this.#ctx.lineWidth = 4;
        for (let i = 1; i < 3; i++) {
            this.#ctx.beginPath();
            this.#ctx.moveTo(i * this.#cellSize, 0);
            this.#ctx.lineTo(i * this.#cellSize, this.#size);
            this.#ctx.stroke();
            this.#ctx.beginPath();
            this.#ctx.moveTo(0, i * this.#cellSize);
            this.#ctx.lineTo(this.#size, i * this.#cellSize);
            this.#ctx.stroke();
        }
        // X e O
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const val = this.#board[r][c];
                if (val) {
                    this.#ctx.font = `${this.#cellSize * 0.7}px Arial`;
                    this.#ctx.textAlign = 'center';
                    this.#ctx.textBaseline = 'middle';
                    this.#ctx.fillStyle = val === 'X' ? '#0ff' : '#ff0';
                    this.#ctx.fillText(val, c * this.#cellSize + this.#cellSize / 2, r * this.#cellSize + this.#cellSize / 2);
                }
            }
        }
        // Mensagem de vitória
        if (this.#winner) {
            this.#ctx.fillStyle = '#0f0';
            this.#ctx.font = '28px Arial';
            this.#ctx.textAlign = 'center';
            const msg = this.#winner === 'draw' ? 'Empate!' : `Vencedor: ${this.#winner}`;
            this.#ctx.fillText(msg, this.#size / 2, this.#size - 20);
        }
    }

    #updatePanel() {
        document.getElementById('score').textContent = this.#score.player;
        this.#record.load();
    }

    start() {
        this.#init();
    }

    stop() {
        this.#canvas.removeEventListener('click', this.#boundHandleClick);
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    isRunning() {
        return this.#winner === null;
    }

    reset() {
        this.#init();
        this.#updatePanel();
    }

    get recordKey() {
        return this.#recordKey;
    }

    record = {
        save: this.#record.save,
        load: this.#record.load
    };
}
