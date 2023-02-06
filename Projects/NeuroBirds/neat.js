const c1 = 1, c2 = 1, c3 = 0.4;

function getChance(chance) { return random() < chance; }
function getRandomInt(max) { return Math.floor(random() * max); }

class NEAT {
    constructor(inputNodeCount, outputNodeCount, populationSize) {
        // F in chat for the config n all - just bias node is constantly on i guess?

        this.biasNode = true;

        this.inputNodeCount = inputNodeCount + (this.biasNode ? 1 : 0);
        this.outputNodeCount = outputNodeCount;

        this.nodeCount = 0;
        this.globalConnections = [];

        this.population = [];
        for (let n = 0; n < populationSize; n++) {
            this.population[n] = new Genome(this);
            for (let i = 0; i < this.inputNodeCount; i++) {
                for (let j = 0; j < this.outputNodeCount; j++) {
                    this.population[n].addConnectionB(i, j + this.inputNodeCount);
                }
            }
        }

        this.lastSpecies = [];
        this.speciesThreshold = 2;
    }

    // Fun Stuff Goes Here:

    getPopulation() { return this.population; }
    get(index) { return this.population[index]; }

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
        this.globalConnections[index] = new Connection(from, to);

        return index;
    }

    static distance(g1, g2) {
        let g1Connections = g1.getConnections(),
            g2Connections = g2.getConnections();
        if (g1Connections[g1Connections.length - 1].getIndex() < g2Connections[g2Connections.length - 1].getIndex()) {
            let g = g1;
            g1 = g2;
            g2 = g;

            g1Connections = g1.getConnections();
            g2Connections = g2.getConnections();
        }

        let similar = 0,
            disjoint = 0,
            excess = 0;
        let weightDifference = 0;

        let g1Index = 0, g2Index = 0;
        while (g1Index < g1Connections.length && g2Index < g2Connections.length) {
            let gene1 = g1Connections[g1Index],
                gene2 = g2Connections[g2Index];
            let g1i = gene1.getIndex(), g2i = gene2.getIndex();

            if (g1i == g2i) {
                similar++;
                weightDifference += Math.abs(gene1.getWeight() - gene2.getWeight());

                g1Index++;
                g2Index++;
            } else {
                disjoint++;
                if (g1i < g2i) {
                    g1Index++;
                } else {
                    g2Index++;

                }
            }
        }

        excess = g1Connections.length - g1Index;
        weightDifference /= similar;

        let n = Math.max(g1.getConnections().length, g2.getConnections().length);
        if (n < 20) { n = 1; }

        return ((c1 * excess) / n) + ((c2 * disjoint) / n) + (c3 * weightDifference);
    }

    static getAdjustedFitness(species) {
        let genomes = species.getGenomes();
        let adjustedFitness = 0;
        for (let i = 0; i < genomes.length; i++) {
            adjustedFitness += genomes[i].getFitness() / genomes.length;
        }
        return adjustedFitness / genomes.length;
    }

    getSpecies(distanceThreshold) {
        let species = [];

        let genomes = [].concat(this.population);
        for (let i = 0; i < this.lastSpecies.length; i++) {
            species[i] = this.lastSpecies[i].takeNew();
        }
        while (genomes.length > 0) {
            let index = getRandomInt(genomes.length);
            let g = genomes[index];
            genomes.splice(index, 1);

            let found = false;
            for (let i = 0; i < species.length; i++) {
                if (species[i].getDistance(g) < distanceThreshold) {
                    species[i].addGenome(g);
                    found = true;
                    break;
                }
            }
            if (!found) {
                species[species.length] = new Species(g, true);
            }
        }

        let backup = [].concat(species);
        for (let i = 0; i < species.length; i++) {
            if (species[i].getGenomes().length < 2 && species.length > 1) {
                species.splice(i--, 1);
                continue;
            }
            species[i].calculateBestFitness();
        }
        let backup2 = [].concat(species);

        species.sort((a, b) => a.getAverageSize() - b.getAverageSize());
        
        let backup3 = [].concat(species);

        for (let i = species.Count - 1; i >= 0; i--) {
            if (species[i].shouldDestroy() && species.length > 1) {
                species.splice(i, 1);
            }
        }
        this.lastSpecies = species;
        if (this.lastSpecies.length <= 0) {
            console.log(backup);
            console.log(backup2);
            console.log(backup3);
        }
        return this.lastSpecies;
    }

    crossover(g1, g2) {
        let equalFitness = g1.getFitness() == g2.getFitness();
        if (!equalFitness && g1.getFitness() < g2.getFitness()) {
            let g = g1;
            g1 = g2;
            g2 = g;
        }

        let child = new Genome(this);

        let g1Connections = g1.getConnections(),
            g2Connections = g2.getConnections();
        let g1Index = 0,
            g2Index = 0;
        while (g1Index < g1Connections.length && g2Index < g2Connections.length) {
            let gene1 = g1Connections[g1Index],
                gene2 = g2Connections[g2Index];
            let g1i = gene1.getIndex(),
                g2i = gene2.getIndex();
            if (g1i == g2i) {
                if (getChance(0.5)) {
                    child.addConnectionG(gene1);
                } else {
                    child.addConnectionG(gene2);
                }

                if (gene1.getState() != gene2.getState()) {
                    let connections = child.getConnections();
                    connections[connections.length - 1].setState(!getChance(0.75));
                }

                g1Index++;
                g2Index++;
            } else if (g1i < g2i) {
                if (!equalFitness || getChance(0.5)) { child.addConnectionG(gene1); }
                g1Index++;
            } else {
                if (equalFitness && getChance(0.5)) { child.addConnectionG(gene2); }
                g2Index++;
            }
        }

        while (g1Index < g1Connections.length) {
            if (getChance(0.5)) {
                child.addConnectionG(g1Connections[g1Index]);
            }
            g1Index++;
        }
        return child;
    }

    generateNewPopulation(targetSpeciesCount = 15   ) {
        let species = this.getSpecies(this.speciesThreshold);

        if (species.length != targetSpeciesCount) {
            let difference = targetSpeciesCount - species.length;

            this.speciesThreshold = Math.max(1, this.speciesThreshold - (0.005 * difference));
        }


        if (species.length <= 0) {
            console.log("so like, yeah, there are no species here, fuck.")
        }

        let actualPopulationSize = 0;

        let aFitness = [];
        let averageFitness = 0;
        for (let n = 0; n < species.length; n++) {
            aFitness[n] = NEAT.getAdjustedFitness(species[n]);
            averageFitness += (aFitness[n] * species[n].getGenomes().length);
            actualPopulationSize += species[n].getGenomes().length;
        }
        averageFitness /= actualPopulationSize;

        let allowedOffspring = [];
        let totalOffspring = 0;
        for (let i = 0; i < species.length; i++) {
            if (averageFitness != 0) {
                allowedOffspring[i] = Math.round((aFitness[i] / averageFitness) * species[i].getGenomes().length);
            } else {
                allowedOffspring[i] = species[i].getGenomes().length;
            }
            totalOffspring += allowedOffspring[i];
        }
        // a rotary sorta deal (based on the initial stuff) would be quite cool here instead of random.
        while (totalOffspring != this.population.length) {
            let target = getRandomInt(species.length);
            let way = (totalOffspring < this.population.length) ? 1 : -1;
            allowedOffspring[target] += way;
            totalOffspring += way;
        }

        let newPopulation = []; // is size of population for the non-js fans (aka future me i guess)
        for (let n = 0; n < species.length; n++) {
            let genomes = species[n].getGenomes();
            let smallSpecies = genomes.length < (this.population * 0.15);

            let totalFitness = species[n].getTotalFitness();
            let offset = 0;
            if (genomes.length > 5) {
                newPopulation[newPopulation.length] = genomes[0].clone();
                offset++;
            }

            let parents = [];
            for (let k = offset; k < allowedOffspring[n]; k++) {
                let index = newPopulation.length;
                if (getChance(0.25)) {
                    newPopulation[index] = this.getParentFromSpecies(genomes, totalFitness);
                } else {
                    for (let j = 0; j < 2; j++) {
                        parents[j] = this.getParentFromSpecies(genomes, totalFitness);
                    }
                    newPopulation[index] = this.crossover(parents[0], parents[1]);
                }
                newPopulation[index].mutate(smallSpecies);
            }
        }
        this.population = newPopulation;
        //console.log(this);
    }

    getParentFromSpecies(species) { return this.getParentFromSpecies(s.getGenomes(), s.getTotalFitness()); }
    getParentFromSpecies(genomes, totalFitness) {
        let index = 0;
        for (let address = (random() * totalFitness * 0.5); address >= 0 && index < genomes.length; index++) {
            address -= genomes[index].getFitness();
        }
        //console.log(index ,genomes.length, );
        //index--;
        return genomes[Math.min(index, genomes.length - 1)].clone();
    }
}

class Connection {
    constructor(fromIndex, toIndex) {
        this.from = fromIndex;
        this.to = toIndex;
        this.splitNode = -1;
    }

    getFrom() { return this.from; }
    getTo() { return this.to; }

    compare(from, to) {
        return this.to == to && this.from == from;
    }

    getSplitNode(neat) {
        if (this.splitNode == -1) {
            this.splitNode = neat.nodeCount++;
        }
        return this.splitNode;
    }
}

class Species {
    constructor(representative, addRepresentativeToSpecies = false) {
        this.representative = representative;
        this.genomes = [];
        if (addRepresentativeToSpecies) {
            this.addGenome(this.representative);
        }
        this.bestFitness = 0;
        this.innovationsSinceLastFitnessChange = 0;
        this.sorted = true;
    }
    takeNew() {
        let newSpecies = new Species(this.genomes[getRandomInt(this.genomes.length)].clone());
        newSpecies.bestFitness = this.bestFitness;
        newSpecies.innovationsSinceLastFitnessChange = this.innovationsSinceLastFitnessChange + 1;
        return newSpecies;
    }

    getDistance(g) {
        return NEAT.distance(this.representative, g);
    }

    addGenome(g) {
        this.genomes[this.genomes.length] = g;
        if (this.genomes.length > 1) {
            this.sorted = false;
        }
    }
    getGenomes() { return this.genomes; }

    sort() {
        if (!this.sorted) {
            this.genomes.sort((a, b) => b.getFitness() - a.getFitness());
            this.sorted = true;
        }
    }

    calculateBestFitness() {
        if (this.genomes.length > 0) {
            this.sort();
            let fitness = this.genomes[0].getFitness();
            if (fitness > this.bestFitness) {
                this.bestFitness = fitness;
                this.innovationsSinceLastFitnessChange = 0;
            }
        }
    }

    getAverageSize() {
        let average = 0;
        for (let i = 0; i < this.genomes.length; i++) {
            average += this.genomes[i].getConnections().length;
        }
        return average / this.genomes.length;
    }

    getTotalFitness() {
        let totalFitness = 0;
        for (let i = 0; i < this.genomes.length; i++) {
            totalFitness += this.genomes[i].getFitness();
        }
        return totalFitness;
    }

    shouldDestroy() { return this.innovationsSinceLastFitnessChange > 15; }
}

class Genome {
    constructor(neat) {
        this.neat = neat;
        this.connections = [];
        this.fitness = 0;
    }

    clone() {
        let clone = new Genome(this.neat);
        for (let i = 0; i < this.connections.length; i++) {
            clone.addConnectionG(this.connections[i].clone());
        }
        clone.fitness = this.fitness;
        return clone;
    }

    getFitness() { return this.fitness; }
    setFitness(fitness) { this.fitness = Math.max(fitness, 0); }

    passInputs(inputs) {
        let actualInputs = [];
        if (this.neat.biasNode) {
            actualInputs[0] = 1;
        }
        for (let i = 0; i < inputs.length; i++) {
            actualInputs[actualInputs.length] = inputs[i];
        }
        //////////////////////////////////////
        let nodes = [];
        for (let i = 0; i < this.neat.nodeCount; i++) {
            nodes[i] = new CalculationNode();
            if (i < Math.min(actualInputs.length, this.neat.inputNodeCount)) {
                nodes[i].setOutput(actualInputs[i]);
            }
        }
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].getState()) {
                nodes[this.connections[i].getTo(this.neat)].addConnection(i);
            }
        }

        let output = [];
        for (let i = 0; i < this.neat.outputNodeCount; i++) {
            output[i] = nodes[i + this.neat.inputNodeCount].getOutput(this, nodes);
        }
        return output;
    }

    getConnections() { return this.connections; }
    getEnabledConnections() { return this.getConnections().filter(c => c.getState()); }

    getRandomConnection() {
        let connections = this.getConnections();
        if (connections.length > 0) {
            return connections[getRandomInt(connections.length)];
        }
        return null;
    }
    getRandomEnabledConnection() {
        let connections = this.getEnabledConnections();
        if (connections.length > 0) {
            return connections[getRandomInt(connections.length)];
        }
        return null;
    }

    randomWeight() { return ((random() * 2) - 1) * 2; }
    getNodes() {
        let nodes = [];
        for (let i = 0; i < this.connections.length; i++) {
            let from = this.connections[i].getFrom(this.neat),
                to = this.connections[i].getTo(this.neat);
            if (nodes.indexOf(from) == -1) { nodes[nodes.length] = from; }
            if (nodes.indexOf(to) == -1) { nodes[nodes.length] = to; }
        }
        nodes.sort((a, b) => a - b);
        return nodes;
    }

    addRandomConnection() {
        let nodes = [];
        for (let i = 0; i < this.neat.nodeCount; i++) {
            // ideally only define the ones used <3
            nodes[i] = new CalculationNode();
        }
        for (let i = 0; i < this.connections.length; i++) {
            // have been wondering if it would affect anything to just add the node index instead of the connection index??
            nodes[this.connections[i].getTo(this.neat)].addConnection(i);
        }
        let highestLayer = 0;
        for (let i = this.neat.inputNodeCount; i < this.neat.inputNodeCount + this.neat.outputNodeCount; i++) {
            highestLayer = Math.max(highestLayer, nodes[i].getLayer(this, nodes));
        }
        for (let i = this.neat.inputNodeCount; i < this.neat.inputNodeCount + this.neat.outputNodeCount; i++) {
            nodes[i].setLayer(highestLayer);
        }

        // you've got this!, future me
        /// Thank you, past me!

        let layerCount = [];
        for (let i = 0; i < nodes.length; i++) {
            let layer = nodes[i].getLayer(this, nodes);
            if (layer != 0 || i < this.neat.inputNodeCount) {
                if (!layerCount[layer]) {
                    layerCount[layer] = 0;
                }
                layerCount[layer]++;
            }
        }
        let layerPotential = [];
        layerPotential[0] = layerCount[0] - 1;
        // was layerpotential.length -> big oof
        for (let i = 1; i < highestLayer; i++) {
            layerPotential[i] = layerPotential[i - 1] + layerCount[i];
        }
        layerPotential[highestLayer] = layerPotential[highestLayer - 1] + 1;
        layerPotential[0] = 0;

        let onlyUsedNodes = this.getNodes();
        let potentialNodes = [].concat(onlyUsedNodes);
        // i dont think this is correct, sorry (yeah i second that, outputs should be a valid node to go to)
        // fixing time: done'zies
        potentialNodes.splice(0, this.neat.inputNodeCount);
        for (let i = 0; i < potentialNodes.length; i++) {
            if (!(nodes[potentialNodes[i]].getConnections().length < layerPotential[nodes[potentialNodes[i]].getLayer(this, nodes)])) {
                potentialNodes.splice(i--, 1);
            }
        }

        if (potentialNodes.length > 0) {
            let to = potentialNodes[getRandomInt(potentialNodes.length)];
            let connections = nodes[to].getConnections();
            let layer = nodes[to].getLayer(this, nodes);

            potentialNodes = [].concat(onlyUsedNodes);
            //potentialNodes.splice(to, 1); // jesus this is just dumbo stuff -- binary search it future me <3
            for (let i = 0; i < potentialNodes.length; i++) {
                if (potentialNodes[i] == to || (potentialNodes[i] >= this.neat.inputNodeCount && potentialNodes[i] < this.neat.inputNodeCount + this.neat.outputNodeCount)) {
                    potentialNodes.splice(i--, 1);
                }
            }
            for (let n = 0; n < potentialNodes.length; n++) {
                if (nodes[potentialNodes[n]].getLayer(this, nodes) <= layer) {
                    let found = false;
                    for (let i = 0; i < connections.length; i++) {
                        if (this.connections[connections[i]].getFrom(this.neat) == potentialNodes[n]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        continue;
                    }
                }
                potentialNodes.splice(n--, 1); // splice takes two arguments actual
            }
            let from = potentialNodes[getRandomInt(potentialNodes.length)];
            this.addConnectionB(from, to);
        }
    }

    addRandomNode() {
        let connections = this.getEnabledConnections();

        let nodeCount = [];
        for (let i = 0; i < connections.length; i++) {
            let index = connections[i].getTo(this.neat);
            if (!nodeCount[index]) {
                nodeCount[index] = 0;
            }
            nodeCount[index]++;
        }
        let ioCount = this.neat.inputNodeCount + this.neat.outputNodeCount
        for (let i = 0; i < connections.length; i++) {
            let index = connections[i].getFrom(this.neat);
            let to = connections[i].getTo(this.neat);

            if (index < ioCount && to < ioCount) {
                continue;
            }

            if (!nodeCount[index] || nodeCount[index] < 1) {
                connections.splice(i--, 1);
            }
        }

        if (connections.length > 0) {
            let connection = connections[getRandomInt(connections.length)];

            let newNodeIndex = connection.getSplitNode(this.neat);
            connection.setState(false);
            this.addConnectionB(connection.getFrom(this.neat), newNodeIndex, 1);
            this.addConnectionB(newNodeIndex, connection.getTo(this.neat), connection.getWeight());
        }
    }

    mutateConnectionWeight() {
        let connection = this.getRandomEnabledConnection();
        if (connection != null) {
            if (!getChance(0.1)) {
                let w = connection.getWeight();
                const range = 0.4;
                let r = (random() * 2) - 1;
                connection.setWeight(w + (r * range));
            } else {
                connection.setWeight(this.randomWeight());
            }
        }
    }

    mutate(smallPopulation) {
        const nodeMutation = (smallPopulation ? 0.03 : 0.18);
        const connectionMutation = smallPopulation ? 0.05 : 0.4;

         
        const weightMutation = 1 - (nodeMutation + connectionMutation);
        
        const functions = [
            [weightMutation, 0],
            [nodeMutation, 1],
            [connectionMutation, 2]
        ];

        let func = random();
        
        for (let i = 0; i < functions.length; i++) {
            func -= functions[i][0];
            if (func <= 0) {
                switch (functions[i][1]) {
                    case 0: { this.mutateConnectionWeight(); } break
                    case 1: { this.addRandomNode(); } break
                    case 2: { this.addRandomConnection(); } break
                }
                break;
            }
        }
    }

    addConnectionB(from, to, weight = this.randomWeight()) {
        this.addConnectionG(new Gene(this.neat.getConnection(from, to), weight))
    }
    addConnectionG(gene) {
        let connection = gene.clone(); // pointers bad, yeah

        let found = false;
        // binary search would be so much better...
        for (let n = 0; n < this.connections.length && !found; n++) {
            if (this.connections[n].getIndex() > connection.getIndex()) {
                for (let i = this.connections.length; i > n; i--) {
                    this.connections[i] = this.connections[i - 1];
                }
                this.connections[n] = connection;
                found = true;
            }
        }
        if (!found) {
            this.connections[this.connections.length] = connection;
        }
    }

    draw(x, y, w, h, inputs) {
        if (this.neat.biasNode) {
            for (let i = inputs.length; i >= 1; i--) {
                inputs[i] = inputs[i - 1];
            }
            inputs[0] = 1;
        }

        let usedNodes = this.getNodes();
        let nodes = [];
        for (let i = 0; i < usedNodes.length; i++) {
            nodes[usedNodes[i]] = new CalculationNode();
        }
        // could totally get the used nodes here too
        for (let i = 0; i < this.connections.length; i++) {
            nodes[this.connections[i].getTo(this.neat)].addConnection(i);
        }
        for (let i = 0; i < Math.min(this.neat.inputNodeCount, inputs.length); i++) {
            nodes[i].setOutput(inputs[i]);
        }
        let highestLayer = 0;
        for (let i = 0; i < this.neat.outputNodeCount; i++) {
            highestLayer = Math.max(highestLayer, nodes[i + this.neat.inputNodeCount].getLayer(this, nodes));
        }
        for (let i = 0; i < this.neat.outputNodeCount; i++) {
            nodes[i + this.neat.inputNodeCount].setLayer(highestLayer);
        }
        let layerCount = [];
        let layerCountNodes = [];
        let layerCountNodesIndex = [];
        let maxLayerCount = 0;
        for (let i = 0; i < usedNodes.length; i++) {
            let layer = nodes[usedNodes[i]].getLayer(this, nodes);
            if (!layerCount[layer]) {
                layerCount[layer] = 0;
                layerCountNodes[layer] = [];
                layerCountNodesIndex[layer] = [];
            }
            layerCount[layer]++;
            layerCountNodes[layer][layerCountNodes[layer].length] = nodes[usedNodes[i]];
            layerCountNodesIndex[layer][layerCountNodesIndex[layer].length] = usedNodes[i];
            maxLayerCount = Math.max(maxLayerCount, layerCount[layer]);
        }

        let columnWidth = w / (highestLayer + 1);
        let columnHeight = h / maxLayerCount;

        let offset = 10;
        let nodeSize = Math.max(Math.min(columnWidth, columnHeight) - offset, 0);

        noFill(255);
        stroke(255);
        strokeWeight(1);
        let border = 5;
        rect(x - border, y - border, w + (2 * border), h + (2 * border));
        let ox = columnWidth / 2;
        let oy = columnHeight / 2;
        stroke(255);
        let yoffs = [];
        for (let i = 0; i <= highestLayer; i++) {
            yoffs[i] = (maxLayerCount - layerCount[i]) * columnHeight / 2;
        }

        let weightMultiplier = 1 / 40;
        let nodeThres = 0.5;
        for (let i = 0; i < this.connections.length; i++) {
            let connection = this.connections[i];
            if (!connection.getState()) {
                continue;
            }
            let targets = [
                connection.getFrom(this.neat),
                connection.getTo(this.neat)
            ];
            let targetXYs = [];
            for (let n = 0; n < targets.length; n++) {
                let layer = nodes[targets[n]].getLayer(this, nodes);
                let index;
                for (index = 0; index < layerCount[n]; index++) {
                    if (layerCountNodesIndex[layer][index] == targets[n]) {
                        break;
                    }
                }
                targetXYs[n] = [
                    x + (columnWidth * layer) + ox,
                    y + (columnHeight * index) + oy + yoffs[layer]
                ];
            }
            let weight = connection.getWeight();
            if (weight >= 0) {
                weight = Math.max(weight, nodeThres);
                strokeWeight(weight * nodeSize * weightMultiplier);
                stroke(50, 50, map(weight, 0, 1, 75, 200));
            } else {
                weight = Math.min(weight, -nodeThres);
                strokeWeight(-weight * nodeSize * weightMultiplier);
                stroke(map(-weight, 0, 1, 75, 200), 50, 50);
            }
            line(targetXYs[0][0] + (nodeSize / 2), targetXYs[0][1], targetXYs[1][0] - (nodeSize / 2), targetXYs[1][1]);
        }
        noStroke();
        for (let i = 0; i <= highestLayer; i++) {
            let dx = x + (columnWidth * i) + ox;
            for (let j = 0; j < layerCount[i]; j++) {
                let dy = y + (columnHeight * j) + oy + yoffs[i];
                let val = layerCountNodes[i][j].getOutput(this, nodes);
                if (val >= 0) {
                    fill(50, 50, map(val, 0, 1, 75, 200));
                } else {
                    fill(map(-val, 0, 1, 75, 200), 50, 50);
                }
                circle(dx, dy, nodeSize);
                fill(255);
                //text((yoffs[i] / columnHeight) + j, dx, dy);
            }
        }
    }
}

// WeightedConnection
class Gene {
    constructor(index, weight, enabled = true) {
        this.index = index;
        this.weight = weight;
        this.enabled = enabled;
    }
    clone() {
        return new Gene(this.index, this.weight, this.enabled);
    }

    getIndex() { return this.index; }
    getWeight() { return this.weight; }
    getState() { return this.enabled; }

    setWeight(weight) { this.weight = weight; }
    setState(enabled) { this.enabled = enabled; }

    getFrom(neat) { return neat.globalConnections[this.index].getFrom(); }
    getTo(neat) { return neat.globalConnections[this.index].getTo(); }
    getSplitNode(neat) { return neat.globalConnections[this.index].getSplitNode(neat); }
}

class CalculationNode {
    constructor() {
        this.connections = [];
        this.outputCalculated = false;
        this.layerCalculated = false;
    }

    addConnection(index) { this.connections[this.connections.length] = index; }
    getConnections() { return this.connections; }

    setOutput(value) {
        this.output = value;
        this.outputCalculated = true;
    }

    getOutput(g, nodes) {
        if (!this.outputCalculated) {
            this.output = 0;
            for (let i = 0; i < this.connections.length; i++) {
                let connection = g.connections[this.connections[i]];
                if (connection.getState()) {
                    let from = connection.getFrom(neatInstance);
                    this.output += nodes[from].getOutput(g, nodes) * connection.getWeight();
                }
            }
            this.output = this.activationFunction(this.output);
            this.outputCalculated = true;
        }
        return this.output;
    }

    activationFunction(x) {
        //return Math.tanh(x); // Tanh
        return 1 / (1 + Math.pow(Math.E, -4.9 * x)); // Modified Sigmoid
    }

    setLayer(layer) {
        this.layer = layer;
        this.layerCalculated = true;
    }
    getLayer(g, nodes) {
        if (!this.layerCalculated) {
            this.layer = 0;
            for (let i = 0; i < this.connections.length; i++) {
                this.layer = Math.max(this.layer, nodes[g.connections[this.connections[i]].getFrom(g.neat)].getLayer(g, nodes) + 1);
            }
            this.layerCalculated = true;
        }
        return this.layer;
    }
}