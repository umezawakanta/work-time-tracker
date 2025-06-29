import {
  generateId,
  generateTimeBasedId,
  generateShareId,
  generateUUID,
  generateOperationId,
  DataGenerator,
  dataGenerator,
  randomDataGenerator,
  sequentialIdGenerator,
} from '../idGenerator';

describe('idGenerator', () => {
  describe('generateId', () => {
    it('デフォルトの長さでIDを生成する', () => {
      const id = generateId();

      expect(typeof id).toBe('string');
      expect(id.length).toBe(8); // デフォルトの長さ
      expect(id).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]+$/);
    });

    it('指定した長さでIDを生成する', () => {
      const length = 12;
      const id = generateId(undefined, length);

      expect(id.length).toBe(length);
    });

    it('プレフィックス付きでIDを生成する', () => {
      const prefix = 'test';
      const id = generateId(prefix, 8);

      expect(id).toMatch(
        new RegExp(`^${prefix}_[ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]+$`)
      );
      expect(id).toContain('_');
    });

    it('複数回呼び出すと異なるIDを生成する', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('generateTimeBasedId', () => {
    it('タイムスタンプベースのIDを生成する', () => {
      const id = generateTimeBasedId();

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      expect(id).toContain('_'); // timestamp_randomの形式
    });

    it('プレフィックス付きでタイムスタンプIDを生成する', () => {
      const prefix = 'event';
      const id = generateTimeBasedId(prefix);

      expect(id).toMatch(new RegExp(`^${prefix}_`));
    });

    it('短時間で生成すると異なるIDになる', () => {
      const id1 = generateTimeBasedId();
      const id2 = generateTimeBasedId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('generateShareId', () => {
    it('共有用のセキュアなIDを生成する', () => {
      const id = generateShareId();

      expect(typeof id).toBe('string');
      expect(id.length).toBe(8);
      expect(id).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]+$/);
    });

    it('複数回呼び出すと異なるIDを生成する', () => {
      const id1 = generateShareId();
      const id2 = generateShareId();

      expect(id1).not.toBe(id2);
    });

    it('指定回数分全て異なるIDを生成する', () => {
      const count = 100;
      const ids = new Set<string>();

      for (let i = 0; i < count; i++) {
        ids.add(generateShareId());
      }

      expect(ids.size).toBe(count); // 全て異なることを確認
    });
  });

  describe('generateUUID', () => {
    it('UUID v4形式のIDを生成する', () => {
      const uuid = generateUUID();

      expect(typeof uuid).toBe('string');
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('複数回呼び出すと異なるUUIDを生成する', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateOperationId', () => {
    it('操作IDを生成する', () => {
      const operationType = 'create';
      const opId = generateOperationId(operationType);

      expect(typeof opId).toBe('string');
      expect(opId.length).toBeGreaterThan(0);
      expect(opId).toMatch(new RegExp(`^${operationType}_`));
    });

    it('操作タイプ付きでIDを生成する', () => {
      const opType = 'update';
      const opId = generateOperationId(opType);

      expect(opId).toMatch(new RegExp(`^${opType}_`));
    });

    it('複数回呼び出すと異なるIDを生成する', () => {
      const opId1 = generateOperationId('test');
      const opId2 = generateOperationId('test');

      expect(opId1).not.toBe(opId2);
    });
  });

  describe('sequentialIdGenerator', () => {
    beforeEach(() => {
      // 各テスト前にカウンターをリセット
      sequentialIdGenerator.reset();
    });

    it('連続したIDを生成する', () => {
      const prefix = 'seq';

      const id1 = sequentialIdGenerator.generate(prefix);
      const id2 = sequentialIdGenerator.generate(prefix);

      expect(id1).toMatch(new RegExp(`^${prefix}_\\d{6}$`));
      expect(id2).toMatch(new RegExp(`^${prefix}_\\d{6}$`));
      expect(id1).not.toBe(id2);

      // 連続した番号になることを確認
      expect(id1).toBe(`${prefix}_000001`);
      expect(id2).toBe(`${prefix}_000002`);
    });

    it('異なるプレフィックスで独立したカウンターを持つ', () => {
      const id1 = sequentialIdGenerator.generate('test1');
      const id2 = sequentialIdGenerator.generate('test2');
      const id3 = sequentialIdGenerator.generate('test1');

      expect(id1).toBe('test1_000001');
      expect(id2).toBe('test2_000001');
      expect(id3).toBe('test1_000002');
    });

    it('リセット機能が正しく動作する', () => {
      const prefix = 'reset';

      sequentialIdGenerator.generate(prefix);
      sequentialIdGenerator.generate(prefix);

      sequentialIdGenerator.reset(prefix);

      const id = sequentialIdGenerator.generate(prefix);
      expect(id).toBe(`${prefix}_000001`);
    });
  });

  describe('DataGenerator', () => {
    describe('基本機能', () => {
      it('シード値で初期化できる', () => {
        const generator = new DataGenerator(123);
        expect(generator).toBeInstanceOf(DataGenerator);
      });

      it('決定論的な整数を生成する', () => {
        const generator = new DataGenerator(123);
        const num1 = generator.randomInt(1, 10);
        const num2 = generator.randomInt(1, 10);

        expect(num1).toBeGreaterThanOrEqual(1);
        expect(num1).toBeLessThanOrEqual(10);
        expect(num2).toBeGreaterThanOrEqual(1);
        expect(num2).toBeLessThanOrEqual(10);
      });

      it('決定論的な浮動小数点数を生成する', () => {
        const generator = new DataGenerator(456);
        const num = generator.randomFloat(0.0, 1.0);

        expect(num).toBeGreaterThanOrEqual(0.0);
        expect(num).toBeLessThanOrEqual(1.0);
      });

      it('配列からランダムに要素を選択する', () => {
        const generator = new DataGenerator(789);
        const array = ['a', 'b', 'c', 'd', 'e'];
        const choice = generator.randomChoice(array);

        expect(array).toContain(choice);
      });
    });

    describe('メトリクス生成', () => {
      it('パフォーマンスメトリクスを生成する', () => {
        const generator = new DataGenerator(111);
        const metrics = generator.generatePerformanceMetrics();

        expect(metrics.cpu).toBeGreaterThanOrEqual(20);
        expect(metrics.cpu).toBeLessThanOrEqual(80);
        expect(metrics.memory).toBeGreaterThanOrEqual(30);
        expect(metrics.memory).toBeLessThanOrEqual(90);
        expect(metrics.loadTime).toBeGreaterThanOrEqual(500);
        expect(metrics.loadTime).toBeLessThanOrEqual(3000);
        expect(metrics.fps).toBeGreaterThanOrEqual(55);
        expect(metrics.fps).toBeLessThanOrEqual(65);
      });

      it('エンゲージメントメトリクスを生成する', () => {
        const generator = new DataGenerator(222);
        const metrics = generator.generateEngagementMetrics();

        expect(metrics.views).toBeGreaterThanOrEqual(100);
        expect(metrics.views).toBeLessThanOrEqual(10000);
        expect(metrics.likes).toBeGreaterThanOrEqual(0);
        expect(metrics.shares).toBeGreaterThanOrEqual(0);
        expect(metrics.comments).toBeGreaterThanOrEqual(0);
        expect(metrics.engagement).toBeGreaterThanOrEqual(2);
        expect(metrics.engagement).toBeLessThanOrEqual(8);
      });

      it('システムヘルスメトリクスを生成する', () => {
        const generator = new DataGenerator(333);
        const health = generator.generateSystemHealth();

        expect(health.uptime).toBeGreaterThanOrEqual(99.5);
        expect(health.uptime).toBeLessThanOrEqual(99.99);
        expect(health.responseTime).toBeGreaterThanOrEqual(50);
        expect(health.responseTime).toBeLessThanOrEqual(200);
        expect(health.errorRate).toBeGreaterThanOrEqual(0);
        expect(health.errorRate).toBeLessThanOrEqual(0.5);
        expect(health.throughput).toBeGreaterThanOrEqual(500);
        expect(health.throughput).toBeLessThanOrEqual(2000);
      });

      it('財務データを生成する', () => {
        const generator = new DataGenerator(444);
        const baseAmount = 1000000;
        const financial = generator.generateFinancialData(baseAmount);

        expect(financial.assets).toBeGreaterThan(0);
        expect(financial.debts).toBeGreaterThan(0);
        expect(financial.growth).toBeGreaterThanOrEqual(-5);
        expect(financial.growth).toBeLessThanOrEqual(8);
        expect(financial.volatility).toBeGreaterThanOrEqual(1);
        expect(financial.volatility).toBeLessThanOrEqual(3);
      });

      it('生産性データを生成する', () => {
        const generator = new DataGenerator(555);
        const productivity = generator.generateProductivityData();

        expect(productivity.tasksCompleted).toBeGreaterThanOrEqual(0);
        expect(productivity.hoursWorked).toBeGreaterThanOrEqual(6);
        expect(productivity.hoursWorked).toBeLessThanOrEqual(10);
        expect(productivity.focusScore).toBeGreaterThanOrEqual(70);
        expect(productivity.focusScore).toBeLessThanOrEqual(95);
        expect(productivity.efficiency).toBeGreaterThanOrEqual(60);
        expect(productivity.efficiency).toBeLessThanOrEqual(90);
      });
    });
  });

  describe('デフォルトジェネレーター', () => {
    it('dataGeneratorが利用可能', () => {
      expect(dataGenerator).toBeInstanceOf(DataGenerator);
      const num = dataGenerator.randomInt(1, 100);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(100);
    });

    it('randomDataGeneratorが利用可能', () => {
      expect(randomDataGenerator).toBeInstanceOf(DataGenerator);
      const num = randomDataGenerator.randomInt(1, 100);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(100);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のID生成が高速に完了する', () => {
      const start = Date.now();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        generateId();
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // 1秒以内で完了
    });

    it('DataGeneratorで大量のデータ生成が高速に完了する', () => {
      const generator = new DataGenerator(999);
      const start = Date.now();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        generator.randomInt(1, 1000);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // 1秒以内で完了
    });
  });

  describe('ユニーク性テスト', () => {
    it('generateShareIdで生成されるIDの衝突率が極めて低い', () => {
      const count = 10000;
      const ids = new Set<string>();

      for (let i = 0; i < count; i++) {
        ids.add(generateShareId());
      }

      const uniqueRate = ids.size / count;
      expect(uniqueRate).toBeGreaterThan(0.99); // 99%以上がユニーク
    });

    it('generateUUIDで生成されるIDの衝突率が極めて低い', () => {
      const count = 1000;
      const ids = new Set<string>();

      for (let i = 0; i < count; i++) {
        ids.add(generateUUID());
      }

      const uniqueRate = ids.size / count;
      expect(uniqueRate).toBe(1.0); // 100%ユニーク
    });
  });
});
