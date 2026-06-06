import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, List, Badge, Card, Tag, Typography, Space, message, Popconfirm, Spin, Empty, Modal, Tooltip } from 'antd';
import { DeleteOutlined, DatabaseOutlined, PlusOutlined, ReloadOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTableStore } from '../../stores/tableStore';
import { ConnectionConfig, ConnectionView } from '../../types';

const { Text } = Typography;

const DB_TYPE_STYLE: Record<'mysql' | 'postgresql', { label: string; color: string; tagColor: string }> = {
  postgresql: { label: 'PostgreSQL', color: '#336791', tagColor: 'blue' },
  mysql: { label: 'MySQL', color: '#00758f', tagColor: 'cyan' },
};

const DEFAULT_CONFIG: ConnectionConfig = {
  name: '',
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: '',
};

export function Sidebar() {
  const {
    isConnected,
    connectionId: activeConnectionId,
    loading: connectionLoading,
    connections,
    loadingConnections,
    connect,
    connectToView,
    deleteConnection,
    loadConnections,
  } = useConnectionStore();
  const { tables, tableSearchQuery, setTableSearchQuery, columnSearchQuery, setColumnSearchQuery, loading: tableLoading } = useTableStore();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [newConnOpen, setNewConnOpen] = useState(false);
  const [config, setConfig] = useState<ConnectionConfig>(DEFAULT_CONFIG);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const resetForm = () => setConfig({ ...DEFAULT_CONFIG, port: config.type === 'mysql' ? 3306 : 5432 });

  const handleNewConnection = async () => {
    try {
      await connect(config);
      useTableStore.getState().fetchTables();
      messageApi.success('连接成功');
      setNewConnOpen(false);
      resetForm();
      navigate('/list');
    } catch (err: unknown) {
      const msg = extractMessage(err, '连接失败');
      messageApi.error(msg);
    }
  };

  const handleConnectToView = async (view: ConnectionView) => {
    setConnectingId(view.id);
    try {
      await connectToView(view);
      useTableStore.getState().fetchTables();
      messageApi.success(`已切换到「${view.name}」`);
      navigate('/list');
    } catch {
      messageApi.error('连接已失效,请检查目标库后重新创建');
    } finally {
      setConnectingId(null);
    }
  };

  const handleDeleteView = async (id: string, name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await deleteConnection(id);
      messageApi.success(`已删除「${name}」`);
    } catch {
      messageApi.error('删除失败');
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

  if (isConnected) {
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
      </aside>
    );
  }

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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        flexShrink: 0,
      }}>
        <Space size={4}>
          <Text strong style={{ fontSize: 14 }}>连接</Text>
          {!loadingConnections && (
            <Text type="secondary" style={{ fontSize: 12 }}>· {connections.length}</Text>
          )}
          {loadingConnections && <Spin size="small" />}
        </Space>
        <Space size={2}>
          <Tooltip title="新建连接">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                resetForm();
                setNewConnOpen(true);
              }}
              aria-label="新建连接"
            />
          </Tooltip>
          <Tooltip title="刷新列表">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={loadConnections}
              aria-label="刷新"
            />
          </Tooltip>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: connections.length > 0 ? 12 : 0 }}>
        {connections.length === 0 && !loadingConnections ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: 24,
            gap: 16,
          }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space orientation="vertical" size={4}>
                  <Text type="secondary" style={{ fontSize: 13 }}>还没有连接</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>点右上 + 添加一个数据库</Text>
                </Space>
              }
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { resetForm(); setNewConnOpen(true); }}>
              新建连接
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {connections.map((view) => {
              const meta = DB_TYPE_STYLE[view.dbType];
              const isConnecting = connectingId === view.id;
              const isActive = activeConnectionId === view.id;
              return (
                <Card
                  key={view.id}
                  size="small"
                  hoverable
                  onClick={() => handleConnectToView(view)}
                  styles={{ body: { padding: 0, borderRadius: 6 } }}
                  style={{
                    cursor: isConnecting ? 'wait' : 'pointer',
                    borderLeft: `3px solid ${meta.color}`,
                    opacity: isConnecting ? 0.7 : 1,
                    background: isActive ? '#f0f7ff' : undefined,
                  }}
                >
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <Space size={4} align="center" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        {isActive && <CheckCircleFilled style={{ color: '#52c41a', fontSize: 12, flexShrink: 0 }} />}
                        <Text strong style={{ fontSize: 13, lineHeight: '20px' }} ellipsis>
                          {view.name}
                        </Text>
                      </Space>
                      <Popconfirm
                        title="确定删除该连接？"
                        description="将同时删除后端保存的连接配置"
                        onConfirm={(e) => handleDeleteView(view.id, view.name, e)}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="删除连接"
                        />
                      </Popconfirm>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag
                        color={meta.tagColor}
                        icon={<DatabaseOutlined />}
                        style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 6px' }}
                      >
                        {meta.label}
                      </Tag>
                      {isConnecting && <Spin size="small" />}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Text type="secondary" style={{ fontSize: 11 }} ellipsis>
                        {view.host}:{view.port}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }} ellipsis>
                        {view.database}
                      </Text>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        title="新建数据库连接"
        open={newConnOpen}
        onCancel={() => setNewConnOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setNewConnOpen(false)}>取消</Button>,
          <Button
            key="ok"
            type="primary"
            loading={connectionLoading}
            onClick={handleNewConnection}
          >
            连接
          </Button>,
        ]}
        width={460}
        destroyOnHidden
        afterClose={resetForm}
      >
        <Form layout="vertical" size="middle" style={{ marginTop: 8 }}>
          <Form.Item label="连接名称" required>
            <Input
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="例如:生产数据库"
              autoFocus
            />
          </Form.Item>
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
          <Form.Item label="主机地址" required>
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
            <Form.Item label="数据库名" style={{ flex: 1 }} required>
              <Input
                value={config.database}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                placeholder="mydb"
              />
            </Form.Item>
          </div>
          <Form.Item label="用户名" required>
            <Input
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              placeholder="root"
            />
          </Form.Item>
          <Form.Item label="密码" required>
            <Input.Password
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              placeholder="输入密码"
              autoComplete="new-password"
            />
          </Form.Item>
        </Form>
        <div style={{ marginTop: 8 }}>
          <Button type="primary" onClick={handleNewConnection} loading={connectionLoading} block>
            DEBUG: 直接点我
          </Button>
        </div>
      </Modal>
    </aside>
  );
}

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? fallback;
  }
  return fallback;
}
