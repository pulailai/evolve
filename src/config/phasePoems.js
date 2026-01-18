// 各时期真言诗句配置

export const phasePoems = {
    // 狂热期
    hot: {
        warming: {
            text: '投石问路深浅试\n拨开云雾见青天',
            position: 'right',
            color: '#ff9500'
        },
        testing: {
            text: '投石问路深浅试\n拨开云雾见青天',
            position: 'left',
            color: '#ffa500'
        },
        heating: {
            text: '春江水暖鸭先知\n风起青萍意未迟',
            position: 'right',
            color: '#ff8c00'
        },
        boiling: {
            text: '烈火烹油花着锦\n高歌猛进不知归',
            position: 'right',
            color: '#ff6b35'
        },
        exhausted: {
            text: '盛宴散去人影乱\n唯余秋水共长天',
            position: 'left',
            color: '#d4a574'
        }
    },

    // 冰冷期
    cold: {
        chilly: {
            text: '西风昨夜凋碧树\n一叶知秋寒意生',
            position: 'left',
            color: '#60a5fa'
        },
        freezing: {
            text: '冰塞川河流不转\n千山鸟飞绝人踪',
            position: 'right',
            color: '#3b82f6'
        },
        frozen: {
            text: '万径人踪灭无声\n否极泰来阳气生',
            position: 'left',
            color: '#1e40af'
        }
    },

    // 灰白期（乱纪元）
    neutral: {
        normal: {
            text: '黑云压城城欲摧\n阴阳未判混沌中',
            position: 'right',
            color: '#9ca3af'
        }
    }
};

// 获取当前时期的诗句
export const getPoemForPhase = (mode, phase) => {
    return phasePoems[mode]?.[phase] || null;
};
