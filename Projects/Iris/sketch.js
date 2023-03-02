var nn = new NeuralNetwork(0.00025, [4, 10, 10, 10, 10, 3], "tanh");


var table;
function preload() {
    table = loadTable('https://jawdan-dev.github.io/Projects/Iris/iris.csv', 'csv', 'header');
}





var currentDataIndex = 0;
var trainingData = [];


var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);

    const outputClass = {
        "Setosa": 0,
        "Versicolor": 1,
        "Virginica": 2,
    };

    let data = table.getArray();
    for (let i = 0; i < data.length; i++) {
        let input = [], output = [];

        const d = data[i];
        for (let j = 0; j < d.length; j++) {
            if (j < 4) {
                input[input.length] = parseFloat(d[j]);
            } else {
                let ind = outputClass[d[j]];
                for (let k = 0; k < 3; k++) {
                    output[k] = k == ind ? 1 : -1;
                }
            }
        }
        trainingData[i] = [input, output];
    }


    let inp = createInput('');
    inp.position(0, 0);
    inp.size(100);
    inp.input(() => {
        const parsed = parseInt(inp.value());
        currentDataIndex = (parsed >= 0 && parsed < trainingData.length) ? parsed : 0;
        console.log(parsed, currentDataIndex);
    });

    frameRate(30);
}

function draw() {
    background(50)

    nn.Draw(50, 50, trainingData[currentDataIndex][0]);


    let inputs = [], outputs = [];
    for (let i = 0; i < trainingData.length; i++) {
        let index = i;//Math.floor(random(0, trainingData.length));


        inputs[inputs.length] = trainingData[index][0]
        outputs[outputs.length] = trainingData[index][1];
    }
    nn.Train(inputs, outputs);

    let totalError = 0;
    let errors = [];
    for (let i = 0; i < trainingData.length; i++) {
        const input = trainingData[i][0];
        const output = trainingData[i][1];

        let ao = nn.FeedForward(input);
        let localErr = 0;
        for (let j = 0; j < ao.length && j < output.length; j++) {
            let e = Math.abs(ao[j] - output[j]);
            totalError += e;
            localErr += e;
        }
        errors[i] = {
            err: localErr,
            index: i
        };
    }
    textSize(24)
    textAlign(CENTER)
    text("Avg Error: " + str(totalError / trainingData.length), windowWidth / 2, 20);

    errors.sort((a, b) => b.err - a.err);
    for (let i = 0; i < 10 && i < errors.length; i++) {
        text(str(Math.round(errors[i].err * 1000) / 1000) + " > " + str(errors[i].index), windowWidth - 200, 50 + (i * 24));
    }
}
