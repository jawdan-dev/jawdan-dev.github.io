var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1')

    c1 = new Square(100, 400, 60, 0.01);
    c2 = new Square(400, 400, 70, PI * 0.25);
}

var timeStep = 0;
var c1, c2;

var target, offset;

function draw() {
    background(50);

    timeStep += deltaTime / 1000;

    stroke(200);
    if (mouseIsPressed) {
        const mpos = new Vec2(mouseX, mouseY);
        if (target == undefined) {
            const c1m = c1.pos.subtract(mpos).magnitude() / c1.size;
            const c2m = c2.pos.subtract(mpos).magnitude() / c2.size;

            if (c1m <= 1 && c1m < c2m) {
                target = c1;
                offset = c1.pos.subtract(mpos);
            } else if (c2m <= 1 && c2m < c1m) {
                target = c2;
                offset = c2.pos.subtract(mpos);
            }
        }
        if (target != undefined) {
            target.pos = mpos.add(offset);
        }
    } else if (target != undefined) {
        target = undefined;
    }


    if (c1.checkCollision(c2)) {
        stroke(50, 255, 50);
    } else {
        stroke(255);
    }
    c1.draw();
    c2.draw();
}

function drawArrow(from, to) {

    const dir = to.subtract(from);
    const mag = dir.magnitude();
    const normal = dir.normal();
    const right = normal.cross();


    const arrowSize = 0.2;
    const arrowRight = right.multiply(mag * arrowSize).subtract(dir.multiply(arrowSize));
    const arrowLeft = right.multiply(mag * -arrowSize).subtract(dir.multiply(arrowSize));

    const thickness = Math.log(mag);

    strokeWeight(thickness);
    line(from.x, from.y, to.x, to.y);
    line(to.x, to.y, to.x + arrowRight.x, to.y + arrowRight.y);
    line(to.x, to.y, to.x + arrowLeft.x, to.y + arrowLeft.y);
    strokeWeight(1);
}

function drawAxis(normal, offset) {
    const plane = normal.cross();

    const x0 = offset.x / plane.x;
    const x1 = (offset.x - windowWidth) / plane.x;

    const y0 = offset.y / plane.y;
    const y1 = (offset.y - windowHeight) / plane.y;

    const v0 = offset.add(plane.multiply(-x0));
    const v1 = offset.add(plane.multiply(-x1));
    const v2 = offset.add(plane.multiply(-y0));
    const v3 = offset.add(plane.multiply(-y1));

    const p0 = v0.y >= 0 ? v0 : v1;
    const p1 = v2.x >= 0 ? v2 : v3;

    strokeWeight(0.5);
    line(p0.x, p0.y, p1.x, p1.y);
    strokeWeight(1);
}

class Square {
    constructor(x, y, s, r = 0) {
        this.pos = new Vec2(x, y);
        this.size = s;
        this.r = r;
    }

    checkCollision(other) {
        const mp = this.getPoints();
        const op = other.getPoints();

        stroke(50, 200, 50);
        const me0 = mp[1].subtract(mp[0]).normal().cross();
        const me1 = mp[2].subtract(mp[1]).normal().cross();
        const me01 = mp[0].add(mp[1]).divide(2);
        const me12 = mp[1].add(mp[2]).divide(2);
        drawArrow(me01, me01.add(me0.inverse().multiply(50)));
        drawArrow(me12, me12.add(me1.inverse().multiply(50)));

        stroke(50, 50, 200);
        const oe0 = op[1].subtract(op[0]).normal().cross();
        const oe1 = op[2].subtract(op[1]).normal().cross();
        const oe01 = op[0].add(op[1]).divide(2);
        const oe12 = op[1].add(op[2]).divide(2);
        drawArrow(oe01, oe01.add(oe0.inverse().multiply(50)));
        drawArrow(oe12, oe12.add(oe1.inverse().multiply(50)));

        stroke(200, 50, 50, 100);
        drawAxis(oe0.cross(), op[0]);
        drawAxis(oe1.cross(), op[1]);
        drawAxis(oe0.cross(), op[2]);
        drawAxis(oe1.cross(), op[3]);
        stroke(200, 50, 50, 100);
        drawAxis(me0.cross(), mp[0]);
        drawAxis(me1.cross(), mp[1]);
        drawAxis(me0.cross(), mp[2]);
        drawAxis(me1.cross(), mp[3]);

        noStroke();
        stroke(0, 0, 255);
        let textOffset = 10;

        const checks = [me0, me1, oe0, oe1];
        for (let i = 0; i < checks.length; i++) {
            const check1 = c1.getMinMax(checks[i]);
            const check2 = c2.getMinMax(checks[i]);

            fill(255);
            let isSeparated = check1.maxDot < check2.minDot || check2.maxDot < check1.minDot;
            if (isSeparated) { fill(255, 50, 50); }
            text(check1.minDot.toString() + " : " + check1.maxDot.toString(), 50, textOffset += 20);
            text(check2.minDot.toString() + " : " + check2.maxDot.toString(), 50, textOffset += 20);

            if (isSeparated)
                return false;
        }
        return true;
    }

    getMinMax(axis) {
        const points = this.getPoints();

        let minDot = points[0].dot(axis);
        let maxDot = points[0].dot(axis);
        for (let i = 1; i < points.length; i++) {
            let dotVal = points[i].dot(axis);

            minDot = Math.min(minDot, dotVal);
            maxDot = Math.max(maxDot, dotVal);
        }

        return {
            minDot: minDot,
            maxDot: maxDot
        };
    }

    getPoints() {
        const
            r0 = this.r + Math.PI * 0.25,
            r1 = this.r + Math.PI * 0.75,
            r2 = this.r + Math.PI * 1.25,
            r3 = this.r + Math.PI * 1.75;

        // This.size is not interpreted correctly here lol
        return [
            new Vec2(this.pos.x + (Math.sin(r0) * this.size), this.pos.y + (Math.cos(r0) * this.size)),
            new Vec2(this.pos.x + (Math.sin(r1) * this.size), this.pos.y + (Math.cos(r1) * this.size)),
            new Vec2(this.pos.x + (Math.sin(r2) * this.size), this.pos.y + (Math.cos(r2) * this.size)),
            new Vec2(this.pos.x + (Math.sin(r3) * this.size), this.pos.y + (Math.cos(r3) * this.size))
        ];
    }

    draw() {
        const p = this.getPoints();
        line(p[0].x, p[0].y, p[1].x, p[1].y);
        line(p[2].x, p[2].y, p[1].x, p[1].y);
        line(p[2].x, p[2].y, p[3].x, p[3].y);
        line(p[0].x, p[0].y, p[3].x, p[3].y);
    }
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    multiply(v) {
        if (typeof v == 'Vec2') {
            return new Vec2(this.x * v.x, this.y * v.y);
        }
        return new Vec2(this.x * v, this.y * v);
    }
    divide(v) {
        if (typeof v == 'Vec2') {
            return new Vec2(this.x / v.x, this.y / v.y);
        }
        return new Vec2(this.x / v, this.y / v);
    }

    dot(v) {
        return (this.x * v.x) + (this.y * v.y);
    }

    cross() {
        return new Vec2(this.y, -this.x);
    }

    sqrMagnitude() {
        return this.dot(this);
    }

    magnitude() {
        return Math.sqrt(this.sqrMagnitude());
    }

    normal() {
        const len = this.magnitude();
        return this.divide(len);
    }

    inverse() {
        return new Vec2(-this.x, -this.y);
    }

}