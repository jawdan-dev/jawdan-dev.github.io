// NEAT Config

const
    inputNodeCount = 2,
    outputNodeCount = 1,
    populationSize = 200;
var neatInstance;

//

var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');

    neatInstance = new NEAT(inputNodeCount, outputNodeCount, populationSize);
    ellipseMode(CENTER);
}

function draw() {
    background(50);

    let offset = 50;
    let rightOff = offset * 2;
    let height = (windowHeight - rightOff) / 4;

    let sideWidth = 300;

    let states = [
        [0, 0, 0],
        [0, 1, 1],
        [1, 0, 1],
        [1, 1, 0]
    ];

    let border = 10;
    let g = neatInstance.getPopulation()[0];
    for (let i = 0; i < 4; i++) {
        g.draw(offset + border, offset + border + (height * i), windowWidth - (rightOff + sideWidth + (border * 2)), height - (border * 2), states[i]);
    }

    // All the other stuff

    let population = neatInstance.getPopulation();
    for (let n = 0; n < population.length; n++) {
        let g = population[n];
        let fitness = 4;
        for (let i = 0; i < 4; i++) {
            let output = g.passInputs(states[i])[0];
            fitness -= Math.pow(output - states[i][2], 2);
        }
        g.setFitness(fitness);
    }

    neatInstance.generateNewPopulation();
}