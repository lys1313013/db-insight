import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Table, Tag, Descriptions, Space, Typography, message, Card, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useConnectionStore } from '../../stores/connectionStore';
import { schemaApi } from '../../api/schemaApi';
import { commentApi } from '../../api/commentApi';
import { TableInfo } from '../../types';

const { Text, Title } = Typography;

export function TableDetail() {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const { connectionId } = useConnectionStore();
  const [tableData, setTableData] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!connectionId || !tableName) return;
    setLoading(true);
    schemaApi.getTableDetail(connectionId, tableName)
      .then(({ data }) => {
        setTableData(data.data);
        setCommentValue(data.data?.tableComment || '');
      })
      .catch(() => messageApi.error('获取表详情失败'))
      .finally(() => setLoading(false));
  }, [connectionId, tableName]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
  }

  if (!tableData) {
    return null;
  }

  const handleSaveComment = async () => {
    if (!connectionId || !tableName) return;
    setSaving(true);
    try {
      await commentApi.updateTableComment(connectionId, tableName, commentValue);
      setTableData({ ...tableData, tableComment: commentValue });
      setEditingComment(false);
      messageApi.success('保存成功');
    } catch {
      messageApi.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const columnData = tableData.columns?.map((col) => ({
    ...col,
    key: col.columnName,
  })) || [];

  const indexData = tableData.indexes?.map((idx, i) => ({
    ...idx,
    key: i,
  })) || [];

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      {contextHolder}
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <Title level={5} style={{ margin: 0 }}>{tableData.tableName}</Title>
      </Space>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="表注释">
            {editingComment ? (
              <Space>
                <Input
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  onPressEnter={handleSaveComment}
                  style={{ width: 260 }}
                  size="small"
                  autoFocus
                />
                <Button type="primary" size="small" icon={<SaveOutlined />} loading={saving} onClick={handleSaveComment}>保存</Button>
                <Button size="small" icon={<CloseOutlined />} onClick={() => { setEditingComment(false); setCommentValue(tableData.tableComment || ''); }}>取消</Button>
              </Space>
            ) : (
              <Space>
                <Text>{tableData.tableComment || '无注释'}</Text>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setEditingComment(true)}>编辑</Button>
              </Space>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="列信息" size="small" style={{ marginBottom: 16 }}>
        <Table
          dataSource={columnData}
          columns={[
            { title: '列名', dataIndex: 'columnName', key: 'columnName', render: (v: string) => <Text strong>{v}</Text> },
            { title: '类型', dataIndex: 'dataType', key: 'dataType', render: (v: string) => <Tag>{v}</Tag> },
            {
              title: '键', dataIndex: 'columnKey', key: 'columnKey',
              render: (v: string) => {
                if (v === 'PRI') return <Tag color="gold">PRI</Tag>;
                if (v === 'MUL') return <Tag color="blue">MUL</Tag>;
                if (v === 'UNI') return <Tag color="cyan">UNI</Tag>;
                return <Text type="secondary">-</Text>;
              }
            },
            {
              title: '可空', dataIndex: 'isNullable', key: 'isNullable',
              render: (v: string) => v === 'YES' ? <Tag color="success">YES</Tag> : <Tag color="error">NO</Tag>
            },
            { title: '默认值', dataIndex: 'columnDefault', key: 'columnDefault', render: (v: string) => v || <Text type="secondary">-</Text> },
            { title: '注释', dataIndex: 'columnComment', key: 'columnComment', render: (v: string) => v || <Text type="secondary">-</Text> },
          ]}
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>

      {indexData.length > 0 && (
        <Card title="索引信息" size="small">
          <Table
            dataSource={indexData}
            columns={[
              { title: '索引名', dataIndex: 'indexName', key: 'indexName' },
              { title: '列名', dataIndex: 'columnName', key: 'columnName' },
              {
                title: '唯一', dataIndex: 'nonUnique', key: 'nonUnique',
                render: (v: boolean) => v ? <Tag>否</Tag> : <Tag color="success">是</Tag>
              },
            ]}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
}
