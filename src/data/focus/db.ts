import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface FocusSession {
  id?: number;
  startedAt: string; // ISO string
  durationMs: number;
  interruptions: string[]; // 分散タグ
  rating: number; // 1-5
  note?: string;
  tags: string[];
  completedAt?: string; // ISO string
  actualDurationMs?: number; // 実際の完了時間
}

interface FocusDB extends DBSchema {
  focus_sessions: {
    key: number;
    value: FocusSession;
    indexes: {
      'by-started-at': string;
      'by-completed-at': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<FocusDB>> | null = null;

const getDB = (): Promise<IDBPDatabase<FocusDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<FocusDB>('focus-sessions', 1, {
      upgrade(db) {
        const store = db.createObjectStore('focus_sessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-started-at', 'startedAt');
        store.createIndex('by-completed-at', 'completedAt');
      },
    });
  }
  return dbPromise;
};

export const saveSession = async (session: Omit<FocusSession, 'id'>): Promise<number> => {
  const db = await getDB();
  const id = await db.add('focus_sessions', {
    ...session,
    completedAt: session.completedAt || new Date().toISOString(),
    actualDurationMs: session.actualDurationMs || session.durationMs,
  });
  return id as number;
};

export const listSessions = async (limit = 50, offset = 0): Promise<FocusSession[]> => {
  const db = await getDB();
  const sessions = await db.getAllFromIndex('focus_sessions', 'by-started-at');
  return sessions
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(offset, offset + limit);
};

export const getStats = async (range: 'week' | 'month' | 'all' = 'week') => {
  const db = await getDB();
  const sessions = await db.getAll('focus_sessions');

  const now = new Date();
  const cutoff = new Date();

  switch (range) {
    case 'week':
      cutoff.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoff.setMonth(now.getMonth() - 1);
      break;
    case 'all':
      cutoff.setFullYear(2000); // 十分古い日付
      break;
  }

  const filteredSessions = sessions.filter((session) => new Date(session.startedAt) >= cutoff);

  const totalSessions = filteredSessions.length;
  const totalDuration = filteredSessions.reduce(
    (sum, session) => sum + (session.actualDurationMs || session.durationMs),
    0
  );
  const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
  const avgRating =
    totalSessions > 0
      ? filteredSessions.reduce((sum, session) => sum + session.rating, 0) / totalSessions
      : 0;

  const interruptionCounts: Record<string, number> = {};
  filteredSessions.forEach((session) => {
    session.interruptions.forEach((tag) => {
      interruptionCounts[tag] = (interruptionCounts[tag] || 0) + 1;
    });
  });

  return {
    totalSessions,
    totalDuration,
    avgDuration,
    avgRating: Math.round(avgRating * 10) / 10,
    interruptionCounts,
    sessions: filteredSessions,
  };
};

export const deleteSession = async (id: number): Promise<void> => {
  const db = await getDB();
  await db.delete('focus_sessions', id);
};
