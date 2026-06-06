import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { SearchOutlined, TableOutlined, AppstoreOutlined, LinkOutlined, NumberOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { schemaApi } from '../../api/schemaApi';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTableStore } from '../../stores/tableStore';
import { AllColumnInfo, TableInfo } from '../../types';

const { Text } = Typography;

const KEY_TYPE_COLOR: Record<string, string> = {
  PRI: 'gold',
  MUL: 'cyan',
  UNI: 'purple',
};

const TYPE_TAG_COLORS = [
  'blue', 'geekblue', 'cyan', 'green', 'lime', 'gold',
  'orange', 'magenta', 'purple', 'red', 'volcano', 'processing',
];

function colorForType(type: string): string {
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) | 0;
  return TYPE_TAG_COLORS[Math.abs(hash) % TYPE_TAG_COLORS.length];
}

const FILTER_INPUT_STYLE: React.CSSProperties = { width: 200 };

export function AllColumns() {
  const connectionId = useConnectionStore((s) => s.connectionId);
  const { tables, fetchTables, loading: tablesLoading } = useTableStore();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [columns, setColumns] = useState<AllColumnInfo[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'columns'>('tables');

  const [tableQuery, setTableQuery] = useState('');
  const [columnQuery, setColumnQuery] = useState('');
  const [typeQuery, setTypeQuery] = useState<string | undefined>(undefined);
  const [commentQuery, setCommentQuery] = useState('');
  const [tablesSearchQuery, setTablesSearchQuery] = useState('');

  useEffect(() => {
    if (!connectionId) return;
    setColumnsLoading(true);
    schemaApi
      .getAllColumns(connectionId)
      .then(({ data }) => setColumns(data.data ?? []))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : '查询列失败';
        messageApi.error(msg);
      })
      .finally(() => setColumnsLoading(false));
  }, [connectionId, messageApi]);

  useEffect(() => {
    if (connectionId) fetchTables();
  }, [connectionId, fetchTables]);

  const dataTypes = useMemo(() => {
    const set = new Set<string>();
    columns.forEach((c) => c.dataType && set.add(c.dataType));
    return Array.from(set).sort();
  }, [columns]);

  const filteredColumns = useMemo(() => {
    const tq = tableQuery.trim().toLowerCase();
    const cq = columnQuery.trim().toLowerCase();
    const cmq = commentQuery.trim().toLowerCase();
    return columns.filter((c) => {
      if (tq && !c.tableName.toLowerCase().includes(tq)) return false;
      if (cq && !c.columnName.toLowerCase().includes(cq)) return false;
      if (typeQuery && c.dataType !== typeQuery) return false;
      if (cmq && !(c.columnComment || '').toLowerCase().includes(cmq)) return false;
      return true;
    });
  }, [columns, tableQuery, columnQuery, typeQuery, commentQuery]);

  const filteredTables = useMemo(() => {
    const q = tablesSearchQuery.trim().toLowerCase();
    if (!q) return tables;
    return tables.filter((t) => t.tableName.toLowerCase().includes(q));
  }, [tables, tablesSearchQuery]);

  const columnTableColumns: ColumnsType<AllColumnInfo> = [
    {
      title: '序号',
      dataIndex: 'ordinalPosition',
      width: 72,
      align: 'center',
      sorter: (a, b) => a.ordinalPosition - b.ordinalPosition,
      render: (v: number) => (
        <Text type="secondary" style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</Text>
      ),
    },
    {
      title: <Space size={6}><TableOutlined />表名</Space>,
      dataIndex: 'tableName',
      width: 220,
      fixed: 'left',
      render: (name: string) => (
        <a onClick={() => navigate(`/table/${name}`)}
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 }}>
          {name}
        </a>
      ),
    },
    {
      title: '表说明',
      dataIndex: 'tableComment',
      ellipsis: true,
      render: (v: string) =>
        v ? <Text style={{ fontSize: 13 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: <Space size={6}><AppstoreOutlined />列名</Space>,
      dataIndex: 'columnName',
      width: 200,
      fixed: 'left',
      render: (v: string) => (
        <Text strong style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 }}>{v}</Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'dataType',
      width: 160,
      render: (v: string) => (
        <Tag color={colorForType(v)}
          style={{ margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: <Space size={6}><LinkOutlined />键</Space>,
      dataIndex: 'columnKey',
      width: 72,
      align: 'center',
      render: (v: string) =>
        v ? <Tag color={KEY_TYPE_COLOR[v] ?? 'default'} style={{ margin: 0 }}>{v}</Tag>
          : <Text type="secondary">—</Text>,
    },
    {
      title: '可空',
      dataIndex: 'isNullable',
      width: 72,
      align: 'center',
      render: (v: string) =>
        v === 'YES'
          ? <Tag color="default" style={{ margin: 0, color: '#8c8c8c' }}>YES</Tag>
          : <Tag color="error" style={{ margin: 0 }}>NO</Tag>,
    },
    {
      title: '默认值',
      dataIndex: 'columnDefault',
      width: 160,
      ellipsis: true,
      render: (v: string | null) =>
        v
          ? <Text style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12 }}>{v}</Text>
          : <Text type="secondary">—</Text>,
    },
    {
      title: '列说明',
      dataIndex: 'columnComment',
      ellipsis: true,
      render: (v: string) =>
        v ? <Text style={{ fontSize: 13 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
  ];

  const tableTableColumns: ColumnsType<TableInfo> = [
    {
      title: '序号',
      width: 72,
      align: 'center',
      render: (_: unknown, __: TableInfo, idx: number) => (
        <Text type="secondary" style={{ fontVariantNumeric: 'tabular-nums' }}>{idx + 1}</Text>
      ),
    },
    {
      title: <Space size={6}><TableOutlined />表名</Space>,
      dataIndex: 'tableName',
      render: (name: string) => (
        <a onClick={() => navigate(`/table/${name}`)}
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 }}>
          {name}
        </a>
      ),
    },
    {
      title: '表说明',
      dataIndex: 'tableComment',
      ellipsis: true,
      render: (v: string) =>
        v ? <Text style={{ fontSize: 13 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: '列数',
      dataIndex: 'columnCount',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.columnCount - b.columnCount,
      render: (v: number) => <Tag color="blue" style={{ margin: 0 }}>{v}</Tag>,
    },
  ];

  const isLoading = columnsLoading || tablesLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        {contextHolder}
        <Spin size="large" />
      </div>
    );
  }

  const columnsCountLabel = (
    <Space size={6} align="center">
      <NumberOutlined style={{ color: '#8c8c8c' }} />
      <Text><Text strong>{filteredColumns.length}</Text><Text type="secondary"> / {columns.length} 列</Text></Text>
    </Space>
  );

  const tablesCountLabel = (
    <Space size={6} align="center">
      <NumberOutlined style={{ color: '#8c8c8c' }} />
      <Text><Text strong>{filteredTables.length}</Text><Text type="secondary"> / {tables.length} 表</Text></Text>
    </Space>
  );

  // header(52) + padding-top(16) + tabs+margin(40) + toolbar(48) + table-header(40) + pagination(64)
  const tableScrollY = 'calc(100vh - 260px)';

  const toolbarStyle: React.CSSProperties = {
    padding: '8px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    flexShrink: 0,
  };

  return (
    <div style={{ height: '100%', padding: '16px 24px 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {contextHolder}

      <div style={{ marginBottom: 8, flexShrink: 0 }}>
        <Space size={0}>
          <Button
            type={activeTab === 'tables' ? 'primary' : 'default'}
            onClick={() => { setActiveTab('tables'); setTablesSearchQuery(''); }}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            表
          </Button>
          <Button
            type={activeTab === 'columns' ? 'primary' : 'default'}
            onClick={() => setActiveTab('columns')}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            列
          </Button>
        </Space>
      </div>

      {activeTab === 'tables' && (
        <>
          <div style={toolbarStyle}>
            {tablesCountLabel}
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="搜索表名"
              value={tablesSearchQuery}
              onChange={(e) => setTablesSearchQuery(e.target.value)}
              allowClear
              style={FILTER_INPUT_STYLE}
            />
          </div>
          <Table<TableInfo>
            size="middle"
            columns={tableTableColumns}
            dataSource={filteredTables}
            rowKey="tableName"
            rowHoverable
            onRow={(record) => ({
              style: { cursor: 'pointer' },
              onClick: () => navigate(`/table/${record.tableName}`),
            })}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSize: 50,
              position: ['bottomRight'],
            }}
            scroll={{ y: tableScrollY }}
          />
        </>
      )}

      {activeTab === 'columns' && (
        <>
          <div style={toolbarStyle}>
            {columnsCountLabel}
            <Space size={8} wrap>
              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="搜索表名"
                value={tableQuery}
                onChange={(e) => setTableQuery(e.target.value)}
                allowClear
                style={FILTER_INPUT_STYLE}
              />
              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="搜索列名"
                value={columnQuery}
                onChange={(e) => setColumnQuery(e.target.value)}
                allowClear
                style={FILTER_INPUT_STYLE}
              />
              <Select
                placeholder="类型"
                value={typeQuery}
                onChange={(v) => setTypeQuery(v)}
                allowClear
                style={{ width: 160 }}
                options={dataTypes.map((t) => ({ label: t, value: t }))}
              />
              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="搜索说明"
                value={commentQuery}
                onChange={(e) => setCommentQuery(e.target.value)}
                allowClear
                style={FILTER_INPUT_STYLE}
              />
            </Space>
          </div>
          <Table<AllColumnInfo>
            size="middle"
            columns={columnTableColumns}
            dataSource={filteredColumns}
            rowKey={(r) => `${r.tableName}.${r.columnName}`}
            rowHoverable
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSize: 50,
              position: ['bottomRight'],
            }}
            scroll={{ x: 1280, y: tableScrollY }}
          />
        </>
      )}
    </div>
  );
}
