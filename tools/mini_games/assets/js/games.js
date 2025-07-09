var game = null;

window.addEventListener('load', () => {
    const placeholderCanvas = document.getElementById('placeholder');
    const pongCanvas = document.getElementById('pong');
    const snakeCanvas = document.getElementById('snake');
    const tttCanvas = document.getElementById('tictactoe');
    
    const gamesMap = {
        initGame: () => {
            document.getElementById('record').textContent = game.record.load();
            canvasCtl.resizeCanvas(pongCanvas);
            canvasCtl.resizeCanvas(snakeCanvas);
            canvasCtl.resizeCanvas(tttCanvas);
            document.getElementById('restart').onclick = () => {
                document.getElementById('score').textContent = '0';
                game.reset();
            };
            document.getElementById('start').onclick = () => {
                game.start('pong');
            };
            document.getElementById('stop').onclick = () => {
                game.stop();
            };
        },
        pong: () => {
            game = new PongGame();
            game.start('pong');
            game.initGame();
            // Dificuldade
            const diffSelect = document.getElementById('pong-difficulty');
            if (diffSelect) {
                diffSelect.onchange = (e) => {
                    game.setDifficulty(e.target.value);
                };
                // Aplica a dificuldade inicial
                game.setDifficulty(diffSelect.value);
            }
        },
        snake: () => {
            game = new SnakeGame();
            game.start('snake');
            game.initGame();
        },
        tictactoe: () => {
            game = new TicTacToe(document.getElementById('tictactoe'));
            game.initGame();
        }
    };
    const gamesCtl = {
        stopGame: () => {
            if (game && typeof game.stop === 'function') {
                game.stop();
                game = null;
            }
            // Esconde todos os canvases
            canvasCtl.showOnlyCanvas(null);
        },
        showGame: (gameType) => {
            gamesCtl.stopGame();
            buttonsCtl.resetButtonStyles();
            // Mostra apenas o canvas do jogo selecionado
            canvasCtl.showOnlyCanvas(gameType);
            gamesMap[gameType]?.();
            buttonsCtl.highlightSelectedButton(gameType);
        }
    };
    const buttonsCtl = {
        resetButtonStyles: () => {
            const buttons = document.querySelectorAll('.btns button');
            buttons.forEach(button => {
                buttonsCtl.unhighlightButton(button);
            });
        },
        highlightButton: (button) => {
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
        },
        unhighlightButton: (button) => {
            button.style.backgroundColor = '';
            button.style.color = '';
        },
        resetButtonStyles: () => {
            const buttons = document.querySelectorAll('.btns button');
            buttons.forEach(button => {
                buttonsCtl.unhighlightButton(button);
            });
        },
        highlightSelectedButton: (gameType) => {
            const buttons = document.querySelectorAll('.btns button');
            buttons.forEach(button => {
                if (button.textContent.toLowerCase() === gameType.toLowerCase()) {
                    buttonsCtl.highlightButton(button);
                } else {
                    buttonsCtl.unhighlightButton(button);
                }
            });
        }
    };
    const canvasCtl = {
        showOnlyCanvas: (canvasId) => {
            const canvases = document.querySelectorAll('.game-canvas');
            let showPlaceholder = true;
            canvases.forEach(canvas => {
                if (canvasId && canvas.id === canvasId) {
                    canvas.classList.add('active');
                    showPlaceholder = false;
                } else {
                    canvas.style.display = 'none'; // Esconde novamente se não for o ativo
                    canvas.classList.remove('active');
                }
            });
            if (showPlaceholder) {
                placeholderCtl.showPlaceholder(); // Mostra o placeholder se nenhum jogo estiver ativo
            } else {
                placeholderCtl.hidePlaceholder(); // Esconde o placeholder se um jogo estiver ativo
            }
        },
        resizeCanvas: (canvas) => {
            if (!canvas) return;
            const aspectRatio = 4 / 3;
            let width = Math.min(window.innerWidth * 0.7, 800);
            let height = width / aspectRatio;
            if (height > window.innerHeight * 0.8) {
                height = window.innerHeight * 0.8;
                width = height * aspectRatio;
            }
            canvas.width = width;
            canvas.height = height;
        }
    };
    const placeholderCtl = {
        initPlaceholder: () => {
            if (!placeholderCanvas) {
                console.warn('Placeholder canvas não encontrado, criando um novo.');
                throw new Error('Placeholder canvas não encontrado.');
            }
            
            document.body.appendChild(placeholderCanvas);
        },
        drawPlaceholder: () => {
            if (!placeholderCanvas) return;

            const ctx = placeholderCanvas.getContext('2d');
            ctx.clearRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);

            // Fundo igual ao body
            ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#f0f0f0';
            ctx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);

            // Caixa centralizada
            const boxWidth = Math.min(400, placeholderCanvas.width);
            const boxHeight = 180;

            const boxX = (placeholderCanvas.width - boxWidth) / 2;
            const boxY = (placeholderCanvas.height - boxHeight) / 2;

            // Borda arredondada
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(boxX + 16, boxY);

            ctx.lineTo(boxX + boxWidth - 16, boxY);
            ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + 16);

            ctx.lineTo(boxX + boxWidth, boxY + boxHeight - 16);
            ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - 16, boxY + boxHeight);

            ctx.lineTo(boxX + 16, boxY + boxHeight);
            ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - 16);

            ctx.lineTo(boxX, boxY + 16);
            ctx.quadraticCurveTo(boxX, boxY, boxX + 16, boxY);

            ctx.closePath();
            ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#f0f0f0';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#007bff';
            ctx.stroke();
            ctx.restore();
            // Texto centralizado
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Selecione um jogo', placeholderCanvas.width / 2, boxY + 75);
            ctx.font = '18px Arial';
            ctx.fillText('ou pressione ESC para sair', placeholderCanvas.width / 2, boxY + 100);
        },
        showPlaceholder: () => {
            const placeholderCanvas = document.getElementById('placeholder');
            if (placeholderCanvas) {
                placeholderCanvas.style.display = 'block'; // Mostra o canvas placeholder
                placeholderCtl.drawPlaceholder();
            }
        },
        hidePlaceholder: () => {
            const placeholderCanvas = document.getElementById('placeholder');
            if (placeholderCanvas) {
                placeholderCanvas.style.display = 'none'; // Esconde o canvas placeholder
            }
        }
    };

    const setEventListeners = () => {
        document.querySelectorAll('.btns button').forEach(button => {
            button.addEventListener('click', (event) => {
                const gameType = event.target.dataset.game;
                gamesCtl.showGame(gameType);
                buttonsCtl.highlightSelectedButton(gameType);
            });
        });
        window.addEventListener('resize', () => {
            // Redimensiona todos os canvases ao redimensionar a janela
            canvasCtl.resizeCanvas(placeholderCanvas);
            canvasCtl.resizeCanvas(pongCanvas);
            canvasCtl.resizeCanvas(snakeCanvas);
            canvasCtl.resizeCanvas(tttCanvas);
        });
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                gamesCtl.stopGame();
                buttonsCtl.resetButtonStyles();
            }
        });
        window.addEventListener('resize', resizeAllCanvases);
    };
    const resizeAllCanvases = () => {
        [pongCanvas, snakeCanvas, tttCanvas].forEach(canvas => {
            if (canvas) {
                canvasCtl.resizeCanvas(canvas);
            }
        });
    };
    
    // Observa redimensionamento do body para ajustar todos os canvases
    if (!('ResizeObserver' in window)) {
        console.warn('ResizeObserver não suportado, usando fallback de resize.');
        window.addEventListener('resize', resizeAllCanvases);
    } else {
        const resizeObserver = new ResizeObserver(resizeAllCanvases);
        resizeObserver.observe(document.body);
    }

    // Redimensiona todos os canvases ao carregar e ao redimensionar a janela
    resizeAllCanvases();
    // Mostra nada por padrão
    canvasCtl.showOnlyCanvas(null);
    // Registra os event listeners
    setEventListeners();
});

// Função utilitária para aplicar dificuldade se suportado
function applyDifficulty(gameInstance, difficulty) {
    if (typeof gameInstance.setDifficulty === 'function' && difficulty) {
        gameInstance.setDifficulty(difficulty);
    }
}

// Novo método centralizado para iniciar qualquer jogo
function startGame(gameName, options = {}) {
    if (game && typeof game.stop === 'function') game.stop();
    let instance;
    switch (gameName) {
        case 'pong':
            instance = new PongGame();
            instance.start('pong');
            applyDifficulty(instance, options.difficulty || (document.getElementById('pong-difficulty')?.value));
            break;
        case 'snake':
            instance = new SnakeGame();
            instance.start('snake');
            applyDifficulty(instance, options.difficulty);
            break;
        case 'tictactoe':
            instance = new TicTacToe(document.getElementById('tictactoe'));
            applyDifficulty(instance, options.difficulty);
            break;
        default:
            return;
    }
    // Atualiza painel de record
    if (instance.record && typeof instance.record.load === 'function') {
        instance.record.load();
    }
    // Atualiza painel de score
    document.getElementById('score').textContent = '0';
    // Liga botões
    document.getElementById('restart').onclick = () => instance.reset();
    document.getElementById('start').onclick = () => instance.start(gameName);
    document.getElementById('stop').onclick = () => instance.stop();
    // Liga dificuldade se existir
    const diffSelect = document.getElementById('pong-difficulty');
    if (diffSelect && gameName === 'pong') {
        diffSelect.onchange = (e) => {
            instance.setDifficulty(e.target.value);
        };
    }
    game = instance;
}

