import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Chip,
  Autocomplete,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Rating,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import {
  BlogAiService,
  BlogAnalysisResult,
  BlogContentAnalysis,
} from '../services/ai/blogAiService';
import { logger } from '@/utils/logger';

interface EnhancedBlogPostFormProps {
  initialValues?: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  };
  onSubmit: (formData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => void;
  submitButtonText: string;
  disabled?: boolean;
}

export const EnhancedBlogPostForm: React.FC<EnhancedBlogPostFormProps> = ({
  initialValues = { title: '', content: '', category: '', tags: [] },
  onSubmit,
  submitButtonText,
  disabled = false,
}) => {
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const [category, setCategory] = useState(initialValues.category);
  const [tags, setTags] = useState<string[]>(initialValues.tags);

  // AI分析関連の状態
  const [analysisResult, setAnalysisResult] = useState<BlogAnalysisResult | null>(null);
  const [contentAnalysis, setContentAnalysis] = useState<BlogContentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [analysisTimer, setAnalysisTimer] = useState<NodeJS.Timeout | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);

  // 自動分析のデバウンス処理
  useEffect(() => {
    if (autoAnalysis && (title.length > 10 || content.length > 50)) {
      if (analysisTimer) {
        clearTimeout(analysisTimer);
      }

      const timer = setTimeout(() => {
        performAnalysis();
      }, 2000); // 2秒後に分析実行

      setAnalysisTimer(timer);
    }

    return () => {
      if (analysisTimer) {
        clearTimeout(analysisTimer);
      }
    };
  }, [title, content, autoAnalysis]);

  const performAnalysis = async () => {
    if (!title.trim() && !content.trim()) return;

    logger.debug('AI-Analysis', 'Starting analysis', {
      titleLength: title.length,
      contentLength: content.length,
    });

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisSuccess(false);

    try {
      const promises = [
        BlogAiService.analyzeBlogPost(title, content, category),
        content.length > 100 ? BlogAiService.analyzeContent(content) : null,
      ];

      const [blogAnalysis, contentAnalysisResult] = (await Promise.all(promises)) as [
        BlogAnalysisResult | null,
        BlogContentAnalysis | null,
      ];

      if (blogAnalysis) {
        setAnalysisResult(blogAnalysis as BlogAnalysisResult);
        setAnalysisSuccess(true);
        logger.debug('AI-Analysis', 'Analysis completed successfully');
      }

      if (contentAnalysisResult) {
        setContentAnalysis(contentAnalysisResult);
      }
    } catch (error) {
      logger.warn('AI-Analysis', 'Analysis failed', error);

      // AI分析の失敗は投稿をブロックしない
      setAnalysisError('AI分析が利用できません。投稿は続行可能です。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestedTags = () => {
    if (analysisResult?.suggestedTags) {
      const newTags = [...new Set([...tags, ...analysisResult.suggestedTags])];
      setTags(newTags);
    }
  };

  const applyImprovedTitle = () => {
    if (analysisResult?.improvedTitle) {
      setTitle(analysisResult.improvedTitle);
    }
  };

  const applySuggestedCategory = () => {
    if (analysisResult?.categoryRecommendation) {
      setCategory(analysisResult.categoryRecommendation);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled) {
      logger.warn('Form', 'Submission blocked - form disabled');
      return;
    }

    logger.debug('Form', 'Form submission', {
      hasTitle: !!title.trim(),
      hasContent: !!content.trim(),
      hasCategory: !!category.trim(),
    });

    onSubmit({ title, content, category, tags });
  };

  const availableCategories = [
    '技術',
    'ビジネス',
    'ライフスタイル',
    'エンターテイメント',
    'その他',
  ];

  return (
    <Box>
      {/* AI分析セクション（簡素化） */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHighIcon color="primary" />
            AI分析
          </Typography>
          <FormControlLabel
            control={
              <Switch checked={autoAnalysis} onChange={(e) => setAutoAnalysis(e.target.checked)} />
            }
            label="自動分析"
          />
        </Box>

        {/* 分析状態表示 */}
        {isAnalyzing && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              AI分析中...
            </Box>
          </Alert>
        )}

        {analysisSuccess && (
          <Alert severity="success" sx={{ mt: 1 }}>
            AI分析が完了しました
          </Alert>
        )}

        {analysisError && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {analysisError}
          </Alert>
        )}

        {!autoAnalysis && (
          <Button
            variant="outlined"
            onClick={performAnalysis}
            disabled={isAnalyzing || (!title.trim() && !content.trim())}
            sx={{ mt: 1 }}
          >
            {isAnalyzing ? <CircularProgress size={20} /> : '今すぐ分析'}
          </Button>
        )}
      </Paper>

      {/* フォーム */}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          error={!title.trim() && disabled}
          helperText={!title.trim() && disabled ? 'タイトルは必須です' : ''}
        />

        <Autocomplete
          freeSolo
          options={availableCategories}
          value={category}
          onChange={(_, newValue) => setCategory(newValue || '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="カテゴリ"
              margin="normal"
              required
              error={!category.trim() && disabled}
              helperText={!category.trim() && disabled ? 'カテゴリは必須です' : ''}
            />
          )}
        />

        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={tags}
          onChange={(_, newValue) => setTags(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="タグ（任意）"
              placeholder="Enterキーでタグを追加"
              margin="normal"
            />
          )}
        />

        <TextField
          fullWidth
          label="内容"
          multiline
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          margin="normal"
          required
          error={!content.trim() && disabled}
          helperText={!content.trim() && disabled ? '内容は必須です' : `文字数: ${content.length}`}
        />

        {/* AI分析結果の簡素化表示 */}
        {analysisResult && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI分析結果
            </Typography>

            {analysisResult.suggestedTags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  推奨タグ:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {analysisResult.suggestedTags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag]);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {analysisResult.readabilityScore && (
              <Typography variant="body2" color="text.secondary">
                読みやすさスコア: {analysisResult.readabilityScore}/100
              </Typography>
            )}
          </Paper>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={disabled || !title.trim() || !content.trim() || !category.trim()}
            sx={{ minWidth: 200 }}
          >
            {submitButtonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
