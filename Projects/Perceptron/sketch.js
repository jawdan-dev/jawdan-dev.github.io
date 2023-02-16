
const hillslide = true;

const learningRate = hillslide ? 0.2 : 0.04;
const class1 = 1;
const class2 = hillslide ? 0 : -1;

const learningData = [
    [0.1, 0.75, class2],
    [0.4, 0.6, class2],
    [0.75, 0.6, class1],
    [0.15, 0.25, class1],
    [0.2, 0.4, class2],
    [0.6, 0.35, class1]
];

var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);

    frameRate(20);
}

function activationFunction(value) {    
    return (hillslide) ? (value >= 0 ? 1 : 0) : value;
}

class Perceptron {
    constructor(size) {
        this.size = size + 1;
        this.w = [1.0, -0.4, -0.1];
        //for (let i = 0; i < this.size; i++) {
        //    this.w[i] = (Math.random() * 2) - 1;
        //}
    }
    feed(data) {
        data[this.size - 1] = 1;
        let out = 0;
        for (let i = 0; i < this.size; i++) {
            out += this.w[i] * data[i];
        }
        return (out);
    }
    train(learningData) {
        let errorSum = [];
        for (let i = 0; i < this.size; i++) {
            errorSum[i] = 0;
        }

        //let n = Math.floor(Math.random() * learningData.length);

        for (let n = 0; n < learningData.length; n++) {
            let data = learningData[n];

            let tdata = [];
            for (let i = 0; i < data.length - 1; i++) {
                tdata[i] = data[i];
            }
            tdata[this.size - 1] = 1;
            let target = data[data.length - 1];

            let out = 0;
            for (let i = 0; i < tdata.length; i++) {
                out += this.w[i] * tdata[i];
            }

            let value = activationFunction(out);
            let dif = (target - value);

            for (let i = 0; i < tdata.length; i++) {
                if (dif > 0) {
                    errorSum[i] += tdata[i];
                } else if (dif < 0) {
                    errorSum[i] -= tdata[i];
                }
            }
        }

        for (let i = 0; i < this.size && i < errorSum.length; i++) {
            this.w[i] += errorSum[i] * learningRate;
        }
    }
}

var perc = new Perceptron(2);

function draw() {
    const border = 50;
    let bx = border;
    let bw = windowWidth - (border * 2);
    let by = border;
    let bh = windowHeight - (border * 2);

    const minRange = 0;
    const maxRange = 1;
    const totalRange = maxRange - minRange;

    background(50);
    stroke(255);
    noFill();
    rect(bx, by, bw, bh);
    noStroke();

    const cut = 80;
    const increment = totalRange / cut;
    const boxW = bw / cut + 1;
    const boxH = bh / cut + 1;
    for (let x = 0; x <= totalRange; x += increment) {
        for (let y = 0; y <= totalRange; y += increment) {
            let dx = ((x / totalRange)) * bw;
            let dy = (1 - (y / totalRange)) * bh;

            let ax = x + minRange;
            let ay = y + minRange;
            let value = (perc.feed([ax, ay]));


            if (value > 0) {
                fill(0, 150 * value, 255 * value);
            } else {
                if (false && hillslide) {
                    value = -1;
                }
                fill(255 * -value, 150 * -value, 0);
            }

            rect(bx + dx, by + dy, boxW, boxH);
        }
    }

    stroke(255);
    for (let i = 0; i < learningData.length; i++) {
        let x = (((learningData[i][0] - minRange) / totalRange)) * bw;
        let y = (1 - ((learningData[i][1] - minRange) / totalRange)) * bh;

        if (learningData[i][2] == 1) {
            fill(0, 255, 0);
        } else {
            fill(255, 0, 0);

        }
        circle(x, y, 10);
    }

    perc.train(learningData);
}