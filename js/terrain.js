class Terrain {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.points = [];
        this.generateTerrain();
    }

    generateTerrain() {
        // Start and end points
        this.points.push(new Vector(0, this.height * 0.7));
        
        // Generate terrain points using Perlin-like noise
        const segments = 20;
        const segmentWidth = this.width / segments;
        
        for (let i = 1; i < segments; i++) {
            const x = i * segmentWidth;
            const heightVariation = Math.sin(i * 0.5) * 100 + Math.random() * 50;
            const y = this.height * 0.7 + heightVariation;
            this.points.push(new Vector(x, y));
        }

        // Add final point
        this.points.push(new Vector(this.width, this.height * 0.7));

        // Add landing pad (flat section of terrain)
        const padWidth = 80;
        const padX = this.width * 0.7;
        const padY = this.height * 0.6;
        
        this.landingPad = {
            x: padX,
            y: padY,
            width: padWidth,
            height: 10,
            safeSpeed: 50, // Maximum safe landing speed
            safeAngle: 0.2 // Maximum angle deviation from vertical (in radians)
        };

        // Add cave system (simplified for now)
        this.caves = [
            {
                x: this.width * 0.3,
                y: this.height * 0.7,
                width: 100,
                height: 80
            }
        ];
    }

    draw(ctx) {
        // Draw terrain
        ctx.beginPath();
        ctx.strokeStyle = '#33ff33';
        ctx.lineWidth = 2;
        
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            // If we're near the landing pad, draw the flat section
            if (this.points[i].x >= this.landingPad.x && 
                this.points[i-1].x <= this.landingPad.x + this.landingPad.width) {
                ctx.lineTo(this.landingPad.x, this.landingPad.y);
                ctx.lineTo(this.landingPad.x + this.landingPad.width, this.landingPad.y);
                continue;
            }
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        // Complete the terrain shape
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();
        ctx.stroke();

        // Draw landing pad
        ctx.beginPath();
        ctx.fillStyle = '#33ff33';
        ctx.fillRect(this.landingPad.x, this.landingPad.y, this.landingPad.width, this.landingPad.height);
        
        // Draw landing pad lights
        const lightCount = 4;
        const lightSpacing = this.landingPad.width / (lightCount + 1);
        ctx.fillStyle = '#ffff00';
        for (let i = 1; i <= lightCount; i++) {
            ctx.beginPath();
            ctx.arc(this.landingPad.x + i * lightSpacing, this.landingPad.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw caves
        this.caves.forEach(cave => {
            ctx.beginPath();
            ctx.fillStyle = '#000000';
            ctx.ellipse(cave.x, cave.y, cave.width/2, cave.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#33ff33';
            ctx.stroke();
        });
    }

    checkCollision(x, y) {
        // Check if point is on landing pad
        if (x >= this.landingPad.x && x <= this.landingPad.x + this.landingPad.width &&
            Math.abs(y - this.landingPad.y) <= this.landingPad.height) {
            return false; // No collision on landing pad
        }

        // Simple point-in-polygon collision detection
        let inside = false;
        const points = [...this.points, new Vector(this.width, this.height), new Vector(0, this.height)];
        
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;
            
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        // Check if point is inside any cave (safe zone)
        const inCave = this.caves.some(cave => {
            const dx = x - cave.x;
            const dy = y - cave.y;
            return (dx * dx) / (cave.width * cave.width / 4) + (dy * dy) / (cave.height * cave.height / 4) <= 1;
        });

        return inside && !inCave;
    }

    checkLanding(ship) {
        // Check if ship is above landing pad
        if (ship.pos.x >= this.landingPad.x && 
            ship.pos.x <= this.landingPad.x + this.landingPad.width) {
            
            // Check if ship is touching the pad
            const touchingPad = Math.abs(ship.pos.y - this.landingPad.y) <= ship.size;
            
            if (touchingPad) {
                // Check landing conditions
                const speed = ship.vel.magnitude();
                const angleFromVertical = Math.abs((ship.angle + Math.PI/2) % (Math.PI * 2));
                
                return {
                    landed: true,
                    success: speed < this.landingPad.safeSpeed && angleFromVertical < this.landingPad.safeAngle
                };
            }
        }
        return { landed: false, success: false };
    }
}
