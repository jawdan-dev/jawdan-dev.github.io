const tt = 1;
const tf = 0;

const trainingData = [
    [[tt, tf], [tt]],
    [[tf, tt], [tt]],
    [[tf, tf], [tf]],
    [[tt, tt], [tf]],
];

var neat;

var doCreateCanvas = true;
var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    if (doCreateCanvas) {
        canvas = createCanvas(windowWidth, windowHeight);
        canvas.position(0, 0);
        doCreateCanvas = false;
    }


    neat = new NEAT({
        inputNodeCount: 2,
        outputNodeCount: 1,
        populationSize: 10,
        biasNode: true,
    });

    console.log(neat);

    let p = neat.population[0];

    //p.addConnection(0, 4);

    p.addConnection(1, 4);
    p.addConnection(2, 4);
    p.addConnection(4, 3);

    p.addConnection(1, 5);
    p.addConnection(2, 5);
    p.addConnection(5, 3);

    p.addConnection(0, 4);
    p.addConnection(0, 5);

    p.connections[1].enabled = false;
    p.connections[2].enabled = false;

    let cs = [
        1.5, 0, 0,
        1, 1, 1,
        -1, -1, 1,
        0.5, -1.5
    ]

    for (let i = 0; i < p.connections.length && i < cs.length; i++) {
        p.connections[i].weight = cs[i];
    }


    if (false) {
        p.addConnection(0, 17);
        p.addConnection(17, 18);
        p.addConnection(18, 3);
        p.addConnection(18, 19);
        p.addConnection(19, 20);
        p.addConnection(20, 19);
        p.addConnection(19, 3);


        p.connections[3].enabled = false;
    }
    //console.log(p.getOutput(testInput));
    console.log(NEAT.distance(neat.population[0], neat.population[1]));
    console.log(NEAT.distance(neat.population[1], neat.population[2]));

    //console.log(p.train([trainingData[0][0]], [trainingData[0][1]]));

    frameRate(30);
}

var nextStep = false;

let iterations = 0;
function draw() {
    background(11); //12

    noStroke();
    fill(12);
    let s = Math.min(windowWidth, windowHeight);

    let x = (windowWidth - s) / 2;
    let y = (windowHeight - s) / 2;

    let left = 200;

    let hw = (windowWidth - left) / 2;
    let hh = windowHeight / 2;

    //neat.population[0].draw(0, 0, windowWidth, windowHeight, iterations++, trainingData[0][0]);
    neat.population[0].draw(left, 0, hw, hh, iterations++, trainingData[0][0]);
    neat.population[0].draw(left + hw, 0, hw, hh, iterations++, trainingData[1][0]);
    neat.population[0].draw(left, hh, hw, hh, iterations++, trainingData[2][0]);
    neat.population[0].draw(left + hw, hh, hw, hh, iterations++, trainingData[3][0]);

    let inputs = [];
    let outputs = [];

    for (let i = 0; i < trainingData.length; i++) {
        inputs[inputs.length] = trainingData[i][0];
        outputs[outputs.length] = trainingData[i][1];
    }

    neat.population[0].train(inputs, outputs);
}


function keyPressed() {
    console.log(keyCode);
    if (keyCode === 32) {
        setup();
        iterations = 0;
    } else if (keyCode == 67) {
        nextStep = true;
    }
}
