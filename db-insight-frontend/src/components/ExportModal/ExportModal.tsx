import { useState, useEffect } from 'react';
import { Modal, Button, Space, message, Typography, Tabs } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { useConnectionStore } from '../../stores/connectionStore';
import { schemaApi } from '../../api/schemaApi';

const { Text } = Typography;

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

function parseMarkdownToHtml(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inTable = false;
  let tableHeaders: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 标题
    if (line.startsWith('# ')) {
      html += `<h1 style="font-size:24px;font-weight:600;margin:16px 0 8px 0">${line.slice(2)}</h1>`;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2 style="font-size:20px;font-weight:600;margin:16px 0 8px 0;border-bottom:1px solid #e8e8e8;padding-bottom:8px">${line.slice(3)}</h2>`;
      continue;
    }
    if (line.startsWith('### ')) {
      html += `<h3 style="font-size:16px;font-weight:600;margin:16px 0 8px 0">${line.slice(4)}</h3>`;
      continue;
    }

    // 分隔线
    if (line === '---') {
      html += '<hr style="border:none;border-top:1px solid #e8e8e8;margin:16px 0" />';
      continue;
    }

    // 表格行
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '');

      // 跳过分隔行
      if (cells.every(c => c.trim().match(/^[-:]+$/))) {
        inTable = true;
        continue;
      }

      // 表头
      if (!inTable && tableHeaders.length === 0) {
        tableHeaders = cells.map(c => c.trim());
        html += '<table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:14px"><thead><tr>';
        for (const cell of cells) {
          html += `<th style="border:1px solid #e8e8e8;padding:8px 12px;background:#fafafa;text-align:left;font-weight:600">${cell.trim()}</th>`;
        }
        html += '</tr></thead><tbody>';
        continue;
      }

      // 表格内容
      if (inTable) {
        html += '<tr>';
        for (const cell of cells) {
          let content = cell.trim();
          // 高亮键类型
          if (['PRI', 'MUL', 'UNI'].includes(content)) {
            const color = content === 'PRI' ? '#faad14' : content === 'MUL' ? '#1677ff' : '#13c2c2';
            content = `<span style="color:${color};font-weight:500">${content}</span>`;
          }
          html += `<td style="border:1px solid #e8e8e8;padding:8px 12px">${content}</td>`;
        }
        html += '</tr>';

        // 检查是否是最后一个表格行
        if (i + 1 >= lines.length || !lines[i + 1].startsWith('|')) {
          html += '</tbody></table>';
          inTable = false;
          tableHeaders = [];
        }
        continue;
      }
    }

    // 空行
    if (line.trim() === '') {
      continue;
    }
  }

  return html;
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  const { connectionId } = useConnectionStore();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [database, setDatabase] = useState('');

  useEffect(() => {
    if (open && connectionId) {
      fetchMarkdown();
    }
  }, [open, connectionId]);

  const fetchMarkdown = async () => {
    if (!connectionId) return;
    setLoading(true);
    try {
      const res = await schemaApi.exportMarkdown(connectionId);
      if (res.data.success) {
        setContent(res.data.data.content);
        setDatabase(res.data.data.database);
      }
    } catch {
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${database}-文档.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('下载成功');
  };

  const tabItems = [
    {
      key: 'preview',
      label: '预览',
      children: (
        <div
          style={{ maxHeight: 500, overflow: 'auto', padding: '16px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 6 }}
          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(content) }}
        />
      ),
    },
    {
      key: 'source',
      label: '源码',
      children: (
        <pre style={{
          maxHeight: 500,
          overflow: 'auto',
          padding: 16,
          background: '#f5f5f5',
          border: '1px solid #e8e8e8',
          borderRadius: 6,
          margin: 0,
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          {content}
        </pre>
      ),
    },
  ];

  return (
    <Modal
      title="导出数据库文档"
      open={open}
      onCancel={onClose}
      width={900}
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>下载 .md</Button>
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">正在生成文档...</Text>
        </div>
      ) : (
        <Tabs items={tabItems} />
      )}
    </Modal>
  );
}
