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


function generateRandomNetworks() {
    let depth = 50;
    let input = 20;
    let output = 6;

    let networks = 50;

    for(let i = 0 ; i<networks;++i){
        networks[i] = generateNetwork(depth, input, output);
    }

}

function geneticSelection(){
    networks = generateRandomNetworks();

    result = getResultFromPlay(networks);

    selectedNetword = getSelectedNetworkFromResult(result);

    newGeneration = getNewGenerationFromSelectNetwork(selectedNetword);
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
                possibilities1[i][0].splice(j - nbDelete, 1);
                possibilities1[i][1].splice(j - nbDelete, 1);
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
            for (let y = 0; y < shapes1[i].length; ++y) {
                for (let x = 0; x < shapes1[i].length; ++x) {
                    if (shapes1[i][y][x] === 1) {
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


console.log(printGrid(djikstra(getGridForTreeSearch(gridTest), shapesT2.T, 0, 0, 2, 4)));

treeSearch(gridTest, shapesT.T, null, 0, 0, null, null)

