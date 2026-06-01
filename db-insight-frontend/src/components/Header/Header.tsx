import { useState } from 'react';
import { Button, Tag, Space } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTableStore } from '../../stores/tableStore';
import { ExportModal } from '../ExportModal/ExportModal';

export function Header() {
  const { isConnected, dbType, database, disconnect } = useConnectionStore();
  const { fetchTables } = useTableStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const isList = location.pathname === '/list' || location.pathname === '/';
  const isCanvas = location.pathname === '/canvas';

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
              type={isList ? 'primary' : 'default'}
              onClick={() => handleViewChange('/list')}
            >
              列表
            </Button>
            <Button
              type={isCanvas ? 'primary' : 'default'}
              onClick={() => handleViewChange('/canvas')}
            >
              画布
            </Button>
          </Space>
        )}

        <div>
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
        </div>
      </header>
      <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </>
  );
}
