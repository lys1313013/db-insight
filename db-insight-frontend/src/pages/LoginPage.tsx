import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    clearError();
    try {
      await login(values.username.trim(), values.password);
      navigate('/list');
    } catch {
      // error captured in store
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <Card style={{ width: 380 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0, textAlign: 'center' }}>
            DB Insight 登录
          </Typography.Title>
          {error && <Alert type="error" message={error} showIcon closable onClose={clearError} />}
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input autoFocus autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登录
              </Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">还没有账号?</Typography.Text>{' '}
            <Link to="/register">立即注册</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}
