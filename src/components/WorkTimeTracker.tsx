import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  startTracking,
  stopTracking,
  resetTracking,
  startBreak,
  endBreak,
  selectFormattedTotalTime,
} from "../store/workTimeSlice";
import { RootState } from "../store";

const WorkTimeTracker: React.FC = () => {
  const dispatch = useDispatch();
  const formattedTotalTime = useSelector(selectFormattedTotalTime);
  const isTracking = useSelector(
    (state: RootState) => state.workTime.isTracking
  );

  return (
    <div className="work-time-tracker">
      <h2>作業時間トラッカー</h2>
      <p>合計時間: {formattedTotalTime}</p>
      <div className="controls">
        {!isTracking ? (
          <button onClick={() => dispatch(startTracking())}>開始</button>
        ) : (
          <button onClick={() => dispatch(stopTracking())}>停止</button>
        )}
        <button onClick={() => dispatch(resetTracking())}>リセット</button>
        <button onClick={() => dispatch(startBreak())}>休憩開始</button>
        <button onClick={() => dispatch(endBreak())}>休憩終了</button>
      </div>
    </div>
  );
};

export default WorkTimeTracker;
