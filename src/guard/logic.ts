import { GuardSchedule } from './types';

export const isNowInSchedule = (now: Date, sch: GuardSchedule) => {
  const day = (now.getDay() as 0|1|2|3|4|5|6);
  if (!sch.days.includes(day)) return false;

  const toMin = (t:string)=>{const [h,m]=t.split(':').map(Number); return h*60+m;};
  const n = now.getHours()*60 + now.getMinutes();
  const s = toMin(sch.start), e = toMin(sch.end);
  // 翌日跨ぎ対応
  return s<=e ? (n>=s && n<e) : (n>=s || n<e);
};
