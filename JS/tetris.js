document.addEventListener('DOMContentLoaded', () => {
    // Get HTML canvas element
    const canvas = document.getElementById('tetrisCanvas');
    // 2D Rendering context
    const context = canvas.getContext('2d');

    // Grid and block size constants
    const ROWS = 20;
    const COLUMNS = 10;
    const BLOCK_SIZE = 30;

    // Define tetromino shapes
    const shapes = {
        square: [[1, 1], [1, 1]],
        line: [[1, 1, 1, 1]],
        T: [[1, 1, 1], [0, 1, 0]],
        L: [[1, 1, 1], [1, 0, 0]],
        J: [[1, 1, 1], [0, 0, 1]],
        S: [[1, 1, 0], [0, 1, 1]],
        Z: [[0, 1, 1], [1, 1, 0]],
    };

    // Definition of tetromino color
    const shapeColors = {
        square: '#eaea00',
        line: '#00efef',
        T: '#AA00FF',
        L: '#FFA500',
        J: '#0000FF',
        S: '#01FF00',
        Z: '#FF0000',
    };

    // Initialize the Tetris grid
    let tetrisGrid = newGrid();

    // Variables to manage current, next, and saved tetris pieces
    let intermediatePiece;
    let currentPiece;
    let nextPiece;
    let savedPiece;

    // Variables to keep track of game state
    let nbPieces = 1;
    let speedModifier = 1;
    let lineCount = 0;
    let score = 0;
    let displayScore = document.getElementById("displayScore");
    let timePerFrame = 4;

    /**
     *
     * @returns Array - 2D array representing the Tetris grid
     */
    function newGrid() {
        return Array.from({length: ROWS}, () => Array(COLUMNS).fill(0));
    }

    /**
     * Draws a colored square with optional padding
     * @param {*} x coordinate of the top-left corner of the square
     * @param {*} y coordinate of the top-left corner of the square
     * @param {*} color color of the sqaure
     * @param {*} padding optional padding around the square
     * @param {*} context optional render context
     * @param {*} blockSize optional size of each block
     */
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

    /**
     * Draws the tetris grid and the current Tetromino
     */
    function drawGridAndPiece() {
        // Clear the entire canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the Tetris grid
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                const color = tetrisGrid[row][col];
                if (color) {
                    drawSquare(col, row, color);
                }
                // Draw vertical grid lines
                context.beginPath();
                context.moveTo(col * BLOCK_SIZE, 0);
                context.lineTo(col * BLOCK_SIZE, canvas.height);
                context.strokeStyle = 'rgba(220,220,220,0.45)';
                context.stroke();
            }
            // Draw horizontal grid lines
            context.beginPath();
            context.moveTo(0, row * BLOCK_SIZE);
            context.lineTo(canvas.width, row * BLOCK_SIZE);
            context.strokeStyle = 'rgba(220,220,220,0.45)';
            context.stroke();
        }

        // Draw the current Tetromino
        if (currentPiece) {
            currentPiece.draw();
        }
    }

    /**
     * Draws the next Tetromino on a separate canvas
     */
    function drawNextPiece() {
        const nextPieceCanvas = document.getElementById('nextPieceCanvas');
        const nextPieceContext = nextPieceCanvas.getContext('2d');

        // Clear the "nextPieceCanvas"
        nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

        // Get a random Tetromino for the next piece and his color
        const nextShape = getRandomShape();
        const nextColor = getColor(nextShape);

        // Instance the new Tetromino with his class
        nextPiece = new TetrisPiece(nextShape, nextColor);
        nbPieces++;

        // Draw the new Tetromino on the "nextPieceCanvas"
        nextPiece.shape.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col) {
                    drawSquare(j, i, nextColor, 0, nextPieceContext, BLOCK_SIZE);
                }
            });
        });
    }

    /**
     * Draws the saved Tetromino on a separate canvas
     */
    function drawSavedPiece() {
        const savedPieceCanvas = document.getElementById('savedPieceCanvas');
        const savedPieceContext = savedPieceCanvas.getContext('2d');

        const savedColor = savedPiece.color;

        // Draw the saved piece on the "savedPieceCanvas"
        savedPiece.shape.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col) {
                    drawSquare(j, i, savedColor, 0, savedPieceContext, BLOCK_SIZE);
                }
            });
        });
    }

    /**
     * Clears the saved Tetromino
     */
    function clearSavedPiece() {
        const savedPieceCanvas = document.getElementById('savedPieceCanvas');
        const savedPieceContext = savedPieceCanvas.getContext('2d');
        savedPieceContext.clearRect(0, 0, savedPieceCanvas.width, savedPieceCanvas.height);
    }

    /**
     * Get the color associated with a Tetromino
     * @param {string} shape - Tetromino shape
     * @returns {string} - Color code
     */
    function getColor(shape) {
        return shapeColors[shape];
    }

    /**
     * Class Representing a Tetromino
     */
    class TetrisPiece {
        /**
         * Constructor of a Tetromino
         * @param {string} shape - Tetromino shape
         * @param {string} color - Color code
         */
        constructor(shape, color) {
            this.frame = 0;
            this.maxFrame = 240;
            this.shape = shapes[shape];
            this.color = color || getColor(shape);
            this.row = -this.shape.length + 1;
            this.col = Math.floor(COLUMNS / 2) - Math.floor(this.shape[0].length / 2);
        }

        /**
         * Draws the Tetromino on the principal canvas
         */
        draw() {
            this.shape.forEach((row, i) => {
                row.forEach((col, j) => {
                    if (col) {
                        drawSquare(this.col + j, this.row + i, this.color, BLOCK_SIZE * this.frame / this.maxFrame - BLOCK_SIZE);
                    }
                });
            });
        }

        /**
         * Moves the Tetromino down automatically
         */
        autoMoveDown() {
            clearRows();
            this.frame += speedModifier;
            if (this.frame >= this.maxFrame) {
                this.frame = 0;
                this.row++;
            }
        }

        /**
         * Moves the Tetromino down manually
         */
        moveDown() {
            this.row++;
            this.frame = 0;
        }

        /**
         * Moves the Tetromino to the left manually
         */
        moveLeft() {
            this.col--;
            if (collision()) {
                this.col++;
            }
        }

        /**
         * Moves the Tetromino to the right manually
         */
        moveRight() {
            this.col++;
            if (collision()) {
                this.col--;
            }
        }

        /**
         * Rotate the Tetromino manually
         */
        rotate() {
            const oldShape = this.shape;
            const oldRow = this.row;
            const oldCol = this.col;

            const centerRow = Math.floor(this.shape.length / 2);
            const centerCol = Math.floor(this.shape[0].length / 2);

            // Rotate the shape
            this.shape = this.shape[0].map((_, i) =>
                this.shape.map((row) => row[i]).reverse()
            );
            this.row = oldRow + centerRow - Math.floor(this.shape.length / 2);
            this.col = oldCol + centerCol - Math.floor(this.shape[0].length / 2);

            // Check for collision after rotation
            if (collision()) {
                recenterToBoard(oldCol);
                if (collision()) {
                    // Restore the old shape and position if collision
                    this.shape = oldShape;
                    this.row = oldRow;
                    this.col = oldCol;
                }
            }
        }
    }

    /**
     * Recenter the tetromino to the board after rotation
     * @param {number} oldCol - Original column position
     * @returns
     */
    function recenterToBoard(oldCol) {
        const liste = [-1, -2, 0, 1, 2]
        const initialCol = currentPiece.col;
        for (let offset of liste) {
            currentPiece.col += offset;
            if (!collision()) {
                return;
            }
            currentPiece.col = initialCol;
        }
    }

    /**
     * Check for collision between a Tetromino and the filled blocks in the grid
     * @returns {boolean} - True if collision is detected, false otherwise
     */
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

    /**
     * Merges the current tetromino into the Tetris grid
     */
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

    /**
     * Clears completed rows from the Tetris grid
     */
    function clearRows() {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (tetrisGrid[row].every((col) => col !== 0)) {
                tetrisGrid.splice(row, 1);
                tetrisGrid.unshift(Array(COLUMNS).fill(0));
                lineCount++;
            }
        }
    }

    /**
     * Update the game state and checks for game
     */
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
        // Added speed every 25 Tetromino
        if (nbPieces === 25) {
            nbPieces = 0;
            speedModifier++;
        }
    }

    /**
     * Gets a random Tetris shape
     * @returns {string} - Random Tetris shape
     */
    function getRandomShape() {
        const shapes = Object.keys(shapeColors);
        const randomIndex = Math.floor(Math.random() * shapes.length);
        return shapes[randomIndex];
    }

    /**
     * Updates the score based on the number of cleared lines
     * @param {number} lineCounter - number of lines cleared
     */
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

    /**
     * Handless key presses to control the Tetromino
     * @param {KeyboardEvent} event - Key press event
     */
    function handleKeyPress(event) {
        switch (event.code) {
            case 'ArrowLeft':
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
            case 'KeyA':
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
                    clearSavedPiece();
                    intermediatePiece = currentPiece;
                    currentPiece = savedPiece;
                    savedPiece = intermediatePiece;
                    drawSavedPiece();
                    currentPiece.row = -currentPiece.shape.length + 1;
                    currentPiece.col = Math.floor(COLUMNS / 2) - Math.floor(currentPiece.shape[0].length / 2);
                    drawGridAndPiece();

                } else {
                    savedPiece = currentPiece;
                    drawSavedPiece();
                    currentPiece = nextPiece;
                    drawNextPiece();
                }
                break;
        }
    }

    // Listen for keydown events to control Tetromino
    document.addEventListener('keydown', handleKeyPress);

    /**
     * Checks if the game is over by inspecting the top row of the tetris grid
     * If the top row contains any filles blocks, prompts the user to play again
     * Resets the game state if the user chooses to play again
     * Otherwise redirect user to the homepage
     */
    function checkGameOver() {
        // Iterate through the top row of the Tetris grid
        for (let i = 0; i < tetrisGrid[0].length; ++i) {
            // If a filled block is found in the top row, the game is over
            if (tetrisGrid[0][i] !== 0) {
                // Prompt for user with a confirmation dialog
                if (confirm('Game Over! \n Do you want to play again?')) {
                    // Reset the game
                    tetrisGrid = newGrid();
                    speedModifier = 1;
                    score = 0;
                    clearSavedPiece();
                } else {
                    //Redirect to the homepage
                    open("../index.html", "_self");
                }
            }
        }
    }

    /**
     * Continuouslt updates and renders the game
     */
    function gameLoop() {
        // Check for GameOver conditions
        checkGameOver();

        // Update game state four times per frame
        for (let i = 0; i < timePerFrame; i++) {
            update();
        }

        // Draw the Tetris grid and current piece
        drawGridAndPiece();
        // Refresh the score
        refreshScore(lineCount);
        requestAnimationFrame(gameLoop);

    }

    // Initialize the current tetromino and draw the next piece
    currentPiece = new TetrisPiece(getRandomShape(), getColor());
    drawNextPiece();

    // Start the gameLoop
    gameLoop();
});
