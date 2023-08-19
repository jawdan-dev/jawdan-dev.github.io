var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1')

    let c1 = new Square(100, 400, 60, 0.2);
    let c2 = new Square(400, 400, 90, PI * 0.34827);

    c1.velocity.x = 200;
    c1.velocity.y = 200;
    c1.calculateBBox();

    c2.velocity.x = 150;
    c2.velocity.y = -250;
    c2.calculateBBox();

    collisionObjects = [c1, c2];
}

var collisionObjects = [];

var timeStep = 0;
var target, offset;

function draw() {
    background(50);

    const delta = deltaTime / 1000;
    timeStep += delta;

    //if (c1.pos.y < 800) c1.pos.y += delta * 40;
    //if (c2.pos.y < 800) c2.pos.y += delta * 40;

    stroke(200);
    if (mouseIsPressed) {
        const mpos = new Vec2(mouseX, mouseY);
        if (target == undefined) {
            let best = Infinity;
            for (let i = 0; i < collisionObjects.length; i++) {
                const com = collisionObjects[i].pos.subtract(mpos).magnitude() / collisionObjects[i].size;

                if (com <= 1 && com < best) {
                    target = collisionObjects[i];
                    offset = collisionObjects[i].pos.subtract(mpos);
                }
            }
        }
        if (target != undefined) {
            target.pos = mpos.add(offset);
            target.calculateBBox();
        }
    } else if (target != undefined) {
        target = undefined;
    }

    for (let i = 0; i < collisionObjects.length; i++) {
        collisionObjects[i].draw();
    }

    if (collisionObjects[0].checkCollision(collisionObjects[1])) {
        fill(255);
        text("Hit!", 50, 50);
    }
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

class BBox {
    constructor(points) {
        if (Array.isArray(points)) {
            this.minX = points[0].x;
            this.minY = points[0].y;
            this.maxX = points[0].x;
            this.maxY = points[0].y;

            for (let i = 1; i < points.length; i++) {
                this.minX = Math.min(this.minX, points[i].x);
                this.minY = Math.min(this.minY, points[i].y);
                this.maxX = Math.max(this.maxX, points[i].x);
                this.maxY = Math.max(this.maxY, points[i].y);
            }
        } else {
            this.minX = points.x;
            this.minY = points.y;
            this.maxX = points.x;
            this.maxY = points.y;
        }
    }

    check(bbox) {
        return (this.minX <= bbox.maxX && this.maxX >= bbox.minX) && (this.minY <= bbox.maxY && this.maxY >= bbox.minY);
    }

    draw() {
        noFill();
        stroke(200, 50, 50, 50);
        rect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
    }
}

class Square {
    constructor(x, y, s, r = 0) {
        this.pos = new Vec2(x, y);
        this.size = s;
        this.r = r;
        this.velocity = new Vec2(0, 0);

        this.bbox = new BBox(this.getPoints());
    }

    calculateBBox() {
        this.bbox = new BBox(this.getPoints().concat(this.getPoints(1)));
    }

    checkCollision(other) {
        const mp = this.getPoints();
        const op = other.getPoints();

        const normalSize = 20;

        stroke(50, 200, 50);
        const me0 = mp[1].subtract(mp[0]).normal().cross();
        const me1 = mp[2].subtract(mp[1]).normal().cross();
        const me01 = mp[0].add(mp[1]).divide(2);
        const me12 = mp[1].add(mp[2]).divide(2);
        const me23 = mp[2].add(mp[3]).divide(2);
        const me30 = mp[3].add(mp[0]).divide(2);
        drawArrow(me01, me01.add(me0.inverse().multiply(normalSize)));
        drawArrow(me12, me12.add(me1.inverse().multiply(normalSize)));
        drawArrow(me23, me23.add(me0.multiply(normalSize)));
        drawArrow(me30, me30.add(me1.multiply(normalSize)));

        stroke(50, 50, 200);
        const oe0 = op[1].subtract(op[0]).normal().cross();
        const oe1 = op[2].subtract(op[1]).normal().cross();
        const oe01 = op[0].add(op[1]).divide(2);
        const oe12 = op[1].add(op[2]).divide(2);
        const oe23 = op[2].add(op[3]).divide(2);
        const oe30 = op[3].add(op[0]).divide(2);
        drawArrow(oe01, oe01.add(oe0.inverse().multiply(normalSize)));
        drawArrow(oe12, oe12.add(oe1.inverse().multiply(normalSize)));
        drawArrow(oe23, oe23.add(oe0.multiply(normalSize)));
        drawArrow(oe30, oe30.add(oe1.multiply(normalSize)));

        //stroke(200, 50, 50, 100);
        //drawAxis(oe0.cross(), op[0]);
        //drawAxis(oe1.cross(), op[1]);
        //drawAxis(oe0.cross(), op[2]);
        //drawAxis(oe1.cross(), op[3]);
        //stroke(200, 50, 50, 100);
        //drawAxis(me0.cross(), mp[0]);
        //drawAxis(me1.cross(), mp[1]);
        //drawAxis(me0.cross(), mp[2]);
        //drawAxis(me1.cross(), mp[3]);

        this.bbox.draw();
        other.bbox.draw();

        return this.cheapCollisionCheck(other);
    }

    bboxCheck(other, from, to) {
        const fromtos = [
            this.getPoints(from), this.getPoints(to),
            other.getPoints(from), other.getPoints(to)
        ];

        const bb1 = new BBox(
            this.getPoints(from).concat(this.getPoints(to))
        );
        const bb2 = new BBox(
            other.getPoints(from).concat(other.getPoints(to))
        );

        bb1.draw();
        bb2.draw();

        stroke(200, 20);
        for (let i = 0; i < fromtos.length; i++) {
            line(fromtos[i][0].x, fromtos[i][0].y, fromtos[i][1].x, fromtos[i][1].y);
            line(fromtos[i][2].x, fromtos[i][2].y, fromtos[i][1].x, fromtos[i][1].y);
            line(fromtos[i][2].x, fromtos[i][2].y, fromtos[i][3].x, fromtos[i][3].y);
            line(fromtos[i][0].x, fromtos[i][0].y, fromtos[i][3].x, fromtos[i][3].y);
        }

        return bb1.check(bb2);
    }

    bboxDepthCheck(other, depth, from = 0, to = 1) {
        if (depth <= 0) {
            return this.expensiveCollisionCheck(other, from);
        }
        const bbcheck = this.bboxCheck(other, from, to);
        if (!bbcheck || depth <= 0) {
            return bbcheck;
        }

        const left = this.bboxDepthCheck(other, depth - 1, from, (from + to) / 2)
        if (left) { return true; }
        const right = this.bboxDepthCheck(other, depth - 1, (from + to) / 2, to)
        return right;
    }

    cheapCollisionCheck(other) {
        return this.bboxDepthCheck(other, 8);
    }

    expensiveCollisionCheck(other, lerp, doDraw = false) {
        const mp = this.getPoints(lerp);
        const op = other.getPoints(lerp);

        const me0 = mp[1].subtract(mp[0]).normal().cross();
        const me1 = mp[2].subtract(mp[1]).normal().cross();
        const oe0 = op[1].subtract(op[0]).normal().cross();
        const oe1 = op[2].subtract(op[1]).normal().cross();


        noStroke();
        stroke(0, 0, 255);
        let textOffset = 10;

        const checks = [me0, me1, oe0, oe1];
        for (let i = 0; i < checks.length; i++) {
            const check1 = this.getMinMax(checks[i], lerp);
            const check2 = other.getMinMax(checks[i], lerp);

            let isSeparated = check1.maxDot < check2.minDot || check2.maxDot < check1.minDot;
            if (doDraw) {
                fill(255);
                if (isSeparated) { fill(255, 50, 50); }
                text(check1.minDot.toString() + " : " + check1.maxDot.toString(), 50, textOffset += 20);
                text(check2.minDot.toString() + " : " + check2.maxDot.toString(), 50, textOffset += 20);
            }

            if (isSeparated)
                return false;
        }
        return true;
    }

    getMinMax(axis, lerp) {
        const points = this.getPoints(lerp);

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

    getPoints(lerpAmount = 0) {
        const
            r0 = this.r + Math.PI * 0.25,
            r1 = this.r + Math.PI * 0.75,
            r2 = this.r + Math.PI * 1.25,
            r3 = this.r + Math.PI * 1.75;

        // This.size is not interpreted correctly here lol
        const m = Math.sqrt(2) * this.size;
        const offset = new Vec2(lerpAmount * this.velocity.x, lerpAmount * this.velocity.y);
        return [
            new Vec2(this.pos.x + (Math.sin(r0) * m), this.pos.y + (Math.cos(r0) * m)).add(offset),
            new Vec2(this.pos.x + (Math.sin(r1) * m), this.pos.y + (Math.cos(r1) * m)).add(offset),
            new Vec2(this.pos.x + (Math.sin(r2) * m), this.pos.y + (Math.cos(r2) * m)).add(offset),
            new Vec2(this.pos.x + (Math.sin(r3) * m), this.pos.y + (Math.cos(r3) * m)).add(offset)
        ];
    }

    draw() {
        if (false && (this.velocity.x != 0 || this.velocity.y != 0)) {
            stroke(255, 255, 50, 200);
            line(this.pos.x, this.pos.y, this.pos.x + this.velocity.x, this.pos.y + this.velocity.y);
            const p = this.getPoints(1);
            stroke(255, 50);
            line(p[0].x, p[0].y, p[1].x, p[1].y);
            line(p[2].x, p[2].y, p[1].x, p[1].y);
            line(p[2].x, p[2].y, p[3].x, p[3].y);
            line(p[0].x, p[0].y, p[3].x, p[3].y);
        }
        const p = this.getPoints();
        stroke(255);
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