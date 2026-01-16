// fetcher.js
const axios = require('axios');

/**
 * 从东方财富获取 A 股所有股票列表
 * 返回格式: ['sh600519', 'sz000001', ...]
 */
async function getAllStockCodes() {
    console.log("正在拉取最新的 A 股列表...");
    
    // 东方财富行情中心接口 (fs=m:0+t:6,m:0+t:80 代表沪深A股)
    const url = "http://82.push2.eastmoney.com/api/qt/clist/get?pn=1&pz=10000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f14";

    try {
        const res = await axios.get(url);
        const list = res.data.data.diff; // 原始数据列表

        if (!list || list.length === 0) {
            throw new Error("未能获取到股票列表");
        }

        // 格式化代码：加上 sh 或 sz 前缀
        const formattedList = list.map(item => {
            const code = item.f12; // 股票代码，如 "600519"
            const name = item.f14; // 股票名称
            let prefix = 'sz';
            
            // 简单判断逻辑：6开头是上海，0/3开头是深圳，4/8是北交所(可选)
            if (code.startsWith('6')) {
                prefix = 'sh';
            } else if (code.startsWith('4') || code.startsWith('8')) {
                prefix = 'bj'; // 北交所，如果你想分析的话
            }
            
            return {
                symbol: prefix + code, // sh600519
                code: code,            // 600519
                name: name             // 贵州茅台
            };
        });

        console.log(`成功获取 ${formattedList.length} 只股票。`);
        return formattedList;

    } catch (error) {
        console.error("获取股票列表失败:", error.message);
        return [];
    }
}

module.exports = { getAllStockCodes };