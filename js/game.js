class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.gravity = new Vector(0, 0.4);
        this.ship = new Ship(this.canvas.width / 2, 100, this.canvas.width, this.canvas.height);
        this.terrain = new Terrain(this.canvas.width, this.canvas.height);
        
        this.score = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.lastTime = 0;
        
        this.setupControls();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    setupCanvas() {
        this.canvas.width = 1200;
        this.canvas.height = 900;
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.ship.setRotation(-1);
                    break;
                case 'ArrowRight':
                    this.ship.setRotation(1);
                    break;
                case 'ArrowUp':
                    this.ship.setThrust(true);
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.ship.setRotation(0);
                    break;
                case 'ArrowUp':
                    this.ship.setThrust(false);
                    break;
                case 'r':
                    if (this.gameOver || this.gameWon) this.reset();
                    break;
            }
        });
    }

    reset() {
        this.ship = new Ship(this.canvas.width / 2, 100, this.canvas.width, this.canvas.height);
        this.score = 0;
        this.gameOver = false;
        this.gameWon = false;
        document.getElementById('score').textContent = this.score;
    }

    update(deltaTime) {
        if (this.gameOver || this.gameWon) return;

        this.ship.update(this.gravity, deltaTime);
        
        // Check collisions
        if (this.ship.checkCollision(this.terrain)) {
            this.gameOver = true;
            this.ship.alive = false;
        }

        // Check landing
        const landingCheck = this.terrain.checkLanding(this.ship);
        if (landingCheck.landed) {
            if (landingCheck.success) {
                this.gameWon = true;
                this.score += 1000; // Bonus points for successful landing
            } else {
                this.gameOver = true;
                this.ship.alive = false;
            }
        }

        // Update HUD
        document.getElementById('fuelLevel').textContent = Math.round(this.ship.fuel);
        document.getElementById('score').textContent = Math.round(this.score);

        // Update score
        this.score += deltaTime * 0.1; // Score increases based on time survived
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw game elements
        this.terrain.draw(this.ctx);
        this.ship.draw(this.ctx);

        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press R to restart', this.canvas.width/2, this.canvas.height/2 + 40);
        }
        
        // Draw victory message
        if (this.gameWon) {
            this.ctx.fillStyle = '#33ff33';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Landing Successful!', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${Math.round(this.score)}`, this.canvas.width/2, this.canvas.height/2 + 40);
            this.ctx.fillText('Press R to play again', this.canvas.width/2, this.canvas.height/2 + 80);
        }

        // Draw landing instructions when near pad
        if (!this.gameOver && !this.gameWon && 
            Math.abs(this.ship.pos.x - this.terrain.landingPad.x) < 200) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Land slowly and vertically on the green pad', 
                            this.canvas.width/2, 30);
        }
    }

    gameLoop(currentTime) {
        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};
