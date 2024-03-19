const shapeColors = {
    square: '#eaea00',
    line: '#00efef',
    T: '#AA00FF',
    L: '#FFA500',
    J: '#0000FF',
    S: '#01FF00',
    Z: '#FF0000',
};

function collision(grid, x, y, shape) {
    let height = grid.length;
    let width = grid.length;

    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[0].length; j++) {
            if (x + j > -1 && x + j < width && y + i >= 0) {
                if (shape[i][j] !== 0 && (y + i >= height || grid[y + i][x + j] === false)) {
                    return true;
                }
            }
        }
    }
    return false;
}

/*temp find possibilities*/
function findPossibilities(shape, grid) {
    let differentPieces = getShapesFromPiece(shape);
    let solutions = Array(differentPieces.length);
    for (let i = 0; i < differentPieces.length; ++i) {
        solutions[i] = findPossibilitiesForShape(differentPieces[i], grid);
    }
    return solutions;
}

function printGrid(grid) {
    let str = "[ \n";
    for (let y = 0; y < grid.length; ++y) {
        str += "\t[ "
        for (let x = 0; x < grid[0].length; ++x) {
            str += grid[y][x] + " ,";
        }
        str += "],\n"
    }
    str += "]";
    console.log(str)
    return str;
}

function printSolution(newGrid, shape, solution) {
    grid = Array.from({length: newGrid.length}, () => Array(newGrid[0].length).fill(1));

    let str = "  ";
    for (let i = 0; i < solution[0].length; ++i) {
        currentGrid = copyShape(grid);

        for (let y = 0; y < currentGrid.length; ++y) {
            for (let x = 0; x < currentGrid[0].length; ++x) {
                if (newGrid[y][x] === true) {
                    currentGrid[y][x] = 0;
                }
            }
        }
        for (let y = 0; y < shape.length; ++y) {
            for (let x = 0; x < shape[0].length; ++x) {
                if (shape[y][x] !== 0) {
                    currentGrid[y + solution[1][i]][x + solution[0][i]] = 2;
                }
            }
        }
        str += printGrid(currentGrid);
    }
    console.log(str);
}

function findPossibilitiesForShape(shape, newGrid) {
    let solution = Array.from({length: 2}, () => Array(0));

    for (let i = 0; i < newGrid.length - shape.length + 1; ++i) {
        for (let j = 0; j < newGrid[0].length - shape[0].length + 1; ++j) {
            if (!collision(newGrid, j, i, shape) && collision(newGrid, j, i + 1, shape)) {
                solution[0].push(j);
                solution[1].push(i);
            }
        }
    }

    //printSolution(newGrid, shape, solution);

    return solution;
}

function copyShape(shape) {
    let newShape = Array.from({length: shape.length}, () => Array(shape[0].length).fill(0));
    for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < shape[0].length; ++x) {
            newShape[y][x] = shape[y][x];
        }
    }
    return newShape;
}

function rotateShape(shapeToRotate) {
    return shapeToRotate[0].map((_, i) =>
        shapeToRotate.map((row) => row[i]).reverse()
    );
}

function areTheSameShape(shape, shape2) {
    if (shape.length !== shape2.length || shape[0].length !== shape2[0].length) {
        return false;
    }
    for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < shape[0].length; ++x) {
            if (shape[y][x] !== shape2[y][x]) {
                return false;
            }
        }
    }

    return true;
}

function getShapesFromPiece(shape) {
    let shapes = Array(4);
    shapes[0] = copyShape(shape);
    for (let i = 0; i < 3; ++i) {
        let shapeToRotate = copyShape(shapes[i]);
        shapes[i + 1] = rotateShape(shapeToRotate);
    }

    let deletedShape = 0;
    for (let i = 0; i < shapes.length - 1; ++i) {
        let n = shapes.length;
        for (let j = i + 1; j < n; ++j) {
            if (areTheSameShape(shapes[i], shapes[j - deletedShape])) {
                shapes.splice(j - deletedShape, 1);
                ++deletedShape;
            }
        }
    }
    return shapes;
}

function getGridForTreeSearch(grid) {
    let newGrid = Array.from({length: grid.length}, () => Array(grid[0].length).fill(false));
    let checked = Array.from({length: grid.length}, () => Array(grid[0].length).fill(false));

    checkGrid(grid, newGrid, checked, 0, 0);
    return newGrid;
}

function checkGrid(grid, newGrid, checked, x, y) {
    checked[y][x] = true;
    let height = grid.length;
    let width = grid[0].length;

    if (grid[y][x] === 0) {
        newGrid[y][x] = true;
        for (let i = -1; i < 2; ++i) {
            for (let j = -1; j < 2; ++j) {
                if (x + j > -1 && x + j < width && y + i >= 0 && y + i < height) {
                    if ((i === 0 || j === 0) && i !== j && checked[y + i][x + j] === false) {
                        checkGrid(grid, newGrid, checked, x + j, y + i);
                    }
                }
            }
        }
    }
}


let shapesT = {
    square: [[1, 1], [1, 1]],
    line: [[1, 1, 1, 1]],
    T: [[1, 1, 1], [0, 1, 0]],
    L: [[1, 1, 1], [1, 0, 0]],
    J: [[1, 1, 1], [0, 0, 1]],
    S: [[1, 1, 0], [0, 1, 1]],
    Z: [[0, 1, 1], [1, 1, 0]],
};
let gridTest = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 1, 1, 0, 1],
];
//console.log(printGrid(gridTest))
//console.log( printGrid(getGridForTreeSearch(gridTest, 2)));

//console.log(findPossibilities(shapesT.T, gridTest))

/*djikstra*/

const maxWeight = 999999;

function getMinWeight(gridWeight, gridLowestPathFound, gridBoolean) {
    let min = maxWeight;
    let coordMin = null;
    for (let i = 0; i < gridWeight.length; ++i) {
        for (let j = 0; j < gridWeight[0].length; ++j) {
            if (gridBoolean[i][j] === true && !gridLowestPathFound[i][j] && gridWeight[i][j] < min) {
                min = gridWeight[j][i];
                coordMin = Array(2).fill(0);
                coordMin[0] = j;
                coordMin[1] = i;
            }
        }
    }
    return coordMin;
}

function recursiveDjikstra(gridBoolean, shape, targetX, targetY, gridPreviousX, gridPreviousY, gridWeight, gridLowestPathFound) {
    let width = gridWeight[0].length;
    let height = gridWeight.length;
    let coordMin = getMinWeight(gridWeight, gridLowestPathFound, gridBoolean);
    if (coordMin === null) {
        return;
    }
    let minX = coordMin[0];
    let minY = coordMin[1];

    gridLowestPathFound[minY][minX] = true;

    if (gridLowestPathFound[targetY][targetX] === true) {
        return;
    }

    for (let i = -1; i < 2; ++i) {
        for (let j = -1; j < 2; ++j) {
            if (minX + j >= 0 && minX + j < width && minY + i >= 0 && minY + i < height) {
                if ((i === 0 || j === 0) && i !== j) {
                    if (gridBoolean[minY + i][minX + j] === true && !gridLowestPathFound[minY + i][minX + j] && gridWeight[minY + i][minX + j] > gridWeight[minY][minX] + 1) {
                        if (!collision(gridBoolean, minX + j, minY + i, shape)) {
                            gridWeight[minY + i][minX + j] = gridWeight[minY][minX] + 1;
                            gridPreviousX[minY + i][minX + j] = minX;
                            gridPreviousY[minY + i][minX + j] = minY;
                        }
                    }
                }
            }
        }
    }

    recursiveDjikstra(gridBoolean, shape, targetX, targetY, gridPreviousX, gridPreviousY, gridWeight, gridLowestPathFound);
}

function djikstra(gridBoolean, shape, initX, initY, targetX, targetY) {
    let gridPreviousX = Array.from({length: gridBoolean.length}, () => Array(gridBoolean[0].length).fill(0));
    let gridPreviousY = Array.from({length: gridBoolean.length}, () => Array(gridBoolean[0].length).fill(0));
    let gridWeight = Array.from({length: gridBoolean.length}, () => Array(gridBoolean[0].length).fill(maxWeight));
    let gridLowestPathFound = Array.from({length: gridBoolean.length}, () => Array(gridBoolean[0].length).fill(false));

    gridWeight[initY][initX] = 0;

    recursiveDjikstra(gridBoolean, shape, targetX, targetY, gridPreviousX, gridPreviousY, gridWeight, gridLowestPathFound);

    return gridWeight;
}

let gridTest2 = [
    [0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 1, 1, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
];
let shapesT2 = {
    square: [[1, 1], [1, 1]],
    line: [[1, 1, 1, 1]],
    T: [[0, 1], [1, 1], [0, 1]],
    L: [[1, 1, 1], [1, 0, 0]],
    J: [[1, 1, 1], [0, 0, 1]],
    S: [[1, 1, 0], [0, 1, 1]],
    Z: [[0, 1, 1], [1, 1, 0]],
};

function treeSearch(grid, shape1, shape2, x1, y1, x2, y2) {
    let booleanGrid = getGridForTreeSearch(grid);
    let shapes1 = getShapesFromPiece(shape1);
    let possibilities1 = Array(shapes1.length);
    for (let i = 0; i < shapes1.length; ++i) {
        possibilities1[i] = findPossibilitiesForShape(shapes1[i], booleanGrid);
    }
    let nbPossibilities1 = 0;
    for (let i = 0; i < possibilities1.length; ++i) {
        let nbDelete = 0;
        for (let j = 0; j < possibilities1[i][0].length; j) {
            let gridDjikstra = djikstra(booleanGrid, shapes1[i], x1, y1, possibilities1[i][0][j], possibilities1[i][1][j]);
            if (gridDjikstra[possibilities1[i][1][j]][possibilities1[i][0][j]] === maxWeight) {
                possibilities1[i].splice(j - nbDelete, 1);
                ++nbDelete;
            } else {
                ++nbPossibilities1;
            }
        }
    }
    let newGrids = Array(nbPossibilities1);
    let ct = 0;
    for (let i = 0; i < possibilities1.length; ++i) {
        for (let j = 0; j < possibilities1[i][0].length; ++j) {
            let newGrid = Array.from({length: grid.length}, () => Array(grid[0].length).fill(false));
            for (let y = 0; y < newGrid.length; ++y) {
                for (let x = 0; x < newGrid[0].length; ++x) {
                    newGrid[y][x] = booleanGrid[y][x];
                }
            }
            for (let y = 0; y < shape1.length; ++y) {
                for (let x = 0; x < shape1[0].length; ++x) {
                    if (shape1[y][x] === 1) {
                        newGrid[y + possibilities1[i][1][j]][x + possibilities1[i][0][j]] = false;
                    }
                }
            }
            newGrids[ct] = newGrid;
            ++ct;
        }
    }
    //console.log("ici");
    for (let i = 0; i < newGrids.length; ++i) {
        console.log(printGrid(newGrids[i]));
    }
}


//console.log(printGrid(djikstra(getGridForTreeSearch(gridTest), shapesT2.T, 0, 0, 2, 4)));

treeSearch(gridTest, shapesT.T, null, 0, 0, null, null)

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
