/**
 * 计算两个日期之间的交易日天数（排除周末）
 * @param {string|Date} startDate - 起始日期
 * @param {string|Date} endDate - 结束日期（默认为当前时间）
 * @returns {number} 交易日天数
 */
export const calculateTradingDays = (startDate, endDate = new Date()) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 重置时间为当天开始
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let tradingDays = 0;
    const current = new Date(start);

    while (current <= end) {
        const dayOfWeek = current.getDay();
        // 0 = 周日, 6 = 周六
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            // TODO: 可以在这里添加节假日判断
            // if (!isHoliday(current)) {
            tradingDays++;
            // }
        }
        current.setDate(current.getDate() + 1);
    }

    return tradingDays;
};

/**
 * 中国A股交易日判断（简化版）
 * 实际使用时可以接入交易日历API或维护节假日列表
 */
const HOLIDAYS_2026 = [
    // 元旦: 2026-01-01 至 2026-01-03
    '2026-01-01', '2026-01-02', '2026-01-03',
    // 春节: 2026-01-28 至 2026-02-03 (示例)
    '2026-01-28', '2026-01-29', '2026-01-30', '2026-01-31',
    '2026-02-01', '2026-02-02', '2026-02-03',
    // 清明节: 2026-04-04 至 2026-04-06
    '2026-04-04', '2026-04-05', '2026-04-06',
    // 劳动节: 2026-05-01 至 2026-05-05
    '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
    // 端午节: 2026-06-25 至 2026-06-27
    '2026-06-25', '2026-06-26', '2026-06-27',
    // 中秋节: 2026-10-01 至 2026-10-03
    '2026-10-01', '2026-10-02', '2026-10-03',
    // 国庆节: 2026-10-01 至 2026-10-08
    '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08',
];

/**
 * 判断是否为节假日
 */
export const isHoliday = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return HOLIDAYS_2026.includes(dateStr);
};

/**
 * 计算交易日天数（排除周末和节假日）
 */
export const calculateTradingDaysWithHolidays = (startDate, endDate = new Date()) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let tradingDays = 0;
    const current = new Date(start);

    while (current <= end) {
        const dayOfWeek = current.getDay();
        // 排除周末和节假日
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(current)) {
            tradingDays++;
        }
        current.setDate(current.getDate() + 1);
    }

    return tradingDays;
};
