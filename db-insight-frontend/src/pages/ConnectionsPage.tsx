import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Empty,
  Spin,
  Popconfirm,
  Tooltip,
  message,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  CheckCircleFilled,
  ThunderboltOutlined,
  GlobalOutlined,
  UserOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { useConnectionStore } from '../stores/connectionStore';
import { useTableStore } from '../stores/tableStore';
import { ConnectionConfig, ConnectionView } from '../types';
import { DbLogo } from '../components/DbLogo/DbLogo';

const { Text, Title } = Typography;

type DbType = 'mysql' | 'postgresql';

const DB_TYPE_STYLE: Record<DbType, { label: string; color: string; soft: string }> = {
  postgresql: { label: 'PostgreSQL', color: '#336791', soft: '#e6efff' },
  mysql: { label: 'MySQL', color: '#00758f', soft: '#e0f3f7' },
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

export function ConnectionsPage() {
  const {
    isConnected,
    connectionId: activeConnectionId,
    loading: connectionLoading,
    connections,
    loadingConnections,
    connect,
    connectToView,
    deleteConnection,
    updateConnection,
    loadConnections,
  } = useConnectionStore();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [newConnOpen, setNewConnOpen] = useState(false);
  const [config, setConfig] = useState<ConnectionConfig>(DEFAULT_CONFIG);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const resetForm = (preserveType = false) => {
    const currentType = preserveType ? config.type : 'mysql';
    setConfig({ ...DEFAULT_CONFIG, type: currentType, port: currentType === 'mysql' ? 3306 : 5432 });
    setEditingId(null);
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

  const handleDeleteView = async (id: string, name: string) => {
    try {
      await deleteConnection(id);
      messageApi.success(`已删除「${name}」`);
    } catch {
      messageApi.error('删除失败');
    }
  };

  const handleOpenEdit = (view: ConnectionView) => {
    setEditingId(view.id);
    setConfig({
      name: view.name,
      type: view.dbType,
      host: view.host,
      port: view.port,
      username: view.username,
      password: '',
      database: view.database,
    });
    setNewConnOpen(true);
  };

  const handleSaveConnection = async () => {
    if (editingId) {
      try {
        await updateConnection(editingId, config);
        messageApi.success('连接已更新');
        setNewConnOpen(false);
        resetForm(true);
      } catch (err: unknown) {
        messageApi.error(extractMessage(err, '更新失败'));
      }
    } else {
      try {
        await connect(config);
        useTableStore.getState().fetchTables();
        messageApi.success('连接成功');
        setNewConnOpen(false);
        resetForm(true);
        navigate('/list');
      } catch (err: unknown) {
        messageApi.error(extractMessage(err, '连接失败'));
      }
    }
  };

  const handleTypeChange = (type: DbType) => {
    setConfig({
      ...config,
      type,
      port: type === 'mysql' ? 3306 : 5432,
    });
  };

  const isEmpty = !loadingConnections && connections.length === 0;

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#f7f8fa' }}>
      {contextHolder}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 64px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 32,
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 600, letterSpacing: -0.3 }}>
              数据库连接
            </Title>
            <Text type="secondary" style={{ fontSize: 13, marginTop: 6, display: 'block' }}>
              {isConnected
                ? '当前已连接,你可以切换到其他库,或新建一个连接'
                : '选择一个已保存的连接,或新建一个开始浏览'}
            </Text>
          </div>
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={loadConnections} loading={loadingConnections}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                resetForm();
                setNewConnOpen(true);
              }}
            >
              新建连接
            </Button>
          </Space>
        </div>

        {loadingConnections ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
            <Spin size="large" />
          </div>
        ) : isEmpty ? (
          <Card
            bordered={false}
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            styles={{ body: { padding: '64px 24px' } }}
          >
            <Empty
              image={
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 22,
                    background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f0fa 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DatabaseOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                </div>
              }
              description={
                <Space orientation="vertical" size={4} style={{ marginTop: 8 }}>
                  <Text strong style={{ fontSize: 15 }}>还没有数据库连接</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>新建一个连接,开始探索你的数据库</Text>
                </Space>
              }
            >
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => {
                  resetForm();
                  setNewConnOpen(true);
                }}
                style={{ marginTop: 16 }}
              >
                新建连接
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {connections.map((view) => (
              <Col key={view.id} xs={24} sm={12} md={8} lg={8} xl={6}>
                <ConnectionCard
                  view={view}
                  isActive={activeConnectionId === view.id}
                  isConnecting={connectingId === view.id}
                  onConnect={() => handleConnectToView(view)}
                  onEdit={() => handleOpenEdit(view)}
                  onDelete={() => handleDeleteView(view.id, view.name)}
                />
              </Col>
            ))}
            <Col xs={24} sm={12} md={8} lg={8} xl={6}>
              <AddConnectionCard onClick={() => { resetForm(); setNewConnOpen(true); }} />
            </Col>
          </Row>
        )}
      </div>

      <Modal
        title={editingId ? '编辑数据库连接' : '新建数据库连接'}
        open={newConnOpen}
        onCancel={() => { setNewConnOpen(false); resetForm(true); }}
        footer={[
          <Button key="cancel" onClick={() => { setNewConnOpen(false); resetForm(true); }}>取消</Button>,
          <Button
            key="ok"
            type="primary"
            loading={connectionLoading}
            onClick={handleSaveConnection}
          >
            {editingId ? '保存' : '测试并连接'}
          </Button>,
        ]}
        width={460}
        destroyOnHidden
        afterClose={() => resetForm(true)}
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
              placeholder={editingId ? '留空则不修改密码' : '输入密码'}
              autoComplete="new-password"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function ConnectionCard({
  view,
  isActive,
  isConnecting,
  onConnect,
  onEdit,
  onDelete,
}: {
  view: ConnectionView;
  isActive: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = DB_TYPE_STYLE[view.dbType];

  return (
    <div
      onClick={() => !isConnecting && onConnect()}
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 12,
        border: isActive ? `1.5px solid ${meta.color}` : '1px solid #ececec',
        boxShadow: isActive
          ? '0 4px 14px rgba(51, 103, 145, 0.12)'
          : '0 1px 2px rgba(0, 0, 0, 0.03)',
        padding: '20px 20px 16px',
        cursor: isConnecting ? 'wait' : 'pointer',
        opacity: isConnecting ? 0.6 : 1,
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !isConnecting) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.08)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isConnecting) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }
      }}
    >
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 999,
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            color: '#389e0d',
            fontSize: 11,
            lineHeight: '18px',
            fontWeight: 500,
          }}
        >
          <CheckCircleFilled style={{ fontSize: 11 }} />
          已连接
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <DbLogo type={view.dbType} size={36} style={{ flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1, paddingRight: isActive ? 70 : 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1f1f1f',
              lineHeight: '22px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {view.name}
          </div>
          <Tag
            color="default"
            style={{
              marginTop: 4,
              fontSize: 11,
              padding: '0 6px',
              lineHeight: '18px',
              borderRadius: 4,
              background: meta.soft,
              color: meta.color,
              border: 'none',
            }}
          >
            {meta.label}
          </Tag>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '12px 0',
          borderTop: '1px dashed #f0f0f0',
          borderBottom: '1px dashed #f0f0f0',
          marginBottom: 14,
        }}
      >
        <MetaRow icon={<GlobalOutlined />} label="主机" value={`${view.host}:${view.port}`} />
        <MetaRow icon={<ProfileOutlined />} label="库名" value={view.database} />
        <MetaRow icon={<UserOutlined />} label="用户" value={view.username} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <Button
          type="primary"
          size="small"
          icon={<ThunderboltOutlined />}
          loading={isConnecting}
          onClick={onConnect}
          style={{ flex: 1 }}
        >
          {isActive ? '重新连接' : '连接'}
        </Button>
        <Tooltip title="编辑">
          <Button size="small" icon={<EditOutlined />} onClick={onEdit} />
        </Tooltip>
        <Popconfirm
          title="确定删除该连接？"
          description="将同时删除后端保存的连接配置"
          onConfirm={onDelete}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <span style={{ color: '#bfbfbf', fontSize: 12, display: 'flex', alignItems: 'center' }}>{icon}</span>
      <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>{label}</Text>
      <Text style={{ fontSize: 12, color: '#262626', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </Text>
    </div>
  );
}

function AddConnectionCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        height: '100%',
        minHeight: 240,
        borderRadius: 12,
        border: '1.5px dashed #d9d9d9',
        background: '#fafbfc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: '#8c8c8c',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1677ff';
        (e.currentTarget as HTMLDivElement).style.color = '#1677ff';
        (e.currentTarget as HTMLDivElement).style.background = '#f0f5ff';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#d9d9d9';
        (e.currentTarget as HTMLDivElement).style.color = '#8c8c8c';
        (e.currentTarget as HTMLDivElement).style.background = '#fafbfc';
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          background: '#fff',
          border: '1.5px dashed currentColor',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PlusOutlined style={{ fontSize: 20 }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>添加新连接</div>
    </div>
  );
}

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? fallback;
  }
  return fallback;
}
