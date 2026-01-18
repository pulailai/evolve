// 弹幕样式模板配置

export const barrageStyleTemplates = {
    classic: {
        name: '经典',
        icon: '🎨',
        className: 'barrage-classic',
        description: '传统弹幕风格',
    },
    modern: {
        name: '现代',
        icon: '✨',
        className: 'barrage-modern',
        description: '玻璃态效果',
    },
    minimal: {
        name: '简约',
        icon: '📝',
        className: 'barrage-minimal',
        description: '纯文字无背景',
    },
    bold: {
        name: '醒目',
        icon: '💪',
        className: 'barrage-bold',
        description: '实色背景粗字体',
    },
    rainbow: {
        name: '彩虹',
        icon: '🌈',
        className: 'barrage-rainbow',
        description: '渐变流动效果',
    },
    neon: {
        name: '霓虹',
        icon: '💫',
        className: 'barrage-neon',
        description: '发光脉动效果',
    },
    shake: {
        name: '警示',
        icon: '⚠️',
        className: 'barrage-shake',
        description: '抖动警告效果',
    },
    bounce: {
        name: '弹跳',
        icon: '🎾',
        className: 'barrage-bounce',
        description: '上下跳动效果',
    },
    fade: {
        name: '渐变',
        icon: '🌫️',
        className: 'barrage-fade',
        description: '透明度变化',
    },
    particle: {
        name: '粒子',
        icon: '✨',
        className: 'barrage-particle',
        description: '粒子飘动效果',
    },
};

export const barrageSizeOptions = {
    small: {
        name: '小',
        fontSize: '12px',
        padding: '8px 14px',
    },
    medium: {
        name: '中',
        fontSize: '15px',
        padding: '10px 18px',
    },
    large: {
        name: '大',
        fontSize: '18px',
        padding: '12px 22px',
    },
};

export const barrageSpeedOptions = {
    slow: {
        name: '慢速',
        speed: 0.5,
    },
    medium: {
        name: '中速',
        speed: 0.8,
    },
    fast: {
        name: '快速',
        speed: 1.2,
    },
};

export const barrageAreaOptions = {
    top: {
        name: '顶部',
        getPosition: (index) => 70 + (index % 2) * 50,
    },
    full: {
        name: '全屏',
        getPosition: (index) => 70 + (index % 4) * 40,
    },
    bottom: {
        name: '底部',
        getPosition: (index) => window.innerHeight - 150 + (index % 2) * 50,
    },
};

export const defaultBarrageSettings = {
    template: 'modern',
    size: 'medium',
    opacity: 0.95,
    speed: 'medium',
    area: 'top',
};
