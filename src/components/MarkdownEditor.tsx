import React, { useState } from 'react';
import { Box, TextField, Tab, Tabs, Paper } from '@mui/material';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, label = '内容' }) => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 1 }}>
        <Tab label="編集" />
        <Tab label="プレビュー" />
      </Tabs>

      {tabValue === 0 ? (
        <TextField
          fullWidth
          multiline
          rows={15}
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Markdownで記事を書いてください..."
        />
      ) : (
        <Paper sx={{ p: 3, minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
          <MarkdownRenderer content={value || '*プレビューするコンテンツがありません*'} />
        </Paper>
      )}
    </Box>
  );
};

export default MarkdownEditor;
