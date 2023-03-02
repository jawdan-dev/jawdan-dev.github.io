class Matrix {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.matrix = [];
        for (var i = 0; i < this.rows; i++) {
            this.matrix[i] = [];
            for (var j = 0; j < this.columns; j++) {
                this.matrix[i][j] = 0;
            }
        }
    }
    Clone() {
        var result = new Matrix(this.rows, this.columns);
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                result.matrix[i][j] = this.matrix[i][j];
            }
        }
        return result;
    }
    toArray() {
        var result = [];
        var counter = 0;
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                result[counter] = this.matrix[i][j];
                counter++;
            }
        }
        return result;
    }
    static fromArray(arr) {
        var result = new Matrix(arr.length, 1);
        for (var i = 0; i < arr.length; i++) {
            result.matrix[i][0] = arr[i];
        }
        return result;
    }


    Randomize() {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                this.matrix[i][j] = (Math.random() * 2) - 1;
            }
        }
    }
    Map(func) {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                this.matrix[i][j] = func(this.matrix[i][j]);
            }
        }
    }
    Transpose() {
        var result = new Matrix(this.columns, this.rows);
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                result.matrix[j][i] = this.matrix[i][j];
            }
        }
        return result;
    }


    Add(v) {
        if (v instanceof Matrix) {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.columns; j++) {
                    this.matrix[i][j] += v.matrix[i][j];
                }
            }
        } else {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.columns; j++) {
                    this.matrix[i][j] += v;
                }
            }
        }
    }
    Subtract(v) {
        if (v instanceof Matrix) {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.columns; j++) {
                    this.matrix[i][j] -= v.matrix[i][j];
                }
            }
        } else {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.columns; j++) {
                    this.matrix[i][j] -= v;
                }
            }
        }
    }
    Multiply(v) {
        if (v instanceof Matrix) {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.columns; j++) {
                    this.matrix[i][j] *= v.matrix[i][j];
                }
            }
        } else {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.columns; j++) {
                    this.matrix[i][j] *= v;
                }
            }
        }
    }
    Dot(m) {
        if (this.columns != m.rows) { return null; }

        var result = new Matrix(this.rows, m.columns);
        for (var i = 0; i < result.rows; i++) {
            for (var j = 0; j < result.columns; j++) {
                var sum = 0;
                for (var k = 0; k < this.columns; k++) {
                    sum += this.matrix[i][k] * m.matrix[k][j];
                }
                result.matrix[i][j] = sum;
            }
        }
        return result;
    }
}