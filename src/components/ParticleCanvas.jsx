import React, { useEffect, useRef } from 'react';

/**
 * ParticleCanvas - Canvas粒子动画组件
 * 冰冷期：3D企鹅冰封场景
 * 狂热期：春江水暖鸭先知场景
 * 灰白期：雾气混沌场景
 */
export const ParticleCanvas = ({ mode = 'neutral', days = 0, phase = 'normal' }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const windParticlesRef = useRef([]);
    const ducksRef = useRef([]);
    const bubblesRef = useRef([]);
    const animationRef = useRef(null);
    const penguinRef = useRef(null);
    const timeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const getVisualIntensity = () => {
            if (mode === 'cold') {
                const phaseConfig = {
                    'chilly': { iceLevel: 0.3, particleCount: 30, penguinFrozen: 0.2, windStrength: 0.3 },
                    'freezing': { iceLevel: 0.6, particleCount: 50, penguinFrozen: 0.5, windStrength: 0.6 },
                    'frozen': { iceLevel: 0.9, particleCount: 70, penguinFrozen: 0.85, windStrength: 0.9 }
                };
                return phaseConfig[phase] || phaseConfig['chilly'];
            } else if (mode === 'hot') {
                const phaseConfig = {
                    'warming': { duckCount: 2, waterTemp: 0.3, bubbleCount: 15, waterColor: { r: 100, g: 200, b: 255 }, phase: 'warming' },
                    'heating': { duckCount: 6, waterTemp: 0.6, bubbleCount: 35, waterColor: { r: 255, g: 180, b: 100 }, phase: 'heating' },
                    'boiling': { duckCount: 12, waterTemp: 0.9, bubbleCount: 60, waterColor: { r: 255, g: 100, b: 80 }, phase: 'boiling' },
                    'exhausted': { duckCount: 4, waterTemp: 0.7, bubbleCount: 20, waterColor: { r: 200, g: 100, b: 100 }, phase: 'exhausted' }
                };
                return phaseConfig[phase] || phaseConfig['warming'];
            } else {
                if (days <= 3) return { chaos: 0.2, fogOpacity: 0.05, particleCount: 20 };
                if (days <= 7) return { chaos: 0.5, fogOpacity: 0.12, particleCount: 30 };
                return { chaos: 0.9, fogOpacity: 0.2, particleCount: 45 };
            }
        };

        const intensity = getVisualIntensity();

        // ========== 冰冷期初始化 ==========
        if (!penguinRef.current && mode === 'cold') {
            penguinRef.current = {
                x: canvas.width * 0.65,
                y: canvas.height * 0.72,
                wobble: 0,
                jumpPhase: 0
            };
        }

        const initParticles = () => {
            particlesRef.current = [];
            const count = mode === 'cold' ? intensity.particleCount : (mode === 'neutral' ? intensity.particleCount : 0);

            for (let i = 0; i < count; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: 2 + Math.random() * 3,
                    speedY: 0.5 + Math.random() * 1.5,
                    speedX: (Math.random() - 0.5) * 0.5,
                    opacity: 0.4 + Math.random() * 0.4,
                    phase: Math.random() * Math.PI * 2
                });
            }
        };

        const initWindParticles = () => {
            if (mode !== 'cold') return;
            windParticlesRef.current = [];
            const count = Math.floor(intensity.windStrength * 40);

            for (let i = 0; i < count; i++) {
                windParticlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    length: 40 + Math.random() * 80,
                    speed: 5 + Math.random() * 8,
                    opacity: 0.4 + Math.random() * 0.5,
                    thickness: 1 + Math.random() * 2
                });
            }
        };

        // ========== 狂热期初始化 ==========
        const initDucks = () => {
            if (mode !== 'hot') return;
            ducksRef.current = [];
            const count = intensity.duckCount || 0;

            for (let i = 0; i < count; i++) {
                ducksRef.current.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height * (0.5 + Math.random() * 0.3),
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 0.5,
                    wobble: Math.random() * Math.PI * 2,
                    size: 25 + Math.random() * 10,
                    direction: Math.random() > 0.5 ? 1 : -1
                });
            }
        };

        const initBubbles = () => {
            if (mode !== 'hot') return;
            bubblesRef.current = [];
            const count = intensity.bubbleCount || 0;

            for (let i = 0; i < count; i++) {
                bubblesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height * (0.6 + Math.random() * 0.4),
                    size: 2 + Math.random() * 6,
                    speed: 0.5 + Math.random() * 2,
                    opacity: 0.3 + Math.random() * 0.4,
                    wobble: Math.random() * Math.PI * 2
                });
            }
        };

        // ========== 更新函数 ==========
        const updateParticles = () => {
            if (mode === 'cold') {
                timeRef.current += 0.016;
                const windOffset = Math.sin(timeRef.current * 0.5) * intensity.windStrength * 2;

                particlesRef.current.forEach(particle => {
                    particle.y += particle.speedY;
                    particle.x += particle.speedX + windOffset;
                    particle.phase += 0.02;

                    if (particle.y > canvas.height + 10) {
                        particle.y = -10;
                        particle.x = Math.random() * canvas.width;
                    }
                    if (particle.x < -10) particle.x = canvas.width + 10;
                    if (particle.x > canvas.width + 10) particle.x = -10;
                });

                windParticlesRef.current.forEach(wind => {
                    wind.x += wind.speed * intensity.windStrength;
                    if (wind.x > canvas.width + 100) {
                        wind.x = -100;
                        wind.y = Math.random() * canvas.height;
                    }
                });
            } else if (mode === 'neutral') {
                particlesRef.current.forEach(particle => {
                    particle.y += Math.sin(Date.now() * 0.001 + particle.x) * 0.5 * intensity.chaos;
                    particle.x += particle.speedX;
                    if (Math.random() < 0.01 * intensity.chaos) {
                        particle.speedX = (Math.random() - 0.5) * intensity.chaos;
                    }
                    if (particle.x < -10) particle.x = canvas.width + 10;
                    if (particle.x > canvas.width + 10) particle.x = -10;
                });
            }
        };

        const updateDucks = () => {
            if (mode !== 'hot') return;

            ducksRef.current.forEach(duck => {
                duck.x += duck.speedX * duck.direction;
                duck.y += duck.speedY;
                duck.wobble += 0.1;

                if (duck.x < -50) duck.x = canvas.width + 50;
                if (duck.x > canvas.width + 50) duck.x = -50;
                if (duck.y < canvas.height * 0.4) duck.speedY = Math.abs(duck.speedY);
                if (duck.y > canvas.height * 0.85) duck.speedY = -Math.abs(duck.speedY);

                if (Math.random() < 0.01) {
                    duck.direction *= -1;
                }
            });
        };

        const updateBubbles = () => {
            if (mode !== 'hot') return;

            bubblesRef.current.forEach(bubble => {
                bubble.y -= bubble.speed;
                bubble.x += Math.sin(bubble.wobble) * 0.5;
                bubble.wobble += 0.05;

                if (bubble.y < canvas.height * 0.3) {
                    bubble.y = canvas.height;
                    bubble.x = Math.random() * canvas.width;
                }
            });
        };

        // ========== 绘制函数 - 春江水暖 ==========
        const drawRiver = () => {
            if (mode !== 'hot') return;

            const c = intensity.waterColor;

            // 1. 绘制太阳
            const sunY = canvas.height * 0.15;
            const sunRadius = 40 + intensity.waterTemp * 20;
            const sunGradient = ctx.createRadialGradient(
                canvas.width * 0.8, sunY, 0,
                canvas.width * 0.8, sunY, sunRadius * 2
            );
            sunGradient.addColorStop(0, `rgba(255, 220, 100, ${0.8 + intensity.waterTemp * 0.2})`);
            sunGradient.addColorStop(0.3, `rgba(255, 180, 80, ${0.5 + intensity.waterTemp * 0.3})`);
            sunGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
            ctx.fillStyle = sunGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

            const sunCoreGradient = ctx.createRadialGradient(
                canvas.width * 0.8, sunY, 0,
                canvas.width * 0.8, sunY, sunRadius
            );
            sunCoreGradient.addColorStop(0, `rgba(255, 255, 200, ${0.9 + intensity.waterTemp * 0.1})`);
            sunCoreGradient.addColorStop(0.6, `rgba(255, 200, 100, ${0.7 + intensity.waterTemp * 0.2})`);
            sunCoreGradient.addColorStop(1, `rgba(255, 150, 80, 0)`);
            ctx.fillStyle = sunCoreGradient;
            ctx.beginPath();
            ctx.arc(canvas.width * 0.8, sunY, sunRadius, 0, Math.PI * 2);
            ctx.fill();

            // 2. 远山剪影（多层）
            const mountainLayers = [
                { distance: 0.3, height: 0.28, opacity: 0.15 },
                { distance: 0.25, height: 0.32, opacity: 0.25 },
                { distance: 0.2, height: 0.35, opacity: 0.35 }
            ];

            mountainLayers.forEach(layer => {
                ctx.fillStyle = `rgba(${Math.max(c.r - 100, 50)}, ${Math.max(c.g - 100, 50)}, ${Math.max(c.b - 50, 100)}, ${layer.opacity})`;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * layer.height);
                for (let x = 0; x < canvas.width; x += 40) {
                    const y = canvas.height * (layer.height - 0.05 + Math.sin(x * 0.003 + layer.distance * 10) * 0.08);
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(canvas.width, canvas.height * 0.4);
                ctx.lineTo(0, canvas.height * 0.4);
                ctx.closePath();
                ctx.fill();
            });

            // 3. 天空渐变
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
            skyGradient.addColorStop(0, `rgba(${Math.max(200, c.r)}, ${Math.max(220, c.g)}, 255, 0.2)`);
            skyGradient.addColorStop(0.5, `rgba(${c.r}, ${c.g + 50}, ${c.b + 50}, 0.25)`);
            skyGradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0.3)`);
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

            // 4. 云朵
            const cloudCount = Math.max(3 - Math.floor(intensity.waterTemp * 3), 0);
            for (let i = 0; i < cloudCount; i++) {
                const cloudX = (canvas.width / (cloudCount + 1)) * (i + 1);
                const cloudY = canvas.height * (0.1 + i * 0.05);
                drawCloud(cloudX, cloudY, 40 + i * 10, 0.15);
            }

            // 5. 江水主体
            const waterGradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
            waterGradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.2)`);
            waterGradient.addColorStop(0.3, `rgba(${c.r}, ${c.g}, ${c.b}, 0.35)`);
            waterGradient.addColorStop(0.6, `rgba(${c.r - 20}, ${c.g - 20}, ${c.b}, 0.45)`);
            waterGradient.addColorStop(1, `rgba(${Math.max(c.r - 50, 0)}, ${Math.max(c.g - 50, 0)}, ${Math.max(c.b - 30, 0)}, 0.55)`);
            ctx.fillStyle = waterGradient;
            ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);

            // 6. 水面反光
            const reflectionGradient = ctx.createRadialGradient(
                canvas.width * 0.8, canvas.height * 0.5, 0,
                canvas.width * 0.8, canvas.height * 0.5, canvas.width * 0.4
            );
            reflectionGradient.addColorStop(0, `rgba(255, 230, 150, ${0.3 + intensity.waterTemp * 0.3})`);
            reflectionGradient.addColorStop(0.5, `rgba(255, 200, 100, ${0.15 + intensity.waterTemp * 0.2})`);
            reflectionGradient.addColorStop(1, 'rgba(255, 180, 80, 0)');
            ctx.fillStyle = reflectionGradient;
            ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.3);

            // 7. 动态水波纹
            const waveCount = 10;
            for (let i = 0; i < waveCount; i++) {
                const depth = i / waveCount;
                const y = canvas.height * (0.42 + depth * 0.5);
                const waveSpeed = 1 + i * 0.2;
                const waveHeight = (5 - depth * 3) * (1 + intensity.waterTemp * 0.5);
                const opacity = (0.2 + intensity.waterTemp * 0.2) * (1 - depth * 0.7);
                const waveWidth = 8 - depth * 5;

                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 2 - depth * 1.5;
                ctx.beginPath();

                for (let x = 0; x < canvas.width; x += waveWidth) {
                    const waveY = y + Math.sin(x * (0.01 + depth * 0.02) + timeRef.current * waveSpeed + i) * waveHeight;
                    if (x === 0) ctx.moveTo(x, waveY);
                    else ctx.lineTo(x, waveY);
                }
                ctx.stroke();
            }

            // 8. 左右岸边
            const leftBankGradient = ctx.createLinearGradient(0, canvas.height * 0.5, canvas.width * 0.15, canvas.height);
            leftBankGradient.addColorStop(0, `rgba(80, 100, 60, 0.6)`);
            leftBankGradient.addColorStop(1, `rgba(60, 80, 40, 0.8)`);
            ctx.fillStyle = leftBankGradient;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height * 0.5);
            ctx.lineTo(canvas.width * 0.15, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.fill();

            const rightBankGradient = ctx.createLinearGradient(canvas.width * 0.85, canvas.height, canvas.width, canvas.height * 0.5);
            rightBankGradient.addColorStop(0, `rgba(60, 80, 40, 0.8)`);
            rightBankGradient.addColorStop(1, `rgba(80, 100, 60, 0.6)`);
            ctx.fillStyle = rightBankGradient;
            ctx.beginPath();
            ctx.moveTo(canvas.width, canvas.height * 0.5);
            ctx.lineTo(canvas.width * 0.85, canvas.height);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();

            // 9. 芦苇
            for (let i = 0; i < 8; i++) {
                const x = canvas.width * (0.02 + i * 0.015);
                const baseY = canvas.height * (0.6 + i * 0.05);
                const height = 40 + Math.random() * 30;
                const sway = Math.sin(timeRef.current + i) * 3;

                ctx.strokeStyle = `rgba(100, 120, 80, ${0.6 - i * 0.05})`;
                ctx.lineWidth = 2 + Math.random();
                ctx.beginPath();
                ctx.moveTo(x, baseY + height);
                ctx.quadraticCurveTo(x + sway, baseY + height * 0.5, x + sway * 2, baseY);
                ctx.stroke();

                ctx.fillStyle = `rgba(150, 140, 100, ${0.5 - i * 0.04})`;
                ctx.beginPath();
                ctx.ellipse(x + sway * 2, baseY - 5, 3, 8, Math.PI / 6, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let i = 0; i < 8; i++) {
                const x = canvas.width * (0.98 - i * 0.015);
                const baseY = canvas.height * (0.6 + i * 0.05);
                const height = 40 + Math.random() * 30;
                const sway = Math.sin(timeRef.current + i + Math.PI) * 3;

                ctx.strokeStyle = `rgba(100, 120, 80, ${0.6 - i * 0.05})`;
                ctx.lineWidth = 2 + Math.random();
                ctx.beginPath();
                ctx.moveTo(x, baseY + height);
                ctx.quadraticCurveTo(x + sway, baseY + height * 0.5, x + sway * 2, baseY);
                ctx.stroke();

                ctx.fillStyle = `rgba(150, 140, 100, ${0.5 - i * 0.04})`;
                ctx.beginPath();
                ctx.ellipse(x + sway * 2, baseY - 5, 3, 8, -Math.PI / 6, 0, Math.PI * 2);
                ctx.fill();
            }

            // 10. 波光粼粼
            const sparkleCount = Math.floor(15 + intensity.waterTemp * 25);
            for (let i = 0; i < sparkleCount; i++) {
                const depth = Math.random();
                const x = canvas.width * (0.2 + Math.random() * 0.6);
                const y = canvas.height * (0.5 + depth * 0.4);
                const size = (1 + Math.random() * 2) * (1 - depth * 0.5);
                const sparkleOpacity = (Math.sin(timeRef.current * 5 + i) + 1) * 0.3 * (1 - depth * 0.3);

                ctx.fillStyle = `rgba(255, 255, 220, ${sparkleOpacity})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(255, 255, 200, ${sparkleOpacity * 0.3})`;
                ctx.beginPath();
                ctx.arc(x, y, size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const drawCloud = (x, y, size, opacity) => {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 0.7, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
            ctx.arc(x - size * 0.7, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawBubbles = () => {
            if (mode !== 'hot') return;

            bubblesRef.current.forEach(bubble => {
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, 0,
                    bubble.x, bubble.y, bubble.size
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity})`);
                gradient.addColorStop(0.5, `rgba(200, 230, 255, ${bubble.opacity * 0.5})`);
                gradient.addColorStop(1, `rgba(150, 200, 255, 0)`);
                ctx.fillStyle = gradient;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.6})`;
                ctx.fill();
            });
        };

        const drawDucks = () => {
            if (mode !== 'hot') return;

            ducksRef.current.forEach(duck => {
                ctx.save();
                ctx.translate(duck.x, duck.y);
                if (duck.direction < 0) ctx.scale(-1, 1);

                const wobbleY = Math.sin(duck.wobble) * 3;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.beginPath();
                ctx.ellipse(0, duck.size * 0.8, duck.size * 0.6, duck.size * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();

                const bodyGradient = ctx.createRadialGradient(-5, wobbleY - 5, 0, 0, wobbleY, duck.size * 0.8);
                bodyGradient.addColorStop(0, '#fef08a');
                bodyGradient.addColorStop(0.7, '#fde047');
                bodyGradient.addColorStop(1, '#facc15');
                ctx.fillStyle = bodyGradient;
                ctx.beginPath();
                ctx.ellipse(0, wobbleY, duck.size * 0.7, duck.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();

                const headGradient = ctx.createRadialGradient(-3, wobbleY - duck.size * 0.7, 0, 0, wobbleY - duck.size * 0.6, duck.size * 0.5);
                headGradient.addColorStop(0, '#fef08a');
                headGradient.addColorStop(1, '#fde047');
                ctx.fillStyle = headGradient;
                ctx.beginPath();
                ctx.arc(duck.size * 0.3, wobbleY - duck.size * 0.6, duck.size * 0.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fb923c';
                ctx.beginPath();
                ctx.ellipse(duck.size * 0.6, wobbleY - duck.size * 0.6, duck.size * 0.25, duck.size * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(duck.size * 0.4, wobbleY - duck.size * 0.7, duck.size * 0.08, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(duck.size * 0.42, wobbleY - duck.size * 0.72, duck.size * 0.03, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fde047';
                ctx.beginPath();
                ctx.ellipse(-duck.size * 0.3, wobbleY + duck.size * 0.1, duck.size * 0.3, duck.size * 0.4, -0.3, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
                ctx.lineWidth = 2;
                for (let i = 1; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.arc(0, duck.size * 0.7, duck.size * i * 0.8, 0, Math.PI * 2);
                    ctx.stroke();
                }

                ctx.restore();
            });
        };

        // ========== 绘制函数 - 冰冷期 ==========
        const drawMountains = () => {
            if (mode !== 'cold') return;

            const mountainLayers = [
                { baseHeight: 0.4, peaks: 4, color: '#7dd3fc', opacity: 0.4 },
                { baseHeight: 0.5, peaks: 5, color: '#bae6fd', opacity: 0.6 },
                { baseHeight: 0.6, peaks: 6, color: '#e0f2fe', opacity: 0.8 }
            ];

            mountainLayers.forEach((layer, idx) => {
                const baseY = canvas.height * layer.baseHeight;

                ctx.beginPath();
                ctx.moveTo(0, canvas.height);

                for (let i = 0; i <= layer.peaks; i++) {
                    const x = (canvas.width / layer.peaks) * i;
                    const peakHeight = (80 + Math.sin(i * 0.7 + idx) * 40) * intensity.iceLevel;
                    const y = baseY - peakHeight;

                    if (i === 0) {
                        ctx.lineTo(x, y);
                    } else {
                        const prevX = (canvas.width / layer.peaks) * (i - 1);
                        const cpX = (prevX + x) / 2;
                        const cpY = y - 30;
                        ctx.quadraticCurveTo(cpX, cpY, x, y);
                    }
                }

                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();

                const gradient = ctx.createLinearGradient(0, baseY - 150, 0, canvas.height);
                gradient.addColorStop(0, layer.color);
                gradient.addColorStop(0.5, '#f0f9ff');
                gradient.addColorStop(1, '#ffffff');

                ctx.fillStyle = gradient;
                ctx.globalAlpha = layer.opacity * intensity.iceLevel;
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.globalAlpha = layer.opacity * 0.6;
                ctx.stroke();

                ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = -10;
                ctx.shadowOffsetY = 10;
                ctx.fill();

                ctx.shadowColor = 'transparent';
                ctx.globalAlpha = 1;
            });
        };

        const drawPenguin = () => {
            if (mode !== 'cold' || !penguinRef.current) return;

            const penguin = penguinRef.current;
            const size = 50;
            const frozen = intensity.penguinFrozen;

            penguin.wobble += 0.08 * (1 - frozen);
            penguin.jumpPhase += 0.05 * (1 - frozen);
            const wobbleX = Math.sin(penguin.wobble) * 4 * (1 - frozen);
            const jumpY = Math.abs(Math.sin(penguin.jumpPhase)) * 8 * (1 - frozen);

            ctx.save();
            ctx.translate(penguin.x + wobbleX, penguin.y - jumpY);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(0, size + 5, size * 0.6, size * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();

            const bodyGradient = ctx.createRadialGradient(-10, -5, 0, 0, 0, size);
            bodyGradient.addColorStop(0, '#475569');
            bodyGradient.addColorStop(0.7, '#1e293b');
            bodyGradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = bodyGradient;
            ctx.globalAlpha = 1 - frozen * 0.4;
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 0.65, size * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();

            const bellyGradient = ctx.createRadialGradient(-8, 0, 0, 0, 5, size * 0.7);
            bellyGradient.addColorStop(0, '#ffffff');
            bellyGradient.addColorStop(0.8, '#f1f5f9');
            bellyGradient.addColorStop(1, '#e2e8f0');
            ctx.fillStyle = bellyGradient;
            ctx.beginPath();
            ctx.ellipse(0, 8, size * 0.45, size * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.ellipse(-28, 8, 10, 25, -0.4, 0, Math.PI * 2);
            ctx.ellipse(28, 8, 10, 25, 0.4, 0, Math.PI * 2);
            ctx.fill();

            const eyeGradient = ctx.createRadialGradient(-10, -12, 0, -10, -12, 6);
            eyeGradient.addColorStop(0, '#ffffff');
            eyeGradient.addColorStop(1, '#e2e8f0');
            ctx.fillStyle = eyeGradient;
            ctx.beginPath();
            ctx.arc(-12, -15, 6, 0, Math.PI * 2);
            ctx.arc(12, -15, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-12, -15, 3, 0, Math.PI * 2);
            ctx.arc(12, -15, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(-13, -16, 1.5, 0, Math.PI * 2);
            ctx.arc(11, -16, 1.5, 0, Math.PI * 2);
            ctx.fill();

            const beakGradient = ctx.createLinearGradient(-8, -8, 8, 0);
            beakGradient.addColorStop(0, '#fb923c');
            beakGradient.addColorStop(1, '#f97316');
            ctx.fillStyle = beakGradient;
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(-8, -2);
            ctx.lineTo(8, -2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.ellipse(-12, 42, 10, 6, 0, 0, Math.PI * 2);
            ctx.ellipse(12, 42, 10, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;

            if (frozen > 0) {
                const iceSize = size * (1.1 + frozen * 0.4);

                const iceGradient = ctx.createRadialGradient(-15, -15, 0, 0, 0, iceSize * 1.3);
                iceGradient.addColorStop(0, `rgba(219, 234, 254, ${frozen * 0.1})`);
                iceGradient.addColorStop(0.4, `rgba(191, 219, 254, ${frozen * 0.3})`);
                iceGradient.addColorStop(0.7, `rgba(147, 197, 253, ${frozen * 0.4})`);
                iceGradient.addColorStop(1, `rgba(219, 234, 254, ${frozen * 0.5})`);

                ctx.fillStyle = iceGradient;
                ctx.beginPath();
                ctx.ellipse(0, 0, iceSize, iceSize * 1.3, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(255, 255, 255, ${frozen * 0.7})`;
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.strokeStyle = `rgba(255, 255, 255, ${frozen * 0.4})`;
                ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * iceSize * 0.9, Math.sin(angle) * iceSize * 1.1);
                    ctx.stroke();
                }
            }

            ctx.restore();
        };

        const drawWind = () => {
            if (mode !== 'cold') return;

            windParticlesRef.current.forEach(wind => {
                ctx.strokeStyle = `rgba(200, 230, 255, ${wind.opacity * intensity.windStrength * 0.3})`;
                ctx.lineWidth = wind.thickness * 3;
                ctx.beginPath();
                ctx.moveTo(wind.x, wind.y);
                ctx.lineTo(wind.x + wind.length, wind.y + wind.length * 0.1);
                ctx.stroke();

                ctx.strokeStyle = `rgba(255, 255, 255, ${wind.opacity * intensity.windStrength})`;
                ctx.lineWidth = wind.thickness;
                ctx.beginPath();
                ctx.moveTo(wind.x, wind.y);
                ctx.lineTo(wind.x + wind.length, wind.y + wind.length * 0.1);
                ctx.stroke();

                ctx.strokeStyle = `rgba(255, 255, 255, ${wind.opacity * intensity.windStrength * 0.5})`;
                ctx.lineWidth = wind.thickness * 0.5;
                ctx.beginPath();
                ctx.moveTo(wind.x + wind.length * 0.3, wind.y + wind.length * 0.03);
                ctx.lineTo(wind.x + wind.length * 1.2, wind.y + wind.length * 0.12);
                ctx.stroke();
            });
        };

        const drawParticles = () => {
            particlesRef.current.forEach(particle => {
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.phase);

                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const x = Math.cos(angle) * particle.size;
                    const y = Math.sin(angle) * particle.size;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            });
        };

        const drawBackground = () => {
            if (mode === 'cold') {
                const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                skyGradient.addColorStop(0, `rgba(224, 242, 254, ${intensity.iceLevel * 0.3})`);
                skyGradient.addColorStop(0.5, `rgba(186, 230, 253, ${intensity.iceLevel * 0.4})`);
                skyGradient.addColorStop(1, `rgba(224, 242, 254, ${intensity.iceLevel * 0.5})`);
                ctx.fillStyle = skyGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (mode === 'neutral') {
                ctx.fillStyle = `rgba(148, 163, 184, ${intensity.fogOpacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        };

        // 动画循环
        const animate = () => {
            timeRef.current += 0.016;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawBackground();

            if (mode === 'cold') {
                drawMountains();
                drawWind();
                updateParticles();
                drawParticles();
                drawPenguin();
            } else if (mode === 'hot') {
                drawRiver();
                updateBubbles();
                drawBubbles();
                updateDucks();
                drawDucks();
            } else {
                updateParticles();
                drawParticles();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        initParticles();
        initWindParticles();
        initDucks();
        initBubbles();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [mode, days, phase]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1
            }}
        />
    );
};
