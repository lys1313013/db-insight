import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Empty } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TableList } from './components/TableList/TableList';
import { TableCanvas } from './components/TableCanvas/TableCanvas';
import { TableDetail } from './components/TableDetail/TableDetail';
import { AllColumns } from './components/AllColumns/AllColumns';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAuthStore } from './stores/authStore';
import { useConnectionStore } from './stores/connectionStore';

function App() {
  const { token, user, logout } = useAuthStore();
  const { isConnected, restoreConnection } = useConnectionStore();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isListPage = location.pathname === '/list';
  const isCanvasPage = location.pathname === '/canvas';
  const isColumnsPage = location.pathname === '/columns';
  const hideSidebar = (isListPage || isCanvasPage || isColumnsPage) && isConnected;

  useEffect(() => {
    if (token) {
      restoreConnection();
    }
  }, [token, restoreConnection]);

  if (!token || !user) {
    if (isAuthPage) {
      return (
        <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 6 } }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ConfigProvider>
      );
    }
    return (
      <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 6 } }}>
        <Navigate to="/login" replace />
      </ConfigProvider>
    );
  }

  if (isAuthPage) {
    return <Navigate to="/list" replace />;
  }

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
        <Header onLogout={logout} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {!hideSidebar && <Sidebar />}
          <main style={{ flex: 1, overflow: 'hidden', background: '#f5f5f5' }}>
            {isConnected ? (
              <Routes>
                <Route path="/list" element={<TableList />} />
                <Route path="/columns" element={<AllColumns />} />
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
