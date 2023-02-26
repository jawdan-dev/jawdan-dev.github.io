let testInput = [1, -1];

var neat;

var createCanvas = true;
var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    if (createCanvas) {
        canvas = createCanvas(windowWidth, windowHeight);
        canvas.position(0, 0);
        createCanvas = false;
    }


    neat = new NEAT({
        inputNodeCount: 2,
        outputNodeCount: 3,
        populationSize: 10,
    });

    console.log(neat);

    let p = neat.population[0];

    p.addConnection(0, 17);
    p.addConnection(17, 18);
    p.addConnection(18, 3);
    p.addConnection(18, 19);
    p.addConnection(19, 20);
    p.addConnection(20, 19);
    p.addConnection(19, 3);


    p.connections[3].enabled = false;
    //p.connections[1].enabled = false;
    //p.connections[2].enabled = false;
    //p.connections[3].enabled = false;

    console.log(p.getOutput(testInput));
    console.log(NEAT.distance(neat.population[0], neat.population[1]));
    console.log(NEAT.distance(neat.population[1], neat.population[2]));

    frameRate(30);
}


let iterations = 0;
function draw() {
    background(110); //12

    fill(12);
    let s = Math.min(windowWidth, windowHeight);

    let x = (windowWidth - s) / 2;
    let y = (windowHeight - s) / 2;

    rect(x, y, s, s);
    if (neat.population[0].draw(x, y, s, s, iterations++, testInput)) {
        setup();
        iterations = 0;
    }


}

function keyPressed() {
    console.log(keyCode);
    if (keyCode === 32) {
        setup();
        iterations = 0;
    }
}
