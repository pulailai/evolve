import React, { useEffect, useRef } from 'react';
import './CanvasEnhancementLayer.css';
import { getPoemForPhase } from '../config/phasePoems';

/**
 * CanvasEnhancementLayer - 环境画布增强层
 * 添加光影、特效、交互反馈等立体化效果
 */
export const CanvasEnhancementLayer = ({ mode = 'neutral', phase = 'normal', intensity = 0.5 }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const timeRef = useRef(0);
    const ripplesRef = useRef([]);
    const flamesRef = useRef([]);
    const snowflakesRef = useRef([]);
    const fogLayersRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // 火焰粒子创建
        const createFlame = () => ({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 50,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -(1 + Math.random() * 2),
            size: 3 + Math.random() * 8,
            life: 1,
            decay: 0.01 + Math.random() * 0.02,
            color: Math.random() > 0.5 ? '#ff6b35' : '#f7931e'
        });

        // 雪花创建
        const createSnowflake = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            z: Math.random() * 1000,
            vx: (Math.random() - 0.5) * 0.3,
            vy: 0.5 + Math.random() * 1.5,
            size: 2 + Math.random() * 4,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        });

        // 初始化特效
        const initializeEffects = () => {
            if (mode === 'hot') {
                flamesRef.current = [];
                const count = phase === 'boiling' ? 40 : phase === 'heating' ? 25 : 15;
                for (let i = 0; i < count; i++) {
                    flamesRef.current.push(createFlame());
                }
            } else if (mode === 'cold') {
                snowflakesRef.current = [];
                const count = phase === 'frozen' ? 60 : phase === 'freezing' ? 40 : 25;
                for (let i = 0; i < count; i++) {
                    snowflakesRef.current.push(createSnowflake());
                }
            } else {
                fogLayersRef.current = [
                    { y: 0, speed: 0.1, opacity: 0.1 },
                    { y: canvas.height * 0.3, speed: 0.15, opacity: 0.15 },
                    { y: canvas.height * 0.6, speed: 0.08, opacity: 0.12 }
                ];
            }
        };

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initializeEffects();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 环境光渲染
        const renderAmbientLight = () => {
            if (mode === 'hot') {
                const gradient = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, canvas.width * 0.8
                );
                const alpha = intensity * 0.15;
                gradient.addColorStop(0, `rgba(255, 100, 50, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(255, 150, 80, ${alpha * 0.5})`);
                gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (mode === 'cold') {
                const gradient = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, canvas.width * 0.8
                );
                const alpha = intensity * 0.12;
                gradient.addColorStop(0, `rgba(100, 200, 255, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(150, 220, 255, ${alpha * 0.5})`);
                gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        };

        // 火焰粒子渲染
        const renderFlames = () => {
            flamesRef.current.forEach((flame, index) => {
                flame.x += flame.vx;
                flame.y += flame.vy;
                flame.life -= flame.decay;

                if (flame.life <= 0 || flame.y < -50) {
                    flamesRef.current[index] = createFlame();
                    return;
                }

                ctx.save();
                ctx.globalAlpha = flame.life * 0.8;
                ctx.globalCompositeOperation = 'lighter';

                const gradient = ctx.createRadialGradient(
                    flame.x, flame.y, 0,
                    flame.x, flame.y, flame.size
                );
                gradient.addColorStop(0, flame.color);
                gradient.addColorStop(0.5, '#ff9500');
                gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(flame.x, flame.y, flame.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        };

        // 雪花渲染
        const renderSnowflakes = () => {
            snowflakesRef.current.forEach((snow, index) => {
                snow.x += snow.vx;
                snow.y += snow.vy;
                snow.rotation += snow.rotationSpeed;

                if (snow.y > canvas.height + 50) {
                    snowflakesRef.current[index] = createSnowflake();
                    return;
                }

                const scale = 1000 / (1000 + snow.z);
                const alpha = Math.max(0.3, 1 - snow.z / 1000);
                const size = snow.size * scale;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(snow.x, snow.y);
                ctx.rotate(snow.rotation);

                ctx.strokeStyle = '#e0f2fe';
                ctx.lineWidth = 1.5 * scale;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
                }
                ctx.stroke();
                ctx.restore();
            });
        };

        // 雾气渲染
        const renderFog = () => {
            fogLayersRef.current.forEach(layer => {
                layer.y += layer.speed;
                if (layer.y > canvas.height) layer.y = -100;

                ctx.save();
                ctx.globalAlpha = layer.opacity;
                const gradient = ctx.createLinearGradient(0, layer.y, 0, layer.y + 200);
                gradient.addColorStop(0, 'rgba(200, 200, 200, 0)');
                gradient.addColorStop(0.5, 'rgba(220, 220, 220, 0.3)');
                gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, layer.y, canvas.width, 200);
                ctx.restore();
            });
        };

        // 波纹渲染
        const renderRipples = () => {
            ripplesRef.current = ripplesRef.current.filter(ripple => {
                ripple.radius += 2;
                ripple.alpha -= 0.02;

                if (ripple.alpha <= 0) return false;

                ctx.save();
                ctx.globalAlpha = ripple.alpha;
                ctx.strokeStyle = mode === 'hot' ? '#ff6b35' : mode === 'cold' ? '#60a5fa' : '#9ca3af';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                return true;
            });
        };

        // 诗句渲染（发光漂浮效果 - 竖排）
        const renderPoem = () => {
            const poem = getPoemForPhase(mode, phase);
            if (!poem) return;

            const { text, position, color } = poem;
            const lines = text.split('\n');

            // 计算位置（竖排从右到左）
            const startX = position === 'left' ? canvas.width * 0.2 : canvas.width * 0.8;
            const startY = canvas.height * 0.2;

            // 漂浮动画
            const floatOffset = Math.sin(timeRef.current * 0.5) * 10;

            ctx.save();
            ctx.font = 'bold 36px "STKaiti", "KaiTi", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            // 竖排渲染（从右到左，每列一句）
            lines.forEach((line, lineIndex) => {
                const chars = line.split('');
                const columnX = startX - lineIndex * 60 + floatOffset * 0.5; // 列间距50px

                chars.forEach((char, charIndex) => {
                    const y = startY + charIndex * 48; // 字符间距40px

                    // 发光效果（多层阴影）
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 20;
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.3;
                    ctx.fillText(char, columnX, y);

                    ctx.shadowBlur = 15;
                    ctx.globalAlpha = 0.5;
                    ctx.fillText(char, columnX, y);

                    ctx.shadowBlur = 10;
                    ctx.globalAlpha = 0.8;
                    ctx.fillText(char, columnX, y);

                    // 主文字
                    ctx.shadowBlur = 5;
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(char, columnX, y);
                });
            });

            ctx.restore();
        };

        // 主动画循环
        const animate = () => {
            timeRef.current += 0.016;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            renderAmbientLight();

            if (mode === 'hot') {
                renderFlames();
            } else if (mode === 'cold') {
                renderSnowflakes();
            } else {
                renderFog();
            }

            renderRipples();

            // 诗句
            renderPoem();

            animationRef.current = requestAnimationFrame(animate);
        };

        // 鼠标交互
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (Math.random() > 0.9) {
                ripplesRef.current.push({ x, y, radius: 0, alpha: 0.6 });
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        initializeEffects();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [mode, phase, intensity]);

    return (
        <canvas
            ref={canvasRef}
            className="canvas-enhancement-layer"
        />
    );
};
