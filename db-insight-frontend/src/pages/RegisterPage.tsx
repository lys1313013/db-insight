import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function RegisterPage() {
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string; confirm: string }) => {
    clearError();
    try {
      await register(values.username.trim(), values.password);
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
            注册 DB Insight 账号
          </Typography.Title>
          {error && <Alert type="error" message={error} showIcon closable onClose={clearError} />}
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, max: 64, message: '用户名长度需在 3–64 个字符之间' },
                { pattern: /^[a-zA-Z0-9_.-]+$/, message: '仅支持字母、数字、下划线、点、连字符' },
              ]}
            >
              <Input autoFocus autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, max: 128, message: '密码长度需在 8–128 个字符之间' },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                注册
              </Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">已有账号?</Typography.Text>{' '}
            <Link to="/login">去登录</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}
