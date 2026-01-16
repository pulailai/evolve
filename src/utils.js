export const calculateMarketDays = (startDateStr, endDateStr = null) => {
  if (!startDateStr) return { text: 'T+0', details: '', trading: 0, rest: 0 };

  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) return { text: 'T+0', details: '(未来)', trading: 0, rest: 0 };

  let tradingDays = 0;
  let restDays = 0;
  let current = new Date(start);

  // 循环包含开始当天
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      restDays++;
    } else {
      tradingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  const restInfo = restDays > 0 ? `(+${restDays}休)` : '';
  const statusSuffix = endDateStr ? ' (完)' : '';

  return {
    text: `T+${tradingDays}${statusSuffix}`,
    details: restInfo,
    trading: tradingDays,
    rest: restDays,
    isFrozen: !!endDateStr
  };
};

/**
 * 计算各阶段的天数统计
 * @param {Array} stages - lifecycle.stages 数组
 * @param {String} currentStageId - lifecycle.current 当前阶段ID
 * @returns {Object} { label: '主升3天 分歧2天', details: {...}, total: 5 }
 */
export const calculateStageDays = (stages = [], currentStageId = null) => {
  if (!stages || stages.length === 0) {
    return { label: 'T+0', details: {}, total: 0 };
  }

  // 阶段类型映射到中文标签
  const stageTypeLabels = {
    'startup': '启动',
    'rise': '主升',
    'acceleration': '加速',
    'outbreak': '爆发',
    'accelerated_divergence': '加速分歧',
    'divergence': '分歧',
    'contraction': '缩容',
    'follow_up': '补涨',
    'repair': '修复',
    'second_wave': '二波',
    'decline': '退潮',
    'switch': '切换'
  };

  // 统计各阶段类型的天数
  const stageCounts = {};
  let totalDays = 0;

  // 按照添加顺序（不排序）
  const sortedStages = stages;

  // 计算每个阶段的实际持续天数
  sortedStages.forEach((stage, index) => {
    const typeId = stage.typeId || 'startup';
    const label = stageTypeLabels[typeId] || typeId;

    let days = 1; // 默认1天

    if (stage.time) {
      const stageDate = new Date(stage.time.replace(/-/g, '/'));
      let endDate;

      // 如果有下一个阶段，用下一个阶段的时间作为结束时间（不包含下一个阶段的当天）
      if (index < sortedStages.length - 1 && sortedStages[index + 1].time) {
        endDate = new Date(sortedStages[index + 1].time.replace(/-/g, '/'));
        // 减去一天，不包含下一个阶段开始的那一天
        endDate.setDate(endDate.getDate() - 1);
      } else {
        // 如果是最后一个阶段，用当前时间
        endDate = new Date();
      }

      // 计算交易日天数
      const result = calculateMarketDays(
        stageDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      days = result.trading || 1;
    }

    if (!stageCounts[label]) {
      stageCounts[label] = 0;
    }
    stageCounts[label] += days;
    totalDays += days;
  });

  // 构建显示标签，按照添加顺序显示
  const parts = [];

  // 遍历原始stages数组，按添加顺序收集阶段标签
  sortedStages.forEach(stage => {
    const typeId = stage.typeId || 'startup';
    const label = stageTypeLabels[typeId] || typeId;
    const count = stageCounts[label];
    if (count && !parts.some(p => p.startsWith(label))) {
      parts.push(`${label}${count}`);
    }
  });

  const displayLabel = parts.length > 0 ? parts.join(' → ') : 'T+0';

  // 创建精简版标签（只显示第1个阶段，避免太长）
  const compactParts = parts.slice(0, 1);
  const remainingCount = parts.length - 1;
  let compactLabel = compactParts.join(' → ');
  if (remainingCount > 0) {
    compactLabel += ` +${remainingCount}`;
  }
  if (compactLabel === '') {
    compactLabel = 'T+0';
  }

  return {
    label: displayLabel,
    compactLabel: compactLabel,
    details: stageCounts,
    total: totalDays
  };
};