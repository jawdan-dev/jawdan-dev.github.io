
class Perceptron {
    constructor(size) {
        this.size = size + 1;
        //this.w = [1.0, -0.4, -0.1];
        this.w = [];
        for (let i = 0; i < this.size; i++) {
            this.w[i] = (Math.random() * 2) - 1;
        }
    }
    feed(data) {
        data[this.size - 1] = 1;
        let out = 0;
        for (let i = 0; i < this.size; i++) {
            out += this.w[i] * data[i];
        }
        return (out);
    }
    train(learningData) {
        let errorSum = [];
        for (let i = 0; i < this.size; i++) {
            errorSum[i] = 0;
        }

        //let n = Math.floor(Math.random() * learningData.length);

        for (let n = 0; n < learningData.length; n++) {
            let data = learningData[n];

            let tdata = [];
            for (let i = 0; i < data.length - 1; i++) {
                tdata[i] = data[i];
            }
            tdata[this.size - 1] = 1;
            let target = data[data.length - 1];

            let out = 0;
            for (let i = 0; i < tdata.length; i++) {
                out += this.w[i] * tdata[i];
            }

            let value = activationFunction(out);
            let dif = (target - value);

            for (let i = 0; i < tdata.length; i++) {
                if (dif > 0) {
                    errorSum[i] += tdata[i];
                } else if (dif < 0) {
                    errorSum[i] -= tdata[i];
                }
            }
        }

        for (let i = 0; i < this.size && i < errorSum.length; i++) {
            this.w[i] += errorSum[i] * learningRate;
        }
    }
}