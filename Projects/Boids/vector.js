class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }    
}

Vector2.prototype.Add = function (v2) {
    return new Vector2(this.x + v2.x, this.y + v2.y);
}

Vector2.prototype.Subtract = function (v2) {
    return new Vector2(this.x - v2.x, this.y - v2.y);
}

Vector2.prototype.Multiply = function (v2) {
    return new Vector2(this.x * v2.x, this.y * v2.y);
}
Vector2.prototype.Multiply = function (f) {
    return new Vector2(this.x * f, this.y * f);
}

Vector2.prototype.Divide = function (v2) {
    return new Vector2(this.x / v2.x, this.y / v2.y);
}
Vector2.prototype.Divide = function (f) {
    return new Vector2(this.x / f, this.y / f);
}

Vector2.prototype.Magnitude = function() {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
}

Vector2.prototype.Normal = function() {
    var m = this.Magnitude();
    if (m == 0) { return new Vector2(0, 0); }
    return this.Divide(m);
}
Vector2.prototype.Normalize = function() {
    var m = this.Magnitude();
    if (m != 0) { 
        this.x /= m;
        this.y /= m;
    }
}

Vector2.prototype.Dot = function(v2) {
    return (this.x * v2.x) + (this.y * v2.y);
}
Vector2.prototype.Cross = function(v2) {
    return (this.x * v2.y) + (this.y * v2.x);
}
Vector2.prototype.Cross = function() {
    return new Vector2(this.y, -this.x);
}

Vector2.prototype.Inverse = function() {
    return new Vector2(-this.x, -this.y);
}

Vector2.prototype.Limit = function(f) {
    var m = this.Magnitude();
    if (m > f) {
        this.x /= m;    this.y /= m;
        this.x *= f;    this.y *= f;
    }
}