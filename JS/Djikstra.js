function printGrid(grid) {
    let str = "[ \n";
    for (let y = 0; y < grid.length; ++y) {
        str += y + "\t[ "
        for (let x = 0; x < grid[0].length; ++x) {
            str += "\t" + grid[y][x] + " ,";
        }
        str += "],\n"
    }
    str += "]";
    return str;
}

class Coords {
    x
    y

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    equals(otherCoords) {
        return this.x === otherCoords.x && this.y === otherCoords.y
    }
}

class PieceShape {
    booleanGrid

    constructor(booleanGrid) {
        this.booleanGrid = booleanGrid
    }

    copy() {
        let newGrid = Array.from({length: this.booleanGrid.length}, () => Array(this.booleanGrid[0].length).fill(false));

        for (let y = 0; y < this.booleanGrid.length; ++y) {
            for (let x = 0; x < this.booleanGrid[0].length; ++x) {
                newGrid[y][x] = this.booleanGrid[y][x];
            }
        }

        return new PieceShape(newGrid);
    }

    rotate() {
        this.booleanGrid = this.booleanGrid[0].map((_, i) =>
            this.booleanGrid.map((row) => row[i]).reverse()
        );
    }

    equals(otherPieceShape) {
        if (this.booleanGrid.length !== otherPieceShape.booleanGrid.length || this.booleanGrid[0].length !== otherPieceShape.booleanGrid[0].length) {
            return false
        }

        for (let y = 0; y < this.booleanGrid.length; ++y) {
            for (let x = 0; x < this.booleanGrid[0].length; ++x) {
                if (this.booleanGrid[y][x] !== otherPieceShape.booleanGrid[y][x]) {
                    return false
                }
            }
        }

        return true;
    }
}

class Piece {
    shape
    coords

    constructor(shape, x, y) {
        this.coords = new Coords(x, y)
        this.shape = shape
    }

    getCoords() {
        return this.coords
    }

    rotate(tetrisGrid) {
        let oldShape = this.shape.copy();
        let oldY = this.coords.y;
        let oldX = this.coords.x;

        let centerY = Math.floor(this.shape.booleanGrid.length / 2);
        let centerX = Math.floor(this.shape.booleanGrid[0].length / 2);

        this.shape.rotate()

        //let newY = oldY + centerY - Math.floor(this.shape.booleanGrid.length / 2);
        //let newX = oldX + centerX - Math.floor(this.shape.booleanGrid[0].length / 2);

        //this.coords = new Coords(newX, newY)
    }

    getVariants() {
        let list = Array(4).fill(0);

        list[0] = this.copy();

        for (let i = 0; i < 3; ++i) {
            list[i + 1] = list[i].copy();
            list[i + 1].rotate();
        }

        let deletedShape = 0;
        for (let i = 0; i < list.length - 1; ++i) {
            let n = list.length;
            for (let j = i + 1; j < n; ++j) {
                if (list[i].equals(list[j - deletedShape])) {
                    list.splice(j - deletedShape, 1);
                    ++deletedShape;
                }
            }
        }

        return list

    }

    equals(otherPiece) {
        return this.shape.equals(otherPiece.shape) && this.coords.equals(otherPiece.coords)
    }

    copy() {
        return new Piece(this.shape.copy(), this.coords.x, this.coords.y)
    }
}

class TetrisDjikstra {

    MAX_WEIGHT = 999

    weightGrid

    booleanGrid

    booleanTetrisGrid

    piece

    target

    constructor(grid, piece, target) {
        this.buildGrids(grid);
        this.piece = piece
        this.target = target

        this.weightGrid[piece.coords.y][piece.coords.x] = 0
    }

    buildGrids(grid) {
        let width = grid[0].length
        let height = grid.length

        this.weightGrid = Array.from({length: height}, () => Array(width).fill(this.MAX_WEIGHT))
        this.booleanGrid = Array.from({length: height}, () => Array(width).fill(false))
        this.booleanTetrisGrid = Array.from({length: height}, () => Array(width).fill(false))

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                if (grid[y][x] === false) {
                    this.booleanTetrisGrid[y][x] = true
                }
            }
        }
    }

    getMinWeightCoords() {
        let width = this.weightGrid[0].length
        let height = this.weightGrid.length

        let minWeight = this.MAX_WEIGHT
        let minCoords

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                if (this.weightGrid[y][x] < minWeight && !this.booleanGrid[y][x]) {
                    minCoords = new Coords(x, y)
                    minWeight = this.weightGrid[y][x]
                }
            }
        }

        return minCoords
    }

    recursiveDjikstra() {
        let minCoords = this.getMinWeightCoords()
        if (minCoords == null) {
            return false
        }
        this.booleanGrid[minCoords.y][minCoords.x] = true

        if (this.booleanGrid[this.target.y][this.target.x] === true) {
            return true
        }

        for (let y = 0; y <= 1; ++y) {
            for (let x = -1; x <= 1; ++x) {
                if ((x === 0 || y === 0) && x !== y) {
                    let newX = x + minCoords.x
                    let newY = y + minCoords.y
                    if (!this.pieceCollidesOrOutOfTheGrid(newX, newY)) {
                        if (!this.booleanGrid[newY][newX]) {
                            if (this.weightGrid[newY][newX] > this.weightGrid[minCoords.y][minCoords.x] + 1) {
                                this.weightGrid[newY][newX] = this.weightGrid[minCoords.y][minCoords.x] + 1
                            }
                        }
                    }
                }
            }
        }
        return this.recursiveDjikstra();

    }

    pieceCollidesOrOutOfTheGrid(x, y) {
        let height = this.booleanGrid.length
        let width = this.booleanGrid[0].length

        let shapeGrid = this.piece.shape.booleanGrid

        for (let i = 0; i < shapeGrid.length; ++i) {
            for (let j = 0; j < shapeGrid[0].length; ++j) {
                if (shapeGrid[i][j] === true) {
                    let newX = x + j;
                    let newY = y + i;
                    if (newX < 0 || newX >= width || newY >= height) {
                        return true
                    }
                    if (newY > 0 && this.booleanTetrisGrid[newY][newX] === true) {
                        return true;
                    }
                }
            }
        }

        return false
    }

    toString() {
        return printGrid(this.weightGrid);
    }

}

//test
/*
let gridTest = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 1, 1, 0, 1],
];

let pieceTest = new Piece(new PieceShape([[false, true], [true, true], [false, true]]), 0, 0)

let targetTest1 = new Coords(3, 1)
let targetTest2 = new Coords(2, 3)

let djikstraTest1 = new TetrisDjikstra(gridTest, pieceTest, targetTest1)
let djikstraTest2 = new TetrisDjikstra(gridTest, pieceTest, targetTest2)

djikstraTest1.recursiveDjikstra()
djikstraTest1.log()

djikstraTest2.recursiveDjikstra()
djikstraTest2.log()

let pieceTest2 = new Piece(new PieceShape([[true], [true], [true]]), 2, 2)
console.log(pieceTest2.getVariants())
*/

