import { renderHook, act } from '@testing-library/react';
import useAIAction from '../useAIAction';

describe('useAIAction', () => {
  it('初期状態: idle で結果/エラーなし', () => {
    const action = jest.fn(async () => 'ok');
    const { result } = renderHook(() => useAIAction<string, string>(action));

    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.attempt).toBe(0);
    expect(result.current.durationMs).toBeNull();
  });

  it.skip('ローディング→成功: execute で状態が遷移し結果が入る', async () => {
    const action = jest.fn(async (args: string) => {
      await new Promise((r) => setTimeout(r, 0));
      return `result:${args}`;
    });
    const { result } = renderHook(() => useAIAction<string, string>(action));

    await act(async () => {
      const p = result.current.execute('hello');
      // 直後は同期的に state 更新されない可能性があるため、フラッシュ後に検証
      await Promise.resolve();
      expect(result.current.status === 'loading' || result.current.isLoading).toBeTruthy();
      await p;
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.result).toBe('result:hello');
    expect(result.current.error).toBeNull();
    expect(result.current.attempt).toBe(1);
    expect(result.current.durationMs === null || result.current.durationMs >= 0).toBe(true);
  });

  it('エラー: execute で失敗時に error 状態とエラーが設定される', async () => {
    const action = jest.fn(async () => {
      await new Promise((r) => setTimeout(r, 0));
      throw new Error('boom');
    });
    const { result } = renderHook(() => useAIAction<void, string>(action));

    await act(async () => {
      const res = await result.current.execute(undefined as unknown as void);
      expect(res).toBeNull();
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.result).toBeNull();
  });
});
