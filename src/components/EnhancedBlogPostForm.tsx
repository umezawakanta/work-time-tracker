import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Lightbulb, X } from 'lucide-react';
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
  const [tagInput, setTagInput] = useState('');

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<BlogAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(false);

  // AI Q&A Quick Add State
  const [qaRaw, setQaRaw] = useState('');
  const [qaParsed, setQaParsed] = useState<{ question: string; answer: string } | null>(null);
  const [autoTitleFromQuestion, setAutoTitleFromQuestion] = useState(false);
  const [autoAddTags, setAutoAddTags] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, category, tags });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  function extractFirstQA(raw: string): { question: string; answer: string } | null {
    const text = raw.trim();
    if (!text) return null;

    // Common patterns: Q:/A:, 質問:/回答:, User:/Assistant:, Question:/Answer:
    const patterns: Array<{ q: RegExp; a: RegExp }> = [
      {
        q: /(^|\n)\s*(Q:|Question:|質問[:：]|User:)/i,
        a: /(^|\n)\s*(A:|Answer:|回答[:：]|Assistant:|AI:)/i,
      },
    ];

    for (const p of patterns) {
      const qMatch = p.q.exec(text);
      const aMatch = p.a.exec(text);
      if (qMatch && aMatch) {
        const qStart = qMatch.index + qMatch[0].length;
        const aStart = aMatch.index + aMatch[0].length;
        const qStr = text.slice(qStart, aMatch.index).trim();
        const aStr = text.slice(aStart).trim();
        if (qStr && aStr) return { question: qStr, answer: aStr };
      }
    }

    // Fallback: split first blank line
    const parts = text.split(/\n\n+/);
    if (parts.length >= 2) {
      return { question: parts[0].trim(), answer: parts.slice(1).join('\n\n').trim() };
    }
    return { question: text, answer: '' };
  }

  function buildQaMarkdown(q: string, a: string): string {
    const trimmedQ = q.trim();
    const trimmedA = a.trim();
    const titleLine = trimmedQ.length > 60 ? `${trimmedQ.slice(0, 57)}...` : trimmedQ;
    return [
      `## AI Q&A: ${titleLine}`,
      '',
      '### Question',
      trimmedQ,
      '',
      '### Answer',
      trimmedA,
      '',
    ].join('\n');
  }

  function onParseQa(): void {
    const parsed = extractFirstQA(qaRaw);
    setQaParsed(parsed);
    if (parsed && autoTitleFromQuestion && !title) {
      setTitle(
        parsed.question.length > 64 ? `${parsed.question.slice(0, 61)}...` : parsed.question
      );
    }
    if (parsed && autoAddTags) {
      const merged = new Set([...tags, 'AI', 'Q&A', 'Cursor']);
      setTags(Array.from(merged));
    }
  }

  function onAppendQaToContent(): void {
    if (!qaParsed) return;
    const md = buildQaMarkdown(qaParsed.question, qaParsed.answer);
    setContent((prev) => (prev ? `${prev}\n\n${md}` : md));
  }

  const performAiAnalysis = async () => {
    if (!content.trim() || content.length < 100) {
      setAiAnalysis({
        suggestedTags: [],
        contentSuggestions: ['Please write at least 100 characters to get AI analysis.'],
        seoRecommendations: [],
        readabilityScore: 0,
        categoryRecommendation: '',
        confidence: 0,
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await BlogAiService.analyzeBlogPost(title, content, category);
      setAiAnalysis(analysis);
      logger.info('AI analysis completed', '');
    } catch (error) {
      logger.error('AI analysis failed', String(error));
      setAiAnalysis({
        suggestedTags: [],
        contentSuggestions: ['AI analysis temporarily unavailable. Please try again later.'],
        seoRecommendations: [],
        readabilityScore: 0,
        categoryRecommendation: '',
        confidence: 0,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when content changes (if enabled)
  useEffect(() => {
    if (autoAnalyze && content.length > 100) {
      const debounceTimer = setTimeout(() => {
        performAiAnalysis();
      }, 2000);
      return () => clearTimeout(debounceTimer);
    }
  }, [content, autoAnalyze]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Blog Post Editor</CardTitle>
          <CardDescription>
            Write your blog post with AI-powered suggestions and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter your blog post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                placeholder="Enter category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Press enter to add tags"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="pr-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={15}
                placeholder="Write your blog post content here..."
              />
            </div>

            <Button type="submit" className="w-full">
              {submitButtonText}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Q&A Quick Add */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Q&A Quick Add
          </CardTitle>
          <CardDescription>
            Paste a Q&A (from Cursor or other AI) and append it to your post in markdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qa-raw">Paste Q&A Transcript</Label>
            <Textarea
              id="qa-raw"
              value={qaRaw}
              onChange={(e) => setQaRaw(e.target.value)}
              rows={8}
              placeholder={
                'Example:\nQ: 〇〇についてのベストプラクティスは？\nA: ...\n\nまたは\nUser: 質問...\nAssistant: 回答...'
              }
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-title"
                  checked={autoTitleFromQuestion}
                  onCheckedChange={setAutoTitleFromQuestion}
                />
                <Label htmlFor="auto-title" className="text-sm">
                  Use question as title (if empty)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="auto-tags" checked={autoAddTags} onCheckedChange={setAutoAddTags} />
                <Label htmlFor="auto-tags" className="text-sm">
                  Auto-add tags: AI, Q&A, Cursor
                </Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onParseQa} disabled={!qaRaw.trim()}>
                Parse Q&A
              </Button>
              <Button
                type="button"
                onClick={onAppendQaToContent}
                disabled={!qaParsed}
                title={!qaParsed ? 'Parse first' : 'Append to content'}
              >
                Append to Content
              </Button>
            </div>
          </div>

          {qaParsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-500 mb-1">Parsed Question</div>
                <pre className="text-xs bg-neutral-50 dark:bg-neutral-800 p-2 rounded whitespace-pre-wrap break-words max-h-48 overflow-auto">
                  {qaParsed.question}
                </pre>
              </div>
              <div>
                <div className="text-sm text-neutral-500 mb-1">Parsed Answer</div>
                <pre className="text-xs bg-neutral-50 dark:bg-neutral-800 p-2 rounded whitespace-pre-wrap break-words max-h-48 overflow-auto">
                  {qaParsed.answer}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      {aiEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Analysis & Suggestions
            </CardTitle>
            <div className="flex items-center justify-between">
              <CardDescription>
                Get AI-powered suggestions to improve your blog post
              </CardDescription>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-analyze"
                    checked={autoAnalyze}
                    onCheckedChange={setAutoAnalyze}
                  />
                  <Label htmlFor="auto-analyze" className="text-sm">
                    Auto-analyze
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={performAiAnalysis}
                  disabled={isAnalyzing || content.length < 10}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!aiAnalysis && !isAnalyzing && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  Write at least 100 characters and click "Analyze Content" to get AI suggestions.
                </AlertDescription>
              </Alert>
            )}

            {aiAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {aiAnalysis.readabilityScore}%
                    </div>
                    <div className="text-sm text-gray-600">Readability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(aiAnalysis.confidence * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {aiAnalysis.seoRecommendations.length}
                    </div>
                    <div className="text-sm text-gray-600">SEO Tips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.ceil(content.length / 200)}
                    </div>
                    <div className="text-sm text-gray-600">Min Read</div>
                  </div>
                </div>

                <Separator />

                <Accordion type="single" collapsible>
                  <AccordionItem value="suggestions">
                    <AccordionTrigger>
                      AI Suggestions ({aiAnalysis.contentSuggestions.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {aiAnalysis.contentSuggestions.map((suggestion: string, index: number) => (
                          <Alert key={index}>
                            <AlertDescription>{suggestion}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {aiAnalysis.suggestedTags.length > 0 && (
                    <AccordionItem value="tags">
                      <AccordionTrigger>
                        Suggested Tags ({aiAnalysis.suggestedTags.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.suggestedTags.map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-blue-50"
                              onClick={() => {
                                if (!tags.includes(tag)) {
                                  setTags([...tags, tag]);
                                }
                              }}
                            >
                              + {tag}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
