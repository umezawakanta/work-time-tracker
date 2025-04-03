"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { EventModal } from "@/components/EventModal";
import { useToast } from "@/components/ui/use-toast";
// 認証関連は独自の実装に変更
import { useAuth } from "@/context/useAuth";
import "@/styles/event.css";
import "@/styles/DayView.css";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
  location?: string;
  isPrivate?: boolean;
}

// APIクライアント関数
const api = {
  // イベントの取得
  async getEvents(date: Date, userId: string) {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await fetch(`/api/events?date=${formattedDate}&userId=${userId}`);
      if (!response.ok) throw new Error('イベントの取得に失敗しました');
      
      const data = await response.json();
      // 日付文字列をDateオブジェクトに変換
      return data.events.map((event: {
        id: string;
        title: string;
        start: string;
        end: string;
        color?: string;
        description?: string;
        location?: string;
        isPrivate?: boolean;
      }) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
    } catch (error) {
      console.error('APIエラー:', error);
      throw error;
    }
  },
  
  // イベントの作成
  async createEvent(event: Omit<Event, "id">, userId: string) {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...event, userId }),
      });
      
      if (!response.ok) throw new Error('イベントの作成に失敗しました');
      return await response.json();
    } catch (error) {
      console.error('APIエラー:', error);
      throw error;
    }
  },
  
  // イベントの更新
  async updateEvent(event: Event, userId: string) {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...event, userId }),
      });
      
      if (!response.ok) throw new Error('イベントの更新に失敗しました');
      return await response.json();
    } catch (error) {
      console.error('APIエラー:', error);
      throw error;
    }
  },
  
  // イベントの削除
  async deleteEvent(eventId: string, userId: string) {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) throw new Error('イベントの削除に失敗しました');
      return await response.json();
    } catch (error) {
      console.error('APIエラー:', error);
      throw error;
    }
  },
  
  // サブスクリプション状態の確認
  async checkSubscription(userId: string) {
    try {
      const response = await fetch(`/api/subscription?userId=${userId}`);
      if (!response.ok) throw new Error('サブスクリプション情報の取得に失敗しました');
      return await response.json();
    } catch (error) {
      console.error('APIエラー:', error);
      throw error;
    }
  }
};

export function DayView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'premium' | 'loading'>('loading');
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // 日付変更ハンドラー
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // APIからイベントを取得 (useCallbackでメモ化)
  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const fetchedEvents = await api.getEvents(currentDate, user.id);
      setEvents(fetchedEvents);
    } catch {
      // 変数を含まない形でcatchブロックを記述
      toast({
        title: "エラー",
        description: "イベントの取得に失敗しました。再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, user?.id, toast]);
  
  // サブスクリプション状態を確認 (useCallbackでメモ化)
  const checkUserSubscription = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { subscription } = await api.checkSubscription(user.id);
      setSubscriptionStatus(subscription.status);
    } catch {
      // 変数を含まない形でcatchブロックを記述
      console.error('サブスクリプション確認エラー');
      setSubscriptionStatus('free'); // エラー時はフリープラン扱い
    }
  }, [user?.id]);

  // コンポーネントマウント時とユーザー・日付変更時にイベントを取得
  useEffect(() => {
    if (user?.id) {
      fetchEvents();
      checkUserSubscription();
    }
  }, [fetchEvents, checkUserSubscription, user?.id]);

  const timeSlots = Array.from({ length: 288 }, (_, i) => {
    const minutes = i * 5;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  });

  const handleDoubleClick = (date: Date, time: string) => {
    // 未サブスクライブユーザーはイベント数制限
    if (subscriptionStatus === 'free' && events.length >= 5) {
      toast({
        title: "イベント数制限",
        description: "フリープランでは5件までしかイベントを登録できません。プレミアムプランへのアップグレードをご検討ください。",
        variant: "default",
      });
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setSelectedTime(event.start.toTimeString().slice(0, 5));
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Omit<Event, "id">) => {
    if (!user?.id) {
      toast({
        title: "認証エラー",
        description: "ログインが必要です。",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (selectedEvent) {
        // 既存イベントの更新
        const updatedEvent = await api.updateEvent(
          { ...eventData, id: selectedEvent.id },
          user.id
        );
        
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === selectedEvent.id ? { ...updatedEvent, start: new Date(updatedEvent.start), end: new Date(updatedEvent.end) } : event
          )
        );
        
        toast({
          title: "更新完了",
          description: "イベントが正常に更新されました。",
        });
      } else {
        // 新規イベントの作成
        const newEvent = await api.createEvent(eventData, user.id);
        
        setEvents(prevEvents => [
          ...prevEvents, 
          { ...newEvent, start: new Date(newEvent.start), end: new Date(newEvent.end) }
        ]);
        
        toast({
          title: "作成完了",
          description: "新しいイベントが作成されました。",
        });
      }
    } catch {
      // 変数を含まない形でcatchブロックを記述
      toast({
        title: "エラー",
        description: "イベントの保存に失敗しました。",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if (!user?.id) return;
    
    try {
      await api.deleteEvent(eventId, user.id);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      toast({
        title: "削除完了",
        description: "イベントが削除されました。",
      });
      
      setIsModalOpen(false);
    } catch {
      // 変数を含まない形でcatchブロックを記述
      toast({
        title: "エラー",
        description: "イベントの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const calculateEventProperties = (event: Event) => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
    
    return {
      top: `${(startMinutes / 5) * 2}px`,
      height: `${Math.max(((endMinutes - startMinutes) / 5) * 2, 4)}px`,
      color: event.color || '#3b82f6',
    };
  };

  const dayEvents = events.filter(event => 
    event.start.toDateString() === currentDate.toDateString()
  );
  
  // プレミアム機能が使えるかどうかのチェック
  const isPremiumFeatureAvailable = subscriptionStatus === 'premium';

  // 現在時刻インジケーターを更新するためのuseEffect
  useEffect(() => {
    const updateCurrentTimeIndicator = () => {
      const now = new Date();
      document.documentElement.style.setProperty('--current-hour', now.getHours().toString());
      document.documentElement.style.setProperty('--current-minute', now.getMinutes().toString());
    };

    // 初回実行
    updateCurrentTimeIndicator();
    
    // 1分ごとに更新
    const intervalId = setInterval(updateCurrentTimeIndicator, 60000);
    
    // クリーンアップ関数
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex border-b">
        <div className="w-16 border-r" />
        <div className="flex-1 flex justify-between items-center py-2 px-4">
          <button 
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => {
              const prevDay = new Date(currentDate);
              prevDay.setDate(prevDay.getDate() - 1);
              handleDateChange(prevDay);
            }}
          >
            ←
          </button>
          
          <div className="text-center">
            <div className="text-sm">{currentDate.toLocaleDateString("ja-JP", { weekday: "long" })}</div>
            <div className="text-lg font-semibold">
              {currentDate.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          
          <button 
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => {
              const nextDay = new Date(currentDate);
              nextDay.setDate(nextDay.getDate() + 1);
              handleDateChange(nextDay);
            }}
          >
            →
          </button>
        </div>
      </div>
      
      {!isAuthenticated ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center p-4">
            <h3 className="font-semibold text-lg mb-2">ログインしてください</h3>
            <p className="mb-4">カレンダー機能を利用するにはログインが必要です。</p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => window.location.href = '/login'}
            >
              ログイン
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          {subscriptionStatus === 'free' && (
            <div className="bg-amber-50 p-2 text-sm border-b text-center">
              <span className="font-medium">フリープランをご利用中です。</span> 
              高度な機能を利用するには 
              <a href="/subscription" className="text-blue-600 underline ml-1">
                プレミアムプランにアップグレード
              </a>
              してください。
            </div>
          )}
          
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="flex">
              <div className="w-16 border-r">
                {timeSlots.map(
                  (time, i) =>
                    time.endsWith("00") && (
                      <div
                        key={i}
                        className="h-12 border-b text-xs text-muted-foreground p-1"
                      >
                        {time}
                      </div>
                    )
                )}
              </div>
              <div className="flex-1 relative">
                {/* 現在時刻を示す赤線 */}
                <div className="absolute w-full border-t border-red-500 z-10 current-time-indicator">
                  <div className="w-3 h-3 rounded-full bg-red-500 -mt-1.5 -ml-1.5"></div>
                </div>
                
                {timeSlots.map((time, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={cn(
                      "h-2 border-b border-dashed",
                      slotIndex % 12 === 0 && "border-solid"
                    )}
                    onDoubleClick={() => handleDoubleClick(currentDate, time)}
                  />
                ))}
                
                {dayEvents.map((event) => {
                  const eventProps = calculateEventProperties(event);
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "event-item cursor-pointer hover:opacity-75",
                        isPremiumFeatureAvailable && event.isPrivate && "event-private"
                      )}
                      ref={(el) => {
                        if (el) {
                          el.style.setProperty('--event-top', eventProps.top);
                          el.style.setProperty('--event-height', eventProps.height);
                          el.style.setProperty('--event-color', eventProps.color);
                        }
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="event-title">{event.title}</div>
                      {event.location && (
                        <div className="event-location text-xs opacity-80">
                          {event.location}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </>
      )}
      
      {selectedDate && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          onDelete={selectedEvent ? handleDeleteEvent : undefined}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          event={selectedEvent}
          isPremium={isPremiumFeatureAvailable}
        />
      )}
    </div>
  );
}