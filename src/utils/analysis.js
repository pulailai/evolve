
// import { getAllStockCodes } from '../utils/fetcher';


// const allStocks1 = await getAllStockCodes();
//     const total = allStocks1.length;
//     console.log(allStocks1)

/**
 * 异常成交量分析引擎 - 专注识别异常量能并区分高低位
 */
export const analyzeStockTrend = (klineData) => {


  if (!klineData || klineData.length < 30) {
    console.log('数据不足30天或为空');
    return null;
  }

  try {
    const len = klineData.length;
    
    // 数据预处理
    const closes = klineData.map(k => parseFloat(k[2]));
    const highs = klineData.map(k => parseFloat(k[3]));
    const lows = klineData.map(k => parseFloat(k[4]));
    const volumes = klineData.map(k => parseFloat(k[5]));
    
    // 当前数据
    const c0 = closes[len - 1]; // 今收
    const c1 = closes[len - 2]; // 昨收
    const v0 = volumes[len - 1]; // 今量
    const v1 = volumes[len - 2]; // 昨量

    // 计算关键位置
    const recentHighs = highs.slice(-30);
    const recentLows = lows.slice(-30);
    const high30 = Math.max(...recentHighs);
    const low30 = Math.min(...recentLows);
    const currentPosition = (c0 - low30) / (high30 - low30); // 0-1, 0为最低, 1为最高
    
    // 计算量能指标
    const recentVolumes = volumes.slice(-30);
    const avgVolume30 = recentVolumes.reduce((a, b) => a + b, 0) / 30;
    const volumeRatio = v0 / avgVolume30; // 相对于30日均量的倍数
    const volumeRatioYesterday = v0 / v1; // 相对于昨量的倍数

    const pctChg = (c0 - c1) / c1 * 100;

    console.log(`=== ${klineData[len-1]?.[0]} 量能分析 ===`);
    console.log(`价格位置: ${(currentPosition*100).toFixed(1)}% (相对30日)`);
    console.log(`量能倍数: ${volumeRatio.toFixed(2)}倍(30日均量), ${volumeRatioYesterday.toFixed(2)}倍(昨日)`);
    console.log(`涨跌幅: ${pctChg.toFixed(2)}%`);

    // --- 核心策略：异常成交量识别 ---
    
    // 策略1: 低位异常放量 (吸筹或启动信号)
    // 条件：位置低 + 放量明显 + 最好有止跌或启动迹象
    const isLowPosition = currentPosition < 0.3; // 底部30%区域
    const isLowVolumeSurge = volumeRatio > 2.0; // 2倍以上均量
    const isBottomRebound = pctChg > 0; // 今日上涨更佳
    
    if (isLowPosition && isLowVolumeSurge) {
      const signalType = isBottomRebound ? 'chip-gather' : 'attention';
      const desc = isBottomRebound ? '底部放量 → 资金吸筹' : '底部巨量 → 关注异动';
      
      console.log(`✅ 触发策略1: 低位异常放量`);
      return {
        signal: '低位放量',
        signalType: signalType,
        desc: desc,
        analysis: `股价处于30日相对低位(${(currentPosition*100).toFixed(1)}%)，今日成交量放大至30日均量的${volumeRatio.toFixed(1)}倍。${isBottomRebound ? '伴随价格上涨，疑似主力资金底部吸筹或启动信号。' : '量能异常放大，需关注后续价格走势确认方向。'}`
      };
    }

    // 策略2: 高位异常放量 (出货或震荡信号)
    // 条件：位置高 + 放量明显 + 滞涨或下跌更危险
    const isHighPosition = currentPosition > 0.7; // 顶部30%区域
    const isHighVolumeSurge = volumeRatio > 1.8; // 1.8倍以上均量
    const isStagnantOrFall = pctChg < 3; // 涨幅有限或下跌
    
    if (isHighPosition && isHighVolumeSurge) {
      const isDanger = pctChg < 0 || (pctChg < 2 && volumeRatio > 2.5); // 放量下跌或巨量滞涨更危险
      const signalType = isDanger ? 'risk' : 'attention';
      const desc = isDanger ? '高位放量 → 警惕出货' : '高位放量 → 注意分歧';
      
      console.log(`✅ 触发策略2: 高位异常放量`);
      return {
        signal: '高位放量',
        signalType: signalType,
        desc: desc,
        analysis: `股价处于30日相对高位(${(currentPosition*100).toFixed(1)}%)，今日成交量放大至30日均量的${volumeRatio.toFixed(1)}倍。${isDanger ? '伴随价格下跌或滞涨，疑似主力出货或获利了结，风险较大。' : '高位量能放大，显示多空分歧加大，需谨慎对待。'}`
      };
    }

    // 策略3: 突破位异常放量 (关键位置放量)
    // 条件：中等位置 + 巨量突破近期高点
    const isMidPosition = currentPosition >= 0.3 && currentPosition <= 0.7;
    const recent10High = Math.max(...closes.slice(len-11, len-1)); // 前10日最高
    const isBreakout = c0 > recent10High; // 突破近期高点
    const isBreakoutVolume = volumeRatio > 2.2; // 突破需要更大成交量
    
    if (isMidPosition && isBreakout && isBreakoutVolume) {
      console.log(`✅ 触发策略3: 突破位异常放量`);
      return {
        signal: '放量突破',
        signalType: 'trend-up',
        desc: '关键突破 → 趋势强化',
        analysis: `股价放量突破近期高点，成交量放大至30日均量的${volumeRatio.toFixed(1)}倍，显示突破有效性较高，可能开启新一轮上涨趋势。`
      };
    }

    // 策略4: 恐慌性异常放量 (暴跌巨量)
    // 条件：任何位置 + 暴跌 + 巨量
    const isPlummet = pctChg < -5; // 暴跌5%以上
    const isPanicVolume = volumeRatio > 2.5; // 恐慌性抛售
    
    if (isPlummet && isPanicVolume) {
      const positionDesc = currentPosition < 0.3 ? '低位' : currentPosition > 0.7 ? '高位' : '中位';
      console.log(`✅ 触发策略4: 恐慌性异常放量`);
      return {
        signal: '恐慌抛售',
        signalType: 'risk',
        desc: `${positionDesc}暴跌 → 恐慌释放`,
        analysis: `股价${positionDesc}暴跌${Math.abs(pctChg).toFixed(1)}%，成交量异常放大至30日均量的${volumeRatio.toFixed(1)}倍，显示恐慌盘集中涌出。${currentPosition < 0.3 ? '若在低位可能是最后一跌。' : '在高位需警惕趋势逆转。'}`
      };
    }

    // 策略5: 温和异常放量 (持续活跃)
    // 条件：量能持续高于平均水平但非极端
    const recent5DayAvgVol = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const isConsistentVolume = recent5DayAvgVol > avgVolume30 * 1.5; // 近期持续放量
    const isCurrentVolumeHigh = volumeRatio > 1.5; // 今日也放量
    
    if (isConsistentVolume && isCurrentVolumeHigh && Math.abs(pctChg) < 4) {
      const positionType = currentPosition < 0.4 ? '低位' : currentPosition > 0.6 ? '高位' : '中位';
      console.log(`✅ 触发策略5: 温和异常放量`);
      return {
        signal: '持续放量',
        signalType: 'attention',
        desc: `${positionType}活跃 → 资金关注`,
        analysis: `股价在${positionType}区域持续活跃，近期5日平均成交量是30日均量的${(recent5DayAvgVol/avgVolume30).toFixed(1)}倍，显示资金关注度提升，${positionType === '低位' ? '可能为建仓期' : positionType === '高位' ? '需观察资金意图' : '趋势可能强化'}。`
      };
    }

    console.log(`❌ 未发现明显异常成交量`);
    return null;

  } catch (error) {
    console.error('分析过程出错:', error);
    return null;
  }
};