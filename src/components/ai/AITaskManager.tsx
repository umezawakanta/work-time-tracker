import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import {
  Brain,
  Send,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
  ListTodo,
  Filter,
  Search,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  Target,
} from 'lucide-react';

import { AppDispatch } from '@/store';
import {
  addTodoItem,
  updateTodoItem,
  deleteTodoItem,
  selectTodos,
  clearCompletedTodos,
} from '@/store/todoSlice';
import anthropicService from '@/services/ai/anthropicService';
import { unifiedErrorHandler } from '@/services/error/UnifiedErrorHandler';

interface TaskCommand {
  action: 'create' | 'update' | 'delete' | 'complete' | 'search' | 'analyze';
  task?: string;
  taskId?: string;
  updates?: any;
  priority?: number;
  description?: string;
}

interface AIResponse {
  message: string;
  command?: TaskCommand;
  suggestions?: string[];
  analysis?: any;
}

const AITaskManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [selectedTab, setSelectedTab] = useState('chat');

  // 自然言語コマンドの解析
  const parseNaturalCommand = useCallback(
    async (text: string): Promise<TaskCommand | null> => {
      try {
        const systemPrompt = `
あなたはタスク管理アシスタントです。ユーザーの自然言語入力をタスク管理コマンドに変換してください。

利用可能なアクション:
- create: 新しいタスクを作成
- update: 既存のタスクを更新
- delete: タスクを削除
- complete: タスクを完了にする
- search: タスクを検索
- analyze: タスクを分析

レスポンスはJSON形式で返してください:
{
  "action": "アクション名",
  "task": "タスクのタイトル（createの場合）",
  "taskId": "タスクID（update/delete/completeの場合）",
  "priority": 優先度（1-5の数値）,
  "description": "タスクの説明"
}

現在のタスク一覧:
${todos.map((t) => `- ID: ${t._id}, タイトル: ${t.task}, 優先度: ${t.priority}, 完了: ${t.completed}`).join('\n')}
`;

        // システムプロンプトを含めた完全なメッセージを作成
        const fullMessage = `${systemPrompt}\n\nユーザー入力: ${text}`;
        const response = await anthropicService.chat(fullMessage, 'task-manager', todos);

        // レスポンスからJSONを抽出
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        return null;
      } catch (error) {
        await unifiedErrorHandler.handleError(error, {
          component: 'AITaskManager',
          action: 'parseNaturalCommand',
        });
        return null;
      }
    },
    [todos]
  );

  // タスクコマンドの実行
  const executeCommand = useCallback(
    async (command: TaskCommand): Promise<string> => {
      try {
        switch (command.action) {
          case 'create': {
            if (!command.task) {
              return 'タスクのタイトルが必要です。';
            }

            const newTask = await dispatch(
              addTodoItem({
                task: command.task,
                priority: command.priority || 3,
                isPrioritized: (command.priority || 3) >= 4,
                type: 'input',
                createdAt: new Date().toISOString(),
              })
            ).unwrap();

            return `✅ タスク「${command.task}」を作成しました（優先度: ${command.priority || 3}）`;
          }

          case 'update':
            if (!command.taskId) {
              return 'タスクIDが必要です。';
            }

            await dispatch(
              updateTodoItem({
                _id: command.taskId,
                updates: command.updates || {},
              })
            ).unwrap();

            return `✅ タスクを更新しました`;

          case 'delete':
            if (!command.taskId) {
              return 'タスクIDが必要です。';
            }

            await dispatch(deleteTodoItem(command.taskId)).unwrap();
            return `✅ タスクを削除しました`;

          case 'complete':
            if (!command.taskId) {
              return 'タスクIDが必要です。';
            }

            await dispatch(
              updateTodoItem({
                _id: command.taskId,
                updates: { completed: true },
              })
            ).unwrap();

            return `✅ タスクを完了にしました`;

          case 'search': {
            const searchTerm = command.task?.toLowerCase() || '';
            const foundTasks = todos.filter((t) => t.task.toLowerCase().includes(searchTerm));

            if (foundTasks.length === 0) {
              return '該当するタスクが見つかりません。';
            }

            return `🔍 ${foundTasks.length}件のタスクが見つかりました:\n${foundTasks
              .map((t) => `• ${t.task} (優先度: ${t.priority})`)
              .join('\n')}`;
          }

          case 'analyze': {
            const incompleteTasks = todos.filter((t) => !t.completed);
            const highPriorityTasks = incompleteTasks.filter((t) => t.priority >= 4);

            return `📊 タスク分析結果:
• 総タスク数: ${todos.length}
• 未完了: ${incompleteTasks.length}
• 高優先度: ${highPriorityTasks.length}
• 完了率: ${Math.round(((todos.length - incompleteTasks.length) / todos.length) * 100)}%

${highPriorityTasks.length > 0 ? `\n⚠️ 高優先度タスク:\n${highPriorityTasks.map((t) => `• ${t.task}`).join('\n')}` : ''}`;
          }

          default:
            return 'サポートされていないコマンドです。';
        }
      } catch (error) {
        await unifiedErrorHandler.handleError(error, {
          component: 'AITaskManager',
          action: 'executeCommand',
          additionalData: { action: command.action },
        });
        return 'コマンドの実行に失敗しました。';
      }
    },
    [dispatch, todos]
  );

  // メッセージの送信
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // 会話履歴に追加
    setConversation((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // コマンドを解析
      const command = await parseNaturalCommand(userMessage);

      let response: string;
      if (command) {
        // コマンドを実行
        response = await executeCommand(command);
      } else {
        // 通常のAI応答
        const systemMessage =
          'あなたはタスク管理の専門家です。ユーザーの質問に対して、タスク管理のベストプラクティスや生産性向上のアドバイスを提供してください。';
        const fullMessage = `${systemMessage}\n\nユーザーの質問: ${userMessage}`;
        const aiResponse = await anthropicService.chat(fullMessage, 'task-assistant', todos);
        response = aiResponse;
      }

      // 会話履歴に追加
      setConversation((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      await unifiedErrorHandler.handleError(error, {
        component: 'AITaskManager',
        action: 'handleSendMessage',
      });
      const errorMessage = 'エラーが発生しました。もう一度お試しください。';
      setConversation((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, parseNaturalCommand, executeCommand]);

  // クイックアクション
  const quickActions = [
    { label: '高優先度タスクを表示', command: '優先度4以上のタスクを見せて' },
    { label: '今日のタスクを作成', command: '今日やることリストを作成して' },
    { label: 'タスク分析', command: '現在のタスクを分析して' },
    { label: '完了タスクをクリア', command: '完了したタスクをすべて削除して' },
  ];

  // サンプルコマンド
  const sampleCommands = [
    '「会議の準備」という高優先度タスクを作成して',
    '「メール返信」を完了にして',
    '優先度が高いタスクを教えて',
    '今週のタスクを整理して',
    'プレゼン関連のタスクを検索',
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI タスクマネージャー
          </div>
          <Badge variant="outline" className="text-xs">
            Claude 3.5 Sonnet
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              チャット
            </TabsTrigger>
            <TabsTrigger value="quick">
              <Sparkles className="h-4 w-4 mr-2" />
              クイック操作
            </TabsTrigger>
            <TabsTrigger value="help">
              <AlertCircle className="h-4 w-4 mr-2" />
              ヘルプ
            </TabsTrigger>
          </TabsList>

          {/* チャットタブ */}
          <TabsContent value="chat" className="space-y-4">
            <ScrollArea className="h-[400px] w-full rounded-lg border p-4">
              {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center">
                    自然な言葉でタスクを管理できます。
                    <br />
                    例：「買い物リストを作成して」
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="タスクについて話しかけてください..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                送信
              </Button>
            </div>
          </TabsContent>

          {/* クイック操作タブ */}
          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setInput(action.command);
                    setSelectedTab('chat');
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">現在のタスク状況</h4>
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <ListTodo className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <div className="text-xl font-bold">{todos.length}</div>
                    <div className="text-xs text-gray-600">総タスク</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Clock className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                    <div className="text-xl font-bold">
                      {todos.filter((t) => !t.completed).length}
                    </div>
                    <div className="text-xs text-gray-600">未完了</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <div className="text-xl font-bold">
                      {todos.filter((t) => t.completed).length}
                    </div>
                    <div className="text-xs text-gray-600">完了済み</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ヘルプタブ */}
          <TabsContent value="help" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">💡 使い方</h4>
                <p className="text-sm text-gray-600">
                  自然な言葉でタスクの作成、更新、削除、検索ができます。
                  AIがあなたの意図を理解して、適切な操作を実行します。
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">📝 コマンド例</h4>
                <div className="space-y-2">
                  {sampleCommands.map((cmd, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setInput(cmd);
                        setSelectedTab('chat');
                      }}
                    >
                      <span className="text-blue-500">▶</span>
                      <span className="text-sm">{cmd}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">🎯 できること</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Plus className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>タスクの作成と優先度設定</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>タスクの完了・更新・削除</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Search className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span>タスクの検索とフィルタリング</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span>タスクの分析と最適化提案</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AITaskManager;
