import { useNavigate } from 'react-router-dom';
import { Input, List, Typography } from 'antd';
import { useTableStore } from '../../stores/tableStore';

const { Text } = Typography;

export function Sidebar() {
  const { tables, tableSearchQuery, setTableSearchQuery, loading: tableLoading } = useTableStore();
  const navigate = useNavigate();

  const filteredTables = tables.filter((t) =>
    !tableSearchQuery || t.tableName.toLowerCase().includes(tableSearchQuery.toLowerCase())
  );

  return (
    <aside style={{
      width: 280,
      background: '#fff',
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Input
          placeholder="搜索表名..."
          value={tableSearchQuery}
          onChange={(e) => setTableSearchQuery(e.target.value)}
          allowClear
        />
      </div>

      <List
        loading={tableLoading}
        style={{ flex: 1, overflow: 'auto' }}
        dataSource={filteredTables}
        renderItem={(table) => (
          <List.Item
            onClick={() => navigate(`/table/${table.tableName}`)}
            style={{ cursor: 'pointer', padding: '10px 16px' }}
          >
            <List.Item.Meta
              title={
                <Text style={{ fontSize: 13 }} strong>
                  {table.tableName}
                </Text>
              }
              description={
                table.tableComment ? (
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, display: 'block', marginTop: 2 }}
                    ellipsis={{ tooltip: table.tableComment }}
                  >
                    {table.tableComment}
                  </Text>
                ) : null
              }
            />
          </List.Item>
        )}
      />

      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>共 {filteredTables.length} 张表</Text>
      </div>
    </aside>
  );
}
