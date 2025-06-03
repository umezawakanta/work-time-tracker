import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@/components/ui/timeline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Megaphone, Newspaper, Award, Users, MapPin } from 'lucide-react';

interface TimelineEvent {
  _id: string;
  candidateId: string;
  date: string;
  eventType: 'speech' | 'media' | 'endorsement' | 'rally' | 'other';
  title: string;
  description?: string;
  location?: string;
  url?: string;
}

interface CandidateTimelineProps {
  candidateId: string;
}

const CandidateTimeline: React.FC<CandidateTimelineProps> = ({ candidateId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // TODO: 実際のAPIエンドポイントに接続する
        // const response = await fetch(`/api/candidates/${candidateId}/events`);
        // if (!response.ok) {
        //   throw new Error("イベントの取得に失敗しました");
        // }
        // const data = await response.json();
        // setEvents(data);

        // デモデータを使用
        const demoData: TimelineEvent[] = [
          {
            _id: '1',
            candidateId,
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            eventType: 'speech',
            title: '政策演説会',
            description: '経済政策と雇用創出についての公開演説を行いました。',
            location: '東京都渋谷区',
          },
          {
            _id: '2',
            candidateId,
            date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            eventType: 'media',
            title: 'テレビ出演',
            description: 'NHK「政治フォーラム」に出演し、政策について議論しました。',
            url: 'https://example.com/news/1',
          },
          {
            _id: '3',
            candidateId,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            eventType: 'endorsement',
            title: '業界団体からの支持表明',
            description: '全国中小企業協会から支持を受けました。',
          },
          {
            _id: '4',
            candidateId,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            eventType: 'rally',
            title: '選挙集会',
            description: '支持者と共に選挙キャンペーンの集会を開催しました。',
            location: '東京都新宿区',
          },
          {
            _id: '5',
            candidateId,
            date: new Date().toISOString(),
            eventType: 'other',
            title: '政策文書公開',
            description: '新たな環境政策提言を公式ウェブサイトで発表しました。',
            url: 'https://example.com/policy-doc',
          },
        ];

        setEvents(demoData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchEvents();
    }
  }, [candidateId]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'speech':
        return <Megaphone className="h-4 w-4" />;
      case 'media':
        return <Newspaper className="h-4 w-4" />;
      case 'endorsement':
        return <Award className="h-4 w-4" />;
      case 'rally':
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeText = (eventType: string) => {
    switch (eventType) {
      case 'speech':
        return '演説';
      case 'media':
        return 'メディア';
      case 'endorsement':
        return '支持表明';
      case 'rally':
        return '集会';
      default:
        return 'その他';
    }
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return <div className="text-center py-4 text-gray-500">活動履歴はありません</div>;
  }

  return (
    <div className="space-y-4">
      <Timeline position="alternate">
        {events.map((event, index) => (
          <TimelineItem key={event._id}>
            <TimelineOppositeContent color="text.secondary">
              {new Date(event.date).toLocaleDateString('ja-JP')}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot>{getEventIcon(event.eventType)}</TimelineDot>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Card>
                <CardContent className="p-4">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    {getEventTypeText(event.eventType)}
                  </div>
                  <h4 className="text-base font-medium mb-1">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                  )}
                  {event.location && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </div>
                  )}
                  {event.url && (
                    <div className="mt-2">
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        詳細を見る →
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};

export default CandidateTimeline;
