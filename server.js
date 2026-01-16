import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import https from 'https';
import { fetchAllMarketData } from './src/services/marketDataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * npm run dev
 */

const app = express();
const PORT = 3001;

// MiniMax API Key
const MINIMAX_API_KEY = "sk-api-K7oDtGpVChNcx_XkEs_3lhdEGeytEpqICvwjSbOhwktiS1_28X9r55JXpgeNm77dudNTck7yaQofLVP1v-_sFzwJ9bBvh_agF3Rxqp3UAFksNm40MyytbJ4";

// 文件夹配置
const DATA_DIR = path.join(__dirname, 'data');
const ANALYSIS_DIR = path.join(__dirname, 'A_Share_Analysis');
const DICT_FILE = path.join(ANALYSIS_DIR, 'A股字典.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// 初始化目录
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(ANALYSIS_DIR)) fs.mkdirSync(ANALYSIS_DIR);

// ==========================================
// PART A: 基础文件管理接口
// ==========================================
app.get('/api/files', (req, res) => {
    fs.readdir(DATA_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: '读取失败' });
        const jsonFiles = files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
        res.json(jsonFiles);
    });
});

app.get('/api/files/:name', (req, res) => {
    const filePath = path.join(DATA_DIR, `${req.params.name}.json`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: '文件不存在' });
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: '读取失败' });
        try { res.json(JSON.parse(data)); } catch (e) { res.status(500).json({ error: '格式错误' }); }
    });
});

app.post('/api/files', (req, res) => {
    const { name, data } = req.body;
    if (!name || !data) return res.status(400).json({ error: '参数缺失' });
    const filePath = path.join(DATA_DIR, `${name}.json`);
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) return res.status(500).json({ error: '写入失败' });
        res.json({ success: true });
    });
});

app.delete('/api/files/:name', (req, res) => {
    const filePath = path.join(DATA_DIR, `${req.params.name}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) return res.status(500).json({ error: '删除失败' });
            res.json({ success: true });
        });
    } else {
        res.status(404).json({ error: '文件不存在' });
    }
});

// ==========================================
// PART B: 核心计算工具 (极简量价版)
// ==========================================
const Tools = {
    // 计算相对位置 (0=最低, 1=最高)
    getPosition: (closes, lookback = 120) => {
        if (closes.length < lookback) return 0.5;
        const recent = closes.slice(-lookback);
        const min = Math.min(...recent);
        const max = Math.max(...recent);
        return max === min ? 0.5 : (closes[closes.length - 1] - min) / (max - min);
    },

    // 计算均值
    avg: (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
};

// ==========================================
// PART C: 数据抓取模块 (稳定性修复版)
// ==========================================

// 1. 通用 HTTP 请求 (修复 socket hang up)
const fetchBuffer = (url) => {
    return new Promise((resolve, reject) => {
        const UA_LIST = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
        ];
        const randomUA = UA_LIST[Math.floor(Math.random() * UA_LIST.length)];

        const options = {
            headers: {
                'User-Agent': randomUA,
                'Referer': 'http://quote.eastmoney.com/', // 必须带
                'Connection': 'close', // 关键：短连接，防止 ECONNRESET
                'Host': 'push2his.eastmoney.com'
            },
            timeout: 5000 // 5秒超时
        };

        const req = http.get(url, options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
};

// 2. 获取 A 股列表 (已剔除 920 北交所)
const fetchAllStocks = async () => {
    // 读取本地缓存
    if (fs.existsSync(DICT_FILE)) {
        try {
            const localData = JSON.parse(fs.readFileSync(DICT_FILE, 'utf-8'));
            // 确保本地数据也经过过滤
            return localData.filter(s => !s.code.startsWith('920'));
        } catch (e) { }
    }

    console.log('📊 [系统] 正在从新浪抓取A股列表...');
    let allStocks = [];
    let page = 1;
    const pageSize = 100;

    try {
        while (true) {
            const url = `http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page=${page}&num=${pageSize}&sort=symbol&asc=1&node=hs_a&symbol=&_s_r_a=sort`;
            // 新浪接口比较宽松，可以用简单的 fetchBuffer，如果不行需调整 Headers
            const buf = await fetchBuffer(url.replace('push2his.eastmoney.com', 'vip.stock.finance.sina.com.cn'));
            const txt = new TextDecoder('gbk').decode(buf);

            let list = [];
            try { if (txt) list = new Function(`return ${txt}`)(); } catch (e) { }

            if (!list || list.length === 0) break;

            // 过滤逻辑
            const validStocks = list.filter(item => !item.code.startsWith('920'));

            allStocks = allStocks.concat(validStocks.map(i => ({
                code: i.code,
                name: i.name,
                // 强制小写，兼容性更好
                market: i.symbol.substr(0, 2).toLowerCase()
            })));

            if (page > 60) break;
            page++;
        }

        if (allStocks.length > 0) {
            console.log(`✅ 列表更新完成，共 ${allStocks.length} 只 (已剔除920)`);
            fs.writeFileSync(DICT_FILE, JSON.stringify(allStocks));
            return allStocks;
        }
    } catch (e) {
        console.error("列表抓取失败:", e.message);
    }
    return [];
};

// 3. 获取 K 线 (修复 secid 和重试机制)
const fetchKline = async (code, market, retryCount = 0) => {
    // 东方财富规则: sh=1, sz/bj=0
    const secidPrefix = (market === 'sh') ? '1' : '0';
    const secid = `${secidPrefix}.${code}`;
    const url = `http://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1&fields2=f51,f52,f53,f54,f55,f56&klt=101&fqt=1&end=20500101&lmt=150`;

    try {
        const buf = await fetchBuffer(url);
        const text = buf.toString();

        // 简单校验
        if (!text.startsWith('{')) return null;

        const json = JSON.parse(text);
        if (json?.data?.klines) {
            return json.data.klines.map(k => {
                const s = k.split(',');
                return { day: s[0], close: parseFloat(s[2]), volume: parseFloat(s[5]) };
            });
        }
    } catch (e) {
        console.log("zzzzzzzzz")
        // 自动重试 1 次
        if (retryCount < 1) {
            await new Promise(r => setTimeout(r, 500));
            return fetchKline(code, market, retryCount + 1);
        }
    }
    return null;
};

// ==========================================
// PART D: 第一层 - 硬逻辑筛选 (位置+量能)
// ==========================================
const analyzeStockLayer1 = (stock, klines) => {
    if (!klines || klines.length < 60) return null;

    const len = klines.length;
    const current = klines[len - 1];
    const volumes = klines.map(k => k.volume);
    const closes = klines.map(k => k.close);

    // 1. 位置计算 (Position)
    const position = Tools.getPosition(closes, 120);

    // 2. 量能计算 (Volume Logic)
    const vma5 = Tools.avg(volumes.slice(len - 6, len - 1));
    const vma20 = Tools.avg(volumes.slice(len - 21, len - 1));
    const currentVol = current.volume;

    // 量比
    const volRatio = vma5 > 0 ? currentVol / vma5 : 0;
    // 唤醒系数
    const wakeUpFactor = vma20 > 0 ? currentVol / vma20 : 0;

    let strategy = null;
    let featureDesc = "";

    // S1: 低位·筹码聚合
    // 逻辑：位置低 + 放量 + 从沉寂中苏醒
    if (position < 0.25 && volRatio > 1.8 && wakeUpFactor > 1.5) {
        strategy = "S1_低位聚合";
        featureDesc = `【位置极低 ${(position * 100).toFixed(0)}%】此前长期缩量沉寂，今日成交量突然放大${volRatio.toFixed(1)}倍，疑似资金低位吸筹。`;
    }

    // S2: 高位·分歧震荡
    // 逻辑：位置高 + 异常巨量
    else if (position > 0.80 && volRatio > 2.0) {
        strategy = "S2_高位分歧";
        featureDesc = `【位置极高 ${(position * 100).toFixed(0)}%】高位爆出${volRatio.toFixed(1)}倍巨量，多空分歧剧烈，需判断是上涨中继换手还是主力出货。`;
    }

    // S3: 活跃·资金唤醒
    // 逻辑：中位 + 明显活跃
    else if (volRatio > 2.2 && position >= 0.25 && position <= 0.80) {
        strategy = "S3_资金唤醒";
        featureDesc = `【股性激活】成交量放大${volRatio.toFixed(1)}倍，摆脱此前的缩量织布状态，资金关注度显著提升。`;
    }

    if (strategy) {
        return {
            code: stock.code,
            name: stock.name,
            strategy: strategy,
            feature: featureDesc,
            metrics: {
                price: current.close,
                volRatio: volRatio.toFixed(2),
                position: (position * 100).toFixed(0) + "%"
            }
        };
    }
    return null;
};

// ==========================================
// PART E: 第二层 - DeepSeek 深度研判
// ==========================================
const performAIAnalysis = (candidates) => {
    return new Promise((resolve, reject) => {
        if (!candidates || candidates.length === 0) return resolve([]);

        console.log(`🧠 [AI Layer] 正在请求 DeepSeek 分析 ${candidates.length} 只标的...`);

        const stocksPrompt = candidates.map((s, index) => {
            return `${index + 1}. [${s.code} ${s.name}] 形态：${s.strategy}。描述：${s.feature}`;
        }).join('\n');

        const prompt = `
        你是一位洞察力极强的A股产业分析师。我筛选出了一批“资金异动”（放量活跃）的股票。
        
        请忽略短期的K线波动，重点从以下三个维度进行深度研判：
        1. **题材周期 (Cycle)**：该股所属概念是处于“爆发初期”、“主升浪高潮”还是“退潮衰退期”？
        2. **核心地位 (Value)**：该股在产业链中是“核心中军/龙头”，还是“边缘跟风/杂毛”？
        3. **资金意图 (Intent)**：
           - 对于【S1_低位聚合】：是真正的底部反转，还是利空下跌后的抵抗？
           - 对于【S2_高位分歧】：是主力出货，还是空中加油？
        
        待分析列表：
        ${stocksPrompt}
        
        请严格按以下 JSON 格式返回结果（不要 Markdown）：
        [
          {
            "code": "股票代码",
            "industry": "核心题材",
            "cycle_stage": "爆发期/衰退期/混沌期",
            "analysis": "一句话精炼点评(题材热度+产业链地位+资金意图)",
            "score": 85 (0-100分，给核心资产和热点题材高分，边缘股低分),
            "suggestion": "强烈关注/建议观察/规避风险"
          }
        ]
        `;

        const postData = JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "你是一个只输出纯 JSON 数据的金融决策助手。", name: "MM智能助理" },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
            stream: false
        });

        const req = https.request('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Length': Buffer.byteLength(postData)
            },
            // 超时时间增加到 180秒
            timeout: 180000
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.choices && json.choices.length > 0) {
                        const content = json.choices[0].message.content.replace(/```json|```/g, '').trim();
                        resolve(JSON.parse(content));
                    } else {
                        console.error("DeepSeek 返回异常:", json);
                        resolve([]);
                    }
                } catch (e) {
                    console.error("DeepSeek 解析失败:", e.message);
                    resolve([]);
                }
            });
        });

        req.on('timeout', () => {
            console.error("❌ DeepSeek 请求超时 (建议检查网络或减少批次)");
            req.destroy();
            resolve([]);
        });

        req.on('error', (e) => {
            console.error("❌ DeepSeek 网络错误:", e.message);
            resolve([]);
        });

        req.write(postData);
        req.end();
    });
};

// ==========================================
// PART F: 监控主流程
// ==========================================
const startMonitoring = async () => {
    console.log('🚀 [系统] 启动分层筛选监控服务...');

    let stockList = await fetchAllStocks();

    const runTask = async () => {
        if (!stockList.length) stockList = await fetchAllStocks();
        if (stockList.length === 0) {
            console.log("❌ 无法获取股票列表，请检查网络");
            return;
        }

        console.log(`\n⏰ [Layer 1] 开始扫描资金异动 (${stockList.length}只)...`);

        let candidates = [];
        const BATCH_SIZE = 50;

        // --- 第一阶段：Node.js 快速硬筛选 ---
        for (let i = 0; i < stockList.length; i += BATCH_SIZE) {
            const batch = stockList.slice(i, i + BATCH_SIZE);
            if (i % 1000 === 0) process.stdout.write(`   > 扫描进度: ${((i / stockList.length) * 100).toFixed(0)}% \r`);

            const promises = batch.map(async (stock) => {
                // 加入重试机制的 fetch
                const klines = await fetchKline(stock.code, stock.market);
                return analyzeStockLayer1(stock, klines);
            });

            const results = await Promise.all(promises);
            candidates.push(...results.filter(r => r !== null));

            // 稍作停顿，对服务器友好
            await new Promise(r => setTimeout(r, 200));
        }

        console.log(`\n✅ [Layer 1] 筛选完成，发现 ${candidates.length} 只异动标的。`);

        if (candidates.length > 30) {
            candidates.sort((a, b) => parseFloat(b.metrics.volRatio) - parseFloat(a.metrics.volRatio));
            candidates = candidates.slice(0, 30);
            console.log(`✂️ [Layer 1] 截取前 30 只最强资金异动股送往 AI 研判。`);
        }

        // --- 第二阶段：DeepSeek 智能研判 ---
        if (candidates.length > 0) {
            let enrichedResults = [];

            // 降低 AI 批次大小，确保稳定性
            const AI_BATCH_SIZE = 5;

            for (let i = 0; i < candidates.length; i += AI_BATCH_SIZE) {
                const batch = candidates.slice(i, i + AI_BATCH_SIZE);
                console.log(`   > AI 正在研判第 ${Math.floor(i / AI_BATCH_SIZE) + 1} 批...`);

                if (i > 0) await new Promise(r => setTimeout(r, 1500)); // 批次间隔

                const aiFeedback = await performAIAnalysis(batch);

                batch.forEach(item => {
                    const feedback = aiFeedback.find(f => f.code === item.code);
                    enrichedResults.push({
                        ...item,
                        ai_analysis: feedback ? feedback : {
                            industry: "未知", cycle_stage: "-", analysis: "AI分析暂缺", score: 0, suggestion: "待定"
                        }
                    });
                });
            }

            enrichedResults.sort((a, b) => (b.ai_analysis.score || 0) - (a.ai_analysis.score || 0));

            const now = new Date();
            const fileName = `smart_pick_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate()}.json`;
            const savePath = path.join(ANALYSIS_DIR, fileName);

            const output = {
                timestamp: now.toISOString(),
                count: enrichedResults.length,
                data: enrichedResults
            };

            fs.writeFileSync(savePath, JSON.stringify(output, null, 2));
            console.log(`💾 [Layer 2] 最终决策已保存: ${fileName}`);

            console.log("\n🏆 AI 严选 Top 3:");
            enrichedResults.slice(0, 3).forEach(r => {
                console.log(`   ${r.name}(${r.code}) [${r.ai_analysis.score}分] ${r.ai_analysis.cycle_stage}`);
                console.log(`   └─ 逻辑: ${r.ai_analysis.analysis}`);
            });

        } else {
            console.log("💤 [Layer 1] 市场沉寂，本轮无明显异动。");
        }
    };

    runTask();
    // 每 60 分钟执行一次
    setInterval(runTask, 60 * 60 * 1000);
};

// ==========================================
// PART G: 结果查询 API
// ==========================================
app.get('/api/result', (req, res) => {
    try {
        const files = fs.readdirSync(ANALYSIS_DIR).filter(f => f.endsWith('.json') && f.startsWith('smart_pick')).sort().reverse();
        if (files.length === 0) return res.json({ error: '暂无数据' });
        const data = JSON.parse(fs.readFileSync(path.join(ANALYSIS_DIR, files[0])));
        res.json(data);
    } catch (e) { res.status(500).json({ error: '服务器错误' }); }
});

// ==========================================
// PART H: 龙虎榜数据生成 API
// ==========================================

/**
 * 生成每日龙虎榜数据（纯AI生成）
 * POST /api/generate-daily-data
 * Body: { date: "2026-01-16" }
 */
app.post('/api/generate-daily-data', async (req, res) => {
    const { date } = req.body;

    if (!date) {
        return res.status(400).json({ error: '请提供日期参数' });
    }

    console.log(`🤖 [AI生成] 开始生成 ${date} 的市场数据...`);

    const systemPrompt = `你是一个专业的A股市场分析师，擅长分析龙虎榜数据、资金流向、板块轮动和游资动向。

【关键要求】
1. 成交额必须在2-3万亿之间（这是2026年A股的正常水平）
2. 数据要符合市场规律和逻辑
3. 输出格式必须是严格的JSON，不要包含markdown标记`;

    const userPrompt = `请生成 ${date} 的A股市场完整分析数据。

【重要数据要求】
1. 成交额：沪深两市合计2-3万亿元（这是正常水平）
2. 行业资金流向：选择当前热门行业（如AI、半导体、新能源等）
3. 个股：选择真实存在的龙头股票
4. 游资席位：使用真实的知名游资名称（如作手新一、章盟主等）

请严格按照以下JSON格式输出：

{
  "updateTime": "${date}",
  "dailyFlow": [
    {
      "name": "行业名称",
      "netFlow": 数值(亿元),
      "type": "in或out",
      "desc": "描述"
    }
  ],
  "topStocks": [
    {
      "name": "股票名称",
      "value": 数值(亿元),
      "type": "buy或sell",
      "desc": "描述"
    }
  ],
  "weeklyThemes": [
    {
      "name": "主题名称",
      "value": 热度值(0-100),
      "color": "#颜色代码",
      "details": "详细说明"
    }
  ],
  "marketVolume": [
    {
      "date": "MM-DD",
      "volume": 成交额(万亿，必须在2-3之间),
      "status": "状态",
      "change": 变化量,
      "sentiment": 情绪指数(0-100),
      "desc": "描述"
    }
  ],
  "themeLifecycle": [
    {
      "name": "主题名称",
      "daysActive": 天数,
      "phase": "阶段",
      "heat": 热度,
      "startDate": "开始日期",
      "trend": "up或down",
      "insight": "洞察",
      "news": ["新闻1", "新闻2"]
    }
  ],
  "activeSeats": [
    {
      "name": "席位名称（使用真实游资名）",
      "type": "游资/机构/外资",
      "tag": "标签",
      "direction": "方向",
      "stocks": [
        {
          "name": "股票名称",
          "amount": "金额",
          "date": "日期"
        }
      ],
      "desc": "描述"
    }
  ],
  "fundNature": [
    {
      "sector": "板块名称",
      "dominant": "主导资金",
      "icon": "图标名",
      "color": "颜色类",
      "desc": "描述",
      "composition": [
        {
          "name": "资金类型",
          "val": 占比,
          "color": "#颜色"
        }
      ]
    }
  ]
}`;

    try {
        const postData = JSON.stringify({
            model: "MiniMax-M2",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            stream: false
        });

        const aiResponse = await new Promise((resolve, reject) => {
            const req = https.request('https://api.minimax.chat/v1/text/chatcompletion_v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MINIMAX_API_KEY}`,
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 120000
            }, (apiRes) => {
                let data = '';
                apiRes.on('data', chunk => data += chunk);
                apiRes.on('end', () => {
                    try {
                        console.log('🔍 [调试] MiniMax原始响应:', data.substring(0, 500));
                        const json = JSON.parse(data);
                        console.log('🔍 [调试] 解析后的JSON:', JSON.stringify(json, null, 2).substring(0, 500));

                        if (json.choices && json.choices.length > 0) {
                            // MiniMax响应格式
                            const choice = json.choices[0];
                            const content = choice.message?.content || choice.text || '';
                            resolve(content);
                        } else if (json.base_resp) {
                            // MiniMax错误响应
                            reject(new Error(`MiniMax错误: ${json.base_resp.status_msg} (code: ${json.base_resp.status_code})`));
                        } else {
                            reject(new Error('MiniMax返回格式异常'));
                        }
                    } catch (e) {
                        console.error('❌ [调试] 解析失败，原始数据:', data);
                        reject(new Error('解析MiniMax响应失败: ' + e.message));
                    }
                });
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('MiniMax请求超时'));
            });

            req.on('error', (e) => {
                reject(new Error('MiniMax网络错误: ' + e.message));
            });

            req.write(postData);
            req.end();
        });

        // 清理markdown标记
        let cleanedResponse = aiResponse.replace(/```json|```/g, '').trim();

        // 解析JSON
        const marketData = JSON.parse(cleanedResponse);

        // 验证成交额是否合理
        if (marketData.marketVolume && marketData.marketVolume.length > 0) {
            const latestVolume = marketData.marketVolume[marketData.marketVolume.length - 1].volume;
            if (latestVolume < 2 || latestVolume > 3) {
                console.log(`⚠️ 成交额${latestVolume}万亿不在合理范围，已调整`);
                marketData.marketVolume.forEach(v => {
                    if (v.volume < 2 || v.volume > 3) {
                        v.volume = 2.5 + (Math.random() - 0.5) * 0.8;
                        v.volume = parseFloat(v.volume.toFixed(2));
                    }
                });
            }
        }

        // 保存到文件
        const fileName = `${date.replace(/年|月|日/g, '-').replace(/\s/g, '')}.json`;
        const filePath = path.join(__dirname, 'src', 'data', fileName);

        fs.writeFileSync(filePath, JSON.stringify(marketData, null, 2), 'utf8');

        console.log(`✅ [AI生成] 数据已保存: ${fileName}`);

        res.json({
            success: true,
            message: '数据生成成功',
            data: marketData,
            filePath: fileName
        });

    } catch (error) {
        console.error(`❌ [AI生成] 失败:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n🌍 服务已启动: http://localhost:${PORT}`);
    console.log(`🛠️ 修复版: Socket挂起修复 | 去均线策略 | AI超时优化`);
    // startMonitoring().catch(console.error);
});