const tt = 1;
const tf = -0;

const trainingData = [
    [[tt, tt], [tf]],
    [[tt, tf], [tt]],
    [[tf, tt], [tt]],
    [[tf, tf], [tf]],
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


    textAlign(CENTER);
    if (true) {
        let gx = 0, gy = 300, gw = left, gh = left;

        noStroke();
        fill(255);
        text("Activation Function:", gx + gw / 2, gy - 5);


        fill(20);
        rect(gx, gy, gw, gh);

        let m = 5;
        strokeWeight(1);
        stroke(255, 50);
        for (let i = 0; i <= m * 2; i++) {
            let x = mapRange(i, 0, m * 2, 0, gw);
            let y = mapRange(i, 0, m * 2, 0, gh);
            line(gx + x, gy, gx + x, gy + gh);
            line(gx, gy + y, gx + gw, gy + y);
        }

        stroke(255);
        drawFunction(neat.population[0].activationFunction, gx, gy, gw, gh);
        stroke(255, 0, 0);
        drawFunction(neat.population[0].activationFunctionDerivitive, gx, gy, gw, gh);
    }


    noStroke();
    fill(255);
    text("Training Table:", left / 2, 550);

    drawTrainingData(0, 600, left, 250);
    textAlign(LEFT);
}

function drawFunction(f, dx, dy, dw, dh) {
    let m = 5;
    let min = -m;
    let max = m;

    for (let i = 0; i < dw; i++) {
        let x = mapRange(i, 0, dw, min, max);
        let y = mapRange(f(x), min, max, dh, 0);
        point(dx + i, dy + y);
    }
}

function drawTrainingData(dx, dy, dw, dh) {
    let data = trainingData;

    let rows = data.length + 0.1;
    let columns = data[0][0].length + data[0][1].length + 1;


    const minColor = 20;
    const lowColor = 20;
    const colorFactor = 150;


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
                value = neat.population[0].getOutput(data[j][0])[i - ll];
            }
            const color = Math.min(Math.max(Math.abs(value) * colorFactor, minColor), 255);
            const low = Math.max(((Math.abs(value) * colorFactor) - 255) + lowColor, lowColor);
            if (value >= 0) {
                fill(low, low, color);
            } else {
                fill(color, low, low);
            }
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
        nextStep = true;
    }
}
