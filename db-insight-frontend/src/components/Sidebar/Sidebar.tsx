import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, List, Badge, Typography, Space, message, Modal, Popconfirm } from 'antd';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTableStore } from '../../stores/tableStore';
import { ConnectionConfig } from '../../types';

const { Text } = Typography;

export function Sidebar() {
  const { isConnected, loading: connectionLoading, connect, savedConnections, saveConnection, deleteSavedConnection } = useConnectionStore();
  const { tables, tableSearchQuery, setTableSearchQuery, columnSearchQuery, setColumnSearchQuery, loading: tableLoading } = useTableStore();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [config, setConfig] = useState<ConnectionConfig>({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: '',
  });

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleConnect = async () => {
    try {
      await connect(config);
      useTableStore.getState().fetchTables();
      messageApi.success('连接成功');
    } catch {
      messageApi.error('连接失败');
    }
  };

  const filteredTables = tables.filter((t) => {
    const matchTable = !tableSearchQuery || t.tableName.toLowerCase().includes(tableSearchQuery.toLowerCase());
    const matchColumn = !columnSearchQuery || (t.columnNames && t.columnNames.toLowerCase().includes(columnSearchQuery.toLowerCase()));
    return matchTable && matchColumn;
  });

  const handleTypeChange = (type: 'mysql' | 'postgresql') => {
    setConfig({
      ...config,
      type,
      port: type === 'mysql' ? 3306 : 5432,
    });
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveConnection(saveName.trim(), config);
    setSaveModalOpen(false);
    setSaveName('');
    messageApi.success('已保存');
  };

  const handleLoadSaved = (saved: typeof savedConnections[0]) => {
    setConfig(saved.config);
  };

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
      {contextHolder}
      {!isConnected ? (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
          <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 16 }}>数据库连接</Text>

          <Form layout="vertical" size="middle" style={{ marginBottom: savedConnections.length > 0 ? 16 : 0 }}>
            <Form.Item label="数据库类型">
              <Select
                value={config.type}
                onChange={handleTypeChange}
                options={[
                  { label: 'MySQL', value: 'mysql' },
                  { label: 'PostgreSQL', value: 'postgresql' },
                ]}
              />
            </Form.Item>
            <Form.Item label="主机地址">
              <Input
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="localhost"
              />
            </Form.Item>
            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item label="端口" style={{ flex: 1 }}>
                <Input
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 0 })}
                />
              </Form.Item>
              <Form.Item label="数据库名" style={{ flex: 1 }}>
                <Input
                  value={config.database}
                  onChange={(e) => setConfig({ ...config, database: e.target.value })}
                  placeholder="mydb"
                />
              </Form.Item>
            </div>
            <Form.Item label="用户名">
              <Input
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="root"
              />
            </Form.Item>
            <Form.Item label="密码">
              <Input.Password
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="输入密码"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Button
                  type="primary"
                  loading={connectionLoading}
                  onClick={handleConnect}
                  style={{ flex: 1 }}
                >
                  连接
                </Button>
                <Button onClick={() => setSaveModalOpen(true)}>
                  保存
                </Button>
              </Space.Compact>
            </Form.Item>
          </Form>

          {savedConnections.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>已保存的连接</Text>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedConnections.map((saved) => (
                  <div
                    key={saved.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: '#fafafa',
                      border: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleLoadSaved(saved)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 13, display: 'block' }} ellipsis>{saved.name}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {saved.config.type} · {saved.config.host}:{saved.config.port} · {saved.config.database}
                      </Text>
                    </div>
                    <Popconfirm
                      title="确定删除？"
                      onConfirm={(e) => { e?.stopPropagation(); deleteSavedConnection(saved.id); }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="删除"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        onClick={(e) => e.stopPropagation()}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Input
              placeholder="搜索表名..."
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              allowClear
            />
            <Input
              placeholder="搜索列名..."
              value={columnSearchQuery}
              onChange={(e) => setColumnSearchQuery(e.target.value)}
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
                actions={[<Badge key="count" count={`${table.columnCount}列`} style={{ backgroundColor: '#f0f0f0', color: '#666' }} />]}
              >
                <List.Item.Meta
                  title={<Text style={{ fontSize: 13 }}>{table.tableName}</Text>}
                />
              </List.Item>
            )}
          />

          <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>共 {filteredTables.length} 张表</Text>
          </div>
        </div>
      )}

      <Modal
        title="保存连接"
        open={saveModalOpen}
        onOk={handleSave}
        onCancel={() => { setSaveModalOpen(false); setSaveName(''); }}
        okText="保存"
        cancelText="取消"
      >
        <Input
          placeholder="输入连接名称，例如：生产数据库"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          onPressEnter={handleSave}
          autoFocus
        />
      </Modal>
    </aside>
  );
}
