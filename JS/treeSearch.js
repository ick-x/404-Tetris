
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

/*
test

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