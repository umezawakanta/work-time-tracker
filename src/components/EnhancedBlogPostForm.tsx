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
}

export const EnhancedBlogPostForm: React.FC<EnhancedBlogPostFormProps> = ({
  initialValues = { title: '', content: '', category: '', tags: [] },
  onSubmit,
  submitButtonText,
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

    setIsAnalyzing(true);
    try {
      const [blogAnalysis, contentAnalysisResult] = await Promise.all([
        BlogAiService.analyzeBlogPost(title, content, category),
        content.length > 100 ? BlogAiService.analyzeContent(content) : null,
      ]);

      setAnalysisResult(blogAnalysis);
      if (contentAnalysisResult) {
        setContentAnalysis(contentAnalysisResult);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
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
      {/* AI分析設定 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHighIcon color="primary" />
            AI分析機能
          </Typography>
          <FormControlLabel
            control={
              <Switch checked={autoAnalysis} onChange={(e) => setAutoAnalysis(e.target.checked)} />
            }
            label="自動分析"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          投稿内容を自動的に分析し、タグの提案や内容の改善案を提供します
        </Typography>
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

      {/* メインフォーム */}
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          fullWidth
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          helperText={
            contentAnalysis ? `推定読了時間: ${contentAnalysis.readingTimeMinutes}分` : ''
          }
        />

        <Autocomplete
          freeSolo
          options={availableCategories}
          value={category}
          onChange={(_, newValue) => setCategory(newValue || '')}
          renderInput={(params) => (
            <TextField {...params} label="カテゴリ" margin="normal" required />
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
              label="タグ"
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
          helperText={content.length > 0 ? `文字数: ${content.length}` : ''}
        />

        {/* AI分析結果 */}
        {analysisResult && (
          <Paper sx={{ mt: 3, mb: 2 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TipsAndUpdatesIcon color="secondary" />
                  AI分析結果
                  {isAnalyzing && <CircularProgress size={16} />}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    読みやすさスコア:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Rating value={analysisResult.readabilityScore / 20} readOnly precision={0.1} />
                    <Typography variant="body2">{analysisResult.readabilityScore}/100</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* タイトル改善提案 */}
                {analysisResult.improvedTitle && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      タイトル改善提案:
                    </Typography>
                    <Alert
                      severity="info"
                      action={
                        <Button color="inherit" size="small" onClick={applyImprovedTitle}>
                          適用
                        </Button>
                      }
                    >
                      {analysisResult.improvedTitle}
                    </Alert>
                  </Box>
                )}

                {/* 推奨タグ */}
                {analysisResult.suggestedTags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      推奨タグ:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      {analysisResult.suggestedTags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Button size="small" onClick={applySuggestedTags}>
                      タグを適用
                    </Button>
                  </Box>
                )}

                {/* カテゴリ推奨 */}
                {analysisResult.categoryRecommendation !== category && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      推奨カテゴリ:
                    </Typography>
                    <Alert
                      severity="info"
                      action={
                        <Button color="inherit" size="small" onClick={applySuggestedCategory}>
                          適用
                        </Button>
                      }
                    >
                      {analysisResult.categoryRecommendation}
                    </Alert>
                  </Box>
                )}

                {/* 内容改善提案 */}
                {analysisResult.contentSuggestions.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      内容改善提案:
                    </Typography>
                    <List dense>
                      {analysisResult.contentSuggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* SEO推奨事項 */}
                {analysisResult.seoRecommendations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      SEO最適化提案:
                    </Typography>
                    <List dense>
                      {analysisResult.seoRecommendations.map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Paper>
        )}

        <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
          {submitButtonText}
        </Button>
      </Box>
    </Box>
  );
};
