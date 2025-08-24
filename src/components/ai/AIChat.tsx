import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Code,
  Brain,
  Sparkles,
  RefreshCw,
  Settings,
  Copy,
  Check,
  Download,
  Trash2,
  Loader2,
  ListTodo,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import anthropicService from '@/services/ai/anthropicService';
import { selectTodos } from '@/store/todoSlice';
import AITaskManager from './AITaskManager';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'analysis';
  metadata?: any;
}

interface CodeGenerationOptions {
  language: string;
  framework?: string;
  description: string;
  requirements: string[];
}

const AIChat: React.FC = () => {
  const todos = useSelector(selectTodos);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(`chat-${Date.now()}`);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Code generation state
  const [codeOptions, setCodeOptions] = useState<CodeGenerationOptions>({
    language: 'typescript',
    framework: 'react',
    description: '',
    requirements: [],
  });
  const [requirementInput, setRequirementInput] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send chat message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Include task context if available
      const response = await anthropicService.chat(
        inputMessage,
        conversationId,
        todos.length > 0 ? todos : undefined
      );

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'text',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('メッセージの送信に失敗しました');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Analyze tasks
  const analyzeTasks = async () => {
    if (todos.length === 0) {
      toast.error('分析するタスクがありません');
      return;
    }

    setIsLoading(true);
    setActiveTab('chat');

    const analysisMessage: ChatMessage = {
      id: `msg-${Date.now()}-system`,
      role: 'system',
      content: `${todos.length}個のタスクを分析中...`,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, analysisMessage]);

    try {
      const analysis = await anthropicService.analyzeTasks(todos);

      const resultMessage: ChatMessage = {
        id: `msg-${Date.now()}-analysis`,
        role: 'assistant',
        content: formatAnalysisResult(analysis),
        timestamp: new Date(),
        type: 'analysis',
        metadata: analysis,
      };

      setMessages((prev) => [...prev, resultMessage]);
      toast.success('タスク分析が完了しました');
    } catch (error) {
      console.error('Task analysis error:', error);
      toast.error('タスク分析に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate code
  const generateCode = async () => {
    if (!codeOptions.description.trim()) {
      toast.error('コードの説明を入力してください');
      return;
    }

    setIsLoading(true);
    setActiveTab('chat');

    const generationMessage: ChatMessage = {
      id: `msg-${Date.now()}-codegen`,
      role: 'system',
      content: `${codeOptions.language} コードを生成中...`,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, generationMessage]);

    try {
      const result = await anthropicService.generateCode({
        description: codeOptions.description,
        language: codeOptions.language,
        framework: codeOptions.framework,
        requirements: codeOptions.requirements,
      });

      const codeMessage: ChatMessage = {
        id: `msg-${Date.now()}-code`,
        role: 'assistant',
        content: result.code,
        timestamp: new Date(),
        type: 'code',
        metadata: {
          language: codeOptions.language,
          explanation: result.explanation,
          dependencies: result.dependencies,
          setupInstructions: result.setupInstructions,
        },
      };

      setMessages((prev) => [...prev, codeMessage]);
      toast.success('コード生成が完了しました');
    } catch (error) {
      console.error('Code generation error:', error);
      toast.error('コード生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Get workflow optimization
  const getWorkflowOptimization = async () => {
    setIsLoading(true);
    setActiveTab('chat');

    try {
      const optimization = await anthropicService.getWorkflowOptimization(todos);

      const optimizationMessage: ChatMessage = {
        id: `msg-${Date.now()}-optimization`,
        role: 'assistant',
        content: formatOptimizationResult(optimization),
        timestamp: new Date(),
        type: 'analysis',
        metadata: optimization,
      };

      setMessages((prev) => [...prev, optimizationMessage]);
      toast.success('ワークフロー最適化の提案を生成しました');
    } catch (error) {
      console.error('Workflow optimization error:', error);
      toast.error('ワークフロー最適化の生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Format analysis result
  const formatAnalysisResult = (analysis: any): string => {
    return `📊 **タスク分析結果**

**概要:**
${analysis.summary}

**提案:**
${analysis.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

**インサイト:**
${analysis.insights.map((i: string) => `• ${i}`).join('\n')}

**アクションアイテム:**
${analysis.actionItems.map((a: string) => `☑️ ${a}`).join('\n')}

*信頼度: ${Math.round(analysis.confidence * 100)}%*`;
  };

  // Format optimization result
  const formatOptimizationResult = (optimization: any): string => {
    return `🚀 **ワークフロー最適化提案**

**最適化案:**
${optimization.optimizations.map((o: string) => `• ${o}`).join('\n')}

**自動化の機会:**
${optimization.automationOpportunities.map((a: string) => `🤖 ${a}`).join('\n')}

**時間の無駄を削減:**
${optimization.timeWasters.map((t: string) => `❌ ${t}`).join('\n')}

**フォーカスエリア:**
${optimization.focusAreas.map((f: string) => `🎯 ${f}`).join('\n')}`;
  };

  // Copy code to clipboard
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('コードをコピーしました');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
    anthropicService.clearConversation(conversationId);
    toast.success('会話をクリアしました');
  };

  // Add requirement
  const addRequirement = () => {
    if (requirementInput.trim()) {
      setCodeOptions((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()],
      }));
      setRequirementInput('');
    }
  };

  // Remove requirement
  const removeRequirement = (index: number) => {
    setCodeOptions((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  // Render message content
  const renderMessageContent = (message: ChatMessage) => {
    if (message.type === 'code' && message.metadata) {
      return (
        <div className="space-y-3">
          {message.metadata.explanation && (
            <div className="text-sm text-gray-600 mb-2">{message.metadata.explanation}</div>
          )}
          <div className="relative">
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyCode(message.content)}
                className="h-8 px-2"
              >
                {copiedCode === message.content ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <SyntaxHighlighter
              language={message.metadata.language || 'javascript'}
              style={vscDarkPlus}
              customStyle={{
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
              }}
            >
              {message.content}
            </SyntaxHighlighter>
          </div>
          {message.metadata.dependencies && message.metadata.dependencies.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">依存関係:</div>
              <div className="text-sm text-blue-700">
                {message.metadata.dependencies.join(', ')}
              </div>
            </div>
          )}
          {message.metadata.setupInstructions && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-900 mb-1">セットアップ手順:</div>
              <div className="text-sm text-green-700 whitespace-pre-wrap">
                {message.metadata.setupInstructions}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Convert markdown-like formatting
    const formattedContent = message.content
      .split('\n')
      .map((line) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        line = line.replace(/^[•·] (.+)/, '<li>$1</li>');
        // Checkboxes
        line = line.replace(/^☑️ (.+)/, '<li className="list-none">✓ $1</li>');
        // Emojis and formatting
        return line;
      })
      .join('<br/>');

    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI アシスタント
          </CardTitle>
          <div className="flex items-center gap-2">
            {anthropicService.isConfigured() ? (
              <Badge variant="default" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Claude 接続済み
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                未設定
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6 mb-4 grid grid-cols-4 w-full">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              チャット
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ListTodo className="h-4 w-4 mr-2" />
              タスク管理
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              コード生成
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <Brain className="h-4 w-4 mr-2" />
              分析ツール
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col px-6 pb-6">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">AIアシスタントとの会話を開始してください</p>
                    <p className="text-xs mt-2">タスク管理、コード生成、分析などをサポートします</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role !== 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-lg px-4 py-2'
                            : 'bg-gray-100 rounded-lg px-4 py-3'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <div className="text-sm">{message.content}</div>
                        ) : (
                          renderMessageContent(message)
                        )}
                        <div
                          className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="メッセージを入力..."
                disabled={isLoading || !anthropicService.isConfigured()}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || !anthropicService.isConfigured()}
                className="px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="flex-1 px-6 pb-6">
            <AITaskManager />
          </TabsContent>

          <TabsContent value="code" className="px-6 pb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">プログラミング言語</label>
                <Select
                  value={codeOptions.language}
                  onValueChange={(value) =>
                    setCodeOptions((prev) => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  フレームワーク（オプション）
                </label>
                <Input
                  value={codeOptions.framework || ''}
                  onChange={(e) =>
                    setCodeOptions((prev) => ({ ...prev, framework: e.target.value }))
                  }
                  placeholder="React, Django, Spring Boot, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">コードの説明</label>
                <Textarea
                  value={codeOptions.description}
                  onChange={(e) =>
                    setCodeOptions((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="生成したいコードの詳細な説明を入力してください..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">要件</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    placeholder="要件を追加..."
                  />
                  <Button onClick={addRequirement} size="sm">
                    追加
                  </Button>
                </div>
                <div className="space-y-1">
                  {codeOptions.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{req}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                        className="h-6 px-2"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateCode}
                disabled={
                  isLoading || !codeOptions.description.trim() || !anthropicService.isConfigured()
                }
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    コードを生成
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="px-6 pb-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    タスク分析
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    現在のタスクを分析し、優先度や時間管理の提案を行います
                  </p>
                  <Button
                    onClick={analyzeTasks}
                    disabled={isLoading || todos.length === 0 || !anthropicService.isConfigured()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        タスクを分析
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    ワークフロー最適化
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    作業効率を向上させる最適化案を提案します
                  </p>
                  <Button
                    onClick={getWorkflowOptimization}
                    disabled={isLoading || todos.length === 0 || !anthropicService.isConfigured()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        最適化案を生成
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {!anthropicService.isConfigured() && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    AI機能を使用するには、設定画面でAnthropicのAPIキーを設定してください。
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIChat;
