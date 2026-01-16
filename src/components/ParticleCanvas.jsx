import React, { useEffect, useRef } from 'react';

/**
 * ParticleCanvas - Canvas粒子动画组件
 * 冰冷期：3D企鹅冰封场景
 * 狂热期：春江水暖鸭先知场景
 * 高位震荡期（exhausted）：秋水长天场景
 * 灰白期：雾气混沌场景
 */
export const ParticleCanvas = ({ mode = 'neutral', days = 0, phase = 'normal' }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const windParticlesRef = useRef([]);
    const ducksRef = useRef([]);
    const bubblesRef = useRef([]);
    const leavesRef = useRef([]);      // 秋叶
    const geeseRef = useRef([]);       // 大雁
    const sectorWheelsRef = useRef([]); // 板块轮动轮
    const chaosParticlesRef = useRef([]); // 乱纪元粒子
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
                    'exhausted': {
                        duckCount: 0, // 秋水长天不显示鸭子
                        waterTemp: 0.4,
                        bubbleCount: 5,
                        waterColor: { r: 120, g: 140, b: 160 }, // 灰蓝色调
                        phase: 'exhausted',
                        leafCount: 25,      // 落叶数量
                        geeseCount: 8,      // 大雁数量
                        isAutumn: true      // 标记为秋天场景
                    }
                };
                return phaseConfig[phase] || phaseConfig['warming'];
            } else {
                // 乱纪元/轮动市场配置
                const phaseConfig = {
                    'normal': {
                        chaos: 0.5,
                        sectorCount: 5,         // 板块轮数
                        rotationSpeed: 1,       // 轮动速度
                        particleCount: 40,
                        colorShift: 0.5         // 颜色变换速度
                    },
                    'mild': {
                        chaos: 0.3,
                        sectorCount: 3,
                        rotationSpeed: 0.5,
                        particleCount: 25,
                        colorShift: 0.3
                    },
                    'intense': {
                        chaos: 0.9,
                        sectorCount: 8,
                        rotationSpeed: 2,
                        particleCount: 60,
                        colorShift: 1.0
                    }
                };

                // 根据天数动态选择强度
                let selectedPhase = 'normal';
                if (days <= 3) selectedPhase = 'mild';
                else if (days >= 7) selectedPhase = 'intense';

                return phaseConfig[selectedPhase];
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

        // ========== 秋水长天初始化 ==========
        const initLeaves = () => {
            if (mode !== 'hot' || !intensity.isAutumn) return;
            leavesRef.current = [];
            const count = intensity.leafCount || 20;

            for (let i = 0; i < count; i++) {
                leavesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 0.8,
                    size: 8 + Math.random() * 12,
                    speedX: (Math.random() - 0.3) * 1.5,  // 略微偏右飘落
                    speedY: 0.5 + Math.random() * 1.5,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    type: Math.floor(Math.random() * 3),  // 0: 枫叶, 1: 银杏, 2: 普通叶
                    color: Math.random() > 0.3 ?
                        `hsl(${30 + Math.random() * 20}, ${70 + Math.random() * 20}%, ${50 + Math.random() * 20}%)` :  // 橙黄色
                        `hsl(${0 + Math.random() * 15}, ${60 + Math.random() * 20}%, ${45 + Math.random() * 15}%)`    // 红褐色
                });
            }
        };

        const initGeese = () => {
            if (mode !== 'hot' || !intensity.isAutumn) return;
            geeseRef.current = [];
            const count = intensity.geeseCount || 6;

            // 创建V字形雁群
            const centerX = canvas.width * 0.5;
            const centerY = canvas.height * 0.2;

            for (let i = 0; i < count; i++) {
                const side = i % 2 === 0 ? 1 : -1;  // 左右交替
                const row = Math.floor(i / 2);

                geeseRef.current.push({
                    x: centerX + side * (row + 1) * 40,
                    y: centerY + (row + 1) * 25,
                    baseX: centerX + side * (row + 1) * 40,
                    baseY: centerY + (row + 1) * 25,
                    wingPhase: Math.random() * Math.PI * 2,
                    driftX: 0,
                    driftY: 0,
                    hesitation: Math.random()  // 犹豫程度，影响飞行稳定性
                });
            }
        };

        // ========== 乱纪元/轮动市场初始化 ==========
        const initSectorWheels = () => {
            if (mode !== 'neutral') return;
            sectorWheelsRef.current = [];
            const count = intensity.sectorCount || 5;

            // 板块颜色（代表不同行业）
            const sectorColors = [
                { name: '科技', hue: 200, symbol: '💻' },
                { name: '金融', hue: 45, symbol: '💰' },
                { name: '消费', hue: 340, symbol: '🛒' },
                { name: '医药', hue: 120, symbol: '💊' },
                { name: '能源', hue: 25, symbol: '⚡' },
                { name: '地产', hue: 280, symbol: '🏠' },
                { name: '军工', hue: 0, symbol: '🎯' },
                { name: '新能源', hue: 160, symbol: '🌱' }
            ];

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i;
                const distance = 80 + Math.random() * 100;

                sectorWheelsRef.current.push({
                    x: canvas.width * 0.5 + Math.cos(angle) * distance,
                    y: canvas.height * 0.5 + Math.sin(angle) * distance,
                    radius: 30 + Math.random() * 40,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1 * intensity.rotationSpeed,
                    orbitSpeed: (Math.random() - 0.5) * 0.02 * intensity.rotationSpeed,
                    orbitAngle: angle,
                    orbitRadius: distance,
                    sector: sectorColors[i % sectorColors.length],
                    isHot: Math.random() > 0.7,  // 30%几率是热点
                    hotPhase: Math.random() * Math.PI * 2,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        };

        const initChaosParticles = () => {
            if (mode !== 'neutral') return;
            chaosParticlesRef.current = [];
            const count = intensity.particleCount || 40;

            for (let i = 0; i < count; i++) {
                // 随机方向的粒子
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3 * intensity.chaos;

                chaosParticlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 2 + Math.random() * 4,
                    hue: Math.random() * 360,
                    opacity: 0.3 + Math.random() * 0.5,
                    trail: [],
                    maxTrail: 5 + Math.floor(Math.random() * 10),
                    directionChangeTimer: Math.random() * 100
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

        // ========== 秋水长天更新函数 ==========
        const updateLeaves = () => {
            if (mode !== 'hot' || !intensity.isAutumn) return;

            leavesRef.current.forEach(leaf => {
                // 飘落运动
                leaf.x += leaf.speedX + Math.sin(timeRef.current + leaf.rotation) * 0.5;
                leaf.y += leaf.speedY;
                leaf.rotation += leaf.rotationSpeed;

                // 边界重置
                if (leaf.y > canvas.height + 20) {
                    leaf.y = -20;
                    leaf.x = Math.random() * canvas.width;
                }
                if (leaf.x < -20) leaf.x = canvas.width + 20;
                if (leaf.x > canvas.width + 20) leaf.x = -20;
            });
        };

        const updateGeese = () => {
            if (mode !== 'hot' || !intensity.isAutumn) return;

            const time = timeRef.current;

            // 整体缓慢移动（犹豫不决的感觉）
            const groupDriftX = Math.sin(time * 0.3) * 30;
            const groupDriftY = Math.sin(time * 0.2) * 15;

            geeseRef.current.forEach((goose, idx) => {
                // 翅膀扇动
                goose.wingPhase += 0.15;

                // 个体犹豫抖动
                const hesitationX = Math.sin(time * 2 + idx) * goose.hesitation * 8;
                const hesitationY = Math.cos(time * 1.5 + idx * 0.5) * goose.hesitation * 5;

                // 更新位置
                goose.x = goose.baseX + groupDriftX + hesitationX;
                goose.y = goose.baseY + groupDriftY + hesitationY;
            });
        };

        // ========== 乱纪元/轮动市场更新函数 ==========
        const updateSectorWheels = () => {
            if (mode !== 'neutral') return;
            const time = timeRef.current;

            sectorWheelsRef.current.forEach((wheel, idx) => {
                // 自转
                wheel.rotation += wheel.rotationSpeed;

                // 公转（绕中心）
                wheel.orbitAngle += wheel.orbitSpeed;
                wheel.x = canvas.width * 0.5 + Math.cos(wheel.orbitAngle) * wheel.orbitRadius;
                wheel.y = canvas.height * 0.5 + Math.sin(wheel.orbitAngle) * wheel.orbitRadius;

                // 热点闪烁
                wheel.hotPhase += 0.1;
                wheel.pulsePhase += 0.08;

                // 随机切换热点（轮动效果）
                if (Math.random() < 0.005 * intensity.chaos) {
                    wheel.isHot = !wheel.isHot;
                }

                // 随机改变轨道速度（方向不确定）
                if (Math.random() < 0.01 * intensity.chaos) {
                    wheel.orbitSpeed = (Math.random() - 0.5) * 0.03 * intensity.rotationSpeed;
                }
            });
        };

        const updateChaosParticles = () => {
            if (mode !== 'neutral') return;

            chaosParticlesRef.current.forEach(particle => {
                // 保存轨迹
                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > particle.maxTrail) {
                    particle.trail.shift();
                }

                // 移动
                particle.x += particle.vx;
                particle.y += particle.vy;

                // 边界反弹
                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.vx *= -1;
                    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                }
                if (particle.y < 0 || particle.y > canvas.height) {
                    particle.vy *= -1;
                    particle.y = Math.max(0, Math.min(canvas.height, particle.y));
                }

                // 随机改变方向（体现"乱"）
                particle.directionChangeTimer--;
                if (particle.directionChangeTimer <= 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
                    particle.vx = Math.cos(angle) * speed;
                    particle.vy = Math.sin(angle) * speed;
                    particle.directionChangeTimer = 30 + Math.random() * 70;
                    particle.hue = (particle.hue + 30) % 360;  // 颜色也变
                }
            });
        };

        // ========== 绘制函数 - 乱纪元/轮动市场 ==========
        const drawChaoticEra = () => {
            if (mode !== 'neutral') return;

            const time = timeRef.current;
            const centerX = canvas.width * 0.5;
            const centerY = canvas.height * 0.5;

            // 1. 深空背景
            const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height));
            const hueShift = (time * 10 * intensity.colorShift) % 360;
            bgGradient.addColorStop(0, `hsla(${hueShift}, 30%, 15%, 0.95)`);
            bgGradient.addColorStop(0.5, `hsla(${(hueShift + 60) % 360}, 25%, 10%, 0.9)`);
            bgGradient.addColorStop(1, `hsla(${(hueShift + 120) % 360}, 20%, 5%, 0.85)`);
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. 中央漩涡（代表市场核心的不确定性）
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(time * 0.5 * intensity.rotationSpeed);

            for (let i = 0; i < 6; i++) {
                const armAngle = (Math.PI * 2 / 6) * i;
                const armLength = 150 + Math.sin(time + i) * 30;

                ctx.strokeStyle = `hsla(${(hueShift + i * 60) % 360}, 60%, 50%, ${0.15 + Math.sin(time * 2 + i) * 0.1})`;
                ctx.lineWidth = 3 - i * 0.3;
                ctx.beginPath();

                for (let r = 20; r < armLength; r += 5) {
                    const spiralAngle = armAngle + r * 0.03;
                    const x = Math.cos(spiralAngle) * r;
                    const y = Math.sin(spiralAngle) * r;
                    if (r === 20) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            ctx.restore();

            // 3. 板块轮动轮
            sectorWheelsRef.current.forEach((wheel, idx) => {
                ctx.save();
                ctx.translate(wheel.x, wheel.y);
                ctx.rotate(wheel.rotation);

                // 轮盘外圈
                const wheelGlow = wheel.isHot ? 0.8 : 0.3;
                const pulseScale = wheel.isHot ? 1 + Math.sin(wheel.pulsePhase) * 0.1 : 1;

                ctx.strokeStyle = `hsla(${wheel.sector.hue}, 70%, 60%, ${wheelGlow})`;
                ctx.lineWidth = wheel.isHot ? 4 : 2;
                ctx.beginPath();
                ctx.arc(0, 0, wheel.radius * pulseScale, 0, Math.PI * 2);
                ctx.stroke();

                // 热点光晕
                if (wheel.isHot) {
                    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, wheel.radius * 1.5);
                    glowGradient.addColorStop(0, `hsla(${wheel.sector.hue}, 80%, 60%, 0.4)`);
                    glowGradient.addColorStop(0.5, `hsla(${wheel.sector.hue}, 70%, 50%, 0.2)`);
                    glowGradient.addColorStop(1, `hsla(${wheel.sector.hue}, 60%, 40%, 0)`);
                    ctx.fillStyle = glowGradient;
                    ctx.beginPath();
                    ctx.arc(0, 0, wheel.radius * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 内部分割线（像轮盘）
                const segments = 6;
                for (let i = 0; i < segments; i++) {
                    const segAngle = (Math.PI * 2 / segments) * i;
                    ctx.strokeStyle = `hsla(${wheel.sector.hue}, 50%, 50%, 0.3)`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(segAngle) * wheel.radius * pulseScale, Math.sin(segAngle) * wheel.radius * pulseScale);
                    ctx.stroke();
                }

                // 中心文字（板块名称）
                ctx.rotate(-wheel.rotation);  // 取消旋转使文字正立
                ctx.fillStyle = `hsla(${wheel.sector.hue}, 70%, ${wheel.isHot ? 80 : 60}%, ${wheel.isHot ? 1 : 0.7})`;
                ctx.font = `bold ${wheel.isHot ? 14 : 11}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(wheel.sector.name, 0, 0);

                ctx.restore();
            });

            // 4. 混乱粒子流
            chaosParticlesRef.current.forEach(particle => {
                // 绘制尾迹
                if (particle.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
                    particle.trail.forEach((point, i) => {
                        ctx.lineTo(point.x, point.y);
                    });
                    ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity * 0.3})`;
                    ctx.lineWidth = particle.size * 0.5;
                    ctx.stroke();
                }

                // 粒子本体
                ctx.fillStyle = `hsla(${particle.hue}, 80%, 65%, ${particle.opacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // 5. 方向箭头（随机指向，体现"方向不定"）
            const arrowCount = 4;
            for (let i = 0; i < arrowCount; i++) {
                const arrowAngle = (time * 0.5 + i * Math.PI / 2) % (Math.PI * 2);
                const arrowX = centerX + Math.cos(arrowAngle + i) * 180;
                const arrowY = centerY + Math.sin(arrowAngle + i) * 120;
                const pointAngle = arrowAngle + Math.sin(time * 2 + i) * 1;  // 摇摆指向

                ctx.save();
                ctx.translate(arrowX, arrowY);
                ctx.rotate(pointAngle);

                ctx.fillStyle = `hsla(${(i * 90 + hueShift) % 360}, 60%, 55%, 0.5)`;
                ctx.beginPath();
                ctx.moveTo(20, 0);
                ctx.lineTo(-10, -8);
                ctx.lineTo(-5, 0);
                ctx.lineTo(-10, 8);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }

            // 6. "乱纪元"标题提示
            ctx.fillStyle = `hsla(${hueShift}, 40%, 70%, ${0.3 + Math.sin(time) * 0.1})`;
            ctx.font = 'bold 16px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ 轮动博弈 ⚡', centerX, canvas.height - 30);
        };

        // ========== 绘制函数 - 春江水暖 (3D增强版) ==========
        const drawRiver = () => {
            if (mode !== 'hot') return;

            const c = intensity.waterColor;
            const time = timeRef.current;

            // 1. 天空渐变背景
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.45);
            skyGradient.addColorStop(0, `rgba(${Math.min(c.r + 100, 255)}, ${Math.min(c.g + 80, 255)}, 255, 0.9)`);
            skyGradient.addColorStop(0.4, `rgba(${c.r}, ${c.g + 30}, ${c.b + 50}, 0.7)`);
            skyGradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0.5)`);
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.45);

            // 2. 太阳（带光晕和丁达尔效果）
            const sunX = canvas.width * 0.78;
            const sunY = canvas.height * 0.12;
            const sunRadius = 35 + intensity.waterTemp * 25;

            // 丁达尔光束
            const rayCount = 8;
            for (let i = 0; i < rayCount; i++) {
                const angle = (Math.PI * 2 / rayCount) * i + time * 0.1;
                const rayLength = 150 + Math.sin(time * 2 + i) * 30;
                const rayWidth = 15 + intensity.waterTemp * 10;

                ctx.save();
                ctx.translate(sunX, sunY);
                ctx.rotate(angle);

                const rayGradient = ctx.createLinearGradient(0, 0, rayLength, 0);
                rayGradient.addColorStop(0, `rgba(255, 240, 200, ${0.3 + intensity.waterTemp * 0.2})`);
                rayGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

                ctx.fillStyle = rayGradient;
                ctx.beginPath();
                ctx.moveTo(sunRadius * 0.8, -rayWidth / 2);
                ctx.lineTo(rayLength, -rayWidth * 0.1);
                ctx.lineTo(rayLength, rayWidth * 0.1);
                ctx.lineTo(sunRadius * 0.8, rayWidth / 2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // 太阳光晕
            const sunGlowGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
            sunGlowGradient.addColorStop(0, `rgba(255, 255, 220, ${0.9 + intensity.waterTemp * 0.1})`);
            sunGlowGradient.addColorStop(0.2, `rgba(255, 220, 150, ${0.6 + intensity.waterTemp * 0.2})`);
            sunGlowGradient.addColorStop(0.5, `rgba(255, 180, 100, ${0.2 + intensity.waterTemp * 0.1})`);
            sunGlowGradient.addColorStop(1, 'rgba(255, 150, 80, 0)');
            ctx.fillStyle = sunGlowGradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
            ctx.fill();

            // 太阳本体
            const sunCoreGradient = ctx.createRadialGradient(sunX - 5, sunY - 5, 0, sunX, sunY, sunRadius);
            sunCoreGradient.addColorStop(0, '#fffef0');
            sunCoreGradient.addColorStop(0.5, '#fff5c0');
            sunCoreGradient.addColorStop(1, '#ffd54f');
            ctx.fillStyle = sunCoreGradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
            ctx.fill();

            // 3. 远山剪影（多层透视 + 雾气）
            const mountainLayers = [
                { distance: 0.9, baseY: 0.22, amplitude: 0.06, color: [180, 200, 220], opacity: 0.25 },
                { distance: 0.7, baseY: 0.28, amplitude: 0.08, color: [140, 170, 190], opacity: 0.4 },
                { distance: 0.5, baseY: 0.34, amplitude: 0.1, color: [100, 140, 160], opacity: 0.55 },
                { distance: 0.3, baseY: 0.38, amplitude: 0.07, color: [70, 110, 130], opacity: 0.7 }
            ];

            mountainLayers.forEach((layer, idx) => {
                ctx.fillStyle = `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.opacity})`;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * layer.baseY);

                for (let x = 0; x <= canvas.width; x += 20) {
                    const noise1 = Math.sin(x * 0.005 + layer.distance * 5) * layer.amplitude;
                    const noise2 = Math.sin(x * 0.015 + idx * 2) * layer.amplitude * 0.3;
                    const y = canvas.height * (layer.baseY - noise1 - noise2);
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(canvas.width, canvas.height * 0.45);
                ctx.lineTo(0, canvas.height * 0.45);
                ctx.closePath();
                ctx.fill();
            });

            // 4. 云朵（立体感增强）
            const cloudCount = Math.max(4 - Math.floor(intensity.waterTemp * 2), 1);
            for (let i = 0; i < cloudCount; i++) {
                const cloudX = canvas.width * (0.1 + i * 0.25) + Math.sin(time * 0.2 + i) * 20;
                const cloudY = canvas.height * (0.08 + (i % 2) * 0.06);
                const cloudSize = 30 + i * 8;

                // 云朵阴影
                ctx.fillStyle = 'rgba(180, 190, 200, 0.15)';
                drawCloudShape(ctx, cloudX + 5, cloudY + 5, cloudSize);

                // 云朵主体
                const cloudGradient = ctx.createRadialGradient(cloudX - cloudSize * 0.3, cloudY - cloudSize * 0.2, 0, cloudX, cloudY, cloudSize * 1.5);
                cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                cloudGradient.addColorStop(0.5, 'rgba(245, 248, 255, 0.7)');
                cloudGradient.addColorStop(1, 'rgba(220, 230, 245, 0.3)');
                ctx.fillStyle = cloudGradient;
                drawCloudShape(ctx, cloudX, cloudY, cloudSize);
            }

            // 5. 江水主体（深度渐变）
            const waterStartY = canvas.height * 0.42;
            const waterGradient = ctx.createLinearGradient(0, waterStartY, 0, canvas.height);
            waterGradient.addColorStop(0, `rgba(${c.r + 30}, ${c.g + 40}, ${c.b + 30}, 0.3)`);
            waterGradient.addColorStop(0.2, `rgba(${c.r}, ${c.g + 20}, ${c.b + 20}, 0.45)`);
            waterGradient.addColorStop(0.5, `rgba(${c.r - 20}, ${c.g}, ${c.b + 10}, 0.6)`);
            waterGradient.addColorStop(1, `rgba(${Math.max(c.r - 60, 30)}, ${Math.max(c.g - 40, 50)}, ${Math.max(c.b - 20, 80)}, 0.75)`);
            ctx.fillStyle = waterGradient;
            ctx.fillRect(0, waterStartY, canvas.width, canvas.height - waterStartY);

            // 6. 水面倒影（远山 + 太阳）
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.scale(1, -0.4);
            ctx.translate(0, -canvas.height * 2.8);

            // 倒影远山
            mountainLayers.slice(2).forEach((layer, idx) => {
                ctx.fillStyle = `rgba(${layer.color[0] - 20}, ${layer.color[1] - 20}, ${layer.color[2]}, ${layer.opacity * 0.5})`;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * layer.baseY);
                for (let x = 0; x <= canvas.width; x += 30) {
                    const noise1 = Math.sin(x * 0.005 + layer.distance * 5) * layer.amplitude;
                    const y = canvas.height * (layer.baseY - noise1);
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(canvas.width, canvas.height * 0.45);
                ctx.lineTo(0, canvas.height * 0.45);
                ctx.closePath();
                ctx.fill();
            });

            // 倒影太阳
            const reflectSunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
            reflectSunGradient.addColorStop(0, 'rgba(255, 230, 180, 0.4)');
            reflectSunGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            ctx.fillStyle = reflectSunGradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // 7. 太阳在水面的光路
            const sunReflectGradient = ctx.createLinearGradient(sunX, waterStartY, sunX, canvas.height);
            sunReflectGradient.addColorStop(0, `rgba(255, 240, 180, ${0.4 + intensity.waterTemp * 0.2})`);
            sunReflectGradient.addColorStop(0.3, `rgba(255, 220, 150, ${0.25 + intensity.waterTemp * 0.15})`);
            sunReflectGradient.addColorStop(1, 'rgba(255, 180, 100, 0)');

            ctx.beginPath();
            ctx.moveTo(sunX - 60, waterStartY);
            for (let y = waterStartY; y < canvas.height; y += 5) {
                const progress = (y - waterStartY) / (canvas.height - waterStartY);
                const waveOffset = Math.sin(y * 0.05 + time * 2) * (20 + progress * 40);
                ctx.lineTo(sunX - 30 * (1 - progress) + waveOffset, y);
            }
            for (let y = canvas.height; y > waterStartY; y -= 5) {
                const progress = (y - waterStartY) / (canvas.height - waterStartY);
                const waveOffset = Math.sin(y * 0.05 + time * 2 + 1) * (20 + progress * 40);
                ctx.lineTo(sunX + 30 * (1 - progress) + waveOffset, y);
            }
            ctx.closePath();
            ctx.fillStyle = sunReflectGradient;
            ctx.fill();

            // 8. 动态水波纹（透视效果）
            const waveCount = 12;
            for (let i = 0; i < waveCount; i++) {
                const depth = i / waveCount;
                const y = waterStartY + (canvas.height - waterStartY) * (depth * 0.9 + 0.05);
                const waveSpeed = 0.8 + (1 - depth) * 0.8;
                const waveHeight = (4 - depth * 3) * (1 + intensity.waterTemp * 0.6);
                const opacity = (0.15 + intensity.waterTemp * 0.15) * (1 - depth * 0.6);
                const wavelength = 6 + depth * 10;

                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 1.5 - depth;
                ctx.beginPath();

                for (let x = 0; x < canvas.width; x += wavelength) {
                    const waveY = y + Math.sin(x * (0.015 - depth * 0.008) + time * waveSpeed + i * 0.5) * waveHeight;
                    if (x === 0) ctx.moveTo(x, waveY);
                    else ctx.lineTo(x, waveY);
                }
                ctx.stroke();
            }

            // 9. 两岸（透视增强）
            // 左岸
            const leftBankGradient = ctx.createLinearGradient(0, waterStartY, canvas.width * 0.18, canvas.height);
            leftBankGradient.addColorStop(0, 'rgba(60, 90, 50, 0.7)');
            leftBankGradient.addColorStop(0.5, 'rgba(50, 75, 40, 0.85)');
            leftBankGradient.addColorStop(1, 'rgba(40, 60, 30, 0.95)');
            ctx.fillStyle = leftBankGradient;
            ctx.beginPath();
            ctx.moveTo(0, waterStartY + 20);
            ctx.quadraticCurveTo(canvas.width * 0.05, canvas.height * 0.6, canvas.width * 0.12, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.fill();

            // 右岸
            const rightBankGradient = ctx.createLinearGradient(canvas.width, waterStartY, canvas.width * 0.82, canvas.height);
            rightBankGradient.addColorStop(0, 'rgba(60, 90, 50, 0.7)');
            rightBankGradient.addColorStop(0.5, 'rgba(50, 75, 40, 0.85)');
            rightBankGradient.addColorStop(1, 'rgba(40, 60, 30, 0.95)');
            ctx.fillStyle = rightBankGradient;
            ctx.beginPath();
            ctx.moveTo(canvas.width, waterStartY + 20);
            ctx.quadraticCurveTo(canvas.width * 0.95, canvas.height * 0.6, canvas.width * 0.88, canvas.height);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();

            // 10. 芦苇（动态摇曳 + 深度）
            drawReeds(ctx, canvas, time, 'left');
            drawReeds(ctx, canvas, time, 'right');

            // 11. 柳树垂枝（新增）
            drawWillowBranches(ctx, canvas, time);

            // 12. 波光粼粼（深度感）
            const sparkleCount = Math.floor(20 + intensity.waterTemp * 30);
            for (let i = 0; i < sparkleCount; i++) {
                const depth = Math.random();
                const x = canvas.width * (0.15 + Math.random() * 0.7);
                const y = waterStartY + (canvas.height - waterStartY) * (0.1 + depth * 0.8);
                const size = (1.5 + Math.random() * 2) * (1 - depth * 0.6);
                const flickerSpeed = 4 + Math.random() * 3;
                const sparkleOpacity = (Math.sin(time * flickerSpeed + i * 0.7) + 1) * 0.35 * (1 - depth * 0.4);

                if (sparkleOpacity > 0.1) {
                    // 光点核心
                    ctx.fillStyle = `rgba(255, 255, 240, ${sparkleOpacity})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();

                    // 光点晕染
                    ctx.fillStyle = `rgba(255, 250, 220, ${sparkleOpacity * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        // 云朵形状辅助函数
        const drawCloudShape = (ctx, x, y, size) => {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 0.8, y - size * 0.1, size * 0.75, 0, Math.PI * 2);
            ctx.arc(x - size * 0.6, y + size * 0.1, size * 0.6, 0, Math.PI * 2);
            ctx.arc(x + size * 0.3, y - size * 0.4, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        };

        // 芦苇绘制函数
        const drawReeds = (ctx, canvas, time, side) => {
            const count = 10;
            const baseX = side === 'left' ? 0 : canvas.width;
            const xDir = side === 'left' ? 1 : -1;

            for (let i = 0; i < count; i++) {
                const depth = i / count;
                const x = baseX + xDir * canvas.width * (0.01 + depth * 0.08);
                const baseY = canvas.height * (0.55 + depth * 0.15);
                const height = 50 + depth * 40;
                const sway = Math.sin(time * 1.5 + i * 0.8) * (3 + depth * 4);
                const thickness = 2.5 - depth * 1.5;
                const opacity = 0.7 - depth * 0.3;

                // 茎
                ctx.strokeStyle = `rgba(90, 110, 70, ${opacity})`;
                ctx.lineWidth = thickness;
                ctx.beginPath();
                ctx.moveTo(x, baseY + height);
                ctx.quadraticCurveTo(x + sway * 0.5, baseY + height * 0.5, x + sway, baseY);
                ctx.stroke();

                // 穗
                ctx.fillStyle = `rgba(160, 140, 100, ${opacity * 0.9})`;
                ctx.beginPath();
                ctx.ellipse(x + sway, baseY - 8, 4 - depth * 2, 12 - depth * 5, (side === 'left' ? 1 : -1) * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        // 柳树垂枝绘制函数
        const drawWillowBranches = (ctx, canvas, time) => {
            const branchSets = [
                { x: canvas.width * 0.08, startY: canvas.height * 0.35, count: 6 },
                { x: canvas.width * 0.92, startY: canvas.height * 0.38, count: 5 }
            ];

            branchSets.forEach(set => {
                for (let i = 0; i < set.count; i++) {
                    const startX = set.x + (i - set.count / 2) * 8;
                    const length = 60 + Math.random() * 40;
                    const sway = Math.sin(time * 0.8 + i * 0.5) * 8;

                    ctx.strokeStyle = `rgba(80, 100, 60, ${0.4 - i * 0.05})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(startX, set.startY);
                    ctx.quadraticCurveTo(
                        startX + sway,
                        set.startY + length * 0.6,
                        startX + sway * 1.5,
                        set.startY + length
                    );
                    ctx.stroke();

                    // 柳叶
                    for (let j = 0; j < 4; j++) {
                        const leafY = set.startY + length * (0.3 + j * 0.2);
                        const leafX = startX + sway * (0.3 + j * 0.2);
                        const leafSway = Math.sin(time * 1.2 + j) * 3;

                        ctx.fillStyle = `rgba(100, 140, 80, ${0.5 - j * 0.1})`;
                        ctx.beginPath();
                        ctx.ellipse(leafX + leafSway, leafY, 2, 8, 0.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });
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

            const waterStartY = canvas.height * 0.42;
            const waterRange = canvas.height - waterStartY;

            // 按Y坐标排序（远的先画）
            const sortedDucks = [...ducksRef.current].sort((a, b) => a.y - b.y);

            sortedDucks.forEach(duck => {
                // 根据Y位置计算深度因子（0=最远，1=最近）
                const depthFactor = Math.max(0, Math.min(1, (duck.y - waterStartY) / waterRange));
                const scale = 0.5 + depthFactor * 0.7; // 0.5 ~ 1.2倍
                const scaledSize = duck.size * scale;

                ctx.save();
                ctx.translate(duck.x, duck.y);
                if (duck.direction < 0) ctx.scale(-1, 1);

                const wobbleY = Math.sin(duck.wobble) * 3 * scale;
                const time = timeRef.current;

                // 水波涟漪（鸭子划过的痕迹）
                const rippleCount = 3;
                for (let r = 0; r < rippleCount; r++) {
                    const rippleAge = (time * 2 + r * 0.8) % 3;
                    const rippleSize = scaledSize * (0.8 + rippleAge * 0.6);
                    const rippleOpacity = Math.max(0, 0.25 - rippleAge * 0.1) * (0.5 + depthFactor * 0.5);

                    if (rippleOpacity > 0.02) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${rippleOpacity})`;
                        ctx.lineWidth = 1.5 - rippleAge * 0.3;
                        ctx.beginPath();
                        ctx.ellipse(-r * 15 * duck.direction, scaledSize * 0.6, rippleSize, rippleSize * 0.3, 0, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }

                // 鸭子水下阴影
                ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + depthFactor * 0.1})`;
                ctx.beginPath();
                ctx.ellipse(0, scaledSize * 0.7, scaledSize * 0.6, scaledSize * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();

                // 鸭子身体（立体渐变）
                const bodyGradient = ctx.createRadialGradient(
                    -scaledSize * 0.15, wobbleY - scaledSize * 0.1, 0,
                    0, wobbleY, scaledSize * 0.8
                );
                bodyGradient.addColorStop(0, '#fffbeb');
                bodyGradient.addColorStop(0.4, '#fef08a');
                bodyGradient.addColorStop(0.8, '#fde047');
                bodyGradient.addColorStop(1, '#eab308');
                ctx.fillStyle = bodyGradient;
                ctx.beginPath();
                ctx.ellipse(0, wobbleY, scaledSize * 0.7, scaledSize * 0.55, 0, 0, Math.PI * 2);
                ctx.fill();

                // 身体高光
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.ellipse(-scaledSize * 0.2, wobbleY - scaledSize * 0.2, scaledSize * 0.25, scaledSize * 0.15, -0.5, 0, Math.PI * 2);
                ctx.fill();

                // 鸭子头部
                const headGradient = ctx.createRadialGradient(
                    scaledSize * 0.25, wobbleY - scaledSize * 0.75, 0,
                    scaledSize * 0.3, wobbleY - scaledSize * 0.6, scaledSize * 0.45
                );
                headGradient.addColorStop(0, '#fffbeb');
                headGradient.addColorStop(0.6, '#fef08a');
                headGradient.addColorStop(1, '#fde047');
                ctx.fillStyle = headGradient;
                ctx.beginPath();
                ctx.arc(scaledSize * 0.3, wobbleY - scaledSize * 0.55, scaledSize * 0.38, 0, Math.PI * 2);
                ctx.fill();

                // 鸭嘴
                const beakGradient = ctx.createLinearGradient(
                    scaledSize * 0.5, wobbleY - scaledSize * 0.6,
                    scaledSize * 0.8, wobbleY - scaledSize * 0.55
                );
                beakGradient.addColorStop(0, '#fb923c');
                beakGradient.addColorStop(1, '#ea580c');
                ctx.fillStyle = beakGradient;
                ctx.beginPath();
                ctx.ellipse(scaledSize * 0.65, wobbleY - scaledSize * 0.55, scaledSize * 0.22, scaledSize * 0.12, 0.1, 0, Math.PI * 2);
                ctx.fill();

                // 眼睛
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(scaledSize * 0.4, wobbleY - scaledSize * 0.65, scaledSize * 0.07, 0, Math.PI * 2);
                ctx.fill();

                // 眼睛高光
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(scaledSize * 0.42, wobbleY - scaledSize * 0.67, scaledSize * 0.025, 0, Math.PI * 2);
                ctx.fill();

                // 翅膀（有扇动动画）
                const wingFlap = Math.sin(duck.wobble * 1.5) * 0.15;
                ctx.fillStyle = '#fcd34d';
                ctx.beginPath();
                ctx.ellipse(
                    -scaledSize * 0.25,
                    wobbleY + scaledSize * 0.05,
                    scaledSize * 0.28,
                    scaledSize * 0.38,
                    -0.3 + wingFlap,
                    0, Math.PI * 2
                );
                ctx.fill();

                // 翅膀纹理
                ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-scaledSize * 0.35, wobbleY);
                ctx.quadraticCurveTo(-scaledSize * 0.2, wobbleY + scaledSize * 0.15, -scaledSize * 0.1, wobbleY + scaledSize * 0.3);
                ctx.stroke();

                ctx.restore();
            });
        };

        // ========== 绘制函数 - 秋水长天 (exhausted阶段) ==========
        const drawAutumnScene = () => {
            if (mode !== 'hot' || !intensity.isAutumn) return;

            const time = timeRef.current;
            const c = intensity.waterColor;

            // 1. 秋日天空（灰蒙蒙带暖意）
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
            skyGradient.addColorStop(0, 'rgba(180, 190, 210, 0.95)');
            skyGradient.addColorStop(0.3, 'rgba(200, 190, 180, 0.85)');
            skyGradient.addColorStop(0.6, 'rgba(220, 200, 180, 0.75)');
            skyGradient.addColorStop(1, 'rgba(200, 180, 160, 0.6)');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

            // 2. 阳光穿透云层（不确定的希望）
            const sunX = canvas.width * 0.65;
            const sunY = canvas.height * 0.15;

            // 云层遮挡的太阳
            const sunGlowGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 120);
            sunGlowGradient.addColorStop(0, 'rgba(255, 240, 200, 0.4)');
            sunGlowGradient.addColorStop(0.3, 'rgba(255, 220, 180, 0.25)');
            sunGlowGradient.addColorStop(0.6, 'rgba(255, 200, 160, 0.1)');
            sunGlowGradient.addColorStop(1, 'rgba(255, 180, 140, 0)');
            ctx.fillStyle = sunGlowGradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
            ctx.fill();

            // 偶尔穿透云层的光束
            const beamOpacity = (Math.sin(time * 0.5) + 1) * 0.15;
            if (beamOpacity > 0.1) {
                ctx.save();
                ctx.globalAlpha = beamOpacity;
                const beamGradient = ctx.createLinearGradient(sunX, sunY, sunX, canvas.height);
                beamGradient.addColorStop(0, 'rgba(255, 240, 200, 0.5)');
                beamGradient.addColorStop(1, 'rgba(255, 220, 180, 0)');
                ctx.fillStyle = beamGradient;
                ctx.beginPath();
                ctx.moveTo(sunX - 30, sunY);
                ctx.lineTo(sunX - 80, canvas.height);
                ctx.lineTo(sunX + 80, canvas.height);
                ctx.lineTo(sunX + 30, sunY);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // 3. 远山（秋色层叠）
            const autumnMountains = [
                { baseY: 0.25, amplitude: 0.05, color: [160, 150, 140], opacity: 0.3 },
                { baseY: 0.32, amplitude: 0.07, color: [140, 120, 100], opacity: 0.45 },
                { baseY: 0.38, amplitude: 0.06, color: [120, 100, 80], opacity: 0.6 }
            ];

            autumnMountains.forEach((layer, idx) => {
                ctx.fillStyle = `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.opacity})`;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * layer.baseY);

                for (let x = 0; x <= canvas.width; x += 25) {
                    const noise = Math.sin(x * 0.006 + idx * 3) * layer.amplitude;
                    const y = canvas.height * (layer.baseY - noise);
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(canvas.width, canvas.height * 0.5);
                ctx.lineTo(0, canvas.height * 0.5);
                ctx.closePath();
                ctx.fill();
            });

            // 4. 秋日湖水（沉静的灰蓝色）
            const waterStartY = canvas.height * 0.45;
            const waterGradient = ctx.createLinearGradient(0, waterStartY, 0, canvas.height);
            waterGradient.addColorStop(0, `rgba(${c.r + 30}, ${c.g + 30}, ${c.b + 20}, 0.4)`);
            waterGradient.addColorStop(0.3, `rgba(${c.r + 10}, ${c.g + 10}, ${c.b + 10}, 0.55)`);
            waterGradient.addColorStop(0.7, `rgba(${c.r - 10}, ${c.g - 10}, ${c.b}, 0.7)`);
            waterGradient.addColorStop(1, `rgba(${c.r - 30}, ${c.g - 20}, ${c.b - 10}, 0.8)`);
            ctx.fillStyle = waterGradient;
            ctx.fillRect(0, waterStartY, canvas.width, canvas.height - waterStartY);

            // 5. 水面微弱的阳光倒影
            const reflectGradient = ctx.createRadialGradient(sunX, waterStartY + 50, 0, sunX, waterStartY + 100, 150);
            reflectGradient.addColorStop(0, 'rgba(255, 240, 200, 0.2)');
            reflectGradient.addColorStop(0.5, 'rgba(255, 220, 180, 0.1)');
            reflectGradient.addColorStop(1, 'rgba(255, 200, 160, 0)');
            ctx.fillStyle = reflectGradient;
            ctx.fillRect(sunX - 150, waterStartY, 300, 150);

            // 6. 水波纹（平静而略显萧瑟）
            const waveCount = 8;
            for (let i = 0; i < waveCount; i++) {
                const depth = i / waveCount;
                const y = waterStartY + (canvas.height - waterStartY) * (depth * 0.85 + 0.1);
                const waveSpeed = 0.4 + (1 - depth) * 0.4;
                const waveHeight = (2 - depth * 1.5) * 1.2;
                const opacity = 0.12 * (1 - depth * 0.5);

                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 1 - depth * 0.5;
                ctx.beginPath();

                for (let x = 0; x < canvas.width; x += 8) {
                    const waveY = y + Math.sin(x * 0.012 + time * waveSpeed + i * 0.7) * waveHeight;
                    if (x === 0) ctx.moveTo(x, waveY);
                    else ctx.lineTo(x, waveY);
                }
                ctx.stroke();
            }

            // 7. 枯萎的芦苇（秋色）
            drawAutumnReeds(ctx, canvas, time);

            // 8. 水面漂浮的落叶
            drawFloatingLeaves(ctx, canvas, time);
        };

        // 秋季芦苇
        const drawAutumnReeds = (ctx, canvas, time) => {
            const positions = [
                { baseX: 0.02, count: 8, side: 'left' },
                { baseX: 0.98, count: 7, side: 'right' }
            ];

            positions.forEach(pos => {
                for (let i = 0; i < pos.count; i++) {
                    const depth = i / pos.count;
                    const x = canvas.width * (pos.side === 'left' ? pos.baseX + depth * 0.06 : pos.baseX - depth * 0.06);
                    const baseY = canvas.height * (0.5 + depth * 0.18);
                    const height = 60 + depth * 50;
                    const sway = Math.sin(time * 1.2 + i * 0.6) * (4 + depth * 5);
                    const thickness = 2.5 - depth * 1.2;
                    const opacity = 0.65 - depth * 0.25;

                    // 枯黄色茎
                    ctx.strokeStyle = `rgba(140, 120, 80, ${opacity})`;
                    ctx.lineWidth = thickness;
                    ctx.beginPath();
                    ctx.moveTo(x, baseY + height);
                    ctx.quadraticCurveTo(x + sway * 0.6, baseY + height * 0.5, x + sway, baseY);
                    ctx.stroke();

                    // 蓬松的穗（秋天干枯）
                    ctx.fillStyle = `rgba(180, 160, 120, ${opacity * 0.8})`;
                    ctx.beginPath();
                    ctx.ellipse(x + sway, baseY - 10, 5 - depth * 2, 15 - depth * 6, (pos.side === 'left' ? 1 : -1) * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        };

        // 水面漂浮的落叶
        const drawFloatingLeaves = (ctx, canvas, time) => {
            const floatingLeaves = [
                { x: 0.2, y: 0.55, size: 10, rotation: 0.3 },
                { x: 0.35, y: 0.6, size: 8, rotation: 1.2 },
                { x: 0.5, y: 0.52, size: 12, rotation: 0.8 },
                { x: 0.7, y: 0.58, size: 9, rotation: 2.1 },
                { x: 0.85, y: 0.54, size: 11, rotation: 1.5 }
            ];

            floatingLeaves.forEach((leaf, idx) => {
                const x = canvas.width * leaf.x + Math.sin(time * 0.5 + idx) * 15;
                const y = canvas.height * leaf.y + Math.sin(time * 0.3 + idx * 0.7) * 5;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(leaf.rotation + Math.sin(time * 0.4 + idx) * 0.2);

                // 落叶形状
                ctx.fillStyle = `hsl(${35 + idx * 5}, 70%, ${50 + idx * 3}%)`;
                ctx.beginPath();
                ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();

                // 叶脉
                ctx.strokeStyle = `hsl(${30 + idx * 5}, 50%, 40%)`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(-leaf.size * 0.8, 0);
                ctx.lineTo(leaf.size * 0.8, 0);
                ctx.stroke();

                // 水面涟漪
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.ellipse(0, leaf.size * 0.3, leaf.size * 1.5, leaf.size * 0.4, 0, 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();
            });
        };

        // 绘制飘落的树叶
        const drawLeaves = () => {
            if (mode !== 'hot' || !intensity.isAutumn) return;

            leavesRef.current.forEach(leaf => {
                ctx.save();
                ctx.translate(leaf.x, leaf.y);
                ctx.rotate(leaf.rotation);

                // 根据叶子类型绘制不同形状
                ctx.fillStyle = leaf.color;

                if (leaf.type === 0) {
                    // 枫叶形状（简化版）
                    ctx.beginPath();
                    ctx.moveTo(0, -leaf.size * 0.8);
                    ctx.lineTo(leaf.size * 0.5, -leaf.size * 0.3);
                    ctx.lineTo(leaf.size * 0.8, 0);
                    ctx.lineTo(leaf.size * 0.4, leaf.size * 0.3);
                    ctx.lineTo(0, leaf.size * 0.8);
                    ctx.lineTo(-leaf.size * 0.4, leaf.size * 0.3);
                    ctx.lineTo(-leaf.size * 0.8, 0);
                    ctx.lineTo(-leaf.size * 0.5, -leaf.size * 0.3);
                    ctx.closePath();
                    ctx.fill();
                } else if (leaf.type === 1) {
                    // 银杏扇形
                    ctx.beginPath();
                    ctx.moveTo(0, leaf.size * 0.5);
                    ctx.quadraticCurveTo(-leaf.size, -leaf.size * 0.3, 0, -leaf.size * 0.7);
                    ctx.quadraticCurveTo(leaf.size, -leaf.size * 0.3, 0, leaf.size * 0.5);
                    ctx.fill();
                } else {
                    // 普通椭圆叶
                    ctx.beginPath();
                    ctx.ellipse(0, 0, leaf.size * 0.4, leaf.size * 0.8, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 叶脉
                ctx.strokeStyle = 'rgba(100, 70, 40, 0.3)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -leaf.size * 0.6);
                ctx.lineTo(0, leaf.size * 0.6);
                ctx.stroke();

                ctx.restore();
            });
        };

        // 绘制犹豫的大雁
        const drawGeese = () => {
            if (mode !== 'hot' || !intensity.isAutumn) return;

            geeseRef.current.forEach((goose, idx) => {
                ctx.save();
                ctx.translate(goose.x, goose.y);

                const wingAngle = Math.sin(goose.wingPhase) * 0.4;
                const size = 12;

                // 大雁身体
                ctx.fillStyle = 'rgba(60, 50, 40, 0.8)';
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 1.2, size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();

                // 头部
                ctx.beginPath();
                ctx.arc(size * 1.3, -size * 0.1, size * 0.3, 0, Math.PI * 2);
                ctx.fill();

                // 左翅膀
                ctx.save();
                ctx.rotate(-wingAngle);
                ctx.fillStyle = 'rgba(70, 60, 50, 0.7)';
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, 0);
                ctx.quadraticCurveTo(-size * 1.5, -size * 0.8, -size * 2, -size * 0.2);
                ctx.quadraticCurveTo(-size * 1.2, size * 0.2, -size * 0.3, 0);
                ctx.fill();
                ctx.restore();

                // 右翅膀
                ctx.save();
                ctx.rotate(wingAngle);
                ctx.fillStyle = 'rgba(70, 60, 50, 0.7)';
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, 0);
                ctx.quadraticCurveTo(-size * 1.5, size * 0.8, -size * 2, size * 0.2);
                ctx.quadraticCurveTo(-size * 1.2, -size * 0.2, -size * 0.3, 0);
                ctx.fill();
                ctx.restore();

                ctx.restore();
            });
        };

        // ========== 绘制函数 - 冰冷期 (3D增强版) ==========
        const drawMountains = () => {
            if (mode !== 'cold') return;

            const time = timeRef.current;
            const iceLevel = intensity.iceLevel;

            // 1. 极光（Aurora Borealis）
            const auroraColors = [
                { hue: 140, y: 0.05 },   // 绿色
                { hue: 180, y: 0.12 },   // 青色
                { hue: 280, y: 0.08 }    // 紫色
            ];

            auroraColors.forEach((aurora, idx) => {
                const waveOffset = Math.sin(time * 0.3 + idx) * 20;
                const opacity = 0.15 + Math.sin(time * 0.5 + idx * 2) * 0.1;

                ctx.beginPath();
                ctx.moveTo(0, canvas.height * aurora.y);

                for (let x = 0; x <= canvas.width; x += 20) {
                    const wave1 = Math.sin(x * 0.01 + time * 0.5 + idx) * 30;
                    const wave2 = Math.sin(x * 0.02 + time * 0.3) * 15;
                    const y = canvas.height * aurora.y + wave1 + wave2 + waveOffset;
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(canvas.width, 0);
                ctx.lineTo(0, 0);
                ctx.closePath();

                const auroraGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.25);
                auroraGradient.addColorStop(0, `hsla(${aurora.hue}, 80%, 60%, 0)`);
                auroraGradient.addColorStop(0.3, `hsla(${aurora.hue}, 70%, 50%, ${opacity * iceLevel})`);
                auroraGradient.addColorStop(0.7, `hsla(${aurora.hue + 20}, 60%, 40%, ${opacity * 0.5 * iceLevel})`);
                auroraGradient.addColorStop(1, `hsla(${aurora.hue}, 50%, 30%, 0)`);

                ctx.fillStyle = auroraGradient;
                ctx.fill();
            });

            // 2. 星空点缀
            const starCount = 30;
            for (let i = 0; i < starCount; i++) {
                const x = (canvas.width * 0.1 + i * canvas.width * 0.8 / starCount + Math.sin(i * 7) * 30) % canvas.width;
                const y = canvas.height * (0.05 + (i % 5) * 0.06);
                const twinkle = (Math.sin(time * 3 + i * 5) + 1) * 0.5;
                const size = 1 + twinkle * 1.5;

                ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.5})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // 3. 远山剪影（多层3D透视）
            const mountainLayers = [
                { baseY: 0.3, peaks: 4, colorStart: [100, 140, 180], colorEnd: [60, 100, 140], opacity: 0.35, scale: 0.6 },
                { baseY: 0.4, peaks: 5, colorStart: [130, 170, 210], colorEnd: [80, 130, 170], opacity: 0.5, scale: 0.75 },
                { baseY: 0.5, peaks: 6, colorStart: [160, 200, 230], colorEnd: [110, 160, 200], opacity: 0.7, scale: 0.9 },
                { baseY: 0.6, peaks: 5, colorStart: [200, 220, 240], colorEnd: [150, 190, 220], opacity: 0.85, scale: 1.0 }
            ];

            mountainLayers.forEach((layer, idx) => {
                const baseY = canvas.height * layer.baseY;
                const peakHeight = (60 + idx * 25) * iceLevel * layer.scale;

                // 山体
                ctx.beginPath();
                ctx.moveTo(0, canvas.height);

                for (let i = 0; i <= layer.peaks; i++) {
                    const x = (canvas.width / layer.peaks) * i;
                    const heightVariation = Math.sin(i * 1.2 + idx * 0.5) * 30 + Math.cos(i * 0.8) * 20;
                    const y = baseY - peakHeight - heightVariation * layer.scale;

                    if (i === 0) {
                        ctx.lineTo(x, y);
                    } else {
                        const prevX = (canvas.width / layer.peaks) * (i - 1);
                        const cpX = (prevX + x) / 2;
                        const cpY = y - 20 * layer.scale;
                        ctx.quadraticCurveTo(cpX, cpY, x, y);
                    }
                }

                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();

                // 渐变填充
                const gradient = ctx.createLinearGradient(0, baseY - peakHeight - 50, 0, canvas.height);
                gradient.addColorStop(0, `rgba(${layer.colorStart.join(',')}, ${layer.opacity * iceLevel})`);
                gradient.addColorStop(0.4, `rgba(${layer.colorEnd.join(',')}, ${layer.opacity * 0.9 * iceLevel})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, ${layer.opacity * 0.5 * iceLevel})`);

                ctx.fillStyle = gradient;
                ctx.fill();

                // 山脊高光
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + idx * 0.15})`;
                ctx.lineWidth = 1.5 - idx * 0.2;
                ctx.stroke();
            });

            // 4. 冰面地板（带反射）
            const iceFloorY = canvas.height * 0.75;
            const iceFloorGradient = ctx.createLinearGradient(0, iceFloorY, 0, canvas.height);
            iceFloorGradient.addColorStop(0, `rgba(200, 225, 245, ${0.4 * iceLevel})`);
            iceFloorGradient.addColorStop(0.3, `rgba(180, 210, 235, ${0.6 * iceLevel})`);
            iceFloorGradient.addColorStop(1, `rgba(150, 190, 220, ${0.8 * iceLevel})`);

            ctx.fillStyle = iceFloorGradient;
            ctx.fillRect(0, iceFloorY, canvas.width, canvas.height - iceFloorY);

            // 冰面反射（倒影山）
            ctx.save();
            ctx.globalAlpha = 0.15 * iceLevel;
            ctx.scale(1, -0.3);
            ctx.translate(0, -canvas.height * 3.2);

            mountainLayers.slice(-2).forEach((layer, idx) => {
                const baseY = canvas.height * layer.baseY;
                const peakHeight = (60 + (idx + 2) * 25) * iceLevel * layer.scale;

                ctx.beginPath();
                ctx.moveTo(0, canvas.height);

                for (let i = 0; i <= layer.peaks; i++) {
                    const x = (canvas.width / layer.peaks) * i;
                    const heightVariation = Math.sin(i * 1.2 + (idx + 2) * 0.5) * 30;
                    const y = baseY - peakHeight - heightVariation * layer.scale;

                    if (i === 0) {
                        ctx.lineTo(x, y);
                    } else {
                        const prevX = (canvas.width / layer.peaks) * (i - 1);
                        const cpX = (prevX + x) / 2;
                        const cpY = y - 20 * layer.scale;
                        ctx.quadraticCurveTo(cpX, cpY, x, y);
                    }
                }

                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();

                ctx.fillStyle = `rgba(180, 210, 235, 0.3)`;
                ctx.fill();
            });

            ctx.restore();

            // 5. 冰裂纹
            const crackCount = Math.floor(5 + iceLevel * 8);
            for (let i = 0; i < crackCount; i++) {
                const startX = canvas.width * (0.1 + (i / crackCount) * 0.8);
                const startY = iceFloorY + 20 + (i % 3) * 40;
                const length = 30 + Math.random() * 60;
                const angle = Math.PI * 0.3 + Math.random() * Math.PI * 0.4;

                ctx.strokeStyle = `rgba(100, 150, 200, ${0.2 + iceLevel * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(startX, startY);

                let currentX = startX;
                let currentY = startY;
                const segments = 3 + Math.floor(Math.random() * 3);

                for (let j = 0; j < segments; j++) {
                    const segLength = length / segments;
                    const segAngle = angle + (Math.random() - 0.5) * 0.5;
                    currentX += Math.cos(segAngle) * segLength;
                    currentY += Math.sin(segAngle) * segLength;
                    ctx.lineTo(currentX, currentY);

                    // 分叉
                    if (Math.random() > 0.6) {
                        const branchAngle = segAngle + (Math.random() > 0.5 ? 0.5 : -0.5);
                        const branchLength = segLength * 0.5;
                        ctx.moveTo(currentX, currentY);
                        ctx.lineTo(
                            currentX + Math.cos(branchAngle) * branchLength,
                            currentY + Math.sin(branchAngle) * branchLength
                        );
                        ctx.moveTo(currentX, currentY);
                    }
                }
                ctx.stroke();
            }

            // 6. 冰面光泽
            const shineCount = 8;
            for (let i = 0; i < shineCount; i++) {
                const x = canvas.width * (0.1 + (i / shineCount) * 0.8);
                const y = iceFloorY + 30 + (i % 3) * 25;
                const shimmer = (Math.sin(time * 2 + i * 1.5) + 1) * 0.5;

                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + shimmer * 0.2})`;
                ctx.beginPath();
                ctx.ellipse(x, y, 20 + shimmer * 10, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
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
                if (intensity.isAutumn) {
                    // 秋水长天场景（exhausted阶段）
                    drawAutumnScene();
                    updateLeaves();
                    drawLeaves();
                    updateGeese();
                    drawGeese();
                } else {
                    // 春江水暖场景（其他热阶段）
                    drawRiver();
                    updateBubbles();
                    drawBubbles();
                    updateDucks();
                    drawDucks();
                }
            } else {
                // 乱纪元/轮动市场场景
                drawChaoticEra();
                updateSectorWheels();
                updateChaosParticles();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        initParticles();
        initWindParticles();
        initDucks();
        initBubbles();
        initLeaves();
        initGeese();
        initSectorWheels();
        initChaosParticles();
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
                zIndex: 1,
                opacity: 0.55
            }}
        />
    );
};
