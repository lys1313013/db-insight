package com.dbinsight.model;

public class IndexInfo {
    private String indexName;
    private String columnName;
    private boolean nonUnique;
    private String indexComment;

    public String getIndexName() { return indexName; }
    public void setIndexName(String indexName) { this.indexName = indexName; }
    public String getColumnName() { return columnName; }
    public void setColumnName(String columnName) { this.columnName = columnName; }
    public boolean isNonUnique() { return nonUnique; }
    public void setNonUnique(boolean nonUnique) { this.nonUnique = nonUnique; }
    public String getIndexComment() { return indexComment; }
    public void setIndexComment(String indexComment) { this.indexComment = indexComment; }
}
