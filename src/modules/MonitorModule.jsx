import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import StockChart from '../components/StockChart';
import ChainMap from '../components/ChainMap';
import { fetchStockData } from '../services/stockService';
import './MonitorModule.css'; 

const MonitorModule = () => {
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailTab, setDetailTab] = useState('news'); 
  
  // 分类数据状态
  const [trendUpList, setTrendUpList] = useState([]);
  const [panicList, setPanicList] = useState([]);
  const [chipList, setChipList] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // 🔄 加载并筛选数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const stocks = await fetchStockData();
      
      // 1. 🚀 趋势加速 (Trend Up)
      const up = stocks.filter(s => s.signalType === 'trend-up');
      // 2. ⚠️ 异常放量杀跌 (Risk/Panic)
      const panic = stocks.filter(s => s.signalType === 'risk');
      // 3. 🧱 底部堆量 (Chip Gather)
      const chip = stocks.filter(s => s.signalType === 'chip-gather');
      
      setTrendUpList(up);
      setPanicList(panic);
      setChipList(chip);

      // 默认选中
      const all = [...up, ...panic, ...chip];
      if (all.length > 0) setSelectedItem(all[0]);
      else if (stocks.length > 0) setSelectedItem(stocks[0]);
      
      setLoading(false);
    };

    loadData();
  }, []);

  // 模拟的静态映射数据 (因为暂时没接美股接口)
  const mapData = [
    { id: 'm1', name: '英伟达 (NVDA)', code: 'US', tag: '算力', price: '+2.8%', type: 'up',
      chartData: [800, 810, 820, 830, 825, 835, 840, 850, 860, 870],
      chain: { up: ['台积电 (CoWoS)'], mid: '英伟达', down: ['OpenAI', 'Meta'] },
      events: [{ time: '昨夜', text: 'GTC大会发布B200芯片，算力需求持续爆发', tag: '产业' }]
    },
  ];

  useEffect(() => {
    if (!loading && activeTab === 'map') {
       setSelectedItem(mapData[0]);
    }
  }, [activeTab, loading]);

  return (
    <div className="monitor-container">
      <div className="monitor-tabs">
        <button className={`monitor-tab-btn ${activeTab === 'radar' ? 'active' : ''}`} onClick={() => setActiveTab('radar')}>
          <Icons.Radar /> A股量能雷达
        </button>
        <button className={`monitor-tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          <Icons.Cloud /> 全球映射
        </button>
      </div>

      <div className="monitor-split-view">
        
        {/* 左侧列表 */}
        <div className="monitor-list-panel">
          <div className="list-header">
             {activeTab === 'radar' ? '量价异动筛选' : '全球映射'}
             {loading && <span style={{fontWeight:'normal', fontSize:'12px', color:'#94a3b8'}}> 扫描中...</span>}
          </div>
          <div className="list-content">
            
            {activeTab === 'radar' && (
              <>
                {trendUpList.length > 0 && (
                  <div className="pool-group-title" style={{color: '#ef4444'}}>🚀 上涨趋势·梯量拉升</div>
                )}
                {trendUpList.map(item => (
                  <StockCard key={item.id} item={item} selectedItem={selectedItem} onClick={setSelectedItem} />
                ))}

                {panicList.length > 0 && (
                  <div className="pool-group-title" style={{color: '#f59e0b'}}>⚠️ 下跌趋势·放量杀跌</div>
                )}
                {panicList.map(item => (
                  <StockCard key={item.id} item={item} selectedItem={selectedItem} onClick={setSelectedItem} />
                ))}

                {chipList.length > 0 && (
                  <div className="pool-group-title" style={{color: '#7c3aed'}}>🧱 止跌企稳·底部堆量</div>
                )}
                {chipList.map(item => (
                  <StockCard key={item.id} item={item} selectedItem={selectedItem} onClick={setSelectedItem} />
                ))}
                
                {!loading && trendUpList.length===0 && panicList.length===0 && chipList.length===0 && (
                   <div style={{padding:'20px', color:'#cbd5e1', textAlign:'center', fontSize:'12px'}}>
                     今日市场平淡，观察池中暂无符合特定战法的异动个股。
                   </div>
                )}
              </>
            )}

            {activeTab === 'map' && mapData.map(item => (
              <StockCard key={item.id} item={item} selectedItem={selectedItem} onClick={setSelectedItem} />
            ))}

          </div>
        </div>

        {/* 右侧详情 */}
        <div className="monitor-detail-panel">
          {selectedItem ? (
            <>
              <div className="detail-top-section">
                <div className="detail-header">
                  <div>
                    <div className="detail-title">{selectedItem.name}</div>
                    <div className="detail-subtitle">
                      <span>{selectedItem.code}</span><span>•</span><span>{selectedItem.tag}</span>
                      {selectedItem.currentPrice && <span>• ￥{selectedItem.currentPrice}</span>}
                    </div>
                  </div>
                  <div className={`detail-quote ${selectedItem.type === 'up' ? 'quote-up' : 'quote-down'}`}>{selectedItem.price}</div>
                </div>
                <StockChart data={selectedItem.chartData} volume={selectedItem.volume} color={selectedItem.type} />
              </div>

              <div className="detail-bottom-section">
                <div className="detail-tabs">
                  <button className={`detail-tab-btn ${detailTab === 'news' ? 'active' : ''}`} onClick={() => setDetailTab('news')}>🔴 实时情报</button>
                  <button className={`detail-tab-btn ${detailTab === 'chain' ? 'active' : ''}`} onClick={() => setDetailTab('chain')}>🔵 产业链图谱</button>
                </div>

                <div className="detail-content">
                  {detailTab === 'news' && (
                    <div>
                      {selectedItem.analysis && (
                         <div className="analysis-card">
                            <div className="analysis-title">📈 智能量价分析</div>
                            <div className="analysis-content">{selectedItem.analysis}</div>
                         </div>
                      )}
                      {selectedItem.events?.map((evt, idx) => (
                        <div key={idx} className="news-item">
                          <div className="news-time">{evt.time}</div>
                          <div className="news-body">
                            <div className="news-text"><span className="news-tag">{evt.tag}</span>{evt.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {detailTab === 'chain' && (
                     // 如果没有真实 chain 数据，显示简单的占位，或者可以在 service 中补充
                     selectedItem.chain ? <ChainMap chain={selectedItem.chain} /> : 
                     <div style={{textAlign:'center', color:'#cbd5e1', marginTop:'20px'}}>暂无产业链数据</div>
                  )}
                </div>
              </div>
            </>
          ) : <div className="placeholder-page">请选择左侧个股查看详情</div>}
        </div>
      </div>
    </div>
  );
};

const StockCard = ({ item, selectedItem, onClick }) => (
  <div className={`stock-card ${selectedItem?.id === item.id ? 'active' : ''}`} onClick={() => onClick(item)}>
    <div className="stock-card-main">
      <div className="stock-title">
        {item.name} 
        {item.signal && <span className={`stock-signal signal-${item.signalType}`} style={{marginLeft:'6px', fontSize:'9px'}}>{item.signal}</span>}
      </div>
      <div className="stock-tags"><span className="mini-tag">{item.tag}</span></div>
    </div>
    <div className={item.type === 'up' ? 'up' : 'down'} style={{fontWeight:'700', fontFamily:'Monaco'}}>{item.price}</div>
  </div>
);

export default MonitorModule;