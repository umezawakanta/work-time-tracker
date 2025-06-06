import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addBlogPost } from '@/store/blogSlice';
import { AppDispatch } from '@/store';
import { EnhancedBlogPostForm } from '@/components/EnhancedBlogPostForm';
import {
  Container,
  Typography,
  Box,
  Alert,
  LinearProgress,
  Chip,
  Paper,
  Divider,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  AutoAwesome,
  Psychology,
  TipsAndUpdates,
  Category,
  LocalOffer,
  CheckCircle,
  Error,
  ExpandMore,
  ExpandLess,
  Refresh,
  ContentCopy,
} from '@mui/icons-material';

interface AISuggestion {
  title: string;
  category: string;
  tags: string[];
  summary: string;
  improvements: string[];
  readingTime: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  seoScore: number;
}

interface AIAnalysisState {
  isAnalyzing: boolean;
  suggestions: AISuggestion | null;
  error: string | null;
  showDetails: boolean;
}

const NewBlogPost: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // AI分析の状態管理
  const [aiState, setAiState] = useState<AIAnalysisState>({
    isAnalyzing: false,
    suggestions: null,
    error: null,
    showDetails: false,
  });

  // フォームデータの状態管理
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
  });

  // フォームデータとAI提案の同期
  const updateFormWithAISuggestions = () => {
    if (aiState.suggestions) {
      setFormData((prev) => ({
        ...prev,
        title: prev.title || aiState.suggestions!.title,
        category: prev.category || aiState.suggestions!.category,
        tags: prev.tags.length === 0 ? aiState.suggestions!.tags : prev.tags,
      }));
    }
  };

  // AI分析の実行（改善版）
  const analyzeWithAI = async (content: string, title?: string) => {
    if (!content || content.length < 50) {
      setAiState((prev) => ({
        ...prev,
        error: 'コンテンツは最低50文字以上必要です',
      }));
      return;
    }

    setAiState((prev) => ({
      ...prev,
      isAnalyzing: true,
      error: null,
    }));

    try {
      const suggestions = await getAISuggestions(content, title);
      setAiState((prev) => ({
        ...prev,
        isAnalyzing: false,
        suggestions,
        showDetails: true,
      }));

      // AI分析完了後、自動でフォームを更新（オプション）
      if (!formData.title && !formData.category && formData.tags.length === 0) {
        setTimeout(() => updateFormWithAISuggestions(), 500);
      }
    } catch (error) {
      console.error('AI分析エラー:', error);
      setAiState((prev) => ({
        ...prev,
        isAnalyzing: false,
        error: 'AI分析中にエラーが発生しました',
      }));
    }
  };

  // AI提案を適用
  const applySuggestions = (type: 'title' | 'category' | 'tags' | 'all') => {
    if (!aiState.suggestions) return;

    switch (type) {
      case 'title':
        setFormData((prev) => ({ ...prev, title: aiState.suggestions!.title }));
        break;
      case 'category':
        setFormData((prev) => ({ ...prev, category: aiState.suggestions!.category }));
        break;
      case 'tags':
        setFormData((prev) => ({ ...prev, tags: aiState.suggestions!.tags }));
        break;
      case 'all':
        setFormData((prev) => ({
          ...prev,
          title: aiState.suggestions!.title,
          category: aiState.suggestions!.category,
          tags: aiState.suggestions!.tags,
        }));
        break;
    }
  };

  // AI分析サービスの実装
  async function getAISuggestions(content: string, title?: string): Promise<AISuggestion> {
    // 実際のAI APIコールをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // コンテンツ分析（実際の実装では、OpenAI APIやClaude APIを使用）
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim()).length;
    const readingTime = Math.ceil(words / 200); // 平均読書速度: 200単語/分

    // キーワード抽出（簡易版）
    const commonWords = ['の', 'は', 'を', 'が', 'に', 'と', 'で', 'て', 'た', 'し'];
    const wordFreq: { [key: string]: number } = {};
    content.split(/\s+/).forEach((word) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
      if (cleanWord.length > 2 && !commonWords.includes(cleanWord)) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });
    const keywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // 感情分析（簡易版）
    const positiveWords = ['素晴らしい', '良い', '便利', '効果的', '成功', '改善'];
    const negativeWords = ['問題', '困難', '失敗', '欠点', '悪い', '難しい'];
    const positiveCount = positiveWords.filter((word) => content.includes(word)).length;
    const negativeCount = negativeWords.filter((word) => content.includes(word)).length;
    const sentiment =
      positiveCount > negativeCount
        ? 'positive'
        : negativeCount > positiveCount
          ? 'negative'
          : 'neutral';

    // カテゴリ推定（簡易版）
    const categoryKeywords = {
      テクノロジー: ['AI', 'プログラミング', 'ソフトウェア', 'アプリ', 'デジタル'],
      ビジネス: ['経営', 'マーケティング', '戦略', '収益', 'ビジネス'],
      ライフスタイル: ['生活', '健康', '趣味', '旅行', '料理'],
      教育: ['学習', '教育', 'スキル', '知識', '勉強'],
    };

    let suggestedCategory = 'その他';
    let maxMatches = 0;
    for (const [category, words] of Object.entries(categoryKeywords)) {
      const matches = words.filter((word) => content.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        suggestedCategory = category;
      }
    }

    // タイトル生成（簡易版）
    const suggestedTitle =
      title || (keywords.length > 0 ? `${keywords[0]}について知っておくべきこと` : 'ブログ記事');

    // タグ生成
    const suggestedTags = keywords.slice(0, 3).concat([suggestedCategory]);

    // 改善提案
    const improvements = [];
    if (words < 300)
      improvements.push('記事が短すぎます。より詳細な情報を追加することをお勧めします。');
    if (sentences < 10) improvements.push('段落を増やして、読みやすさを向上させましょう。');
    if (!content.includes('例') && !content.includes('具体的')) {
      improvements.push('具体例を追加すると、読者の理解が深まります。');
    }
    if (keywords.length < 3)
      improvements.push('より多様なキーワードを使用して、SEOを改善しましょう。');

    // SEOスコア計算（簡易版）
    let seoScore = 50;
    if (title && title.length > 30 && title.length < 60) seoScore += 10;
    if (keywords.length >= 3) seoScore += 15;
    if (words > 300) seoScore += 15;
    if (content.includes('まとめ') || content.includes('結論')) seoScore += 10;

    return {
      title: suggestedTitle,
      category: suggestedCategory,
      tags: suggestedTags,
      summary: content.substring(0, 150) + '...',
      improvements,
      readingTime,
      sentiment,
      keywords,
      seoScore: Math.min(seoScore, 100),
    };
  }

  // 投稿処理の改善
  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    console.log('🚀 [NewBlogPost] Starting blog post submission:', {
      title: data.title,
      contentLength: data.content.length,
      category: data.category,
      tagsCount: data.tags.length,
      timestamp: new Date().toISOString(),
    });

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // AI分析が完了していない場合は実行
      if (!aiState.suggestions && data.content) {
        await analyzeWithAI(data.content, data.title);
      }

      // AI提案がある場合は、空のフィールドを自動補完
      const finalData = { ...data };
      if (aiState.suggestions) {
        if (!finalData.title) finalData.title = aiState.suggestions.title;
        if (!finalData.category) finalData.category = aiState.suggestions.category;
        if (finalData.tags.length === 0) finalData.tags = aiState.suggestions.tags;
      }

      console.log('📤 [NewBlogPost] Dispatching addBlogPost action...');

      const resultAction = await dispatch(
        addBlogPost({
          ...finalData,
          author: 'Current User',
          status: 'published',
        })
      );

      if (addBlogPost.fulfilled.match(resultAction)) {
        const postId = resultAction.payload._id;
        console.log('✅ [NewBlogPost] Blog post created successfully:', {
          postId,
          response: resultAction.payload,
        });

        setSuccess('ブログ投稿が正常に作成されました！');

        // ユーザーに選択肢を提供
        setTimeout(() => {
          const userChoice = confirm(
            '投稿が完了しました！\n\n' + 'OK: 投稿詳細を確認\n' + 'キャンセル: ブログ一覧に戻る'
          );

          if (userChoice) {
            navigate(`/blog/${postId}`);
          } else {
            navigate('/blog'); // 一覧ページに遷移
          }
        }, 1500);
      } else if (addBlogPost.rejected.match(resultAction)) {
        const errorMessage = resultAction.error?.message || 'ブログ投稿の作成に失敗しました';
        console.error('❌ [NewBlogPost] Blog post creation rejected:', resultAction.error);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('💥 [NewBlogPost] Exception during blog post creation:', err);
      const errorMessage = (err as Error).message || 'Unknown error';
      setError(`投稿中にエラーが発生しました: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI提案の自動適用
  const handleAutoFill = () => {
    if (aiState.suggestions) {
      setFormData((prev) => ({
        title: aiState.suggestions!.title,
        content: prev.content, // コンテンツは変更しない
        category: aiState.suggestions!.category,
        tags: aiState.suggestions!.tags,
      }));
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 700,
          }}
        >
          <AutoAwesome sx={{ color: 'primary.main', fontSize: 35 }} />
          AI分析機能付きブログ投稿
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AIが投稿内容を分析し、タイトル・カテゴリ・タグの提案や改善案を提供します
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* メインフォーム */}
        <Grid {...({ item: true, xs: 12, md: 8 } as React.ComponentProps<typeof Grid>)}>
          {isSubmitting && (
            <Box mb={2}>
              <Alert severity="info" sx={{ mb: 1 }}>
                ブログ投稿を作成中です...
              </Alert>
              <LinearProgress />
            </Box>
          )}

          {success && (
            <Box mb={2}>
              <Alert severity="success">{success}</Alert>
            </Box>
          )}

          {error && (
            <Box mb={2}>
              <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>
                {error}
              </Alert>
            </Box>
          )}

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <EnhancedBlogPostForm
              onSubmit={handleSubmit}
              submitButtonText={isSubmitting ? '投稿中...' : '投稿する'}
              disabled={isSubmitting}
            />
          </Paper>
        </Grid>

        {/* AI分析パネル */}
        <Grid {...({ item: true, xs: 12, md: 4 } as React.ComponentProps<typeof Grid>)}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology sx={{ color: 'secondary.main' }} />
                AI分析結果
              </Typography>
              <Tooltip title="AI分析を再実行">
                <span>
                  <IconButton
                    onClick={() => analyzeWithAI(formData.content, formData.title)}
                    disabled={aiState.isAnalyzing || !formData.content}
                    size="small"
                  >
                    <Refresh />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {aiState.isAnalyzing && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  コンテンツを分析中...
                </Typography>
              </Box>
            )}

            {aiState.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {aiState.error}
              </Alert>
            )}

            {aiState.suggestions && !aiState.isAnalyzing && (
              <Box>
                {/* 自動適用ボタンを追加 */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleAutoFill}
                    startIcon={<AutoAwesome />}
                  >
                    AI提案を自動適用
                  </Button>
                </Box>

                {/* SEOスコア */}
                <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      SEOスコア
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={aiState.suggestions.seoScore}
                        size={60}
                        thickness={4}
                        sx={{
                          color:
                            aiState.suggestions.seoScore > 70
                              ? 'success.main'
                              : aiState.suggestions.seoScore > 40
                                ? 'warning.main'
                                : 'error.main',
                        }}
                      />
                      <Box>
                        <Typography variant="h4">{aiState.suggestions.seoScore}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          / 100
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* 基本情報 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TipsAndUpdates sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Typography variant="subtitle2">提案されたタイトル</Typography>
                  </Box>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 1 }}>
                    <Typography variant="body2">{aiState.suggestions.title}</Typography>
                  </Paper>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => applySuggestions('title')}
                    startIcon={<ContentCopy />}
                  >
                    タイトルを適用
                  </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Category sx={{ color: 'info.main', fontSize: 20 }} />
                    <Typography variant="subtitle2">推奨カテゴリ</Typography>
                  </Box>
                  <Chip label={aiState.suggestions.category} color="primary" sx={{ mr: 1 }} />
                  <Button size="small" variant="text" onClick={() => applySuggestions('category')}>
                    適用
                  </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalOffer sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="subtitle2">推奨タグ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {aiState.suggestions.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                  <Button size="small" variant="text" onClick={() => applySuggestions('tags')}>
                    タグを適用
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 詳細情報 */}
                <Box>
                  <Button
                    fullWidth
                    onClick={() =>
                      setAiState((prev) => ({ ...prev, showDetails: !prev.showDetails }))
                    }
                    endIcon={aiState.showDetails ? <ExpandLess /> : <ExpandMore />}
                  >
                    詳細な分析結果
                  </Button>

                  <Collapse in={aiState.showDetails}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        読了時間: 約{aiState.suggestions.readingTime}分
                      </Typography>

                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        感情分析:
                        <Chip
                          label={
                            aiState.suggestions.sentiment === 'positive'
                              ? 'ポジティブ'
                              : aiState.suggestions.sentiment === 'negative'
                                ? 'ネガティブ'
                                : 'ニュートラル'
                          }
                          size="small"
                          color={
                            aiState.suggestions.sentiment === 'positive'
                              ? 'success'
                              : aiState.suggestions.sentiment === 'negative'
                                ? 'error'
                                : 'default'
                          }
                          sx={{ ml: 1 }}
                        />
                      </Typography>

                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        主要キーワード:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {aiState.suggestions.keywords.map((keyword, index) => (
                          <Chip key={index} label={keyword} size="small" variant="outlined" />
                        ))}
                      </Box>

                      {aiState.suggestions.improvements.length > 0 && (
                        <>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            改善提案:
                          </Typography>
                          <List dense>
                            {aiState.suggestions.improvements.map((improvement, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <CheckCircle sx={{ color: 'info.main', fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={improvement}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}

                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        sx={{ mt: 2 }}
                        onClick={() => applySuggestions('all')}
                        startIcon={<AutoAwesome />}
                      >
                        すべての提案を適用
                      </Button>
                    </Box>
                  </Collapse>
                </Box>
              </Box>
            )}

            {!aiState.suggestions && !aiState.isAnalyzing && !aiState.error && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  コンテンツを入力してAI分析を実行してください
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => analyzeWithAI(formData.content, formData.title)}
                  disabled={!formData.content || formData.content.length < 50}
                  startIcon={<Psychology />}
                  sx={{ mt: 2 }}
                >
                  AI分析を開始
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NewBlogPost;
