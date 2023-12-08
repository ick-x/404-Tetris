// Ajoutez ici le code JavaScript pour le jeu Tetris
// Assurez-vous d'inclure les fonctionnalités pour les touches de déplacement
// et de rotation, ainsi que la logique du jeu.

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    const context = canvas.getContext('2d');

    const ROWS = 20;
    const COLUMNS = 10;
    const BLOCK_SIZE = 30;

    let tetrisGrid = newGrid();

    let currentPiece;
    let intervalId;

    function newGrid(){
       return Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0))
    }

    function drawSquare(x, y, color, padding = 0) {
        context.fillStyle = color;
        context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE+padding, BLOCK_SIZE, BLOCK_SIZE);
        context.strokeStyle = '#fff';
        context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE+padding, BLOCK_SIZE, BLOCK_SIZE);
    }



    function drawGridAndPiece() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                const color = tetrisGrid[row][col];
                if (color) {
                    drawSquare(col, row, color);
                }
            }
        }

        if (currentPiece) {
            currentPiece.draw();
        }
    }

    class TetrisPiece {
        constructor(shape, color) {
            this.frame = 0;
            this.maxFrame = 60;
            this.shape = shape;
            this.color = color;
            this.row = -shape.length+1;
            this.col = Math.floor(COLUMNS / 2) - Math.floor(shape[0].length / 2);
        }

        draw() {
            this.shape.forEach((row, i) => {
                row.forEach((col, j) => {
                    if (col) {
                        drawSquare(this.col + j, this.row + i, this.color, BLOCK_SIZE* this.frame/this.maxFrame - BLOCK_SIZE);
                    }
                });
            });
        }


        autoMoveDown() {
            clearRows()
            ++this.frame;
            if(this.frame === this.maxFrame){
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
        }

        moveRight() {
            this.col++;
        }

        rotate() {
            this.shape = this.shape[0].map((_, i) =>
                this.shape.map((row) => row[i]).reverse()
            );
        }
    }

    function collision() {
        for (let i = 0; i < currentPiece.shape.length; i++) {
            for (let j = 0; j < currentPiece.shape[i].length; j++) {
                if (
                     currentPiece.row>=0 && currentPiece.shape[i][j] &&
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
                    tetrisGrid[currentPiece.row + i - 1][currentPiece.col + j] = currentPiece.color;
                }
            });
        });
    }

    function clearRows() {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (tetrisGrid[row].every((col) => col !== 0)) {
                tetrisGrid.splice(row, 1);
                tetrisGrid.unshift(Array(COLUMNS).fill(0));
            }
        }
    }

    function update() {

        if (currentPiece) {
            currentPiece.autoMoveDown();

            if (collision()) { // Revert the move
                mergePiece();


                currentPiece = new TetrisPiece(getRandomShape(), getRandomColor());
            }
        }

    }

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

    function getRandomColor() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }


    function handleKeyPress(event) {

        switch (event.code) {
            case 'ArrowLeft':
                currentPiece.moveLeft();
                if (collision()) currentPiece.moveRight(); // Revert the move
                break;
            case 'ArrowRight':
                currentPiece.moveRight();
                if (collision()) currentPiece.moveLeft(); // Revert the move
                break;
            case 'ArrowDown':
                currentPiece.moveDown();
                if (collision()) {
                    mergePiece();
                    currentPiece = new TetrisPiece(getRandomShape(), getRandomColor());
                }
                break;
            case 'ArrowUp':
                currentPiece.rotate();
                if (collision()) currentPiece.rotate(); // Revert the rotation
                break;
        }
    }

    document.addEventListener('keydown', handleKeyPress);

    currentPiece = new TetrisPiece(getRandomShape(), getRandomColor());

    intervalId = setInterval(() => {
        update();
        drawGridAndPiece();
    }, 500); // Adjust the speed as needed
    function checkLoose(){
        for(let i = 0; i<tetrisGrid[0].length;++i){
            if(tetrisGrid[0][i]!==0){

                clearInterval(intervalId);
                if (confirm('Game Over! \n Voulez vous rejouer ?')) {
                    tetrisGrid = newGrid();
                } else {
                    open("/404-Tetris/index.html", "_self");
                }
            }
        }
    }
// Fonction de boucle de jeu
    function gameLoop() {
        checkLoose();
        update();
        drawGridAndPiece();
    }

    // Lancer la boucle de jeu
    setInterval(gameLoop, 1);// Mettez à jour toutes les demi-secondes (ajustez selon vos besoins)

});



