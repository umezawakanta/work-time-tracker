import { EventEmitter } from '../EventEmitter';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on メソッド', () => {
    it('イベントリスナーを追加する', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      emitter.emit('test', 'data');
      expect(listener).toHaveBeenCalledWith('data');
    });

    it('複数のリスナーを同じイベントに追加する', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      emitter.emit('test', 'data');
      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener2).toHaveBeenCalledWith('data');
    });

    it('異なるイベントに別々のリスナーを追加する', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('event1', listener1);
      emitter.on('event2', listener2);

      emitter.emit('event1', 'data1');
      emitter.emit('event2', 'data2');

      expect(listener1).toHaveBeenCalledWith('data1');
      expect(listener2).toHaveBeenCalledWith('data2');
    });

    it('メソッドチェーンが可能', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const result = emitter.on('test1', listener1).on('test2', listener2);

      expect(result).toBe(emitter);
    });
  });

  describe('once メソッド', () => {
    it('一度だけ実行されるリスナーを追加する', () => {
      const listener = jest.fn();
      emitter.once('test', listener);

      emitter.emit('test', 'data1');
      emitter.emit('test', 'data2');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('data1');
    });

    it.skip('複数のonceリスナーが正しく動作する', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.once('test', listener1);
      emitter.once('test', listener2);

      emitter.emit('test', 'data');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      emitter.emit('test', 'data2');
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('onceメソッドもメソッドチェーンが可能', () => {
      const listener = jest.fn();
      const result = emitter.once('test', listener);
      expect(result).toBe(emitter);
    });
  });

  describe('off メソッド', () => {
    it('特定のリスナーを削除する', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.off('test', listener1);

      emitter.emit('test', 'data');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith('data');
    });

    it('存在しないリスナーを削除しようとしても何も起こらない', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      const nonExistentListener = jest.fn();
      emitter.off('test', nonExistentListener);

      emitter.emit('test', 'data');
      expect(listener).toHaveBeenCalledWith('data');
    });

    it('存在しないイベントからリスナーを削除しようとしても何も起こらない', () => {
      const listener = jest.fn();
      expect(() => {
        emitter.off('nonexistent', listener);
      }).not.toThrow();
    });

    it('リスナーが削除されたイベントが空になると削除される', () => {
      const listener = jest.fn();

      emitter.on('test', listener);
      expect(emitter.eventNames()).toContain('test');

      emitter.off('test', listener);
      expect(emitter.eventNames()).not.toContain('test');
    });

    it('offメソッドもメソッドチェーンが可能', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      const result = emitter.off('test', listener);
      expect(result).toBe(emitter);
    });
  });

  describe('emit メソッド', () => {
    it('引数なしでイベントを発火する', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      const result = emitter.emit('test');

      expect(listener).toHaveBeenCalledWith();
      expect(result).toBe(true);
    });

    it('複数の引数でイベントを発火する', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      const result = emitter.emit('test', 'arg1', 'arg2', 'arg3');

      expect(listener).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
      expect(result).toBe(true);
    });

    it('存在しないイベントを発火するとfalseを返す', () => {
      const result = emitter.emit('nonexistent', 'data');
      expect(result).toBe(false);
    });

    it('単一の引数でイベントを発火する', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      const result = emitter.emit('test', 'single-arg');

      expect(listener).toHaveBeenCalledWith('single-arg');
      expect(result).toBe(true);
    });
  });

  describe('removeAllListeners メソッド', () => {
    it('全てのイベントの全てのリスナーを削除する', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.on('event1', listener1);
      emitter.on('event1', listener2);
      emitter.on('event2', listener3);

      const result = emitter.removeAllListeners();

      emitter.emit('event1', 'data1');
      emitter.emit('event2', 'data2');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).not.toHaveBeenCalled();
      expect(result).toBe(emitter);
    });

    it('特定のイベントの全てのリスナーを削除する', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.on('event1', listener1);
      emitter.on('event1', listener2);
      emitter.on('event2', listener3);

      const result = emitter.removeAllListeners('event1');

      emitter.emit('event1', 'data1');
      emitter.emit('event2', 'data2');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).toHaveBeenCalledWith('data2');
      expect(result).toBe(emitter);
    });

    it('存在しないイベントを指定しても何も起こらない', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      expect(() => {
        emitter.removeAllListeners('nonexistent');
      }).not.toThrow();

      emitter.emit('test', 'data');
      expect(listener).toHaveBeenCalledWith('data');
    });
  });

  describe('listenerCount メソッド', () => {
    it('指定したイベントのリスナー数を返す', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      expect(emitter.listenerCount('test')).toBe(0);

      emitter.on('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.on('test', listener2);
      expect(emitter.listenerCount('test')).toBe(2);

      emitter.off('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);
    });

    it('存在しないイベントの場合は0を返す', () => {
      expect(emitter.listenerCount('nonexistent')).toBe(0);
    });
  });

  describe('eventNames メソッド', () => {
    it('登録されているイベント名の配列を返す', () => {
      const listener = jest.fn();

      expect(emitter.eventNames()).toEqual([]);

      emitter.on('event1', listener);
      emitter.on('event2', listener);

      const eventNames = emitter.eventNames();
      expect(eventNames).toContain('event1');
      expect(eventNames).toContain('event2');
      expect(eventNames).toHaveLength(2);
    });

    it('リスナーが削除されるとイベント名も削除される', () => {
      const listener = jest.fn();

      emitter.on('test', listener);
      expect(emitter.eventNames()).toContain('test');

      emitter.off('test', listener);
      expect(emitter.eventNames()).not.toContain('test');
    });
  });

  describe('複合テスト', () => {
    it('onとonceのリスナーが混在しても正しく動作する', () => {
      const onListener = jest.fn();
      const onceListener = jest.fn();

      emitter.on('test', onListener);
      emitter.once('test', onceListener);

      emitter.emit('test', 'data1');
      emitter.emit('test', 'data2');

      expect(onListener).toHaveBeenCalledTimes(2);
      expect(onceListener).toHaveBeenCalledTimes(1);
    });

    it('onceリスナー自体が正しく削除される', () => {
      const listener = jest.fn();

      emitter.once('test', listener);
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.emit('test', 'data');
      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('複数のイベントが独立して動作する', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('event1', listener1);
      emitter.on('event2', listener2);

      emitter.emit('event1', 'data1');
      expect(listener1).toHaveBeenCalledWith('data1');
      expect(listener2).not.toHaveBeenCalled();

      emitter.emit('event2', 'data2');
      expect(listener2).toHaveBeenCalledWith('data2');
    });
  });
});
