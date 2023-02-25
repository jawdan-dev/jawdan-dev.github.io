let testInput = [1, -1];



var neat;
var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);


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
    //p.addConnection(18, 19);
    //p.addConnection(19, 17);

    p.connections[0].enabled = false;

    console.log(p.getOutput(testInput));

    frameRate(30);
}


let iterations = 0;
function draw() {
    background(12);

    neat.population[0].draw(0, 0, windowWidth, windowHeight, iterations++, testInput);
}