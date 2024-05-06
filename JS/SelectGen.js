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
        this.booleanGrid = this.booleanGrid[0].map((_, i) => this.booleanGrid.map((row) => row[i]).reverse());
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

function buildBooleanGrid(shape) {
    let sol = Array.from({length: shape.length}, () => Array(shape[0].length).fill(false))
    for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < shape[0].length; ++x) {
            if (shape[y][x] !== 0) {
                sol[y][x] = true
            }
        }
    }
    return sol
}

function buildBooleanGridBis(shape) {
    let sol = Array.from({length: shape.length}, () => Array(shape[0].length).fill(false))
    for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < shape[0].length; ++x) {
            if (shape[y][x] === 0) {
                sol[y][x] = true
            }
        }
    }
    return sol
}

class Piece {
    shape
    coords

    constructor(x, y, booleanGrid) {
        this.coords = new Coords(x, y)
        this.shape = new PieceShape(booleanGrid)
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
        return new Piece(this.coords.x, this.coords.y, this.shape.copy().booleanGrid)
    }
}

class TetrisDjikstra {

    MAX_WEIGHT = 999

    weightGrid

    booleanGrid

    booleanTetrisGrid

    piece

    target

    constructor(grid, piece, target, boolean) {
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
}

class Node {
    piece
    grid
    nodes
    solutionPiece
    originalGrid
    previousNode
    djikstraGrid

    constructor(piece, solutionPiece, grid, originalGrid, previousNode, djikstraGrid) {
        this.piece = piece
        this.grid = grid
        this.solutionPiece = solutionPiece
        this.nodes = Array(0)
        if (originalGrid != null) this.buildBooleanGrid(originalGrid)
        this.previousNode = previousNode
        this.djikstraGrid = djikstraGrid
    }

    buildNodes(depth, piece) {
        if (depth === 0) {
            let variants = piece.getVariants()
            for (let i = 0; i < variants.length; ++i) {
                let possibilities = this.getPossibilitiesFromPiece(variants[i])
                for (let j = 0; j < possibilities.length; ++j) {
                    let tetrisDjikstra = new TetrisDjikstra(this.grid, variants[i], possibilities[j].getCoords(), false)
                    if (tetrisDjikstra.recursiveDjikstra()) {
                        this.nodes.push(new Node(variants[i], possibilities[j], this.grid, this.originalGrid, this, tetrisDjikstra.weightGrid))
                    }
                }
            }
        } else {
            let newDepth = --depth
            for (let i = 0; i < this.nodes.length; ++i) {
                this.nodes[i].buildNodes(newDepth, piece)
            }
        }
    }

    getGrids() {
        if (this.nodes.length === 0) {
            return [this.grid]
        } else {
            let response = Array(0)
            for (let i = 0; i < this.nodes.length; ++i) {
                let tempGrids = this.nodes[i].getGrids()
                for (let j = 0; j < tempGrids.length; ++j) {
                    response.push(tempGrids[j])
                }
            }
            return response
        }
    }

    getLastNodes() {
        if (this.nodes.length === 0) {
            return [this]
        } else {
            let response = Array(0)
            for (let i = 0; i < this.nodes.length; ++i) {
                let tempNodes = this.nodes[i].getLastNodes()
                for (let j = 0; j < tempNodes.length; ++j) {
                    response.push(tempNodes[j])
                }
            }
            return response
        }
    }

    getPossibilitiesFromPiece(variant) {
        let possibilities = new Array(0)
        for (let y = 0; y < this.grid.length; ++y) {
            for (let x = 0; x < this.grid[0].length; ++x) {
                if (this.grid[y][x] === true) {
                    if (this.pieceCollides(variant, x, y + 1) && !this.pieceCollides(variant, x, y)) {
                        possibilities.push(new Piece(x, y, variant.shape.booleanGrid))
                    }
                }
            }
        }
        return possibilities;
    }

    pieceCollides(piece, x, y) {
        let height = this.grid.length
        let width = this.grid[0].length

        let shapeGrid = piece.shape.booleanGrid

        for (let i = 0; i < shapeGrid.length; ++i) {
            for (let j = 0; j < shapeGrid[0].length; ++j) {
                if (shapeGrid[i][j] === true) {
                    let newX = x + j;
                    let newY = y + i;
                    if (newX < 0 || newX >= width || newY >= height) {
                        return true
                    }
                    if (newY > 0 && this.grid[newY][newX] === false) {
                        return true;
                    }
                }
            }
        }

        return false
    }

    getNewGrid() {
        let newGrid = Array.from({length: this.grid.length}, () => Array(this.grid[0].length).fill(0))
        for (let y = 0; y < this.grid.length; ++y) {
            for (let x = 0; x < this.grid[0].length; ++x) {
                if (this.grid[y][x] === false) {
                    newGrid[y][x] = 1
                }
            }
        }
        for (let y = 0; y < this.solutionPiece.shape.booleanGrid.length; ++y) {
            for (let x = 0; x < this.solutionPiece.shape.booleanGrid[0].length; ++x) {
                if (this.solutionPiece.shape.booleanGrid[y][x] === true) {
                    newGrid[y + this.solutionPiece.coords.y][x + this.solutionPiece.coords.x] = 2
                }
            }
        }
        return newGrid
    }

    buildBooleanGrid(originalGrid) {
        let newRecursiveGrid = Array.from({length: this.grid.length}, () => Array(this.grid[0].length).fill(true))
        let newOriginalGrid = Array.from({length: this.grid.length}, () => Array(this.grid[0].length).fill(true))
        for (let y = 0; y < this.grid.length; ++y) {
            for (let x = 0; x < this.grid[0].length; ++x) {
                newOriginalGrid[y][x] = originalGrid[y][x]
                if (this.grid[y][x] === false) {
                    newRecursiveGrid[y][x] = false
                }
            }
        }
        if (this.solutionPiece != null) {
            for (let y = 0; y < this.solutionPiece.shape.booleanGrid.length; ++y) {
                for (let x = 0; x < this.solutionPiece.shape.booleanGrid[0].length; ++x) {
                    if (this.solutionPiece.shape.booleanGrid[y][x] === true) {
                        newRecursiveGrid[y + this.solutionPiece.coords.y][x + this.solutionPiece.coords.x] = false
                        newOriginalGrid[y + this.solutionPiece.coords.y][x + this.solutionPiece.coords.x] = true
                    }
                }
            }
        }
        this.grid = newRecursiveGrid
        this.originalGrid = newOriginalGrid
    }

    getDepth(depth) {
        let ct = 0
        let current = this
        while (current.previousNode != null) {
            ct++
            current = current.previousNode
        }
        return ct
    }

    getNextMove() {
        let coords = this.solutionPiece.coords
        let sol = " "

        while (!coords.equals(this.piece.coords)) {
            let previousPosFound = false;
            for (let y = -1; y <= 0 && !previousPosFound; ++y) {
                for (let x = -1; x <= 1 && !previousPosFound; ++x) {
                    if ((x === 0 || y === 0) && x !== y) {
                        let newX = x + coords.x
                        let newY = y + coords.y
                        if (newX >= 0 && newX < this.grid[0].length && newY >= 0 && newY < this.grid.length) {
                            if (this.djikstraGrid[newY][newX] < this.djikstraGrid[coords.y][coords.x]) {
                                if (y === -1) {
                                    sol = "DOWN"
                                } else if (x === 1) {
                                    sol = "LEFT"
                                } else if (x === -1) {
                                    sol = "RIGHT"
                                }
                                coords = new Coords(newX, newY)
                                previousPosFound = true
                            }
                        }
                    }
                }
            }
        }
        return sol
    }
}

class GridEvaluator {
    coefHeights
    coefBumpiness
    coefLine
    coefHole

    constructor(coefHeights, coefBumpiness, coefLine, coefHole) {
        this.coefBumpiness = coefBumpiness
        this.coefLine = coefLine
        this.coefHole = coefHole
        this.coefHeights = coefHeights
    }


    evaluateGrid(grid) {
        let bumpinessAndHeight = this.evaluateBumpinessAndHeight(grid)
        let line = this.evaluateLine(grid)
        let hole = this.evaluateHole(grid)

        return bumpinessAndHeight + line + hole
    }

    evaluateBumpinessAndHeight(grid) {
        let heights = Array(grid[0].length).fill(0)
        let sumHeights = 0
        let sumDif = 0
        for (let column = 0; column < grid[0].length; ++column) {
            let ct = 0
            let ctSinceLastOccupied = 0
            for (let i = grid.length - 1; i >= 0; --i) {
                ++ct
                if (grid[i][column] === true) {
                    ctSinceLastOccupied = ct
                }
            }
            heights[column] = ctSinceLastOccupied
        }

        for (let column = 0; column < grid[0].length; ++column) {
            sumHeights += heights[column]
            if (column > 0) {
                sumDif += heights[column - 1] > heights[column] ? heights[column - 1] - heights[column] : heights[column] - heights[column - 1]
            }
        }

        return sumDif * this.coefBumpiness + sumHeights * this.coefHeights
    }

    evaluateLine(grid) {
        let ct = 0
        for (let y = 0; y < grid.length; ++y) {
            let boolLine = true
            for (let x = 0; x < grid[0].length && boolLine; ++x) {
                boolLine = boolLine && !grid[y][x]
            }
            if (boolLine) ++ct
        }
        return ct * this.coefLine
    }

    evaluateHole(grid) {
        let nbHole = 0

        let newGrid = this.buildGridForTreeSearch(grid)

        for (let y = 0; y < grid.length; ++y) {
            for (let x = 0; x < grid[0].length; ++x) {
                if (newGrid[y][x] === grid[y][x]) {
                    ++nbHole
                }
            }
        }

        return nbHole * this.coefHole;
    }

    buildGridForTreeSearch(booleanGrid) {
        let newGrid = Array.from({length: booleanGrid.length}, () => Array(booleanGrid[0].length).fill(false));
        let checked = Array.from({length: booleanGrid.length}, () => Array(booleanGrid[0].length).fill(false));

        this.recursiveGridForTreeSearch(booleanGrid, newGrid, checked, 0, 0);
        return newGrid;
    }

    recursiveGridForTreeSearch(booleanGrid, newGrid, checked, x, y) {
        checked[y][x] = true;
        let height = booleanGrid.length;
        let width = booleanGrid[0].length;
        if (booleanGrid[y][x] === false) {
            newGrid[y][x] = true
            for (let i = -1; i < 2; ++i) {
                for (let j = -1; j < 2; ++j) {
                    if (x + j >= 0 && x + j < width && y + i >= 0 && y + i < height) {
                        if ((i === 0 || j === 0) && i !== j && checked[y + i][x + j] === false) {
                            this.recursiveGridForTreeSearch(booleanGrid, newGrid, checked, x + j, y + i);
                        }
                    }
                }
            }
        }
    }

}

class TreeSearch {
    booleanGrid
    recursiveGrid
    pieces
    node

    constructor(pieces, grid) {
        if (pieces != null) {
            this.pieces = Array.from({length: pieces.length}, () => null)
            for (let i = 0; i < pieces.length; ++i) {
                this.pieces[i] = pieces[i]
            }
        }


        if (grid != null) {
            let width = grid[0].length
            let height = grid.length

            this.booleanGrid = Array.from({length: height}, () => Array(width).fill(false))
            for (let y = 0; y < height; ++y) {
                for (let x = 0; x < width; ++x) {
                    if (grid[y][x] !== 0) {
                        this.booleanGrid[y][x] = true
                    }
                }
            }
            this.buildGridForTreeSearch()
        }
    }

    buildTree() {
        this.node = new Node(null, null, this.recursiveGrid, this.booleanGrid, null, null)
        for (let i = 0; i < this.pieces.length; ++i) {
            this.node.buildNodes(i, this.pieces[i])
        }
    }


    buildGridForTreeSearch() {
        let newGrid = Array.from({length: this.booleanGrid.length}, () => Array(this.booleanGrid[0].length).fill(false));
        let checked = Array.from({length: this.booleanGrid.length}, () => Array(this.booleanGrid[0].length).fill(false));

        this.recursiveGridForTreeSearch(newGrid, checked, 0, 0);
        this.recursiveGrid = newGrid;
    }

    recursiveGridForTreeSearch(newGrid, checked, x, y) {
        checked[y][x] = true;
        let height = this.booleanGrid.length;
        let width = this.booleanGrid[0].length;
        if (this.booleanGrid[y][x] === false) {
            newGrid[y][x] = true;
            for (let i = -1; i < 2; ++i) {
                for (let j = -1; j < 2; ++j) {
                    if (x + j > -1 && x + j < width && y + i >= 0 && y + i < height) {
                        if ((i === 0 || j === 0) && i !== j && checked[y + i][x + j] === false) {
                            this.recursiveGridForTreeSearch(newGrid, checked, x + j, y + i);
                        }
                    }
                }
            }
        }
    }

    getGrids() {
        return this.node.getGrids()
    }


    getBestNode(gridEvaluator) {
        let nodes = this.node.getLastNodes()

        let max = gridEvaluator.evaluateGrid(nodes[0].originalGrid)
        let maxDepth = nodes[0].getDepth()
        let idMax = 0

        for (let i = 1; i < nodes.length; ++i) {
            let currentScore = gridEvaluator.evaluateGrid(nodes[i].originalGrid)
            if (nodes[i].getDepth() >= maxDepth && currentScore > max) {
                max = currentScore
                maxDepth = nodes[i].getDepth()
                idMax = i
            }
        }

        return nodes[idMax]

    }
}

function adaptGridAndPrint(base) {
    let grid = Array.from({length: base.length}, () => Array(base[0].length).fill(0));

    for (let y = 0; y < base.length; ++y) {
        for (let x = 0; x < base[0].length; ++x) {
            if (base[y][x] !== 0) grid[y][x] = 1;
        }
    }
    return printGrid(grid)
}

class TreeSearchIA {
    targetCoords
    targetShape
    alexPiece


    constructor(pieces, grid, alexPiece, gridEvaluator) {
        let treeSearch = new TreeSearch(pieces, grid)
        this.alexPiece = alexPiece
        treeSearch.buildTree()
        let node = treeSearch.getBestNode(gridEvaluator)
        if (node.previousNode != null && node.previousNode.previousNode !== null) {
            this.targetCoords = node.previousNode.solutionPiece.coords
            this.targetShape = node.previousNode.solutionPiece.shape
        } else if (node.previousNode !== null) {
            this.targetCoords = node.solutionPiece.coords
            this.targetShape = node.solutionPiece.shape
        }
    }

    getNextMove(piece, tetrisGrid) {
        let djikstra = new TetrisDjikstra(buildBooleanGridBis(tetrisGrid), piece, this.targetCoords, true)

        let bool = djikstra.recursiveDjikstra()
        if (bool === false) {
            return "NO"
        }

        let weightGrid = djikstra.weightGrid

        return this.getNextMoveBis(piece, weightGrid)

    }

    updateTetris(alexPiece, tetrisGrid) {
        let piece = buildPiece(alexPiece)
        if (this.targetShape.equals(piece.shape)) {
            let move = this.getNextMove(piece, tetrisGrid)

            switch (move) {
                case "RIGHT":
                    this.alexPiece.moveRight()
                    break
                case "NO":
                    break
                case "LEFT":
                    this.alexPiece.moveLeft()
                    break
                case "DOWN":
                    this.alexPiece.moveDown()

            }
        } else {
            alexPiece.rotate()
        }
    }


    getNextMoveBis(piece, weightGrid) {
        let coords = new Coords(this.targetCoords.x, this.targetCoords.y)
        let sol = " "
        while (!coords.equals(piece.coords)) {
            let previousPosFound = false;
            for (let y = -1; y <= 0 && !previousPosFound; ++y) {
                for (let x = -1; x <= 1 && !previousPosFound; ++x) {
                    if ((x === 0 || y === 0) && x !== y) {
                        let newX = x + coords.x
                        let newY = y + coords.y
                        if (newX >= 0 && newX < weightGrid[0].length && newY >= 0 && newY < weightGrid.length) {
                            if (weightGrid[newY][newX] < weightGrid[coords.y][coords.x]) {
                                if (y === -1) {
                                    sol = "DOWN"
                                } else if (x === 1) {
                                    sol = "LEFT"
                                } else if (x === -1) {
                                    sol = "RIGHT"
                                }
                                coords = new Coords(newX, newY)
                                previousPosFound = true
                            }
                        }
                    }
                }
            }
        }


        return sol
    }
}


function buildPiece(nextPiece) {
    return new Piece(nextPiece.col, nextPiece.row, buildBooleanGrid(nextPiece.shape));
}

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
        square: '#eaea00', line: '#00efef', T: '#AA00FF', L: '#FFA500', J: '#0000FF', S: '#01FF00', Z: '#FF0000',
    };

    let tetrisGrid = newGrid();

    let currentPiece;
    let nextPiece;
    let savedPiece;

    let nbPieces = 0;
    let speedModifier = 1;
    let score = 0;

    let displayScore = document.getElementById("displayScore");

    let treeSearch

    function newGrid() {
        return Array.from({length: ROWS}, () => Array(COLUMNS).fill(0));
    }

    function getColor(shape) {
        return shapeColors[shape];
    }

    class TetrisPiece {

        constructor(shape) {
            this.frame = 0;
            this.maxFrame = 240;
            this.shape = shapes[shape];
            this.color = getColor(shape);
            this.row = -this.shape.length + 1 >= 0 ? -this.shape.length + 1 : 0;
            this.col = Math.floor(COLUMNS / 2) - Math.floor(this.shape[0].length / 2);
        }


        autoMoveDown() {
            this.frame += speedModifier * 5;
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

            // Rotate the shape
            this.shape = this.shape[0].map((_, i) => this.shape.map((row) => row[i]).reverse());
            this.row = oldRow + centerRow - Math.floor(this.shape.length / 2);
            this.col = oldCol + centerCol - Math.floor(this.shape[0].length / 2);

            // Check for collision after rotation
            if (collision() || this.row < 0) {
                recenterToBoard(oldCol);
                if (collision() || this.row < 0) {
                    // Restore the old shape and position if collision
                    this.shape = oldShape;
                    this.row = oldRow;
                    this.col = oldCol;
                }
            }
        }
    }


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


    function collision() {
        for (let i = 0; i < currentPiece.shape.length; i++) {
            for (let j = 0; j < currentPiece.shape[i].length; j++) {
                if (currentPiece.row >= 0 && currentPiece.shape[i][j] && (tetrisGrid[currentPiece.row + i] && tetrisGrid[currentPiece.row + i][currentPiece.col + j]) !== 0) {
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


    function clearRowsAndUpdateScore() {
        lineCount = 0

        for (let y = 0; y < tetrisGrid.length; ++y) {
            let boolLine = true
            for (let x = 0; x < tetrisGrid[0].length && boolLine; ++x) {
                boolLine = tetrisGrid[y][x] !== 0
            }
            if (boolLine) {
                tetrisGrid.splice(y, 1)
                tetrisGrid.unshift(Array(tetrisGrid[0].length).fill(0))
                ++lineCount
            }
        }

        if (lineCount > 0) {
            switch (lineCount) {
                case 1:
                    score += 40;
                    break;
                case 2:
                    score += 100;
                    break;
                case 3:
                    score += 300;
                    break;
                case 4:
                    score += 1200;
                    break;
            }
        }
    }


    function getRandomShape() {
        const shapes = Object.keys(shapeColors);
        const randomIndex = Math.floor(Math.random() * shapes.length);
        return shapes[randomIndex];
    }

    function checkGameOver() {
        for (let i = 0; i < tetrisGrid[0].length; ++i) {
            if (tetrisGrid[0][i] !== 0) {
                return true
            }
        }
        return false
    }

    function updateSpeed() {
        if (nbPieces === 25) {
            nbPieces = 0;
            speedModifier++;
        }
    }

    function updateTetris(evaluator) {
        displayScore.innerHTML = "Score : " + score;

        if (currentPiece) {
            currentPiece.autoMoveDown();

            if (collision()) {
                mergePiece();

                currentPiece = nextPiece;
                nextPiece = new TetrisPiece(getRandomShape());
                nbPieces++;

                treeSearch = new TreeSearchIA([buildPiece(currentPiece), buildPiece(nextPiece)], tetrisGrid, currentPiece, evaluator)
            } else {
                treeSearch.updateTetris(currentPiece, tetrisGrid)
            }
        }

        updateSpeed()
        clearRowsAndUpdateScore()
    }

    function gameLoopV2(evaluator) {
        while (!checkGameOver()) {
            updateTetris(evaluator)
        }

        return score
    }

    function initTetrisData(evaluator) {
        tetrisGrid = newGrid()
        currentPiece = new TetrisPiece(getRandomShape());
        nextPiece = new TetrisPiece(getRandomShape());
        treeSearch = new TreeSearchIA([buildPiece(currentPiece), buildPiece(nextPiece)], tetrisGrid, currentPiece, evaluator)
    }

    //const NB_PART = 100
    //const NB_BY_GENERATION = 100
    //const MAX_COEF = 100
    //const MIN_COEF = 100
    //const MAX_PARENTS = 5
    //const COEF_MUTATION = 3
    //let MAX_MUTATION_COEF = 30

    const NB_PART = 10
    const NB_BY_GENERATION = 5
    const MAX_COEF = 100
    const MIN_COEF = 100
    const MAX_PARENTS = 2
    const COEF_MUTATION = 3
    const MAX_MUTATION_COEF = 30

    function gameLoopAndGetScore(evaluator) {
        let score = 0
        for (let i = 0; i < NB_PART; ++i) {
            initTetrisData(evaluator)
            score += gameLoopV2(evaluator)
        }
        return score / NB_PART
    }

    function generateRandomGen() {
        let gen = []
        for(let i =0; i < NB_BY_GENERATION; ++i){
            gen.push(new GridEvaluator(getRandomCoeff(), getRandomCoeff(), getRandomCoeff(), getRandomCoeff()))
        }
        return gen
    }
    function getRandomCoeff(){
        return Math.floor(Math.random() * (MAX_COEF-MIN_COEF) + MIN_COEF)
    }
    let generation = generateRandomGen()

    function getGenResult(generation) {
        let result = []
        for(let i = 0; i<generation.length;++i){
            result.push(gameLoopAndGetScore(generation[i]))
        }
        return result
    }


    function getBestGenIds(generation, result) {
        function getBestID(generation, result){
            let best = 0
            for(let i = 1; i < generation.length;++i){
                if(result[i]>result[best])
                    best = i
            }
            return best
        }

        let bests = []

        for(let j = 0; j < MAX_PARENTS;++j){
            let best = getBestID(generation, result)
            bests.push(generation[best])
            generation.splice(best,1)
        }

        return bests;
    }

    function getMutedValue(coef) {
        let sign = Math.random()*2-1>0
        let add = coef * Math.random() * MAX_MUTATION_COEF / 100

        return coef + add * (sign ? 1 : -1)
    }

    function getNewValue(coef) {
        return Math.floor(Math.random()*100)>COEF_MUTATION ? coef : getMutedValue(coef) ;
    }

    function getNewGen(bests) {
        function getNew(bests){
            let coef1 = bests[getNewValue(Math.floor(Math.random()*bests.length).coefHeights)]
            let coef2 = bests[getNewValue(Math.floor(Math.random()*bests.length).coefBumpiness)]
            let coef3 = bests[getNewValue(Math.floor(Math.random()*bests.length).coefLine)]
            let coef4 = bests[getNewValue(Math.floor(Math.random()*bests.length).coefHole)]

            return new GridEvaluator(coef1, coef2, coef3, coef4)
        }
        let result = []

        for(let i = 0 ; i< NB_BY_GENERATION; ++i){
            result.push(getNew(bests))
        }

        return result
    }

    while(true){
        let result = getGenResult(generation)
        let bests = getBestGenIds(generation, result)
        let newGen = getNewGen(bests)
        generation = newGen
        console.log(result)
    }

});