function getRandomInt(max) { return Math.floor(Math.random() * Math.floor(max)); }

class NeuralNetwork {
    constructor(learningRate, nodes, activationFunction) {
        this.learningRate = learningRate;
        let totalNodes = 0;
        for (let i = 0; i < nodes.length; i++) {
            totalNodes += nodes[i];
        }
        this.learningRate /= totalNodes;

        this.nodes = nodes;

        switch (activationFunction) {
            default: {
                this.afunc = function (x) { return 1 / (1 + Math.pow(Math.E, -x)); }
                this.dfunc = function (x) { return x * (1 - x); }
                //console.log("Sigmoid Function");
            } break;
            case "tanh": {
                this.afunc = function (x) { return Math.tanh(x); }
                this.dfunc = function (x) { return 1 / (Math.pow(Math.cosh(x), 2)); }
                //console.log("Tanh Function");
            } break;
            case "relu": {
                var rate = 0.01;
                this.afunc = function (x) { return Math.max(rate * x, x); }
                this.dfunc = function (x) { return (x >= 0) ? 1 : rate; }
                //console.log("ReLU Function");
            }
        }

        this.weights = [];
        this.bias = [];
        for (var i = 0; i < this.nodes.length - 1; i++) {
            this.weights[i] = new Matrix(this.nodes[i + 1], this.nodes[i]);
            this.bias[i] = new Matrix(this.nodes[i + 1], 1);

            this.weights[i].Randomize();
            this.bias[i].Randomize();
        }
    }
    Clone() {
        var result = new NeuralNetwork(this.learningRate, [...this.nodes]);
        for (var i = 0; i < result.nodes.length - 1; i++) {
            result.weights[i] = this.weights[i].Clone()
            result.bias[i] = this.bias[i].Clone()
        }
        return result;
    }


    Predict(inputArray) { return this.FeedForward(inputArray); }
    FeedForward(inputArray) {
        var current = Matrix.fromArray(inputArray);
        for (var i = 0; i < this.weights.length; i++) {
            current = this.weights[i].Dot(current);
            current.Add(this.bias[i]); // node from 2022/08/21: why would you add bias here? its supposed to be a input node, hun
            current.Map(this.afunc);
        }
        return current.toArray();
    }


    Mutate(rate) {
        function Mutation(val) {
            if (Math.random() < rate) {
                return val + randomGaussian();
            }
            return val;
        }
        for (var i = 0; i < this.weights.length; i++) {
            this.weights[i].Map(Mutation);
            this.bias[i].Map(Mutation);
        }
    }
    Train(inputs, targets) {
        let weightChanges = [];
        let biasChanges = [];
        for (let i = 0; i < this.weights.length; i++) {
            weightChanges[i] = new Matrix(this.weights[i].rows, this.weights[i].columns);
            biasChanges[i] = new Matrix(this.bias[i].rows, 1);
        }

        for (let n = 0; n < inputs.length; n++) {
            const inputArray = inputs[n];
            const targetArray = targets[n];

            var current = [];
            current[0] = Matrix.fromArray(inputArray);
            for (var i = 0; i < this.weights.length; i++) {
                current[i + 1] = this.weights[i].Dot(current[i]);
                current[i + 1].Add(this.bias[i]);
                current[i + 1].Map(this.afunc);
            }


            var top = this.weights.length;
            var lastError = Matrix.fromArray(targetArray);
            for (var i = top; i >= 1; i--) {
                if (i === top) {
                    lastError.Subtract(current[i]);
                } else {
                    var w_t = this.weights[i].Transpose();
                    lastError = w_t.Dot(lastError);
                }

                var gradient = current[i].Clone();
                gradient.Map(this.dfunc);
                gradient.Multiply(lastError);
                gradient.Multiply(this.learningRate);

                var current_t = current[i - 1].Transpose();
                var weight_delta = gradient.Dot(current_t);

                weightChanges[i - 1].Add(weight_delta);
                biasChanges[i - 1].Add(gradient);
            }
        }



        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i].Add(weightChanges[i]);
            this.bias[i].Add(biasChanges[i]);
        }
    }


    Draw(x, y, inputArray, r = 80, indivSpacing = 20, layerSpacing = 70, maxStrokeWidth = 5) {
        textAlign(CENTER, CENTER);

        x += (r * 0.5);
        y += (r * 0.5);
        for (var i = 0; i < this.nodes.length; i++) {
            this.DrawLayer(i, x, y, inputArray, r, indivSpacing, layerSpacing, maxStrokeWidth);
            x += layerSpacing + r;
        }
    }

    DrawLayer(ind, x, y, inputArray, r, indivSpacing, layerSpacing, maxStrokeWidth) {
        var max = 0;
        for (var i = 1; i < this.nodes.length; i++) { max = Math.max(max, this.nodes[i]); }

        var current = Matrix.fromArray(inputArray);
        var values = inputArray;
        for (var i = 1; i <= ind; i++) {
            current = this.weights[i - 1].Dot(current);
            current.Add(this.bias[i - 1]);
            current.Map(this.afunc);
            values = current.toArray();
        }

        var total = max - this.nodes[ind];
        for (var i = 0; i < this.nodes[ind]; i++) {
            var thisTop = y + (total * (r + indivSpacing) * 0.5) + (i * (r + indivSpacing));
            this.DrawNode(x, thisTop, r, values[i]);

            if (ind < this.weights.length) {
                var nextTotal = max - this.nodes[ind + 1];
                for (var n = 0; n < this.nodes[ind + 1]; n++) {
                    var val = this.weights[ind].matrix[n][i];
                    var nextTop = y + (nextTotal * (r + indivSpacing) * 0.5) + (n * (r + indivSpacing));
                    this.DrawWeight(x, thisTop, x + layerSpacing + r, nextTop, val, maxStrokeWidth);
                }
            } else {
                fill(255);
                var val = values[i];
                val *= 1000;
                val = Math.round(val);
                val /= 1000;
                text(val, x, thisTop);
            }
        }
    }

    DrawNode(x1, y1, r, val) {
        if (val >= 0) {
            fill(50, 50, map(val, 0, 1, 75, 200));
        } else {
            fill(map(-val, 0, 1, 75, 200), 50, 50);
        }
        noStroke();
        ellipse(x1, y1, r, r);
    }

    DrawWeight(x1, y1, x2, y2, val, maxStrokeWidth) {
        if (val >= 0) {
            stroke(50, 50, map(val, 0, 1, 100, 200));
        } else {
            stroke(map(-val, 0, 1, 100, 200), 50, 50);
        }
        strokeWeight(map(Math.min(Math.abs(val), 2), 0, 1, 1, maxStrokeWidth));
        line(x1, y1, x2, y2);
    }
}