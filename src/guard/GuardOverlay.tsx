import React, { useEffect, useState } from 'react';
import { useGuardContext } from './GuardContext';

type Props = {
  blockedPath: string;
  onGoAlt: () => void;                // 代替行動へ（/focus 等に遷移）
  onUnlock: (minutes: number, reason: string) => void; // 一時解除確定
};

const REQUIRED_CODE = 'slow'; // 合言葉。必要なら .env で

export const GuardOverlay: React.FC<Props> = ({blockedPath,onGoAlt,onUnlock}) => {
  const { settings } = useGuardContext();
  const [code,setCode]=useState('');
  const [reason,setReason]=useState('');
  const [delay,setDelay]=useState(15); // 秒
  const canConfirm = code.trim().toLowerCase()===REQUIRED_CODE && reason.trim().length>=5;

  useEffect(()=>{ setDelay(15); },[blockedPath]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="text-sm text-gray-500 mb-1">Dopamine Guard</div>
        <h2 className="text-lg font-semibold mb-2 break-words">この画面は現在ブロックされています</h2>
        <p className="text-sm text-gray-600 mb-4">パス: <span className="font-mono">{blockedPath}</span></p>

        <div className="space-y-3">
          <button onClick={onGoAlt} className="w-full h-12 rounded-xl bg-indigo-600 text-white font-medium">
            代替行動へ（推奨）
          </button>

          <div className="border rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">どうしても解除する場合</div>
            <label className="block text-sm font-medium">合言葉</label>
            <input value={code} onChange={e=>setCode(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="slow"/>
            <label className="block text-sm font-medium mt-3">理由（5文字以上）</label>
            <input value={reason} onChange={e=>setReason(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="何のための解除？"/>

            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">確認まで {delay}s</div>
              <button
                disabled={!canConfirm || delay>0}
                onClick={()=>onUnlock(15, reason)}
                className={`h-10 px-4 rounded-lg font-medium ${(!canConfirm||delay>0)?'bg-gray-200 text-gray-400':'bg-amber-600 text-white'}`}>
                15分だけ解除
              </button>
            </div>
          </div>
        </div>

        {settings?.panicUntil && <p className="text-xs text-red-600 mt-3">※ Panicモード中は解除できない場合があります</p>}
      </div>

      {/* 遅延カウントダウン */}
      {delay>0 && (
        <Countdown seconds={delay} onTick={(s)=>setDelay(s)} />
      )}
    </div>
  );
};

const Countdown: React.FC<{seconds:number; onTick:(s:number)=>void}> = ({seconds,onTick})=>{
  const [s,setS]=useState(seconds);
  useEffect(()=>{
    const id=setInterval(()=>setS(v=>Math.max(0,v-1)),1000);
    return ()=>clearInterval(id);
  },[]);
  useEffect(()=>{ onTick(s); },[s]);
  return null;
};
