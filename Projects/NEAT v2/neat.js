
const getChance = chance => { return random() < chance; }
const getRandomInt = max => { return Math.floor(random() * max); }
const getWeight = () => { return (random() * 2) - 1; }

class NEAT {
    constructor(config) {
        const checkInput = (value, fallback, type = undefined, checkFunc = undefined) => {
            if (value != undefined && (type == undefined || typeof (value) == type) && (checkFunc == undefined || checkFunc(value))) {
                return value;
            }
            return fallback;
        }

        this.biasNode = checkInput(config.biasNode, true, 'boolean');

        this.inputNodeCount = checkInput(config.inputNodeCount, 1, 'number', Number.isInteger);
        if (this.biasNode) this.inputNodeCount++;
        this.outputNodeCount = checkInput(config.outputNodeCount, 1, 'number', Number.isInteger);

        this.nodeCount = 0;
        this.globalConnections = [];

        this.population = [];
        let populationSize = checkInput(config.populationSize, 200, 'number', Number.isInteger);
        for (let i = 0; i < populationSize; i++) {
            this.population[i] = new NEAT.Genome(this);
            for (let j = 0; j < this.inputNodeCount; j++) {
                for (let k = 0; k < this.outputNodeCount; k++) {
                    this.population[i].addConnection(j, k + this.inputNodeCount);
                }
            }
        }
    }

    getConnection(from, to) {
        if (from < this.nodeCount && to < this.nodeCount) {
            for (let i = 0; i < this.globalConnections.length; i++) {
                if (this.globalConnections[i].compare(from, to)) {
                    return i;
                }
            }
        }
        this.nodeCount = Math.max(this.nodeCount, Math.max(from, to) + 1);
        let index = this.globalConnections.length;
        this.globalConnections[index] = new NEAT.Connection(from, to);
        return index;
    }

    static distance(g1, g2) {
        // this is the most interesting part




    }

    static crossover(g1, g2) {
        // hmm, this was also an issue.
    }
}

NEAT.Genome = class {
    constructor(neatInstance) {
        this.neatInstance = neatInstance;
        this.connections = [];
        this.fitness = 0;
    }

    clone() {
        let clone = new Genome(this.neatInstance);
        for (let i = 0; i < this.connections.length; i++) {
            let c = this.connections[i];
            clone.connections[i] = new NEAT.Genome.Gene(c.index, c.weight, c.enabled);
        }
        clonse.fitness = this.fitness;
        return clone;
    }

    addConnection(from, to) {
        this.connections[this.connections.length] = new NEAT.Genome.Gene(this.neatInstance.getConnection(from, to), getWeight());
    }


    // 
    /// https://cs.brown.edu/people/rtamassi/gdhandbook/chapters/force-directed.pdf
    draw(x, y, w, h, iterations, inputs = []) {
        const drawInputs = inputs.length == this.neatInstance.inputNodeCount;

        randomSeed(1)

        // edges huh
        let vertices = [], edges = [];
        for (let i = 0; i < this.connections.length; i++) {
            const c = this.neatInstance.globalConnections[this.connections[i].index];

            const nodes = [
                c.from, c.to
            ];
            nodes.forEach(n => {
                if (vertices[n] == undefined) {
                    vertices[n] = {
                        b: n == 0 && this.neatInstance.biasNode,
                        i: (n < this.neatInstance.inputNodeCount),
                        o: (n >= this.neatInstance.inputNodeCount && n < this.neatInstance.inputNodeCount  + this.neatInstance.outputNodeCount),
                        x: random(0, 1),
                        y: random(0, 1),
                        dx: 0,
                        dy: 0,
                    }
                }
            })

            // weight?
            edges[i] = {
                w: Math.abs(this.connections[i].weight),
                from: c.from,
                to: c.to
            }
        }
        // no clue if the following code works.............................
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i] == undefined) {
                vertices.splice(i, 1);

                for (let j = 0; j < edges.length; i++) {
                    if (edges[j].from >= i) {
                        edges[j].from--;
                    }
                    if (edges[j].to >= i) {
                        edges[j].to--;
                    }
                }

                i--;
            }
        }

        let k = Math.sqrt(1 / vertices.length);
        const fa = s => { return (s * s) / k; }
        const fr = s => { return (k * k) / s; }


        let cx, cy, cm;
        let maxMove = 0.1;
        //const iterations = 10;
        let totalMove;
        let n;
        for (n = 0; n < iterations && (totalMove == undefined || totalMove > 0.01 / vertices.length); n++) {
            totalMove = 0;

            // seperation
            for (let i = 0; i < vertices.length; i++) {
                for (let j = 0; j < vertices.length; j++) {
                    if (i != j) {
                        cx = vertices[i].x - vertices[j].x;
                        cy = vertices[i].y - vertices[j].y;
                        cm = Math.sqrt((cx * cx) + (cy * cy));
                        vertices[i].dx += (cx / cm) * fr(cm);
                        vertices[i].dy += (cy / cm) * fr(cm);
                    }
                }
            }

            // attraction
            for (let i = 0; i < edges.length; i++) {
                let e = edges[i];
                cx = vertices[e.to].x - vertices[e.from].x;
                cy = vertices[e.to].y - vertices[e.from].y;
                cm = Math.sqrt((cx * cx) + (cy * cy));

                let facm = fa(cm);
                vertices[e.to].dx -= (cx / cm) * facm * Math.min(Math.max(e.w * 2, 0.25), 4);
                vertices[e.to].dy -= (cy / cm) * facm * Math.min(Math.max(e.w * 2, 0.25), 4);
                vertices[e.from].dx += (cx / cm) * facm * Math.min(Math.max(e.w * 2, 0.25), 4);
                vertices[e.from].dy += (cy / cm) * facm * Math.min(Math.max(e.w * 2, 0.25), 4);
            }

            // actual movement
            for (let i = 0; i < vertices.length; i++) {
                let dm = Math.sqrt((vertices[i].dx * vertices[i].dx) + (vertices[i].dy * vertices[i].dy));
                let ax = (vertices[i].dx / dm) * Math.min(dm, maxMove);
                let ay = (vertices[i].dy / dm) * Math.min(dm, maxMove);

                let tm = Math.sqrt((ax * ax) + (ay * ay));
                totalMove += tm;

                vertices[i].x = Math.min(Math.max(vertices[i].x + ax, 0), 1);
                vertices[i].y = Math.min(Math.max(vertices[i].y + ay, 0), 1);
                vertices[i].dx = 0;
                vertices[i].dy = 0;
            }

            maxMove *= 0.9;
        }
        console.log(n);

        if (n < iterations) {
            noLoop();
        }

        let nodeSize = Math.sqrt((w * h) / vertices.length) * 0.1;

        stroke(255);
        for (let i = 0; i < edges.length; i++) {
            let e = edges[i];

            let v = vertices[e.from];
            let u = vertices[e.to];

            strokeWeight(Math.min(Math.max(e.w * 2, 0.1), nodeSize * 0.5));
            line((v.x * w) + x, (v.y * h) + y, (u.x * w) + x, (u.y * h) + y);
        }

        noStroke();
        for (let i = 0; i < vertices.length; i++) {
            let v = vertices[i];

            if (v.b) {                
                fill(0, 255, 100);
            } else if (v.i) {
                fill(0, 100, 255);
            } else if (v.o) {
                fill(255, 0, 100);

            } else {
                fill(255);
            }

            circle((v.x * w) + x, (v.y * h) + y, nodeSize);
        }
    }
}

NEAT.Genome.Gene = class {
    constructor(index, weight, enabled = true) {
        this.index = index;
        this.weight = weight;
        this.enabled = enabled;
    }

    getFrom(neatInstance) { return neatInstance.globalConnections[this.index].from; }
    getTo(neatInstance) { return neatInstance.globalConnections[this.index].to; }
}

NEAT.Connection = class {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }

    compare(from, to) {
        return this.to == to && this.from == from;
    }
}

// for calculation node, make the variables temporary with 'delete' keyword :)