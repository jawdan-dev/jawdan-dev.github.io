// NEAT Config

const
    inputNodeCount = 8,
    outputNodeCount = 1,
    populationSize = 200;
var neatInstance;

// Conway Config

const
    gridWidth = 30,
    gridHeight = gridWidth,
    fillPercentage = 0.25,
    runsUntilReset = (gridWidth + gridHeight);

//

const targetFillPercentage = 0.5;

var brains;

//

var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');


    neatInstance = new NEAT(inputNodeCount, outputNodeCount, populationSize);
    fillPopulation();

    frameRate(30);
}

function fillPopulation() {
    startGrid = new Grid();
    brains = [];
    for (let i = 0; i < populationSize; i++) {
        brains[i] = new Brain(i);
    }
}

var startGrid;
var iterationCount = 0;
var generation = 0;


function draw() {
    background(50);

    if (!startGrid) {
        startGrid = new Grid();
    }

    for (let i = 0; i < populationSize; i++) {
        brains[i].update();
    }

    iterationCount++;

    let best = brains[0];
    let best2 = brains[populationSize / 2];
    noStroke();
    let border = 50;

    let maxFitness = gridWidth * gridHeight * targetFillPercentage;



    let barborder = 3;
    let midborder = 2;

    let htarget = windowHeight - (border * 2);

    let bestFit = best.getCurrentGridFitness() / maxFitness;
    let besth = htarget * bestFit;
    let bestfittot = htarget * (best.totalFitness / (maxFitness * iterationCount));
    let bestFit2 = best2.getCurrentGridFitness() / maxFitness;
    let besth2 = htarget * bestFit2;
    let bestfittot2 = htarget * (best2.totalFitness / (maxFitness * iterationCount));

    best.grid.draw(border, border, windowWidth/2 - (border * 2), windowHeight - (border * 2));
    best2.grid.draw(windowWidth / 2 + border, border, windowWidth/2 - (border * 2), windowHeight - (border * 2));
    fill(0);
    rect(windowWidth / 2 - border + barborder, border, border - (barborder * 2), windowHeight - (border * 2));
    rect(windowWidth / 2 + barborder, border, border - (barborder * 2), windowHeight - (border * 2));
    fill(250, 150, 50);
    rect(windowWidth / 2 - border + barborder, windowHeight - border, border - (barborder * 2), -besth);
    rect(windowWidth / 2 + barborder, windowHeight - border, border - (barborder * 2), -besth2);
    fill(255);
    rect(windowWidth / 2 - border + barborder + ((border - (barborder * 2)) / 2) - midborder, windowHeight - border, midborder * 2, -bestfittot)
    rect(windowWidth / 2 + barborder + ((border - (barborder * 2)) / 2) - midborder, windowHeight - border, midborder * 2, -bestfittot2)

    //best.brain.draw(windowWidth / 2 + border, border, windowWidth / 2 - (border * 2), windowHeight - (border * 2), best.getInputNeurons(1, 1));


    fill(255);
    text("Generation: " + generation, 50, 20);
    text("Iteration: " + iterationCount, 50, 40);

    if (iterationCount >= runsUntilReset) {
        neatInstance.generateNewPopulation(populationSize / 10);
        fillPopulation();

        iterationCount = 0;
        generation++;
    }


}

class Brain {
    constructor(index) {
        this.grid = startGrid.clone();
        this.brain = neatInstance.getPopulation()[index];
        this.totalFitness = 0;
    }

    getCurrentGridFitness() {
        // Just tryna get a full white board :)
        let total = 0;
        let score = 0;

        let mid = gridWidth * gridHeight * targetFillPercentage;

        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                total += this.grid.grid[x][y];
                if (total > mid) {
                    score -= this.grid.grid[x][y];
                } else {
                    score += this.grid.grid[x][y];
                }
            }
        }

        return score;
    }

    getFitness() {
        return totalFitness;
    }

    update() {
        let newGrid = [];
        for (let x = 0; x < gridWidth; x++) {
            newGrid[x] = [];
            for (let y = 0; y < gridHeight; y++) {
                let input = this.getInputNeurons(x, y);
                newGrid[x][y] = this.brain.passInputs(input)[0] > 0.5 ? 1 : 0;
            }
        }
        this.grid.grid = newGrid;

        this.totalFitness += this.getCurrentGridFitness();
        this.brain.setFitness(this.totalFitness);
    }

    getInputNeurons(x, y) {
        let neurons = [];

        let checks = [
            [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
            [x - 1, y], [x + 1, y],
            [x - 1, y + 1], [x, y + 1], [x + 1, y + 1],
        ];

        for (let i = 0; i < checks.length; i++) {
            if (checks[i][0] < 0 || checks[i][0] >= gridWidth ||
                checks[i][1] < 0 || checks[i][1] >= gridHeight) {
                neurons[i] = 0;
            } else {
                neurons[i] = this.grid.grid[checks[i][0]][checks[i][1]];
            }
        }

        return neurons;
    }
}

class Grid {
    constructor(createNew = true) {
        if (createNew) {
            this.createNew();
        }
    }

    clone() {
        let g = new Grid(false);
        g.grid = [];
        for (let x = 0; x < gridWidth; x++) {
            g.grid[x] = [];
            for (let y = 0; y < gridHeight; y++) {
                g.grid[x][y] = this.grid[x][y];
            }
        }
        return g;
    }

    createNew() {
        this.grid = [];
        for (let x = 0; x < gridWidth; x++) {
            this.grid[x] = [];
            for (let y = 0; y < gridHeight; y++) {
                this.grid[x][y] = 0;
            }
        }

        let fillAmount = Math.min(gridWidth * gridHeight, gridWidth * gridHeight * fillPercentage)
        for (let i = 0; i < fillAmount; i++) {
            let x = getRandomInt(gridWidth);
            let y = getRandomInt(gridHeight);
            if (this.grid[x][y] == 0) {
                this.grid[x][y] = 1;
            } else {
                i--;
            }
        }
    }

    draw(x, y, w, h) {
        let size = Math.min(w / gridWidth, h / gridHeight);

        x -= (gridWidth - (w / size)) * size * 0.5;
        y -= (gridHeight - (h / size)) * size * 0.5;

        fill(0);
        rect(x, y, size * gridWidth, size * gridHeight);

        fill(255);
        for (let dx = 0; dx < gridWidth; dx++) {
            for (let dy = 0; dy < gridHeight; dy++) {
                if (this.grid[dx][dy] == 1) {
                    rect(x + (dx * size), y + (dy * size), size, size);
                }
            }
        }
    }
}