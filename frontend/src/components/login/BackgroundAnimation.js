import React, { useEffect, useRef } from 'react';
import '../../styles/BackgroundAnimation.css';

const BackgroundAnimation = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let lines = [];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Line {
            constructor() {
                this.x1 = Math.random() * canvas.width;
                this.y1 = Math.random() * canvas.height;
                const angle = Math.random() * Math.PI * 2;
                const length = Math.random() * 200 + 100;
                this.x2 = this.x1 + Math.cos(angle) * length;
                this.y2 = this.y1 + Math.sin(angle) * length;
                this.progress = 0;
                this.speed = Math.random() * 0.01 + 0.005;
                this.life = 1;
                this.isDrawn = false;
                this.color = Math.random() < 0.1 ? '#b8860b' : 'rgba(255, 255, 255, 0.4)';
            }

            update() {
                if (this.progress < 1) {
                    this.progress += this.speed;
                } else {
                    this.isDrawn = true;
                }
                
                if (this.isDrawn) {
                    this.life -= 0.005;
                }
            }

            draw() {
                ctx.beginPath();
                const currentX = this.x1 + (this.x2 - this.x1) * this.progress;
                const currentY = this.y1 + (this.y2 - this.y1) * this.progress;
                ctx.moveTo(this.x1, this.y1);
                ctx.lineTo(currentX, currentY);
                
                ctx.strokeStyle = this.color.replace('0.4', this.life * 0.4);
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (lines.length < 20 && Math.random() < 0.1) {
                lines.push(new Line());
            }

            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i];
                line.update();
                line.draw();
                
                if (line.life <= 0) {
                    lines.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        };
        animate();

        // Cleanup function
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas id="background-canvas" ref={canvasRef}></canvas>;
};

export default BackgroundAnimation;