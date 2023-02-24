var neat;
var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);


    neat = new NEAT({
        inputNodeCount: 2,
        outputNodeCount: 1,
        populationSize: 10,
    });

    console.log(neat);


    frameRate(30);
}


let iterations = 0;
function draw() {
    background(50);

    let s = Math.min(windowWidth, windowHeight);

    neat.population[0].draw(50, 50, s - 100, s - 100, iterations++);
}