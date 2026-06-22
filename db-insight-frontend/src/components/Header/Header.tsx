import { useState } from 'react';
import { Button, Tag, Space, Dropdown, Avatar } from 'antd';
import { ExportOutlined, LogoutOutlined, UserOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTableStore } from '../../stores/tableStore';
import { useAuthStore } from '../../stores/authStore';
import { ExportModal } from '../ExportModal/ExportModal';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const { isConnected, dbType, database, disconnect } = useConnectionStore();
  const { fetchTables } = useTableStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const isList = location.pathname === '/list' || location.pathname === '/';
  const isCanvas = location.pathname === '/canvas';
  const isColumns = location.pathname === '/columns';

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/list');
  };

  const handleViewChange = (path: string) => {
    fetchTables();
    navigate(path);
  };

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 52,
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
      }}>
        <Space size={12}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1f1f1f' }}>DB Insight</span>
          {isConnected && (
            <Tag color="blue">{dbType} - {database}</Tag>
          )}
        </Space>

        {isConnected && (
          <Space size={8}>
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => navigate('/connections')}
            >
              管理连接
            </Button>
            <Button
              type={isList ? 'primary' : 'default'}
              onClick={() => handleViewChange('/list')}
            >
              列表
            </Button>
            <Button
              type={isColumns ? 'primary' : 'default'}
              onClick={() => handleViewChange('/columns')}
            >
              表格模式
            </Button>
            <Button
              type={isCanvas ? 'primary' : 'default'}
              onClick={() => handleViewChange('/canvas')}
            >
              画布
            </Button>
          </Space>
        )}

        <Space size={12}>
          {isConnected && (
            <Space size={8}>
              <Button icon={<ExportOutlined />} onClick={() => setExportModalOpen(true)}>
                导出文档
              </Button>
              <Button onClick={handleDisconnect}>
                断开连接
              </Button>
            </Space>
          )}
          {user && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: onLogout,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ fontSize: 13 }}>{user.username}</span>
              </Space>
            </Dropdown>
          )}
        </Space>
      </header>
      <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </>
  );
}
