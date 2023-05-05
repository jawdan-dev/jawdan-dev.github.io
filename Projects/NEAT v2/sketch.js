const tt = 1;
const tf = -1;

const trainingSetXOR = [
    [[tt, tf], [tt]],
    [[tt, tt], [tf]],
    [[tf, tf], [tf]],
    [[tf, tt], [tt]],
];

const class1 = [1];
const class2 = [-1];
const trainingSetApproximation = [
    [[0.1, 0.75], class2],
    [[0.4, 0.6], class2],
    [[0.75, 0.6], class1],
    [[0.15, 0.25], class1],
    [[0.2, 0.4], class2],
    [[0.6, 0.35], class1],
];
const trainingSetApproximationXOR = [];
const trainingSetApproximationXORMOD = [
    [[0.25, 0.25], class2],
    [[0.25, 0.75], class1],
    [[0.75, 0.25], class1],
    [[0.75, 0.75], class2],

    [[0.375, 0.375], class1],
    [[0.625, 0.625], class1],
    [[0.5, 0.5], class2],
];
const trainingSetApproximationRING = [
    [[0.25, 0.25], class2],
    [[0.25, 0.75], class2],
    [[0.75, 0.25], class2],
    [[0.75, 0.75], class2],

    [[0.15, 0.5], class2],
    [[0.5, 0.15], class2],
    [[0.85, 0.5], class2],
    [[0.5, 0.85], class2],

    [[0.5, 0.5], class2],

    [[0.625, 0.625], class1],
    [[0.375, 0.375], class1],
    [[0.375, 0.625], class1],
    [[0.625, 0.375], class1],

    [[0.3, 0.5], class1],
    [[0.7, 0.5], class1],
    [[0.5, 0.3], class1],
    [[0.5, 0.7], class1],
];


let trainingData = trainingSetApproximationXORMOD;
let clampTop = false;

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

    trainingSetApproximationXOR.splice(0, trainingSetApproximationXOR.length);
    for (let i = 0; i < 200; i++) {
        let x = random();
        let y = random();

        let state = (x >= 0.5 ? 1 : 0) + (y >= 0.5 ? 1 : 0);
        trainingSetApproximationXOR[trainingSetApproximationXOR.length] = [
            [x, y], [state == 1 ? tt : tf]
        ];
    }

    neat = new NEAT({
        inputNodeCount: trainingData[0][0].length,
        outputNodeCount: trainingData[0][1].length,
        populationSize: 100,
        biasNode: true,
        drawFrames: 200
    });
    console.log(neat);

    const p = neat.population[0];

    //p.splitConnection(1);
    //p.splitConnection(2);
    //p.addConnection(2, 4);
    //p.addConnection(1, 5);

    frameRate(30);

}

var nextStep = false;

let blocksPerFrame = 1000;
let blockIndex = [];
const deltaTarget = 1000 / 20;

const textColor = 255;
const backgroundColor = 255 - textColor;

function getInputs() {
    let inputs = [];
    for (let i = 0; i < trainingData.length; i++) {
        inputs[inputs.length] = trainingData[i][0];
    }
    return inputs;
}
function getOutputs() {
    let outputs = [];
    for (let i = 0; i < trainingData.length; i++) {
        outputs[outputs.length] = trainingData[i][1];
    }
    return outputs;
}

function draw() {

    if (deltaTime > deltaTarget) {
        blocksPerFrame -= 50;
    } else {
        blocksPerFrame++;
    }
    blocksPerFrame = Math.min(Math.max(blocksPerFrame, 100), 3000);

    background(11); //12
    background(backgroundColor); //12

    noStroke();
    fill(12);
    let s = Math.min(windowWidth, windowHeight);


    const inputs = getInputs();
    const outputs = getOutputs();


    let left = 200;

    let hw = (windowWidth - left) / 2;
    let hh = windowHeight / 2;


    const p = neat.population[0];

    p.draw(left, 0, hw, hh, trainingData[0][0]);
    neat.runEpoch(inputs, outputs, 5000, 5e-3);
    p.calculateFitness(inputs, outputs);

    const minSize = Math.min(hw, hh);
    const graphOx = minSize == hw ? 0 : ((hw - minSize) / 2);
    const graphOy = minSize == hh ? 0 : ((hh - minSize) / 2);

    drawFunctionGraph(left + hw + graphOx, graphOy, minSize, minSize, p);

    //if (neat.lastSpecies != undefined && neat.lastSpecies.length > 2) {
    //    drawFunctionGraph(left, hh, hw, hh, neat.lastSpecies[1].rep, 1);
    //    drawFunctionGraph(left + hw, hh, hw, hh, neat.lastSpecies[2].rep, 2);
    //}



    fill(textColor);
    noStroke();
    let textHeight = 20;
    let textSpacing = 20;

    const drawDebugText = t => {
        text(t, 20, textHeight)
        textHeight += textSpacing;
    }

    drawDebugText("GENERATION: " + String(neat.generation));
    drawDebugText("Population: " + String(neat.population.length));
    drawDebugText("RenderSpeed: " + String(blocksPerFrame));
    drawDebugText("Species Count: " + String(neat.lastSpecies != undefined ? neat.lastSpecies.length : 1));
    drawDebugText("Min Fitness: " + String(neat.minFitness));
    drawDebugText("Max Fitness: " + String(neat.maxFitness));



    let m = 3;
    textAlign(CENTER);
    if (true) {
        let gx = 0, gy = 150, gw = left, gh = left;

        noStroke();
        fill(textColor);
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
    fill(textColor);
    text("Training Table:", left / 2, 400 - 30);

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
        text(weights[i], left / 2, 720 + (i * 20));
    }

    drawTrainingData(0, 400, left, 300, p);
    textAlign(LEFT);
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
    fill(0);
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
    }
}

function getLerpColor(r1, g1, b1, r2, g2, b2, t) {
    return color(
        lerp(r1, r2, t),
        lerp(g1, g2, t),
        lerp(b1, b2, t)
    );
}

let graphTexture = [];
function drawFunctionGraph(bx, by, bw, bh, p, imageVal = 0) {
    strokeWeight(1);
    noStroke();

    let minRange = trainingData[0][0][0];
    let maxRange = trainingData[0][0][0];
    for (let i = 0; i < trainingData.length; i++) {
        trainingData[i][0].forEach(v => {
            minRange = Math.min(minRange, v - 0.2);
            maxRange = Math.max(maxRange, v + 0.2);
        });
    }

    const totalRange = maxRange - minRange;

    const cut = 80;
    const scale = 3;

    if (graphTexture[imageVal] == undefined || graphTexture[imageVal].width != cut * scale || graphTexture[imageVal].height != cut * scale) {
        graphTexture[imageVal] = createImage(cut * scale, cut * scale);
        graphTexture[imageVal].loadPixels();
    }
    if (blockIndex[imageVal] == undefined) {
        blockIndex[imageVal] = 0;
    }

    const increment = totalRange / cut;

    const start = blockIndex[imageVal];
    const end = (blockIndex[imageVal] + blocksPerFrame) % (cut * cut);

    let c = color(255, 0, 255);
    for (let y = 0; y < cut; y++) {
        for (let x = 0; x < cut; x++) {
            let blockIndexValue = x + (y * cut);

            const ix = x * increment;
            const iy = y * increment;

            let ax = ix + minRange;
            let ay = iy + minRange;

            if (!((start < end && blockIndexValue >= start && blockIndexValue < end) || (start >= end && (blockIndexValue >= start || blockIndexValue < end)))) {
                continue;
            }

            let value = p.getOutput([ax, ay])[0];

            if (value != undefined) {
                const sign = value >= 0;
                value = Math.abs(value);
                value = value < 1 ? (1 - value) : (clampTop ? 0 : Math.min(value - 1, 1));

                if (sign) {
                    c = getLerpColor(0, 150, 255, 0, 0, 0, value);
                } else {
                    c = getLerpColor(255, 150, 0, 0, 0, 0, value);
                }
            }

            const dx = x * scale;
            const dy = ((cut - 1) - y) * scale;
            for (let i = 0; i < scale; i++) {
                for (let j = 0; j < scale; j++) {
                    graphTexture[imageVal].set(dx + i, dy + j, c)
                }
            }
        }
    }

    graphTexture[imageVal].updatePixels();
    image(graphTexture[imageVal], bx, by, bw, bh);
    blockIndex[imageVal] = end;

    stroke(255);
    noFill();
    rect(bx, by, bw, bh);


    stroke(255);
    for (let i = 0; i < trainingData.length; i++) {
        let x = (((trainingData[i][0][0] - minRange) / totalRange)) * bw;
        let y = (1 - ((trainingData[i][0][1] - minRange) / totalRange)) * bh;

        if (trainingData[i][1][0] == 1) {
            fill(0, 255, 0);
        } else {
            fill(255, 0, 0);

        }
        circle(x + bx, y + by, 10);
    }
}
