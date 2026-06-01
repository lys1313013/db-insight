import { useMemo } from 'react';
import {
  ReactFlow,
  Node,
  useNodesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTableStore } from '../../stores/tableStore';

const { Text } = Typography;

const TABLE_NODE_WIDTH = 250;
const TABLE_NODE_HEIGHT_BASE = 80;
const TABLE_NODE_HEIGHT_PER_COLUMN = 24;

function TableNode({ data }: { data: { table: ReturnType<typeof useTableStore.getState>['tables'][0]; onClick: () => void } }) {
  const { table, onClick } = data;
  const columns = table.columnNames ? table.columnNames.split(', ') : [];
  const height = TABLE_NODE_HEIGHT_BASE + (columns.length * TABLE_NODE_HEIGHT_PER_COLUMN);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        padding: 12,
        cursor: 'pointer',
        minHeight: height,
        minWidth: TABLE_NODE_WIDTH,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.2s',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(24,144,255,0.2)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1890ff';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e8e8';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>{table.tableName}</span>
      </div>
      {table.tableComment && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{table.tableComment}</Text>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {columns.map((col) => (
          <Text key={col} style={{ fontSize: 12, color: '#595959', lineHeight: '20px' }}>{col}</Text>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = {
  tableNode: TableNode,
};

export function TableCanvas() {
  const { tables } = useTableStore();
  const navigate = useNavigate();

  const initialNodes: Node[] = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(tables.length));
    return tables.map((table, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const columnCount = table.columnNames ? table.columnNames.split(', ').length : table.columnCount;
      const height = TABLE_NODE_HEIGHT_BASE + (columnCount * TABLE_NODE_HEIGHT_PER_COLUMN);

      return {
        id: table.tableName,
        type: 'tableNode',
        position: {
          x: col * (TABLE_NODE_WIDTH + 40) + 50,
          y: row * (height + 40) + 50,
        },
        data: {
          table,
          onClick: () => navigate(`/table/${table.tableName}`),
        },
      };
    });
  }, [tables, navigate]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.25}
        maxZoom={2}
      >
        <Background gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
