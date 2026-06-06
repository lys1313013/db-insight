import { Card, Row, Col, Tag, Empty, Spin, Typography, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTableStore } from '../../stores/tableStore';

const { Text } = Typography;

export function TableList() {
  const { tables, tableSearchQuery, setTableSearchQuery, loading } = useTableStore();
  const navigate = useNavigate();

  const filteredTables = tables.filter((table) =>
    table.tableName.toLowerCase().includes(tableSearchQuery.toLowerCase())
  );

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
  }

  if (filteredTables.length === 0) {
    return <Empty description="暂无表数据" style={{ marginTop: 100 }} />;
  }

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 15 }}>表列表</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Input
            placeholder="搜索表名..."
            value={tableSearchQuery}
            onChange={(e) => setTableSearchQuery(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Tag>{filteredTables.length} 张表</Tag>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {filteredTables.map((table) => (
          <Col key={table.tableName} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              onClick={() => navigate(`/table/${table.tableName}`)}
              size="small"
            >
              <div>
                <Text strong style={{ fontSize: 13, display: 'block' }}>{table.tableName}</Text>
                {table.tableComment && (
                  <Text type="secondary" style={{ fontSize: 12 }}>{table.tableComment}</Text>
                )}
                <div style={{ marginTop: 4 }}><Text type="secondary" style={{ fontSize: 11 }}>{table.columnCount} 列</Text></div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
