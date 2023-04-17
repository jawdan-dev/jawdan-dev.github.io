const tt = 1;
const tf = -1;

const trainingData = [
    [[tt, tt], [tf]],
    [[tf, tf], [tf]],
    [[tt, tf], [tt]],
    [[tf, tt], [tt]],
];

var neat;

var testval = 2;

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
        inputNodeCount: trainingData[0][0].length,
        outputNodeCount: trainingData[0][1].length,
        populationSize: 200,
        biasNode: true,
        drawFrames: 40
    });
    console.log(neat);

    /// so like is th okay i do wonter hwo mayn this is writing befcause oof
    let p = neat.population[0];

    //p.splitConnection(2);
    //p.addConnection(1, 4);
    //p.addConnection(2, 3);
    //p.addConnection(1, 3);


    //for (let i = neat.biasNode ? neat.outputNodeCount : 0; i < p.connections.length; i++) {
    //    p.connections[i].enabled = false;
    //}
    //const extraNodeOffset = neat.inputNodeCount + neat.outputNodeCount;
    //for (let i = 0; i < testval; i++) {
    //    let ni = extraNodeOffset + i;
    //    for (let j = 0; j < neat.inputNodeCount; j++) {
    //        p.addConnection(j, ni);
    //    }
    //    for (let j = 0; j < neat.outputNodeCount; j++) {
    //        p.addConnection(ni, neat.inputNodeCount + j);
    //    }
    //}
    //p.connections[5].enabled = false;
    //testval++;

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
    //console.log(p.getOutput(trainingData[0][0]));
    //console.log(NEAT.distance(neat.population[0], neat.population[1]));
    //console.log(NEAT.distance(neat.population[1], neat.population[2]));

    //console.log(p.train([trainingData[0][0]], [trainingData[0][1]]));

    frameRate(30);
}

var nextStep = false;

var trainingDataIndex = 0;
var trainingDataFloatTime = 2;
var trainingDataFloat = trainingDataFloatTime;


let last = 0;
let settled = 0;

let framesGood = 0;
let iterations = 0;
function draw() {
    trainingDataFloat -= deltaTime * 0.001
    if (trainingDataFloat <= 0) {
        trainingDataFloat = trainingDataFloatTime;
        trainingDataIndex = (trainingDataIndex + 1) % trainingData.length
    }

    background(11); //12

    noStroke();
    fill(12);
    let s = Math.min(windowWidth, windowHeight);

    let x = (windowWidth - s) / 2;
    let y = (windowHeight - s) / 2;

    let left = 200;

    let hw = (windowWidth - left) / 2;
    let hh = windowHeight / 2;



    let inputs = [];
    let outputs = [];

    for (let i = 0; i < trainingData.length; i++) {
        inputs[inputs.length] = trainingData[i][0];
        outputs[outputs.length] = trainingData[i][1];
    }

    neat.population.forEach(p => {
        p.calculateFitness(inputs, outputs);
    });
    neat.population.sort((a, b) => {
        return b.fitness - a.fitness;
    })

    const p = neat.population[0];

    //neat.population[0].draw(0, 0, windowWidth, windowHeight, trainingData[0][0]);
    let move = p.draw(left, 0, hw, hh, trainingData[trainingDataIndex][0]);
    neat.population[1].draw(left + hw, 0, hw, hh, trainingData[1][0]);
    neat.population[2].draw(left, hh, hw, hh, trainingData[2][0]);
    neat.population[3].draw(left + hw, hh, hw, hh, trainingData[3][0]);


    //p.evolve(inputs, outputs, 500, 0.001);
    neat.runEpoch(inputs, outputs, 1000, 1e-5);

    //const totalErrors = p.backPropagate(inputs, outputs, false, true).totalErrors;

    //let totalErr = 0;
    //for (let i = 0; i < totalErrors.length; i++) {
    //    totalErr += Math.abs(totalErrors[i]);
    //}
    const err = undefined;//totalErr / totalErrors.length;

    //console.log(err);

    let m = 3;
    textAlign(CENTER);
    if (true) {
        let gx = 0, gy = 300, gw = left, gh = left;

        noStroke();
        fill(255);
        text("Activation Function:", gx + gw / 2, gy - 5);


        fill(20);
        rect(gx, gy, gw, gh);

        strokeWeight(1);
        stroke(255, 50);
        for (let i = 0; i <= m * 2; i++) {
            let x = mapRange(i, 0, m * 2, 0, gw);
            let y = mapRange(i, 0, m * 2, 0, gh);
            line(gx + x, gy, gx + x, gy + gh);
            line(gx, gy + y, gx + gw, gy + y);
        }

        stroke(255);
        drawFunction(p.activationFunction, gx, gy, gw, gh, m);
        stroke(255, 0, 0);
        drawFunction(p.activationFunctionDerivitive, gx, gy, gw, gh, m);
    }


    noStroke();
    fill(255);
    text("Training Table:", left / 2, 550);

    let weights = [];
    for (let i = 0; i < p.connections.length; i++) {
        if (p.connections[i].enabled) {
            weights[weights.length] = p.connections[i].weight;
        }
    }
    weights.sort((a, b) => {
        return Math.abs(b) - Math.abs(a);
    })
    for (let i = 0; i < weights.length && i < 20; i++) {
        setFillColor(weights[i]);
        text(weights[i], left / 2, 900 + (i * 20));
    }


    drawTrainingData(0, 600, left, 250, p);
    textAlign(LEFT);

    if (err != undefined && err < 0.0005) {
        framesGood++;
    } else {
        framesGood = 0;
    }
    if (last != undefined && last == move) {
        settled++;
    } else {
        settled = 0;
        last = move;
    }
    if (framesGood > 60 && settled > 60) {
        //setup();
        framesGood = 0;
        settled = 0;
        //iterations = 0;
    }
}

function drawFunction(f, dx, dy, dw, dh, m) {
    let min = -m;
    let max = m;

    for (let i = 0; i < dw; i++) {
        let x = mapRange(i, 0, dw, min, max);
        let y = mapRange(f(x), min, max, dh, 0);
        point(dx + i, dy + y);
    }
}

function drawTrainingData(dx, dy, dw, dh, p) {
    let data = trainingData;

    let rows = data.length + 0.1;
    let columns = data[0][0].length + data[0][1].length + neat.outputNodeCount;

    textAlign(CENTER);
    textSize(18);

    noStroke();
    fill(255);
    for (let i = 0; i < columns; i++) {
        let x = mapRange(i, 0, columns, 0, dw);

        let a = data[0][0].length;
        let b = a + data[0][1].length;

        if (i < a) {
            text("x" + str(i), x + (dw / columns) / 2, dy - 10);
        } else if (i < b) {
            text("t" + str(i - a), x + (dw / columns) / 2, dy - 10);
        } else {
            text("a" + str(i - b), x + (dw / columns) / 2, dy - 10);
        }
    }
    textSize(14);
    textAlign(LEFT);

    strokeWeight(1);
    stroke(255, 50);
    for (let i = 0; i < columns; i++) {
        let x = mapRange(i, 0, columns, 0, dw);

        for (let j = 0; j < data.length; j++) {
            let y = mapRange(j + 0.1, 0, rows, 0, dh);

            let l = data[j][0].length;
            let ll = l + data[j][1].length;

            let value;
            if (i < l) {
                value = data[j][0][i];
            } else if (i < ll) {
                value = data[j][1][i - l];
            } else {
                value = p.getOutput(data[j][0])[i - ll];
            }
            setFillColor(value);
            rect(dx + x, dy + y, dw / columns, dh / rows);
        }
    }
}


function keyPressed() {
    console.log(keyCode);
    if (keyCode === 32) {
        setup();
        iterations = 0;
    } else if (keyCode == 67) {

    }
}
