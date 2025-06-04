import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  GitCommit,
  ExternalLink,
  Plus,
  Minus,
  FileText,
  Calendar,
  User,
  Hash,
  Eye,
} from 'lucide-react';
import { EnhancedCommit } from '@/types/github';

interface CommitCardProps {
  commit: EnhancedCommit;
  showDetails?: boolean;
  onClick?: () => void;
}

const CommitCard: React.FC<CommitCardProps> = ({ commit, showDetails = false, onClick }) => {
  // コミットタイプに応じたバッジの設定
  const getCommitTypeBadge = (type: EnhancedCommit['commitType']) => {
    const config = {
      feat: { variant: 'default' as const, label: '機能追加', color: 'bg-blue-500' },
      fix: { variant: 'destructive' as const, label: 'バグ修正', color: 'bg-red-500' },
      docs: { variant: 'secondary' as const, label: 'ドキュメント', color: 'bg-gray-500' },
      style: { variant: 'outline' as const, label: 'スタイル', color: 'bg-purple-500' },
      refactor: { variant: 'secondary' as const, label: 'リファクタ', color: 'bg-yellow-500' },
      test: { variant: 'outline' as const, label: 'テスト', color: 'bg-green-500' },
      chore: { variant: 'outline' as const, label: '雑務', color: 'bg-gray-400' },
      other: { variant: 'outline' as const, label: 'その他', color: 'bg-gray-400' },
    };

    return config[type] || config.other;
  };

  // コミットメッセージを整形
  const formatCommitMessage = (message: string) => {
    const lines = message.split('\n');
    const title = lines[0];
    const body = lines.slice(1).join('\n').trim();

    return { title, body };
  };

  const { title, body } = formatCommitMessage(commit.commit.message);
  const typeBadge = getCommitTypeBadge(commit.commitType);

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between space-x-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={commit.authorAvatar} alt={commit.authorName} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant={typeBadge.variant} className="text-xs">
                  {typeBadge.label}
                </Badge>
                <span className="text-sm text-muted-foreground">{commit.relativeDate}</span>
              </div>

              <CardTitle className="text-base line-clamp-2 mb-1">{title}</CardTitle>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{commit.authorName}</span>
                </span>

                <span className="flex items-center space-x-1">
                  <Hash className="h-3 w-3" />
                  <span className="font-mono">{commit.shortSha}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {commit.linesChanged > 0 && (
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Plus className="h-3 w-3 text-green-600" />
                <span>{commit.stats?.additions || 0}</span>
                <Minus className="h-3 w-3 text-red-600" />
                <span>{commit.stats?.deletions || 0}</span>
              </div>
            )}

            {commit.filesChanged > 0 && (
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>{commit.filesChanged}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {(showDetails || body) && (
        <CardContent className="pt-0">
          {body && (
            <>
              <Separator className="mb-3" />
              <CardDescription className="whitespace-pre-line text-sm">{body}</CardDescription>
            </>
          )}

          {showDetails && commit.files && commit.files.length > 0 && (
            <>
              <Separator className="my-3" />
              <div>
                <h4 className="text-sm font-medium mb-2">変更されたファイル:</h4>
                <div className="space-y-1">
                  {commit.files.slice(0, 5).map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-2">
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-xs">{file.filename}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            file.status === 'added'
                              ? 'text-green-600'
                              : file.status === 'removed'
                                ? 'text-red-600'
                                : file.status === 'modified'
                                  ? 'text-blue-600'
                                  : 'text-gray-600'
                          }`}
                        >
                          {file.status}
                        </Badge>
                      </span>
                      <span className="text-muted-foreground">
                        +{file.additions} -{file.deletions}
                      </span>
                    </div>
                  ))}
                  {commit.files.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      他 {commit.files.length - 5} ファイル...
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(commit.commit.author.date).toLocaleString('ja-JP')}</span>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(commit.html_url, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                GitHub
              </Button>

              {!showDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick();
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  詳細
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CommitCard;
