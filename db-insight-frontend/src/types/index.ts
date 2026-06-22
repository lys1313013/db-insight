export interface ConnectionConfig {
  name: string;
  type: 'mysql' | 'postgresql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface ConnectionView {
  id: string;
  name: string;
  dbType: 'mysql' | 'postgresql';
  host: string;
  port: number;
  username: string;
  database: string;
}

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  columnType?: string;
  columnKey: string;
  isNullable: string;
  columnDefault: string | null;
  columnComment: string;
}

export interface AllColumnInfo extends ColumnInfo {
  tableName: string;
  tableComment: string;
  ordinalPosition: number;
}

export interface IndexInfo {
  indexName: string;
  columnName: string;
  nonUnique: boolean;
}

export interface TableInfo {
  tableName: string;
  tableComment: string;
  columnCount: number;
  rowCount?: number;
  rowCountLoading?: boolean;
  columnNames?: string;
  columns?: ColumnInfo[];
  indexes?: IndexInfo[];
}
