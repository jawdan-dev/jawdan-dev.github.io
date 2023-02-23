
const getChance = chance => { return random() < chance; }
const getRandomInt = max => { return Math.floor(random() * max);; }

var NEAT = new class __NEATCLASS {
    constructor(config) {
        const checkInput = (value, fallback, type = undefined, checkFunc = a => { return true; }) => {
            if (value != undefined && (type == undefined || value instanceof type) && checkFunc(value)) {
                return value;
            }
            return fallback;
        }

        this.biasNode = checkInput(config.outputNodeCount, true, Boolean);

        this.inputNodeCount = checkInput(config.inputNodeCount, 1, Number, a => { return a.isInteger() });
        if (this.biasNode) this.inputNodeCount++;
        this.outputNodeCount = checkInput(config.outputNodeCount, 1, Number, a => { return a.isInteger() });

        this.globalConnections = [];
        
        
        this.Connection = class Connection {
            constructor()

            }
        }
    }
}
