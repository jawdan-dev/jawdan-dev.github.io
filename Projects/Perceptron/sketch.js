const hillslide = true;

const learningRate = hillslide ? 0.2 : 0.1;
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

    frameRate(3);
}

function activationFunction(value) {
    return (hillslide) ? (value >= 0 ? 1 : 0) : value;
}

var perc = new Perceptron(2);

function draw() {
    const border = 10;

    const sf = Math.min(windowWidth, windowHeight);

    let bx = border + (windowWidth - sf) / 2;
    let bw = sf - (border * 2);
    let by = border + (windowHeight - sf) / 2;
    let bh = sf - (border * 2);

    const minRange = 0;
    const maxRange = 1;
    const totalRange = maxRange - minRange;

    background(50);
    stroke(255);
    noFill();
    rect(bx, by, bw, bh);
    noStroke();

    const cut = 160;
    const increment = totalRange / cut;
    const boxW = bw / cut + 1;
    const boxH = bh / cut + 1;
    for (let x = 0; x <= totalRange; x += increment) {
        for (let y = 0; y <= totalRange; y += increment) {
            let dx = ((x / totalRange)) * bw;
            let dy = (1 - (y / totalRange)) * bh;

            let ax = x + minRange;
            let ay = y + minRange;
            let value = activationFunction(perc.feed([ax, ay]));


            if (value > 0) {
                fill(0, 150 * value, 255 * value);
            } else {
                if (hillslide) {
                    value = -1;
                }
                fill(255 * -value, 150 * -value, 0);
            }

            let bwo = Math.min(boxW + bx + dx, bx + bw) - (bx + dx);
            let bho = Math.min(boxH + by + dy, by + bh) - (by + dy);
            rect(bx + dx, by + dy, bwo, bho);
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
        circle(x + bx, y + by, 10);
    }

    perc.train(learningData);
}