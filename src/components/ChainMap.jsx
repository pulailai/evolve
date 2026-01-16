import React from 'react';

const ChainMap = ({ chain }) => {
  if (!chain) return <div style={{padding:'20px', color:'#94a3b8', textAlign:'center'}}>暂无产业链数据</div>;
  
  return (
    <div className="chain-diagram">
      <div className="chain-col">
        <div className="chain-label">上游 (原材料/设备)</div>
        {chain.up.map((item, i) => (
          <div key={i} className="chain-node">{item}</div>
        ))}
      </div>
      
      <div className="chain-connector">➔</div>
      
      <div className="chain-col">
        <div className="chain-label">中游 (当前企业)</div>
        <div className="chain-node center">{chain.mid}</div>
      </div>
      
      <div className="chain-connector">➔</div>
      
      <div className="chain-col">
        <div className="chain-label">下游 (应用/客户)</div>
        {chain.down.map((item, i) => (
          <div key={i} className="chain-node">{item}</div>
        ))}
      </div>
    </div>
  );
};

export default ChainMap;