import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // 处理双击标签事件
  const onEdgeLabelClick = (evt) => {
    evt.stopPropagation();
    // 这里我们通过 window.prompt 简单实现，实际项目中可以用更复杂的 UI
    // 注意：为了让父组件处理数据更新，我们最好通过 onEdgeClick 统一处理，
    // 但这里为了演示方便，我们使用 data.onLabelChange 回调（如果传入了的话）
    // 或者依赖 ReactFlow 的 onEdgeDoubleClick 事件（推荐）
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 11,
              pointerEvents: 'all',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              zIndex: 1000, // 确保标签在连线之上
            }}
            className="nodrag nopan"
            // 这里不需要绑定点击事件，因为 ReactFlow 的 onEdgeDoubleClick 会捕获到
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}