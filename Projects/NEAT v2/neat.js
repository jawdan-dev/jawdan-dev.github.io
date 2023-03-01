
const mapRange = (x, xmin, xmax, newmin, newmax) => { return (((x - xmin) / (xmax - xmin)) * (newmax - newmin)) + newmin; }
const getChance = chance => { return random() < chance; }
const getRandomInt = max => { return Math.floor(random() * max); }
const getWeight = () => { return mapRange(random(), 0, 1, -1, 1); }

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

        // Swap if one has more / newer indexes
        if (g1.connections[g1.connections.length - 1].index < g2.connections[g2.connections.length - 1].index) {
            let g = g1;
            g1 = g2;
            g2 = g;
        }

        let similar = 0,
            disjoint = 0,
            excess,
            weightDifference = 0;

        let g1Index = 0,
            g2Index = 0;

        while (g1Index < g1.connections.length && g2Index < g2.connections.length) {
            let gene1 = g1.connections[g1Index],
                gene2 = g2.connections[g2Index];

            if (gene1.index == gene2.index) {
                similar++;
                weightDifference += Math.abs(gene2.weight - gene1.weight);

                g1Index++;
                g2Index++;
            } else {
                disjoint++;
                if (gene1.index < gene2.index) {
                    g1Index++;
                } else {
                    g2Index++;
                }
            }
        }

        // ones that didnt get read:
        excess = g1.connections.length - g1Index;
        weightDifference /= similar; // avg weight difference

        let n = Math.max(g1.connections.length, g2.connections.length);
        if (n < 20) { n = 1; } // hmmmmmm

        disjoint /= n;
        excess /= n;

        const
            c1 = 1,
            c2 = 1,
            c3 = 1;

        return (c1 * excess) + (c2 * disjoint) + (c3) * weightDifference;
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

    activationFunction(x) {
        //return Math.max(0.2 * x, x);
        //return 1 / (1 + Math.pow(Math.E, -x));
        return 2 * Math.tanh(x / 2);
        return x;
    }

    activationFunctionDerivitive(x) {
        //return (x >= 0) ? 1 : 0.2;
        //return Math.pow(Math.E, -x) / Math.pow(1 + Math.pow(Math.E, -x), 2);
        return 2 / (Math.pow(Math.cosh(x / 2), 2));
        return 1; // ?
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
        let connectionIndex = this.neatInstance.getConnection(from, to);

        this.connections.forEach(c => {
            if (c.index == connectionIndex) {
                console.log(`Failed to add duplicate from ${from} to ${to} {thumbs up}`);
                return;
            }
        });

        this.connections[this.connections.length] = new NEAT.Genome.Gene(connectionIndex, getWeight());
        // i think this sort is needed (could be made faster with just inserting into the correct position :) )
        this.connections.sort((a, b) => {
            return a.index - b.index;
        })

        if (this.drawEdges) delete this.drawEdges;
        if (this.drawVertices) delete this.drawVertices;
    }

    getCalculatedNodes(input) {
        if (input == undefined || input.length == undefined || input.length != this.neatInstance.inputNodeCount - (this.neatInstance.biasNode ? 1 : 0)) {
            return undefined;
        }

        let aInput = [];
        if (this.neatInstance.biasNode) {
            aInput[0] = 1;
            for (let i = input.length; i > 0; i--) {
                aInput[i] = input[i - 1];
            }
        } else {
            for (let i = 0; i < input.length; i++) {
                aInput[i] = input[i];
            }
        }

        let nodes = [];
        for (let i = 0; i < this.neatInstance.nodeCount; i++) {
            nodes[i] = {
                calculated: i < aInput.length,
                value: i < aInput.length ? aInput[i] : undefined,
                failedReferences: 0
            }
        }

        let unusedConnections = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].enabled) {
                unusedConnections[unusedConnections.length] = i;
            }
        }
        let lastLength = unusedConnections.length + 1;
        while (unusedConnections.length > 0 && unusedConnections.length != lastLength) {
            lastLength = unusedConnections.length;

            for (let i = this.neatInstance.inputNodeCount; i < nodes.length; i++) {
                nodes[i].failedReferences = 0;
            }

            let tempUnused = [];
            for (let i = 0; i < unusedConnections.length; i++) {
                let c = this.connections[unusedConnections[i]];
                let g = this.neatInstance.globalConnections[c.index];

                if (c.enabled) {
                    if (!nodes[g.from].calculated) {
                        tempUnused[tempUnused.length] = unusedConnections[i];
                        nodes[g.to].failedReferences++;
                    } else {
                        if (nodes[g.to].value == undefined) nodes[g.to].value = 0;
                        nodes[g.to].value += nodes[g.from].value * c.weight;
                    }
                }
            }

            for (let i = this.neatInstance.inputNodeCount; i < nodes.length; i++) {
                if (nodes[i].calculated == false && nodes[i].value != undefined && nodes[i].failedReferences <= 0) {
                    nodes[i].calculated = true;
                    nodes[i].value = this.activationFunction(nodes[i].value);
                }
            }
            unusedConnections = tempUnused;
        }

        return nodes;
    }

    train(inputs, targetOutputs) {

        let w32 = 0;
        let w03 = 0;
        let w13 = 0;
        let w42 = 0;
        let w04 = 0;
        let w14 = 0;
        let bw2 = 0;
        let bw3 = 0;
        let bw4 = 0;

        const learningRate = 0.1 / Math.min(inputs.length, targetOutputs.length);

        let diserr = []

        for (let i = 0; i < inputs.length && i < targetOutputs.length; i++) {
            const input = inputs[i];
            const targetOutput = targetOutputs[i];

            if (input == undefined || input.length == undefined || input.length != this.neatInstance.inputNodeCount - (this.neatInstance.biasNode ? 1 : 0) ||
                targetOutput == undefined || targetOutput.length == undefined || targetOutput.length != this.neatInstance.outputNodeCount) {
                console.log("bad data, continued.");
                continue;
            }

            let nodes = this.getCalculatedNodes(input);

            let no = (this.neatInstance.biasNode ? 1 : 0);

            const n0 = nodes[0 + no].value;
            const n1 = nodes[1 + no].value;
            const n2 = nodes[2 + no].value;
            const n3 = nodes[3 + no].value;
            const n4 = nodes[4 + no].value;

            let error = n2 - targetOutput[0];

            diserr[diserr.length] = error;

            let derivError = error;


            let wbb2 = this.connections[0].weight;
            let wb32 = this.connections[5].weight;
            let wb42 = this.connections[8].weight;

            let wbb3 = this.connections[9].weight;
            let wb03 = this.connections[3].weight;
            let wb13 = this.connections[4].weight;

            let wbb4 = this.connections[10].weight;
            let wb04 = this.connections[6].weight;
            let wb14 = this.connections[7].weight;


            const z2 = (wb32 * n3) + (wb42 * n4) + wbb2;
            const z3 = (wb03 * n0) + (wb13 * n1) + wbb3;
            const z4 = (wb04 * n0) + (wb14 * n1) + wbb4;

            const df = this.activationFunctionDerivitive;

            const l2 = df(z2) * derivError;
            const l3 = df(z3) * wb32 * l2;
            const l4 = df(z4) * wb42 * l2;

            bw2 += 1 * l2;
            w32 += n3 * l2;
            w42 += n4 * l2;

            bw3 += 1 * l3;
            w03 += n0 * l3;
            w13 += n1 * l3;

            bw4 += 1 * l4;
            w04 += n0 * l4;
            w14 += n1 * l4;
        }

        noStroke();
        fill(0);
        rect(0, 0, 200, windowHeight);
        fill(255);

        let num = 0;
        const getDown = () => {
            return num += 20;
        }

        textAlign(CENTER);
        text(w32, 100, getDown());
        text(w03, 100, getDown());
        text(w13, 100, getDown());
        text(w42, 100, getDown());
        text(w04, 100, getDown());
        text(w14, 100, getDown());


        getDown()

        text("Error Delta:", 100, getDown());
        for (let i = 0; i < diserr.length; i++) {
            if (this.lastDis != undefined) {
                let change = Math.abs(this.lastDis[i]) - Math.abs(diserr[i]);
                let color = Math.min(Math.max(Math.abs(change) * 255 * 100 / learningRate, 0), 255);

                if (change >= 0) {
                    fill(255 - color, 255, 255 - color);
                } else {
                    fill(255, 255 - color, 255 - color);
                }

                text(diserr[i], 100, getDown());

            } else {
                text(diserr[i], 100, getDown());
            }
        }
        fill(255);
        textAlign(LEFT);


        this.connections[5].weight -= learningRate * w32;
        this.connections[3].weight -= learningRate * w03;
        this.connections[4].weight -= learningRate * w13;
        this.connections[8].weight -= learningRate * w42;
        this.connections[6].weight -= learningRate * w04;
        this.connections[7].weight -= learningRate * w14;
        this.connections[0].weight -= learningRate * bw2;
        this.connections[9].weight -= learningRate * bw3;
        this.connections[10].weight -= learningRate * bw4;

        let totalErr = 0;
        if (this.lastDis) {
            for (let i = 0; i < diserr.length; i++) {
                totalErr += Math.abs(diserr[i] - this.lastDis[i]);
            }
        } else {
            totalErr = undefined;
        }
        this.lastDis = diserr;

        return totalErr / diserr.length;
    }

    getOutput(input) {
        let nodes = this.getCalculatedNodes(input);
        //console.log(nodes);

        if (nodes) {
            let output = [];
            for (let i = 0; i < this.neatInstance.outputNodeCount; i++) {
                let n = nodes[this.neatInstance.inputNodeCount + i];
                output[i] = n.calculated ? n.value : 0;
            }
            return output;
        }
        return undefined;
    }

    // graph force stuff
    /// https://cs.brown.edu/people/rtamassi/gdhandbook/chapters/force-directed.pdf
    draw(x, y, w, h, iterations, input = undefined) {
        // edges huh

        if (!this.drawVertices || !this.drawEdges) {
            this.drawVertices = []
            this.drawEdges = [];
            for (let i = 0; i < this.connections.length; i++) {
                const c = this.connections[i];
                const g = this.neatInstance.globalConnections[c.index];

                const nodes = [
                    g.from, g.to
                ];
                nodes.forEach(n => {
                    if (this.drawVertices[n] == undefined) {
                        this.drawVertices[n] = {
                            n: n,
                            x: random(0, 1),
                            y: random(0, 1),
                            dx: 0,
                            dy: 0,
                            // Draw stuff
                            b: n == 0 && this.neatInstance.biasNode,
                            i: (n < this.neatInstance.inputNodeCount),
                            o: (n >= this.neatInstance.inputNodeCount && n < this.neatInstance.inputNodeCount + this.neatInstance.outputNodeCount),
                        }
                    }
                })

                if (this.connections[i].enabled) {
                    this.drawEdges[this.drawEdges.length] = {
                        n: i,
                        //w: Math.abs(c.weight),
                        //ws: Math.sign(c.weight),
                        from: g.from,
                        to: g.to
                    }
                }
            }
            // no clue if the following code works.............................
            for (let i = 0; i < this.drawVertices.length; i++) {
                if (this.drawVertices[i] == undefined) {
                    this.drawVertices.splice(i, 1);

                    for (let j = 0; j < this.drawEdges.length; j++) {
                        if (this.drawEdges[j].from >= i) {
                            this.drawEdges[j].from--;
                        }
                        if (this.drawEdges[j].to >= i) {
                            this.drawEdges[j].to--;
                        }
                    }

                    i--;
                }
            }

            this.maxMove = 0.025;
        }

        let k = Math.sqrt(1 / this.drawVertices.length);
        const fa = s => { return (s * s) / k; }
        const fr = s => { return (k * k) / s; }

        let cx, cy, cm;
        //const iterations = 10;
        let totalMove = 0;
        this.maxMove = Math.max(this.maxMove, 0.0005);
        // seperation
        for (let i = 0; i < this.drawVertices.length; i++) {
            for (let j = 0; j < this.drawVertices.length; j++) {
                if (i != j) {
                    cx = this.drawVertices[i].x - this.drawVertices[j].x;
                    cy = this.drawVertices[i].y - this.drawVertices[j].y;
                    cm = Math.sqrt((cx * cx) + (cy * cy));
                    this.drawVertices[i].dx += (cx / cm) * fr(cm);
                    this.drawVertices[i].dy += (cy / cm) * fr(cm);
                }
            }
        }

        // attraction
        for (let i = 0; i < this.drawEdges.length; i++) {
            let e = this.drawEdges[i];
            cx = this.drawVertices[e.to].x - this.drawVertices[e.from].x;
            cy = this.drawVertices[e.to].y - this.drawVertices[e.from].y;
            cm = Math.sqrt((cx * cx) + (cy * cy));

            let weight = 1 + Math.abs(this.connections[e.n].weight * 0.8);
            let weightClamped = Math.min(Math.max(weight, 0.5, 2));

            let facm = fa(cm);
            this.drawVertices[e.to].dx -= (cx / cm) * facm * weightClamped;
            this.drawVertices[e.to].dy -= (cy / cm) * facm * weightClamped;
            this.drawVertices[e.from].dx += (cx / cm) * facm * weightClamped;
            this.drawVertices[e.from].dy += (cy / cm) * facm * weightClamped;
        }

        // actual movement
        for (let i = 0; i < this.drawVertices.length; i++) {
            let dm = Math.sqrt((this.drawVertices[i].dx * this.drawVertices[i].dx) + (this.drawVertices[i].dy * this.drawVertices[i].dy));
            let ax = (this.drawVertices[i].dx / dm) * Math.min(dm, this.maxMove);
            let ay = (this.drawVertices[i].dy / dm) * Math.min(dm, this.maxMove);

            let tm = Math.sqrt((ax * ax) + (ay * ay));
            totalMove += tm;

            this.drawVertices[i].x = this.drawVertices[i].x + ax;
            this.drawVertices[i].y = this.drawVertices[i].y + ay;
            this.drawVertices[i].dx = 0;
            this.drawVertices[i].dy = 0;
        }

        this.maxMove *= 0.95;
        //console.log(n);

        let minVx, maxVx, minVy, maxVy;
        for (let i = 0; i < this.drawVertices.length; i++) {
            const x = this.drawVertices[i].x;
            const y = this.drawVertices[i].y;
            minVx = minVx != undefined ? Math.min(x, minVx) : x;
            maxVx = maxVx != undefined ? Math.max(x, maxVx) : x;
            minVy = minVy != undefined ? Math.min(y, minVy) : y;
            maxVy = maxVy != undefined ? Math.max(y, maxVy) : y;
        }
        maxVx -= minVx;
        maxVy -= minVy;

        let scale = Math.max(maxVx, maxVy);

        minVx -= (scale - maxVx) / 2
        minVy -= (scale - maxVy) / 2

        scale = 1 / scale;

        const nodeSize = Math.sqrt((w * h) / this.drawVertices.length) * 0.15 * scale;
        x += nodeSize / 2
        y += nodeSize / 2
        w -= nodeSize
        h -= nodeSize

        const nodes = this.getCalculatedNodes(input);
        const drawData = nodes != undefined;

        const minColor = 20;
        const lowColor = 20;
        const colorFactor = 150;
        const arrowScale = 0.16;

        const getMagnitude = n => {
            const
                cx = this.drawVertices[n.to].x - this.drawVertices[n.from].x,
                cy = this.drawVertices[n.to].y - this.drawVertices[n.from].y;
            return (cx * cx) + (cy * cy);
        }

        this.drawEdges.sort((a, b) => {
            return getMagnitude(b) - getMagnitude(a);
        });


        for (let i = 0; i < this.drawEdges.length; i++) {
            const e = this.drawEdges[i];
            const v = this.drawVertices[e.from];
            const u = this.drawVertices[e.to];

            if (drawData) {
                if (nodes[v.n].calculated) {
                    const value = this.connections[e.n].weight * nodes[v.n].value
                    const color = Math.min(Math.max(Math.abs(value) * colorFactor, minColor), 255);
                    const low = Math.max(((Math.abs(value) * colorFactor) - 255) + lowColor, lowColor);
                    if (value >= 0) {
                        stroke(low, low, color);
                    } else {
                        stroke(color, low, low);
                    }
                } else {
                    stroke(lowColor, colorFactor, lowColor);
                }
            } else {
                stroke(255 * Math.min(e.w, 1));
            }

            let x1 = ((v.x - minVx) * w * scale) + x, y1 = ((v.y - minVy) * h * scale) + y,
                x2 = ((u.x - minVx) * w * scale) + x, y2 = ((u.y - minVy) * h * scale) + y;

            strokeWeight(nodeSize * 0.5);
            line(x1, y1, x2, y2);


            if (drawData) {
                let cx = x2 - x1,
                    cy = y2 - y1;
                let cm = Math.sqrt((cx * cx) + (cy * cy));
                cx *= (nodeSize * arrowScale) / cm;
                cy *= (nodeSize * arrowScale) / cm;

                const
                    mx = ((x1 + x2) / 2) + cx * 2,
                    my = ((y1 + y2) / 2) + cy * 2;

                strokeWeight(nodeSize * 0.06125);
                stroke(255);
                line(mx, my, mx + cy - cx, my - cx - cy);
                line(mx, my, mx - cy - cx, my + cx - cy);
                line(mx, my, mx - cx * 4, my - cy * 4);

                noStroke();
                fill(255);
                //text(e.n, mx + 40, my - 20)
                //text(Math.round(this.connections[e.n].weight * 1000) / 1000, mx + 40, my)
                //text(this.connections[e.n].change, mx + 40, my + 20)
            }
        }

        strokeWeight(nodeSize * 0.06125);
        for (let i = 0; i < this.drawVertices.length; i++) {
            const v = this.drawVertices[i];

            const cx = ((v.x - minVx) * w * scale) + x;
            const cy = ((v.y - minVy) * h * scale) + y;

            if (drawData) {
                if (nodes[v.n].calculated) {
                    const color = Math.min(Math.max(Math.abs(nodes[v.n].value * colorFactor), minColor), 255);
                    const low = Math.max((Math.abs(nodes[v.n].value * colorFactor) - 255) + lowColor, lowColor);

                    if (nodes[v.n].value >= 0) {
                        fill(low, low, color);
                    } else {
                        fill(color, low, low);
                    }
                } else {
                    fill(lowColor, colorFactor, lowColor);
                }

                noStroke();
                circle(cx, cy, nodeSize);
            }

            if (v.b) {
                fill(0, 255, 100);
            } else if (v.i) {
                fill(0, 100, 255);
            } else if (v.o) {
                fill(255, 0, 100);
            } else {
                fill(255);
            }

            stroke(12);
            circle(cx, cy, drawData ? nodeSize * 0.5 : nodeSize);

            //noStroke();
            //fill(0);
            //text(v.n - 1, cx, cy);
        }


        return totalMove;
    }
}

NEAT.Genome.Gene = class {
    constructor(index, weight, enabled = true) {
        this.index = index;
        this.weight = weight;
        this.enabled = enabled;
    }

    //activationFunction(x) {
    //    return x;//Math.max(0.2 * x, x);
    //}

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