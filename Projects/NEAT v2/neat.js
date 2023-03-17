"use strict";

const mapRange = (x, xmin, xmax, newmin, newmax) => { return (((x - xmin) / (xmax - xmin)) * (newmax - newmin)) + newmin; }
const getChance = chance => { return random() < chance; }
const getRandomInt = max => { return Math.floor(random() * max); }
const getWeight = () => { return mapRange(random(), 0, 1, -1, 1); }

const getColor = value => {
    const minColor = 20;
    const lowColor = 20;
    const maxLowColor = 220;
    const colorFactor = 150;

    if (value == undefined) {
        return {
            color: colorFactor,
            low: lowColor
        };
    }

    const cutoff = 255 / colorFactor;
    const rescale = ((maxLowColor - lowColor) / 255);

    if (Math.abs(value) > cutoff) {
        const v = (Math.abs(value) - cutoff) / (Math.abs(value) + (1 - cutoff));
        return {
            color: 255,
            low: Math.min(Math.max((v * rescale * colorFactor) + lowColor, lowColor), maxLowColor)
        }
    }

    return {
        color: Math.min(Math.max(Math.abs(value) * colorFactor, minColor), 255),
        low: lowColor
    };
}
const setStrokeColor = value => {
    const color = getColor(value);
    if (value == undefined) {
        stroke(color.low, color.color, color.low);
    } else if (value >= 0) {
        stroke(color.low, color.low, color.color);
    } else {
        stroke(color.color, color.low, color.low);
    }
}
const setFillColor = value => {
    const color = getColor(value);
    if (value == undefined) {
        fill(color.low, color.color, color.low);
    } else if (value >= 0) {
        fill(color.low, color.low, color.color);
    } else {
        fill(color.color, color.low, color.low);
    }
}


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
        this.splitConnections = [];

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
        const index = this.globalConnections.length;
        this.globalConnections[index] = new NEAT.Connection(from, to);
        return index;
    }

    getSplitConnectionNode(from, to) {
        for (let i = 0; i < this.splitConnections.length; i++) {
            if (this.splitConnections[i].from == from && this.splitConnections[i].to == to) {
                return this.splitConnections[i].splitNode;
            }
        }
        const splitNode = this.nodeCount;
        this.nodeCount = Math.max(this.nodeCount, Math.max(from, to, splitNode) + 1);
        this.splitConnections[this.splitConnections.length] = {
            from: from,
            to: to,
            splitNode: splitNode
        }
        return splitNode;
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
        //return Math.tanh(x);
        return x;
    }

    activationFunctionDerivitive(x) {
        //return (x >= 0) ? 1 : 0.2;
        //return Math.pow(Math.E, -x) / Math.pow(1 + Math.pow(Math.E, -x), 2);
        return 2 / (Math.pow(Math.cosh(x / 2), 2));
        //return 1 / (Math.pow(Math.cosh(x), 2));
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

    addConnection(from, to, weight) {
        if (from == to) return;
        const connectionIndex = this.neatInstance.getConnection(from, to);

        const foundIndex = this.connections.findIndex(x => x.index == connectionIndex);
        if (foundIndex != -1) {
            this.connections[foundIndex].enabled = true;
            if (weight != undefined) {
                this.connections[foundIndex].weight = weight;
            }
            return;
        }

        const newIndex = this.connections.length;
        this.connections[newIndex] = new NEAT.Genome.Gene(connectionIndex, weight != undefined ? weight : getWeight());

        // i think this sort is needed (could be made faster with just inserting into the correct position :) )
        this.connections.sort((a, b) => {
            return a.index - b.index;
        })
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
                    } else if (!nodes[g.to].calculated) {
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

    getPotentialConnections(dx, dy, dw, dh) {
        if (this.debug == undefined) {
            this.debug = true;
        }

        const totalNodesCount = this.neatInstance.inputNodeCount + this.neatInstance.outputNodeCount;
        let vertices = [];
        for (let i = 0; i < totalNodesCount; i++) {
            vertices[i] = {
                fromConnections: [],
                toConnections: []
            }
        }
        for (let i = 0; i < this.connections.length; i++) {
            const c = this.connections[i];
            const g = this.neatInstance.globalConnections[c.index];

            if (!c.enabled) {
                continue;
            }

            const vs = [g.from, g.to];
            vs.forEach(v => {
                if (vertices[v] == undefined) {
                    vertices[v] = {
                        fromConnections: [],
                        toConnections: []
                    }
                }
                if (g.from != v) {
                    vertices[v].fromConnections[vertices[v].fromConnections.length] = i; // this is wild shit.
                } else {
                    vertices[v].toConnections[vertices[v].toConnections.length] = i;
                }
            });
        }

        const checkIfConnectionIsRecursive = c => {
            const lookup = [];
            const checkNodes = [c.to];
            lookup[c.from] = true;

            while (checkNodes.length > 0) {
                const check = checkNodes.splice(0, 1)[0];

                if (vertices[check] != undefined) {
                    for (let i = 0; i < vertices[check].toConnections.length; i++) {
                        const connection = this.connections[vertices[check].toConnections[i]];
                        if (connection.enabled) {
                            const toNodeIndex = this.neatInstance.globalConnections[connection.index].to;

                            if (lookup[toNodeIndex] == undefined) {
                                lookup[toNodeIndex] = true;
                                checkNodes[checkNodes.length] = toNodeIndex;
                            } else {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }

        const possibleConnections = [];
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i] == undefined) continue;
            for (let j = i + 1; j < vertices.length; j++) {
                if (vertices[j] == undefined) continue;
                const potentialConnections = [{
                    from: i,
                    to: j
                }, {
                    from: j,
                    to: i
                }];

                potentialConnections.forEach(c => {
                    if ((c.from < this.neatInstance.inputNodeCount || c.from >= totalNodesCount) && c.to >= this.neatInstance.inputNodeCount) {
                        const alreadyConnected = this.connections.findIndex(x => {
                            return this.neatInstance.globalConnections[x.index].from == c.from && this.neatInstance.globalConnections[x.index].to == c.to && x.enabled;
                        }) != -1;
                        const recursive = checkIfConnectionIsRecursive(c);

                        if (!alreadyConnected && !recursive) {
                            possibleConnections[possibleConnections.length] = c;
                        }
                    }
                });
            }
        }

        return possibleConnections;
    }

    getGradientNodes(calculatedNodes, targetOutput) {
        // constants
        const nodeInputMaxIndex = this.neatInstance.inputNodeCount;
        const nodeOutputMaxIndex = nodeInputMaxIndex + this.neatInstance.outputNodeCount;
        const df = this.activationFunctionDerivitive;

        // Derived Errors.
        const errors = [];
        for (let i = nodeInputMaxIndex; i < nodeOutputMaxIndex; i++) {
            errors[i - nodeInputMaxIndex] = calculatedNodes[i].calculated ? (calculatedNodes[i].value - targetOutput[i - nodeInputMaxIndex]) : 0;
        }
        // Gradients (for feeding purposes).
        const nodeZs = [];
        for (let i = 0; i < this.neatInstance.nodeCount && i < calculatedNodes.length; i++) {
            nodeZs[i] = 0;
        }
        for (let i = 0; i < this.connections.length; i++) {
            let c = this.connections[i];
            let g = this.neatInstance.globalConnections[c.index];
            if (c.enabled && calculatedNodes[g.from].calculated) {
                nodeZs[g.to] += c.weight * calculatedNodes[g.from].value;
            }
        }
        // Gradient nodes for backpropagation calculation
        const gradientNodes = [];
        for (let i = 0; i < this.neatInstance.nodeCount && i < calculatedNodes.length; i++) {
            let calculated = i >= nodeInputMaxIndex && i < nodeOutputMaxIndex;
            gradientNodes[i] = {
                calculated: calculated,
                value: calculated ? (df(nodeZs[i]) * errors[i - nodeInputMaxIndex]) : undefined,
                failedReferences: 0
            }
        }

        //////////////////....

        let unusedConnections = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].enabled) {
                unusedConnections[unusedConnections.length] = i;
            }
        }

        let lastLength = unusedConnections.length + 1;
        while (unusedConnections.length > 0 && unusedConnections.length != lastLength) {
            lastLength = unusedConnections.length;

            for (let i = 0; i < gradientNodes.length; i++) {
                gradientNodes[i].failedReferences = 0;
            }

            let tempUnused = [];
            for (let i = 0; i < unusedConnections.length; i++) {
                let c = this.connections[unusedConnections[i]];
                let g = this.neatInstance.globalConnections[c.index];

                if (c.enabled) {
                    if (!gradientNodes[g.to].calculated) {
                        tempUnused[tempUnused.length] = unusedConnections[i];
                        gradientNodes[g.from].failedReferences++;
                    } else if (!gradientNodes[g.from].calculated) {
                        if (gradientNodes[g.from].value == undefined) gradientNodes[g.from].value = 0;
                        gradientNodes[g.from].value += df(nodeZs[g.from]) * c.weight * gradientNodes[g.to].value;
                    }
                }
            }

            for (let i = 0; i < calculatedNodes.length; i++) {
                if (gradientNodes[i].calculated == false && gradientNodes[i].value != undefined && gradientNodes[i].failedReferences <= 0) {
                    gradientNodes[i].calculated = true;
                }
            }
            unusedConnections = tempUnused;
        }

        return {
            gradientNodes: gradientNodes,
            errors: errors,
        }
    }

    getWeightChange(inputs, targetOutputs) {
        const weightChange = [];
        for (let i = 0; i < this.connections.length; i++) weightChange[i] = 0;

        const potentialConnections = this.getPotentialConnections();
        const potentialWeight = [];
        for (let i = 0; i < potentialConnections.length; i++) potentialWeight[i] = 0;

        const targetInputCount = this.neatInstance.inputNodeCount - (this.neatInstance.biasNode ? 1 : 0);
        const targetOutputCount = this.neatInstance.outputNodeCount;

        const totalErrors = [];
        for (let n = 0; n < inputs.length && n < targetOutputs.length; n++) {
            const input = inputs[n];
            const targetOutput = targetOutputs[n];

            if (input == undefined || input.length != targetInputCount ||
                targetOutput == undefined || targetOutput.length != targetOutputCount) {
                continue;
            }

            const calculatedNodes = this.getCalculatedNodes(input);
            const {
                gradientNodes,
                errors,
            } = this.getGradientNodes(calculatedNodes, targetOutput);

            for (let i = 0; i < errors.length; i++) {
                if (totalErrors[n] == undefined) {
                    totalErrors[n] = 0;
                }
                totalErrors[n] += errors[i];
            }

            for (let i = 0; i < this.connections.length; i++) {
                let c = this.connections[i];
                let g = this.neatInstance.globalConnections[c.index];

                if (c.enabled && gradientNodes[g.to].calculated && calculatedNodes[g.from].calculated) {
                    weightChange[i] += gradientNodes[g.to].value * calculatedNodes[g.from].value;
                }
            }
            for (let i = 0; i < potentialConnections.length; i++) {
                let c = potentialConnections[i];
                potentialWeight[i] += gradientNodes[c.to].value * calculatedNodes[c.from].value;
            }
        }

        return {
            weightChange: weightChange,
            potentialWeight: potentialWeight,
            potentialConnections: potentialConnections,
            totalErrors: totalErrors,
        }
    }

    backPropagate(inputs, targetOutputs, dx, dy, dw, dh, train = true) {
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
        const nodeSize = Math.sqrt((dw * dh) / this.drawVertices.length) * 0.15 * scale;
        dx += nodeSize / 2
        dy += nodeSize / 2
        dw -= nodeSize
        dh -= nodeSize

        // constants
        const learningRate = 0.005 / this.neatInstance.nodeCount;//Math.min(inputs.length, targetOutputs.length);

        const {
            weightChange,
            potentialWeight,
            potentialConnections,
            totalErrors,
        } = this.getWeightChange(inputs, targetOutputs);





        noStroke();
        fill(0);
        rect(0, 0, 200, windowHeight);
        fill(255);

        let num = 0;
        const getDown = () => {
            return num += 20;
        }

        textAlign(CENTER);

        text("Error:", 100, getDown());
        for (let i = 0; i < totalErrors.length; i++) {
            if (this.lastDis != undefined) {
                let change = Math.abs(this.lastDis[i]) - Math.abs(totalErrors[i]);
                let color = Math.min(Math.max(Math.abs(change) * 255 * 100 / learningRate, 0), 255);

                if (change >= 0) {
                    fill(255 - color, 255, 255 - color);
                } else {
                    fill(255, 255 - color, 255 - color);
                }

                text(totalErrors[i], 100, getDown());

            } else {
                text(totalErrors[i], 100, getDown());
            }
        }
        fill(255);
        textAlign(LEFT);

        if (train) {
            for (let i = 0; i < this.connections.length && i < weightChange.length; i++) {
                weightChange[i] /= trainingData.length;

                this.connections[i].weight += -learningRate * weightChange[i];
                if (Math.abs(this.connections[i].weight) < 0.01) {
                    //this.connections[i].enabled = false;
                }
            }
        }

        potentialWeight.sort((a, b) => Math.abs(b) - Math.abs(a));

        let count = 0;
        for (let i = 0; i < potentialWeight.length; i++) {
            potentialWeight[i] /= trainingData.length;

            let add = false;
            const c = potentialConnections[i];
            if (potentialWeight[i] == NaN) {
                if (c.to >= this.neatInstance.inputNodeCount && c.to < this.neatInstance.inputNodeCount + this.neatInstance.outputNodeCount) {
                    add = true;
                }
            } else if (potentialWeight[i] > 0.8) {
                add = true;
            }

            //if (add) this.addConnection(c.from, c.to, potentialWeight[i]);

            let from = this.drawVertices[this.drawVertices.findIndex(e => e.n == c.from)];
            let to = this.drawVertices[this.drawVertices.findIndex(e => e.n == c.to)];

            const fx = dx + ((from.x - minVx) * dw * scale);
            const fy = dy + ((from.y - minVy) * dh * scale);
            const tx = dx + ((to.x - minVx) * dw * scale);
            const ty = dy + ((to.y - minVy) * dh * scale);

            let cx = (tx - fx);
            let cy = (ty - fy);
            let mx = fx + cx / 2;
            let my = fy + cy / 2;
            const cm = Math.sqrt((cx * cx) + (cy * cy));
            cx *= 10 / cm;
            cy *= 10 / cm;
            mx += cy;
            my -= cx;

            fill(255);
            noStroke();
            text(count++, mx + cx * 4, my + cy * 4)
            setFillColor(potentialWeight[i]);
            text(potentialWeight[i], dx, dy + (24 * count));

            const arrowSize = 1;

            //stroke(255);
            setStrokeColor(potentialWeight[i]);
            noFill();
            strokeWeight(1);
            line(fx + cy, fy - cx, tx + cy, ty - cx);
            line(mx + ((cy - cx) * arrowSize), my - ((cx + cy) * arrowSize), mx, my);
            line(mx - ((cy + cx) * arrowSize), my + ((cx - cy) * arrowSize), mx, my);
        }

        return {
            weightChange: weightChange,
            potentialWeight: potentialWeight,
            totalErrors: totalErrors,
        }
    }

    mutate(potentialWeight) {

    }

    evolve(inputs, targetOutputs, maxIterations, stopError) {
        if (this.evolutionStopped != undefined) {
            return;
        }

        let minError = stopError;
        let lastPotentialWeight;
        for (let i = 0; i < maxIterations && minError >= stopError; i++) {
            const {
                //weightChange,
                potentialWeight,
                totalErrors,
            } = this.backPropagate(inputs, targetOutputs)

            let totalErr = 0;
            for (let i = 0; i < totalErrors.length; i++) {
                totalErr += Math.abs(totalErrors[i]);
            }
            minError = Math.min(minError, totalErr / totalErrors.length);

            if (minError >= stopError) {
                lastPotentialWeight = potentialWeight;
            }
        }
        if (minError < stopError) {
            this.evolutionStopped = true;
            return;
        }
        this.mutate(lastPotentialWeight);
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

    splitConnection(index) {
        const from = this.neatInstance.globalConnections[this.connections[index].index].from;
        const to = this.neatInstance.globalConnections[this.connections[index].index].to;
        const splitNode = this.neatInstance.getSplitConnectionNode(from, to);

        console.log(from, to, splitNode);

        this.connections[index].enabled = false;
        this.addConnection(from, splitNode, this.connections[index].weight);
        this.addConnection(splitNode, to, 1);
        if (this.neatInstance.biasNode) {
            this.addConnection(0, splitNode);
        }
    }

    // graph force stuff
    /// https://cs.brown.edu/people/rtamassi/gdhandbook/chapters/force-directed.pdf
    draw(x, y, w, h, input = undefined) {
        // edges huh

        const drawBias = true;

        if (!this.drawVertices || !this.drawEdges) {
            console.log("making everything :)");

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

                //if (this.neatInstance.biasNode && g.from == 0 && !drawBias) {
                //    continue;
                //}

                if (this.connections[i].enabled) {
                    this.drawEdges[this.drawEdges.length] = {
                        n: i,
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
                        if (this.drawEdges[j].from >= i) this.drawEdges[j].from--;
                        if (this.drawEdges[j].to >= i) this.drawEdges[j].to--;
                    }
                    i--;
                }
            }
        } else {
            for (let i = 0; i < this.connections.length; i++) {
                let c = this.connections[i];
                let g = this.neatInstance.globalConnections[c.index];
                const index = this.drawEdges.findIndex(x => {
                    return x.n == i;
                })
                if (c.enabled && index == -1) {
                    const newToAndFrom = [];
                    [g.from, g.to].forEach(v => {
                        const vIndex = this.drawVertices.findIndex(x => x.n == v);
                        if (vIndex == -1) {
                            let targetIndex = Math.min(v, this.drawVertices.length - 1);
                            while (targetIndex >= 0 && this.drawVertices[targetIndex].n > v) targetIndex--;
                            targetIndex++;

                            console.log(`inserting vertice index at ${targetIndex} / ${this.drawVertices.length}`);

                            for (let j = 0; j < this.drawEdges.length; j++) {
                                if (this.drawEdges[j].from >= targetIndex) this.drawEdges[j].from++;
                                if (this.drawEdges[j].to >= targetIndex) this.drawEdges[j].to++;
                            }
                            this.drawVertices.splice(targetIndex, 0, {
                                n: v,
                                x: random(0, 1),
                                y: random(0, 1),
                                dx: 0,
                                dy: 0,
                                // Draw stuff
                                b: v == 0 && this.neatInstance.biasNode,
                                i: (v < this.neatInstance.inputNodeCount),
                                o: (v >= this.neatInstance.inputNodeCount && v < this.neatInstance.inputNodeCount + this.neatInstance.outputNodeCount),
                            });
                            newToAndFrom[newToAndFrom.length] = targetIndex;
                        } else {
                            newToAndFrom[newToAndFrom.length] = vIndex;
                        }
                    });
                    this.drawEdges[this.drawEdges.length] = {
                        n: i,
                        from: newToAndFrom[0],
                        to: newToAndFrom[1]
                    }
                } else if (!c.enabled && index != -1) {
                    this.drawEdges.splice(index, 1);
                }
            }
        }

        let xFactor = w / h;

        let k = Math.sqrt(1 / this.drawVertices.length);
        const fa = s => { return (s * s) / k; }
        const fr = s => { return (k * k) / s; }

        let cx, cy, cm;
        //const iterations = 10;
        let totalMove = 0;

        const maxMove = 0.005;
        const moveFactor = 0.05 / (this.drawVertices.length);
        // seperation
        for (let i = 0; i < this.drawVertices.length; i++) {
            for (let j = 0; j < this.drawVertices.length; j++) {
                if (i != j) {
                    cx = (this.drawVertices[i].x - this.drawVertices[j].x) * xFactor;
                    cy = this.drawVertices[i].y - this.drawVertices[j].y;
                    cm = Math.sqrt((cx * cx) + (cy * cy));
                    this.drawVertices[i].dx += (cx / cm) * fr(cm) * 2;
                    this.drawVertices[i].dy += (cy / cm) * fr(cm) * 2;
                }
            }
        }

        // attraction
        for (let i = 0; i < this.drawEdges.length; i++) {
            let e = this.drawEdges[i];
            cx = (this.drawVertices[e.to].x - this.drawVertices[e.from].x) * xFactor;
            cy = this.drawVertices[e.to].y - this.drawVertices[e.from].y;
            cm = Math.sqrt((cx * cx) + (cy * cy));

            let weight = 0.6 + Math.abs(this.connections[e.n].weight * 0.8);
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
            let ax = (this.drawVertices[i].dx / dm) * Math.min(dm * moveFactor, maxMove);
            let ay = (this.drawVertices[i].dy / dm) * Math.min(dm * moveFactor, maxMove);

            let tm = (ax * ax) + (ay * ay);
            totalMove += tm;

            this.drawVertices[i].x = this.drawVertices[i].x + ax;
            this.drawVertices[i].y = this.drawVertices[i].y + ay;
            this.drawVertices[i].dx = 0;
            this.drawVertices[i].dy = 0;
        }

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
                setStrokeColor(nodes[v.n].calculated ? this.connections[e.n].weight * nodes[v.n].value : undefined);
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
                setFillColor(nodes[v.n].calculated ? nodes[v.n].value : undefined);
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


        return Math.round((totalMove / this.drawVertices.length) * 100000000);
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