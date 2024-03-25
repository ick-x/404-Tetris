class Node  {
    piece
    grid
    nodes
    solutionPiece
    originalGrid
    previousNode

    constructor(piece, solutionPiece, grid, originalGrid, previousNode) {
        this.piece = piece
        this.grid = grid
        this.solutionPiece = solutionPiece
        this.nodes = Array(0)
        this.buildBooleanGrid(originalGrid)
        this.previousNode = previousNode
    }

    buildNodes(depth, piece) {
        console.log(this)
        if (depth === 0) {
            let variants = piece.getVariants()
            for (let i = 0; i < variants.length; ++i) {
                let possibilities = this.getPossibilitiesFromPiece(variants[i])
                for (let j = 0; j < possibilities.length; ++j) {
                    if (new TetrisDjikstra(this.grid, variants[i], possibilities[j].getCoords()).recursiveDjikstra()) {
                        this.nodes.push(new Node(variants[i], possibilities[j], this.grid, this.originalGrid, this))
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
        if (this.nodes.length > 0) {
            return this.nodes[0].getDepth(++depth)
        }
        return depth
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
        //let hole = this.evaluateHole(grid)

        return bumpinessAndHeight
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
        for (let y = 0; y < grid.length; ++i) {
            let boolLine = true
            for (let x = 0; x < grid[0].length && boolLine; ++x) {
                boolLine = boolLine && grid[y][x]
            }
            if (boolLine)
                ++ct
        }
        return ct * this.coefLine
    }
}

class TreeSearch {
    booleanGrid
    recursiveGrid
    pieces
    node

    constructor(pieces, grid) {
        this.pieces = Array.from({length: pieces.length}, () => null)
        for (let i = 0; i < pieces.length; ++i) {
            this.pieces[i] = pieces[i]
        }


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

    buildTree() {
        this.node = new Node(null, null, this.recursiveGrid, this.booleanGrid, null)
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

    getDepth() {
        return this.node.getDepth(0)
    }

    getGrids() {
        return this.node.getGrids()
    }

}

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