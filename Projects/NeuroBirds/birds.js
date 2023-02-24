// Globals
var inputNodeCount = 5,
    outputNodeCount = 1,
    populationSize = 200;
var neatInstance;

/*

NOTES FOR FUTURE IMPLEMENTATIONS (sorry for the gore)
 - get calculation nodes should be a function as that shiz gets called every 2 seconds all over the place (ctrl + c is king in these lands)
 - this was really a mockup, please dont take notes other than the algorithms used
*/

// Setup
var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    


    for (var i = 0; i < maxpipes; i++) {
        pipes[i] = new Pipe(pipeoffset);
        pipeoffset += pipespace + pipewidth;
    }

    neatInstance = new NEAT(inputNodeCount, outputNodeCount, populationSize);

    for (var i = 0; i < populationSize; i++) {
        birds[i] = new Bird(neatInstance.get(i));
    }

    ellipseMode(CENTER);

    frameRate(60 / moveRateMulti);
}
const moveRateMulti = 1;

var viewoffset = 384;
function draw() {
    background(25);
    strokeWeight(1);
    stroke(150);

    for (let i = 0; i < 1; i++) {
        update();
    }

    push();
    translate(-birds[0].x + viewoffset, 0);
    fill(255, 50);
    for (var i = 1; i < birds.length; i++) {
        birds[i].draw();
    }
    fill(200, 50, 50, 100);
    birds[0].draw();

    for (var i = 0; i < pipes.length; i++) {
        if (currentpipe == i) {
            fill(25, 50, 50);
        } else {
            fill(65);
        }
        pipes[i].draw();
    }
    pop();

    var w = 560;
    var x = width - w;
    fill(50);
    rect(x - 10, 0, w + 10, height);
    textAlign(LEFT, TOP);
    textSize(20);
    var h = -15;
    noStroke();
    fill(255);
    text("     Generation: " + generation, x, h += 20);
    text("     Population: " + populationSize, x, h += 20);
    text("               Alive: " + birds.length, x, h += 20);
    text("      Max Score: " + maxscore, x, h += 20);
    text(" Viewing Score: " + viewingScore, x, h += 20);
    text(" Current Pipes: " + currentpipesscore, x, h += 20);
    text("      Max Pipes: " + maxpipe, x, h += 20);
    text("           Species: " + neatInstance.lastSpecies.length, x, h += 20);
    text("Species Threshold: " + (Math.round(neatInstance.speciesThreshold*100)/100), x, h += 20);
    var bird = birds[0];    
    if (bird && bird.brain) {
        bird.brain.draw(x, 275, w - 10, 400, bird.getInputs());
    } else {
        console.log(bird);
        console.log(birds);
    }
    /*
        noStroke();
        colorMode(HSB, 1);
        var sh = 200, sw = width;
        var sx = 0, sy = height - sh;
        for (var n = 0; n < genes.length; n++) {
            var perc = sw / genes.length;
            var hperc = sh / genes[n].length;
            for (var i = 0; i < genes[n].length; i++) {
                fill(geneColors[genes[n][i]], 1, 1);
                rect(sx + (n * perc), sy + (i * hperc), perc, hperc);
            }
        }
        colorMode(RGB, 255);
    */
}
var birds = [];

var generation = 1,
    maxscore = 0,
    viewingScore = 0,
    maxpipe = 0,
    currentpipesscore = 0;

function update() {
    //if (birds[0].score > maxscore) { maxscore = birds[0].score; }

    if (birds[0].x > pipes[currentpipe].x + pipewidth) {
        incrementPipe();
        removeOldPipes(birds[0].x - viewoffset);
    }

    let hs = Bird.size / 2;
    let killBird;
    for (var i = 0; i < birds.length; i++) {
        let space = (pipespace + pipewidth)
        let fitness = birds[i].x / space;
        maxscore = Math.max(maxscore, fitness);
        viewingScore = fitness;

        killBird = false;

        birds[i].x += 4 * moveRateMulti; // nice hard value here, past me
        birds[i].update();

        if (birds[i].y >= height || birds[i].y <= 0) {
            killBird = true;
        } else if (birds[i].x + hs >= pipes[currentpipe].x) {
            if (birds[i].y - hs <= pipes[currentpipe].top ||
                birds[i].y + hs >= pipes[currentpipe].bottom) {
                killBird = true;
            }
        }

        if (killBird) {
            birds[i].brain.setFitness(fitness); // we want it to go as far as possible :3
            birds.splice(i, 1);
            i--;
        }
    }


    if (birds.length <= 0) {
        neatInstance.generateNewPopulation();
        for (let i = 0; i < populationSize; i++) {
            birds[i] = new Bird(neatInstance.get(i));
        }

        pipeoffset = 512;
        currentpipe = 0;
        currentpipesscore = 0;
        for (var i = 0; i < maxpipes; i++) {
            pipes[i] = new Pipe(pipeoffset);
            pipeoffset += pipespace + pipewidth;
        }
        generation++;
    }
}

class Bird {
    static size = 48;
    constructor(brain) {
        this.brain = brain;
        this.x = 0;
        this.y = height / 2;

        let movementMultiplier = 1.5;
        this.score = 0;
        this.fitness = 0;
        this.gravity = -0.7 * movementMultiplier;
        this.velocity = 0;
        this.lift = 16 * movementMultiplier; //12
    }

    getInputs() {
        return [
            ((this.y / height) * 2) - 1,
            this.velocity / 16,
            (pipes[currentpipe].x - this.x) / (pipespace + pipewidth),
            ((pipes[currentpipe].top / height) * 2) - 1,
            ((pipes[currentpipe].bottom / height) * 2) - 1
        ];
    }

    think() {
        let inputs = this.getInputs();

        let output = this.brain.passInputs(inputs);
        if (output[0] > 0.5) {
            this.velocity += this.lift;
        }
    }

    update() {
        this.think();

        for (let i = 0; i < moveRateMulti; i++) {
            this.velocity += this.gravity;
            this.y += -this.velocity;
        }
    }

    draw() {
        circle(this.x, this.y, Bird.size);
        //let h = Bird.size / 2;
        //rect(this.x - h, this.y - h, Bird.size, Bird.size);
    }
}

// For the environment

var currentpipe = 0,
    pipeoffset = 512,
    pipegap = 270, //160
    pipespace = 256,
    pipewidth = 64,
    maxpipes = 10,
    pipes = [];

class Pipe {
    constructor(x) {
        this.buffer = (height - 600) / 2;
        this.x = x;
        this.top = random() * (height - pipegap - (2 * this.buffer));
        this.top += this.buffer;
        this.bottom = this.top + pipegap;
    }

    draw() {
        rect(this.x, 0, pipewidth, this.top);
        rect(this.x, this.bottom, pipewidth, height);
        line(this.x, this.buffer, this.x + pipewidth, this.buffer);
        line(this.x, height - this.buffer, this.x + pipewidth, height - this.buffer);
    }
}

function removeOldPipes(left) {
    for (var i = 0; i < pipes.length; i++) {
        if (pipes[i].x + pipewidth < left) {
            pipes[i] = new Pipe(pipeoffset);
            pipeoffset += pipespace + pipewidth;
        }
    }
}

function incrementPipe() {
    currentpipe++;
    currentpipe %= pipes.length;
    currentpipesscore++;
    if (currentpipesscore > maxpipe) {
        maxpipe = currentpipesscore;
    }
}