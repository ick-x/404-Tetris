document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    const context = canvas.getContext('2d');

    const ROWS = 20;
    const COLUMNS = 10;
    const BLOCK_SIZE = 30;

    let tetrisGrid = newGrid();

    let currentPiece;
    let nextPiece;
    let intervalId;

    let ticCounter = 0;
    let speedModifier = 1;

    let lineCount = 0;
    let score = 0;
    let displayScore = document.getElementById("displayScore");

    // Initialize a new grid
    function newGrid() {
        return Array.from({length: ROWS}, () => Array(COLUMNS).fill(0));
    }

    // Draw a colored square on the canvas


    function drawSquare(x, y, color, padding = 0, context = null, blockSize = BLOCK_SIZE) {

        if (context == null) {
            context = document.getElementById('tetrisCanvas').getContext('2d');
        }

        context.fillStyle = color;
        context.fillRect(x * blockSize, y * blockSize + padding, blockSize, blockSize);
        context.strokeStyle = '#fff';
        context.strokeRect(x * blockSize, y * blockSize + padding, blockSize, blockSize);
    }


    // Draw the grid and the current tetris piece
    function drawGridAndPiece() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the existing grid
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                const color = tetrisGrid[row][col];
                if (color) {
                    drawSquare(col, row, color);
                }
            }
        }

        // Draw the current falling tetris piece
        if (currentPiece) {
            currentPiece.draw();
        }
    }

    function drawNextPiece() {
        const nextPieceCanvas = document.getElementById('nextPieceCanvas');
        const nextPieceContext = nextPieceCanvas.getContext('2d');

        // Effacer le canvas
        nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

        // Récupérer la forme et la couleur de la prochaine pièce
        const nextShape = getRandomShape();
        const nextColor = getRandomColor();

        nextPiece = new TetrisPiece(nextShape, nextColor);

        // Dessiner la pièce sur le canvas
        nextPiece.shape.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col) {
                    drawSquare(j, i, nextColor, 0, nextPieceContext, BLOCK_SIZE);
                }
            });
        });
    }


    // Class representing a Tetris piece
    class TetrisPiece {
        constructor(shape, color) {
            this.frame = 0;
            this.maxFrame = 240;
            this.shape = shape;
            this.color = color;
            this.row = -shape.length + 1;
            this.col = Math.floor(COLUMNS / 2) - Math.floor(shape[0].length / 2);
        }

        // Draw the Tetris piece on the canvas
        draw() {
            this.shape.forEach((row, i) => {
                row.forEach((col, j) => {
                    if (col) {
                        // Apply animation to the falling piece
                        drawSquare(this.col + j, this.row + i, this.color, BLOCK_SIZE * this.frame / this.maxFrame - BLOCK_SIZE);
                    }
                });
            });
        }

        // Automatically move the Tetris piece down
        autoMoveDown() {
            clearRows();
            this.frame += speedModifier;
            if (this.frame === this.maxFrame) {
                this.frame = 0;
                this.row++;
            }
        }

        // Move the Tetris piece down
        moveDown() {
            this.row++;
            this.frame = 0;
        }

        // Move the Tetris piece to the left
        moveLeft() {
            this.col--;
        }

        // Move the Tetris piece to the right
        moveRight() {
            this.col++;
        }

        // Rotate the Tetris piece
        rotate() {
            this.shape = this.shape[0].map((_, i) =>
                this.shape.map((row) => row[i]).reverse()
            );
        }
    }

    // Check for collision between the Tetris piece and the grid
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

    // Merge the Tetris piece into the grid
    function mergePiece() {
        currentPiece.shape.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col) {
                    // Merge the piece into the grid
                    tetrisGrid[currentPiece.row + i - 1][currentPiece.col + j] = currentPiece.color;
                }
            });
        });
    }

    // Clear completed rows from the grid
    function clearRows() {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (tetrisGrid[row].every((col) => col !== 0)) {
                // Clear the completed row
                tetrisGrid.splice(row, 1);
                // Add an empty row at the top
                tetrisGrid.unshift(Array(COLUMNS).fill(0));
                // Increment the line count
                lineCount++;
            }
        }
    }

    // Update the game state
    function update() {
        // Display the score
        displayScore.innerHTML = "Score : " + score;

        if (currentPiece) {
            // Automatically move the piece down
            currentPiece.autoMoveDown();

            // Check for collision with the grid
            if (collision()) {
                // Revert the move and merge the piece into the grid
                mergePiece();
                // Generate a new random piece
                currentPiece = nextPiece;
                drawNextPiece();
            }
        }

        // Increment the tic counter and increase speed over time
        ticCounter++;
        if (ticCounter === 4000 && speedModifier < 4) {
            ticCounter = 0;
            speedModifier++;
        }

    }

    // Get a random Tetris shape
    function getRandomShape() {
        const shapes = [
            [[1, 1, 1, 1]],
            [[1, 1], [1, 1]],
            [[1, 1, 1], [0, 1, 0]],
            [[1, 1, 1], [1, 0, 0]],
            [[1, 1, 1], [0, 0, 1]],
            [[1, 1, 0], [0, 1, 1]],
            [[0, 1, 1], [1, 1, 0]],
        ];

        const randomIndex = Math.floor(Math.random() * shapes.length);
        return shapes[randomIndex];
    }

    // Get a random color for the Tetris piece
    function getRandomColor() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }

    // Refresh the score based on the number of completed lines
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

    // Handle key presses for Tetris controls
    function handleKeyPress(event) {
        switch (event.code) {
            case 'ArrowLeft':
                // Move the piece to the left, and revert if there's a collision
                currentPiece.moveLeft();
                if (collision()) currentPiece.moveRight();
                break;
            case 'ArrowRight':
                // Move the piece to the right, and revert if there's a collision
                currentPiece.moveRight();
                if (collision()) currentPiece.moveLeft();
                break;
            case 'ArrowDown':
                // Move the piece down, and merge if there's a collision
                currentPiece.moveDown();
                if (collision()) {
                    mergePiece();
                    currentPiece = nextPiece;
                    drawNextPiece();
                }
                break;
            case 'ArrowUp':
                // Rotate the piece, and revert if there's a collision
                currentPiece.rotate();
                if (collision()) currentPiece.rotate();
                break;
        }
    }

    // Listen for keydown events
    document.addEventListener('keydown', handleKeyPress);

    // Initialize a new Tetris piece


    // Set up the game loop
    intervalId = setInterval(() => {
        update();
        drawGridAndPiece();
    }, 500); // Adjust the speed as needed

    // Check for game over condition
    function checkGameOver() {
        for (let i = 0; i < tetrisGrid[0].length; ++i) {
            if (tetrisGrid[0][i] !== 0) {
                // Game over: stop the game and ask for a restart
                clearInterval(intervalId);
                if (confirm('Game Over! \n Do you want to play again?')) {
                    tetrisGrid = newGrid();
                    speedModifier = 1;
                } else {
                    open("../index.html", "_self");
                }
            }
        }
    }

    // Game loop function
    function gameLoop() {
        checkGameOver();
        for (let i = 0; i < 4; i++) {
            update();  // Update game logic
        }
        drawGridAndPiece();  // Update UI
        refreshScore(lineCount);
        requestAnimationFrame(gameLoop);  // Repeat the loop

    }
    // Initialize a new Tetris piece
    currentPiece = new TetrisPiece(getRandomShape(), getRandomColor());
    drawNextPiece();
    // Start the game loop
    gameLoop();
});
