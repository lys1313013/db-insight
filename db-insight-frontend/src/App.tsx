import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Empty } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TableList } from './components/TableList/TableList';
import { TableCanvas } from './components/TableCanvas/TableCanvas';
import { TableDetail } from './components/TableDetail/TableDetail';
import { useConnectionStore } from './stores/connectionStore';

function App() {
  const { isConnected, restoreConnection } = useConnectionStore();

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>
        <Header />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <main style={{ flex: 1, overflow: 'hidden', background: '#f5f5f5' }}>
            {isConnected ? (
              <Routes>
                <Route path="/list" element={<TableList />} />
                <Route path="/canvas" element={<TableCanvas />} />
                <Route path="/table/:tableName" element={<TableDetail />} />
                <Route path="*" element={<Navigate to="/list" replace />} />
              </Routes>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Empty description="请在左侧连接数据库" />
              </div>
            )}
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
