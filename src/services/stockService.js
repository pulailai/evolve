import { analyzeStockTrend } from '../utils/analysis';

const API_BASE = 'http://localhost:3001/api/stock/kline';

// 扩展观察池 (覆盖不同行业，增加命中概率)
const WATCH_LIST = [
  { code: 'sz002050', name: '三花智控', tag: '机器人' },
  { code: 'sh601138', name: '工业富联', tag: 'AI/服务器' },
  { code: 'sz300308', name: '中际旭创', tag: 'CPO' },
  { code: 'sz300750', name: '宁德时代', tag: '锂电' },
  { code: 'sh600519', name: '贵州茅台', tag: '白酒' },
  { code: 'sz002230', name: '科大讯飞', tag: '大模型' },
  { code: 'sz002085', name: '万丰奥威', tag: '低空经济' },
  { code: 'sh601318', name: '中国平安', tag: '金融' },
  { code: 'sz002594', name: '比亚迪', tag: '汽车' },
  { code: 'sh600418', name: '江淮汽车', tag: '汽车' },
  { code: 'sh601360', name: '三六零', tag: '安全' },
  { code: 'sz300059', name: '东方财富', tag: '券商' },
  { code: 'sz000063', name: '中兴通讯', tag: '5G/算力' },
  { code: 'sh600111', name: '北方稀土', tag: '资源' },
  { code: 'sz002415', name: '海康威视', tag: '安防' },
  { code: 'sh603259', name: '药明康德', tag: 'CXO' }
];

export const fetchStockData = async () => {
  const promises = WATCH_LIST.map(async (stock) => {
    try {
      console.log(`正在获取 ${stock.name} 数据...`);
      const res = await fetch(`${API_BASE}?code=${stock.code}`);
      const data = await res.json();
      console.log(`${stock.name} 原始数据:`, data);
      // 腾讯接口数据路径: data.data[code]
      const stockData = data.data?.[stock.code];
      const klineData = stockData?.qfqday; 
      const qtData = stockData?.qt?.[stock.code];

      console.log(`${stock.name} K线数据长度:`, klineData?.length);
      console.log(`${stock.name} 实时数据:`, qtData);

      if (klineData && klineData.length >= 30 && qtData) {
        const currentPrice = qtData[3];
        const pctChg = qtData[31];
        // 🧠 调用智能分析算法
        const analysisResult = analyzeStockTrend(klineData);
      

        // 格式化 K 线 (取最近 60 天)
        const recentK = klineData.slice(-60);
        const chartData = recentK.map(k => parseFloat(k[2])); 
        const volumeData = recentK.map(k => parseFloat(k[5])); 

        return {
          ...stock,
          id: stock.code,
          price: `${parseFloat(pctChg) > 0 ? '+' : ''}${pctChg}%`,
          currentPrice: currentPrice,
          type: parseFloat(pctChg) >= 0 ? 'up' : 'down',
          chartData: chartData,
          volume: volumeData,
          // 注入分析结果
          signal: analysisResult?.signal || '',
          signalType: analysisResult?.signalType || '',
          analysis: analysisResult?.analysis || '当前走势符合常态，关注后续量能变化。',
          desc: analysisResult?.desc || '',
          events: [
            { time: '实时', text: `现价 ${currentPrice}，涨幅 ${pctChg}%，量比 ${qtData[49]}`, tag: '盘口' }
          ]
        };
      }
    } catch (err) {
      console.error(`Error fetching ${stock.name}`, err);
    }
    return null;
  });

  const fetched = await Promise.all(promises);
  return fetched.filter(item => item !== null);
};