class Ship {
    constructor(x, y, canvasWidth, canvasHeight) {
        this.pos = new Vector(x, y);
        this.vel = new Vector();
        this.acc = new Vector();
        this.angle = -Math.PI / 2; // Start pointing upward
        this.rotation = 0;
        this.thrusting = false;
        this.fuel = 100;
        this.size = 15;
        this.alive = true;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Constants for movement
        this.ROTATION_SPEED = 6; // Radians per second
        this.THRUST_FORCE = 200; // Pixels per second squared
        this.DRAG = 0.1; // Drag coefficient
    }

    update(gravity, deltaTime) {
        if (!deltaTime) return; // Prevent division by zero

        // Apply rotation (radians per second)
        this.angle += this.rotation * this.ROTATION_SPEED * deltaTime;

        // Apply thrust if active and has fuel
        if (this.thrusting && this.fuel > 0) {
            const force = Vector.fromAngle(this.angle).multiply(this.THRUST_FORCE * deltaTime);
            this.acc = this.acc.add(force);
            this.fuel = Math.max(0, this.fuel - 20 * deltaTime); // Consume fuel per second
        }

        // Apply gravity scaled by time
        this.acc = this.acc.add(gravity.multiply(deltaTime * 60));

        // Update velocity with acceleration
        this.vel = this.vel.add(this.acc);

        // Apply drag (air resistance)
        this.vel = this.vel.multiply(1 - this.DRAG * deltaTime);

        // Update position
        this.pos = this.pos.add(this.vel.multiply(deltaTime));

        // Reset acceleration
        this.acc = new Vector();

        // Wrap around screen
        if (this.pos.x < 0) this.pos.x = this.canvasWidth;
        if (this.pos.x > this.canvasWidth) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = this.canvasHeight;
        if (this.pos.y > this.canvasHeight) this.pos.y = 0;
    }

    draw(ctx) {
        if (!this.alive) return;

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);

        // Draw ship
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.moveTo(-this.size, -this.size);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.lineTo(-this.size * 0.5, 0);
        ctx.lineTo(-this.size, -this.size);
        ctx.stroke();

        // Draw thrust
        if (this.thrusting && this.fuel > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#ff3300';
            ctx.moveTo(-this.size, 0);
            ctx.lineTo(-this.size - Math.random() * 20, 0);
            ctx.stroke();
        }

        ctx.restore();
    }

    setRotation(dir) {
        this.rotation = dir * 0.1;
    }

    setThrust(on) {
        this.thrusting = on;
    }

    checkCollision(terrain) {
        // Simple point collision for now
        const points = [
            this.pos,
            this.pos.add(Vector.fromAngle(this.angle).multiply(this.size)),
            this.pos.add(Vector.fromAngle(this.angle + Math.PI * 0.8).multiply(this.size)),
            this.pos.add(Vector.fromAngle(this.angle - Math.PI * 0.8).multiply(this.size))
        ];

        return points.some(point => terrain.checkCollision(point.x, point.y));
    }
}
