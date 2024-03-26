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
        if (originalGrid != null)
            this.buildBooleanGrid(originalGrid)
        this.previousNode = previousNode
        this.djikstraGrid = djikstraGrid
    }

    buildNodes(depth, piece) {
        if (depth === 0) {
            let variants = piece.getVariants()
            for (let i = 0; i < variants.length; ++i) {
                let possibilities = this.getPossibilitiesFromPiece(variants[i])
                for (let j = 0; j < possibilities.length; ++j) {
                    let tetrisDjikstra = new TetrisDjikstra(this.grid, variants[i], possibilities[j].getCoords())
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
                        possibilities.push(new Piece(variant.shape, x, y))
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
                                console.log(sol)
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
            if (boolLine)
                ++ct
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
            for (let y = 0; y < height; ++y) {
                for (let x = 0; x < width; ++x) {
                    if (grid[y][x] !== 0) {
                        this.booleanGrid[y][x] = true
                    }
                }
            }
            this.booleanGrid = Array.from({length: height}, () => Array(width).fill(false))
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


    getBestNode() {
        let nodes = this.node.getLastNodes()

        let gridEvaluatorTest = new GridEvaluator(-51, -18, 76, -35)

        let max = gridEvaluatorTest.evaluateGrid(nodes[0].originalGrid)
        let maxDepth = nodes[0].getDepth()
        let idMax = 0

        for (let i = 1; i < nodes.length; ++i) {
            let currentScore = gridEvaluatorTest.evaluateGrid(nodes[i].originalGrid)
            if (nodes[i].getDepth() >= maxDepth && currentScore > max) {
                max = currentScore
                maxDepth = nodes[i].getDepth()
                idMax = i
            }
        }

        return nodes[idMax]

    }

    getNextMove() {
        let node = this.getBestNode()
        while (node.getDepth() > 1) {
            node = node.previousNode
        }
        return node.getNextMove()
    }
}


/*
let gridTest = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [0, 1, 1, 0, 1],
];

let pieceTest = new Piece(new PieceShape([[false, true], [true, true], [false, true]]), 0, 0)

let ts = new TreeSearch([pieceTest, pieceTest], gridTest)
ts.buildTree()
console.log(printGrid(ts.node.nodes[0].nodes[0].getNewGrid()))
console.log(printGrid(ts.node.nodes[0].nodes[0].originalGrid))
console.log((ts.node.getLastNodes()))

let ct = 0
let ct2 = 0
for (let i = 0; i < ts.node.nodes.length; ++i) {
    for (let j = 0; j < ts.node.nodes[i].nodes.length; ++j) {
        ++ct
        console.log(printGrid(ts.node.nodes[i].nodes[j].getNewGrid()))
    }
}
let gridEvaluatorTest = new GridEvaluator(-51, -18, 76, -35)
let nodes = ts.node.getLastNodes()
let max = gridEvaluatorTest.evaluateGrid(nodes[0].originalGrid)
let idMax = 0

for (let i = 1; i < nodes.length; ++i) {
    let currentScore = gridEvaluatorTest.evaluateGrid(nodes[i].originalGrid)
    console.log(currentScore)
    if (currentScore > max) {
        max = currentScore
        idMax = i
    }
}
console.log(printGrid(nodes[idMax].originalGrid))
console.log(printGrid(nodes[idMax].getNewGrid()))
console.log(max)

console.log(gridEvaluatorTest.evaluateGrid([
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, true, true, true, false],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [false, true, true, true, true]
    ]
))



 */

/*
const shapes = [
    [[true, true], [true, true]],
    [[true, true, true, true]],
    [[true, true, true], [false, true, false]],
    [[true, true, true], [true, false, false]],
    [[true, true, true], [false, false, true]],
    [[true, true, false], [false, true, true]],
    [[false, true, true], [true, true, false]]
]

function getRandomPiece() {
    const randomIndex = Math.floor(Math.random() * shapes.length);
    return new Piece(new PieceShape(shapes[randomIndex]), 4, 0)
}

function newGrid() {
    return Array.from({length: 20}, () => Array(10).fill(0));
}

let gridTest = newGrid()
let currentPiece = getRandomPiece()
let nextPiece = getRandomPiece()
let totalLine = 0
while (!false) {


    let treeSearch = new TreeSearch([currentPiece, nextPiece], gridTest)
    treeSearch.buildTree()


    let node = treeSearch.getBestNode().previousNode

    console.log("_______________________________________________________________________")
    console.log("grid")
    console.log(printGrid(node.grid))
    console.log("djikstraGrid")
    console.log(printGrid(node.djikstraGrid))
    console.log("originalGrid")
    console.log(printGrid(node.originalGrid))
    console.log(node)
    console.log("_______________________________________________________________________")


    for (let i = 0; i < node.solutionPiece.shape.booleanGrid.length; ++i) {
        for (let j = 0; j < node.solutionPiece.shape.booleanGrid[0].length; ++j) {
            if (node.solutionPiece.shape.booleanGrid[i][j]) {
                gridTest[node.solutionPiece.coords.y + i][node.solutionPiece.coords.x + j] = 1
            }
        }
    }
    currentPiece = nextPiece
    nextPiece = getRandomPiece()

    let ct = 0

    for (let y = gridTest.length - 1; y >= ct; --y) {
        let boolLine = true
        for (let x = 0; x < gridTest[0].length && boolLine; ++x) {
            boolLine = boolLine && gridTest[y - ct][x] === 1
        }
        if (boolLine) {
            ++ct
            ++totalLine
            gridTest.splice(y - ct + 1, 1)
        }
    }

    newArray = Array(0)

    for (let i = 0; i < ct; ++i) {
        newArray.push(Array(gridTest[0].length).fill(0))
    }
    for (let i = 0; i < gridTest.length; ++i) {
        newArray.push(gridTest[i])
    }
    gridTest = newArray
    console.log(totalLine)
}
*/
/*
let pieceNodeTest = new Piece(new PieceShape([
    [true, true],
    [false, true],
    [false, true]
]), 4, 0,)
let solutionPieceNodeTest = new Piece(new PieceShape([
    [true, true],
    [false, true],
    [false, true]
]), 8, 16,)
let djikstraGridNodeTest = [
    [4, 3, 2, 1, 0, 1, 2, 3, 4, 999],
    [5, 4, 3, 2, 1, 2, 3, 4, 5, 999],
    [6, 5, 4, 3, 2, 3, 4, 5, 6, 999],
    [7, 6, 5, 4, 3, 4, 5, 6, 7, 999],
    [8, 7, 6, 5, 4, 5, 6, 7, 8, 999],
    [9, 8, 7, 6, 5, 6, 7, 8, 9, 999],
    [10, 9, 8, 7, 6, 7, 8, 9, 10, 999],
    [11, 10, 9, 8, 7, 8, 9, 10, 11, 999],
    [12, 11, 10, 9, 8, 9, 10, 11, 12, 999],
    [13, 12, 11, 10, 9, 10, 11, 12, 13, 999],
    [14, 13, 12, 11, 10, 11, 12, 13, 14, 999],
    [15, 14, 13, 12, 11, 12, 13, 14, 15, 999],
    [16, 15, 14, 13, 12, 13, 14, 15, 16, 999],
    [999, 16, 15, 999, 999, 14, 15, 16, 17, 999],
    [999, 999, 999, 999, 999, 999, 16, 17, 18, 999],
    [999, 999, 999, 999, 999, 999, 999, 999, 19, 999],
    [999, 999, 999, 999, 999, 999, 999, 999, 20, 999],
    [999, 999, 999, 999, 999, 999, 999, 999, 999, 999],
    [999, 999, 999, 999, 999, 999, 999, 999, 999, 999],
    [999, 999, 999, 999, 999, 999, 999, 999, 999, 999]
]
let originalGridNodeTest = [
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [true, true, false, false, true, true, false, false, false, false],
    [true, true, true, true, true, true, true, false, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, false, true, true, true]
]
let gridNodeTest = [
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true],
    [false, false, true, true, false, false, true, true, true, true],
    [false, false, false, false, false, false, false, true, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false]

]

let origine = new Node()
let nodeTest = new Node(pieceNodeTest, solutionPieceNodeTest, gridNodeTest, originalGridNodeTest, origine, djikstraGridNodeTest)
origine.nodes.push(nodeTest)
nodeTest.buildNodes(0, pieceNodeTest)
console.log(nodeTest)

let treeSearchTest = new TreeSearch()
treeSearchTest.node = origine
console.log(treeSearchTest)
console.log(treeSearchTest.getNextMove())

 */

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
