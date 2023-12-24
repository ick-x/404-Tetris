document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    const context = canvas.getContext('2d');

    const ROWS = 20;
    const COLUMNS = 10;
    const BLOCK_SIZE = 30;

    const shapes = {
        square: [[1, 1], [1, 1]],
        line: [[1, 1, 1, 1]],
        T: [[1, 1, 1], [0, 1, 0]],
        L: [[1, 1, 1], [1, 0, 0]],
        J: [[1, 1, 1], [0, 0, 1]],
        S: [[1, 1, 0], [0, 1, 1]],
        Z: [[0, 1, 1], [1, 1, 0]],
    };

    const shapeColors = {
        square: '#eaea00',
        line: '#00efef',
        T: '#AA00FF',
        L: '#FFA500',
        J: '#0000FF',
        S: '#01FF00',
        Z: '#FF0000',
    };

    let tetrisGrid = newGrid();

    let currentPiece;
    let nextPiece;
    let savedPiece;

    let nbPieces = 1;
    let speedModifier = 1;

    let lineCount = 0;
    let score = 0;
    let displayScore = document.getElementById("displayScore");


    function newGrid() {
        return Array.from({length: ROWS}, () => Array(COLUMNS).fill(0));
    }


    function drawSquare(x, y, color, padding = 0, context = null, blockSize = BLOCK_SIZE) {
        if (context == null) {
            context = document.getElementById('tetrisCanvas').getContext('2d');
        }

        context.fillStyle = color;
        context.fillRect(x * blockSize, y * blockSize + padding, blockSize, blockSize);

            context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.strokeRect(x * blockSize + 1, y * blockSize + padding + 1, blockSize - 2, blockSize - 2);

        context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x * blockSize + blockSize, y * blockSize + padding);
        context.lineTo(x * blockSize + blockSize, y * blockSize + blockSize + padding);
        context.stroke();
        context.beginPath();
        context.moveTo(x * blockSize, y * blockSize + blockSize + padding);
        context.lineTo(x * blockSize + blockSize, y * blockSize + blockSize + padding);
        context.stroke();

    }

    function drawGridAndPiece() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                const color = tetrisGrid[row][col];
                if (color) {
                    drawSquare(col, row, color);
                }

                context.beginPath();
                context.moveTo(col * BLOCK_SIZE, 0);
                context.lineTo(col * BLOCK_SIZE, canvas.height);
                context.strokeStyle = 'rgba(220,220,220,0.45)';
                context.stroke();
            }

            context.beginPath();
            context.moveTo(0, row * BLOCK_SIZE);
            context.lineTo(canvas.width, row * BLOCK_SIZE);
            context.strokeStyle = 'rgba(220,220,220,0.45)';
            context.stroke();
        }

        if (currentPiece) {
            currentPiece.draw();
        }
    }


    function drawNextPiece() {
        const nextPieceCanvas = document.getElementById('nextPieceCanvas');
        const nextPieceContext = nextPieceCanvas.getContext('2d');

        nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

        const nextShape = getRandomShape();
        const nextColor = getRandomColor(nextShape);

        nextPiece = new TetrisPiece(nextShape, nextColor);
        nbPieces++;

        nextPiece.shape.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col) {
                    drawSquare(j, i, nextColor, 0, nextPieceContext, BLOCK_SIZE);
                }
            });
        });
    }

    function drawSavedPiece() {
        const savedPieceCanvas = document.getElementById('savedPieceCanvas');
        const savedPieceContext = savedPieceCanvas.getContext('2d');

        const savedShape = currentPiece.shape;
        const savedColor = currentPiece.color;

        savedPiece.shape.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col) {
                    drawSquare(j, i, savedColor, 0, savedPieceContext, BLOCK_SIZE);
                }
            });
        });
    }

    function clearSavedPiece() {
        savedPiece = null;
        const savedPieceCanvas = document.getElementById('savedPieceCanvas');
        const savedPieceContext = savedPieceCanvas.getContext('2d');
        savedPieceContext.clearRect(0, 0, savedPieceCanvas.width, savedPieceCanvas.height);
    }

    function getRandomColor(shape) {
        return shapeColors[shape];
    }

    function createPiece(shape, color) {
        return {
            shape: shapes[shape],
            color: color || getRandomColor(shape),
        };
    }
    class TetrisPiece {
        constructor(shape, color) {
            this.frame = 0;
            this.maxFrame = 240;
            this.shape = shapes[shape];
            this.color = color || getRandomColor(shape);
            this.row = -this.shape.length + 1;
            this.col = Math.floor(COLUMNS / 2) - Math.floor(this.shape[0].length / 2);
        }

        draw() {
            this.shape.forEach((row, i) => {
                row.forEach((col, j) => {
                    if (col) {
                        drawSquare(this.col + j, this.row + i, this.color, BLOCK_SIZE * this.frame / this.maxFrame - BLOCK_SIZE);
                    }
                });
            });
        }

        autoMoveDown() {
            clearRows();
            this.frame += speedModifier;
            if (this.frame >= this.maxFrame) {
                this.frame = 0;
                this.row++;
            }
        }

        moveDown() {
            this.row++;
            this.frame = 0;
        }

        moveLeft() {
            this.col--;
            if (collision()) {
                this.col++;
            }
        }

        moveRight() {
            this.col++;
            if (collision()) {
                this.col--;
            }
        }

        rotate() {
            const oldShape = this.shape;
            const oldRow = this.row;
            const oldCol = this.col;

            const centerRow = Math.floor(this.shape.length / 2);
            const centerCol = Math.floor(this.shape[0].length / 2);

            this.shape = this.shape[0].map((_, i) =>
                this.shape.map((row) => row[i]).reverse()
            );

            this.row = oldRow + centerRow - Math.floor(this.shape.length / 2);
            this.col = oldCol + centerCol - Math.floor(this.shape[0].length / 2);

            if (collision()) {
                this.col = oldCol - 1;
                if (collision()) {
                    this.shape = oldShape;
                    this.row = oldRow;
                    this.col = oldCol;
                }
            }
        }


    }

    function collision() {
        for (let i = 0; i < currentPiece.shape.length; i++) {
            for (let j = 0; j < currentPiece.shape[i].length; j++) {
                if (
                    currentPiece.row >= 0 && currentPiece.shape[i][j] &&
                    (tetrisGrid[currentPiece.row + i] &&
                        tetrisGrid[currentPiece.row + i][currentPiece.col + j]) !== 0
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function mergePiece() {
        currentPiece.shape.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col) {
                    if (tetrisGrid[currentPiece.row + i - 1] && tetrisGrid[currentPiece.row + i - 1][currentPiece.col + j] !== undefined) {
                        tetrisGrid[currentPiece.row + i - 1][currentPiece.col + j] = currentPiece.color;
                    }
                }
            });
        });
    }

    function clearRows() {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (tetrisGrid[row].every((col) => col !== 0)) {
                tetrisGrid.splice(row, 1);
                tetrisGrid.unshift(Array(COLUMNS).fill(0));
                lineCount++;
            }
        }
    }

    function update() {
        checkGameOver();
        displayScore.innerHTML = "Score : " + score;

        if (currentPiece) {
            currentPiece.autoMoveDown();

            if (collision()) {
                mergePiece();
                currentPiece = nextPiece;
                drawNextPiece();
            }
        }

        if (nbPieces === 25) {
            nbPieces = 0;
            speedModifier++;
        }

    }

    function getRandomShape() {
        const shapes = Object.keys(shapeColors);
        const randomIndex = Math.floor(Math.random() * shapes.length);
        return shapes[randomIndex];
    }


    function refreshScore(lineCounter) {
        switch (lineCounter) {
            case 1:
                score += 40;
                lineCount = 0;
                break;
            case 2:
                score += 100;
                lineCount = 0;
                break;
            case 3:
                score += 300;
                lineCount = 0;
                break;
            case 4:
                score += 1200;
                lineCount = 0;
                break;
        }
    }

    function handleKeyPress(event) {
        switch (event.code) {
            case 'ArrowLeft' :
                currentPiece.moveLeft();
                if (collision()) currentPiece.moveRight();
                break;
            case 'ArrowRight':
                currentPiece.moveRight();
                if (collision()) currentPiece.moveLeft();
                break;
            case 'ArrowDown':
                currentPiece.moveDown();
                if (collision()) {
                    mergePiece();
                    currentPiece = nextPiece;
                    drawNextPiece();
                }
                break;
            case 'ArrowUp':
                currentPiece.rotate();
                if (collision()) currentPiece.rotate();
                break;
            case 'KeyA' :
                currentPiece.moveLeft();
                if (collision()) currentPiece.moveRight();
                break;
            case 'KeyD':
                currentPiece.moveRight();
                if (collision()) currentPiece.moveLeft();
                break;
            case 'KeyS':
                currentPiece.moveDown();
                if (collision()) {
                    mergePiece();
                    currentPiece = nextPiece;
                    drawNextPiece();
                }
                break;
            case 'KeyW':
                currentPiece.rotate();
                if (collision()) currentPiece.rotate();
                break;
            case 'Space':
                while (!collision()) {
                    currentPiece.moveDown()
                }
                mergePiece();
                currentPiece = nextPiece;
                drawNextPiece();
                break;
            case 'KeyR':
                if (savedPiece) {
                    currentPiece = savedPiece;
                    currentPiece.row = -currentPiece.shape.length + 1;
                    currentPiece.col = Math.floor(COLUMNS / 2) - Math.floor(currentPiece.shape[0].length / 2);
                    drawGridAndPiece();
                    clearSavedPiece();
                } else {
                    savedPiece = currentPiece;
                    drawSavedPiece();
                    currentPiece = nextPiece;
                    drawNextPiece();
                }
                break;
        }
    }

    document.addEventListener('keydown', handleKeyPress);

    function checkGameOver() {
        for (let i = 0; i < tetrisGrid[0].length; ++i) {
            if (tetrisGrid[0][i] !== 0) {
                if (confirm('Game Over! \n Do you want to play again?')) {
                    tetrisGrid = newGrid();
                    speedModifier = 1;
                    score = 0;
                } else {
                    open("../index.html", "_self");
                }
            }
        }
    }


    function gameLoop() {
        checkGameOver();
        for (let i = 0; i < 4; i++) {
            update();
        }
        drawGridAndPiece();
        refreshScore(lineCount);
        requestAnimationFrame(gameLoop);

    }

    currentPiece = new TetrisPiece(getRandomShape(), getRandomColor());
    drawNextPiece();

    gameLoop();
});
