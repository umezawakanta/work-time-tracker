import React, { useState } from 'react';
import { useGuardContext } from '../guard/GuardContext';
import type { GuardSettings } from '../guard/types';
import { MobileHeader } from '../components/ui/MobileHeader';

const DEFAULT_BLOCKS = ['/feed', '/explore', '/discover', '/news'];

const GuardPage: React.FC = () => {
  const { settings, setSettings } = useGuardContext();
  const [local, setLocal] = useState<GuardSettings>(settings);

  const save = () => setSettings(local);

  const addNight = () =>
    setLocal((s) => ({
      ...s,
      schedules: [
        ...s.schedules,
        { days: [0, 1, 2, 3, 4, 5, 6], start: '22:00', end: '07:00', strict: true },
      ],
    }));

  const toggleEnabled = () => setLocal((s) => ({ ...s, enabled: !s.enabled }));

  return (
    <>
      <MobileHeader
        title="Dopamine Guard"
        subtitle="衝動行動の遮断設定"
        backTo="/"
        rightActions={[]}
      />
      <main className="max-w-screen-sm mx-auto px-4 mt-16 pb-24">
        <div className="rounded-2xl border p-4 space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={local.enabled} onChange={toggleEnabled} />
            <span className="font-medium">ガードを有効化</span>
          </label>

          <div>
            <div className="text-sm text-gray-500 mb-2">ブロックするルート</div>
            <textarea
              className="w-full border rounded-lg p-2 font-mono text-sm"
              rows={3}
              value={local.blockRoutes.join('\n')}
              onChange={(e) =>
                setLocal((s) => ({ ...s, blockRoutes: e.target.value.split('\n').filter(Boolean) }))
              }
              placeholder={DEFAULT_BLOCKS.join('\n')}
            />
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">スケジュール</div>
            {local.schedules.map((sc, i) => (
              <div key={i} className="flex items-center gap-2 text-sm mb-2">
                <span className="px-2 py-1 rounded bg-gray-100">毎日</span>
                <input
                  className="w-20 border rounded px-2 py-1"
                  value={sc.start}
                  onChange={(e) => {
                    const v = [...local.schedules];
                    v[i] = { ...v[i], start: e.target.value };
                    setLocal((s) => ({ ...s, schedules: v }));
                  }}
                  placeholder="22:00"
                  aria-label="開始時間"
                />
                <span>→</span>
                <input
                  className="w-20 border rounded px-2 py-1"
                  value={sc.end}
                  onChange={(e) => {
                    const v = [...local.schedules];
                    v[i] = { ...v[i], end: e.target.value };
                    setLocal((s) => ({ ...s, schedules: v }));
                  }}
                  placeholder="07:00"
                  aria-label="終了時間"
                />
              </div>
            ))}
            <button onClick={addNight} className="mt-1 h-10 px-3 rounded-lg border">
              + 夜間22-7を追加
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setLocal({ ...settings })}
              className="h-11 px-4 rounded-xl border"
            >
              戻す
            </button>
            <button onClick={save} className="h-11 px-4 rounded-xl bg-indigo-600 text-white">
              保存
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default GuardPage;
