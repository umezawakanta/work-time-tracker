import { toast } from '@/components/ui/use-toast';

export interface DataStory {
  id: string;
  title: string;
  description: string;
  scenes: StoryScene[];
  narrative: StoryNarrative;
  insights: DataInsight[];
  visualizations: string[]; // チャートID参照
  metadata: StoryMetadata;
}

export interface StoryScene {
  id: string;
  title: string;
  content: string;
  duration: number;
  visualizationId: string;
  annotations: Annotation[];
  transitions: SceneTransition;
  interactions: SceneInteraction[];
}

export interface StoryNarrative {
  voiceOver: {
    enabled: boolean;
    voice: 'male' | 'female' | 'neutral';
    speed: number;
    language: string;
  };
  captions: {
    enabled: boolean;
    fontSize: number;
    position: 'top' | 'bottom' | 'overlay';
  };
  progression: 'auto' | 'manual' | 'interactive';
  timeline: TimelineEvent[];
}

export interface DataInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'comparison';
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: any;
  visualization?: string;
}

export interface Annotation {
  id: string;
  type: 'text' | 'arrow' | 'highlight' | 'circle' | 'box';
  position: { x: number; y: number };
  content: string;
  style: AnnotationStyle;
  animation: AnnotationAnimation;
}

export interface AnnotationStyle {
  color: string;
  fontSize: number;
  fontWeight: string;
  background: string;
  borderColor: string;
  borderWidth: number;
  opacity: number;
}

export interface AnnotationAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'bounce';
  duration: number;
  delay: number;
  easing: string;
}

export interface SceneTransition {
  type: 'fade' | 'slide' | 'zoom' | 'morph' | 'wipe';
  duration: number;
  easing: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface SceneInteraction {
  type: 'click' | 'hover' | 'scroll' | 'voice';
  trigger: string;
  action: 'next' | 'previous' | 'pause' | 'play' | 'jump';
  target?: string;
}

export interface TimelineEvent {
  time: number;
  action: 'show' | 'hide' | 'highlight' | 'animate' | 'speak';
  target: string;
  parameters: any;
}

export interface StoryMetadata {
  author: string;
  created: string;
  modified: string;
  version: string;
  tags: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  language: string;
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  scenes: Partial<StoryScene>[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * 📊 データビジュアライゼーションマスター: データストーリーテリングサービス
 * ナラティブデータ可視化とインサイト自動生成
 */
class DataStorytellingService {
  private static instance: DataStorytellingService | null = null;
  private stories: Map<string, DataStory> = new Map();
  private templates: Map<string, StoryTemplate> = new Map();
  private insights: Map<string, DataInsight[]> = new Map();
  private playingStories: Set<string> = new Set();

  private constructor() {
    this.initializeTemplates();
    this.initializeDefaultStories();
  }

  public static getInstance(): DataStorytellingService {
    if (!DataStorytellingService.instance) {
      DataStorytellingService.instance = new DataStorytellingService();
    }
    return DataStorytellingService.instance;
  }

  private initializeTemplates(): void {
    const templates: StoryTemplate[] = [
      {
        id: 'productivity-analysis',
        name: '生産性分析ストーリー',
        description: '生産性データの包括的分析と改善提案',
        category: 'productivity',
        difficulty: 'intermediate',
        scenes: [
          {
            title: '現状分析',
            content: '現在の生産性レベルと傾向を確認します',
            duration: 5000,
          },
          {
            title: 'パターン発見',
            content: '生産性の高い時間帯と要因を特定します',
            duration: 7000,
          },
          {
            title: '改善提案',
            content: 'データに基づく具体的な改善策を提示します',
            duration: 6000,
          },
        ],
      },
      {
        id: 'task-efficiency',
        name: 'タスク効率ストーリー',
        description: 'タスク完了効率と最適化の分析',
        category: 'efficiency',
        difficulty: 'beginner',
        scenes: [
          {
            title: 'タスク分布',
            content: 'カテゴリ別タスク配分を視覚化します',
            duration: 4000,
          },
          {
            title: '完了率分析',
            content: 'タスク完了率の傾向を分析します',
            duration: 5000,
          },
        ],
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });

    console.log('📚 ストーリーテンプレートを初期化しました', this.templates.size, 'テンプレート');
  }

  private initializeDefaultStories(): void {
    // デフォルトストーリーを作成
    this.createStoryFromTemplate('productivity-analysis', {
      title: '今週の生産性分析',
      description: '過去7日間の生産性データから得られるインサイト',
    });

    console.log('📖 デフォルトストーリーを初期化しました');
  }

  /**
   * 📖 ストーリー作成
   */
  createStory(storyData: Partial<DataStory>): string {
    const storyId = storyData.id || `story_${Date.now()}`;

    const story: DataStory = {
      id: storyId,
      title: storyData.title || 'Untitled Story',
      description: storyData.description || '',
      scenes: storyData.scenes || [],
      narrative: storyData.narrative || this.getDefaultNarrative(),
      insights: storyData.insights || [],
      visualizations: storyData.visualizations || [],
      metadata: {
        author: storyData.metadata?.author || 'System',
        created: storyData.metadata?.created || new Date().toISOString(),
        modified: storyData.metadata?.modified || new Date().toISOString(),
        version: storyData.metadata?.version || '1.0.0',
        tags: storyData.metadata?.tags || [],
        category: storyData.metadata?.category || 'general',
        difficulty: storyData.metadata?.difficulty || 'beginner',
        duration: storyData.metadata?.duration || 0,
        language: storyData.metadata?.language || 'ja',
      },
    };

    this.stories.set(storyId, story);

    toast({
      title: 'ストーリー作成完了',
      description: `${story.title}を作成しました`,
      variant: 'default',
    });

    return storyId;
  }

  /**
   * 📚 テンプレートからストーリー作成
   */
  createStoryFromTemplate(templateId: string, customData: Partial<DataStory>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const scenes: StoryScene[] = template.scenes.map((sceneTemplate, index) => ({
      id: `scene_${index}`,
      title: sceneTemplate.title || `Scene ${index + 1}`,
      content: sceneTemplate.content || '',
      duration: sceneTemplate.duration || 5000,
      visualizationId: sceneTemplate.visualizationId || '',
      annotations: [],
      transitions: {
        type: 'fade',
        duration: 800,
        easing: 'ease-in-out',
      },
      interactions: [],
    }));

    return this.createStory({
      ...customData,
      scenes,
      metadata: {
        author: customData.metadata?.author || 'System',
        created: customData.metadata?.created || new Date().toISOString(),
        modified: customData.metadata?.modified || new Date().toISOString(),
        version: customData.metadata?.version || '1.0.0',
        tags: customData.metadata?.tags || [],
        duration: customData.metadata?.duration || 0,
        language: customData.metadata?.language || 'ja',
        category: template.category,
        difficulty: template.difficulty,
      },
    });
  }

  /**
   * 🔍 インサイト自動生成
   */
  generateInsights(dataId: string, visualizationData: any): DataInsight[] {
    const insights: DataInsight[] = [];

    // トレンド分析
    if (visualizationData.trend) {
      insights.push({
        id: `trend_${Date.now()}`,
        type: 'trend',
        title: 'トレンド分析',
        description: `データは${visualizationData.trend.direction}傾向を示しています`,
        significance: visualizationData.trend.strength > 0.7 ? 'high' : 'medium',
        confidence: visualizationData.trend.confidence || 0.8,
        data: visualizationData.trend,
      });
    }

    // 異常値検出
    if (visualizationData.anomalies && visualizationData.anomalies.length > 0) {
      insights.push({
        id: `anomaly_${Date.now()}`,
        type: 'anomaly',
        title: '異常値検出',
        description: `${visualizationData.anomalies.length}個の異常値が検出されました`,
        significance: 'critical',
        confidence: 0.9,
        data: visualizationData.anomalies,
      });
    }

    // 相関分析
    if (visualizationData.correlations) {
      const strongCorrelations = visualizationData.correlations.filter(
        (c: any) => Math.abs(c.coefficient) > 0.7
      );
      if (strongCorrelations.length > 0) {
        insights.push({
          id: `correlation_${Date.now()}`,
          type: 'correlation',
          title: '相関関係',
          description: `強い相関関係が${strongCorrelations.length}個発見されました`,
          significance: 'high',
          confidence: 0.85,
          data: strongCorrelations,
        });
      }
    }

    this.insights.set(dataId, insights);
    return insights;
  }

  /**
   * ▶️ ストーリー再生
   */
  async playStory(storyId: string): Promise<void> {
    const story = this.stories.get(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    this.playingStories.add(storyId);

    try {
      for (const scene of story.scenes) {
        if (!this.playingStories.has(storyId)) break;

        await this.playScene(scene);

        // シーン間の遷移
        if (scene.transitions) {
          await this.animateTransition(scene.transitions);
        }
      }
    } catch (error) {
      console.error('ストーリー再生エラー:', error);
    } finally {
      this.playingStories.delete(storyId);
    }
  }

  /**
   * 🎬 シーン再生
   */
  private async playScene(scene: StoryScene): Promise<void> {
    console.log(`🎬 シーン再生: ${scene.title}`);

    // アノテーション表示
    scene.annotations.forEach((annotation) => {
      this.showAnnotation(annotation);
    });

    // ナレーション再生（実装時はWeb Speech APIを使用）
    if (scene.content) {
      console.log(`📢 ナレーション: ${scene.content}`);
    }

    // シーン時間待機
    await new Promise((resolve) => setTimeout(resolve, scene.duration));

    // アノテーション非表示
    scene.annotations.forEach((annotation) => {
      this.hideAnnotation(annotation.id);
    });
  }

  /**
   * 🔄 遷移アニメーション
   */
  private async animateTransition(transition: SceneTransition): Promise<void> {
    console.log(`🔄 遷移: ${transition.type}`);
    return new Promise((resolve) => setTimeout(resolve, transition.duration));
  }

  /**
   * 📝 アノテーション表示
   */
  private showAnnotation(annotation: Annotation): void {
    console.log(`📝 アノテーション表示: ${annotation.content}`);
    // 実装時はDOM操作でアノテーションを表示
  }

  /**
   * 🚫 アノテーション非表示
   */
  private hideAnnotation(annotationId: string): void {
    console.log(`🚫 アノテーション非表示: ${annotationId}`);
    // 実装時はDOM操作でアノテーションを非表示
  }

  /**
   * ⏹️ ストーリー停止
   */
  stopStory(storyId: string): void {
    this.playingStories.delete(storyId);
    console.log(`⏹️ ストーリー停止: ${storyId}`);
  }

  /**
   * 📤 ストーリーエクスポート
   */
  exportStory(storyId: string, format: 'json' | 'html' | 'video'): string | Blob {
    const story = this.stories.get(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(story, null, 2);
      case 'html':
        return this.generateHTMLPresentation(story);
      case 'video':
        // 実際の実装では動画生成
        return new Blob(['video data'], { type: 'video/mp4' });
      default:
        return JSON.stringify(story, null, 2);
    }
  }

  /**
   * 📄 HTMLプレゼンテーション生成
   */
  private generateHTMLPresentation(story: DataStory): string {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${story.title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; }
        .story { max-width: 1200px; margin: 0 auto; }
        .scene { margin-bottom: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .scene-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .scene-content { font-size: 16px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="story">
        <h1>${story.title}</h1>
        <p>${story.description}</p>
        ${story.scenes
          .map(
            (scene) => `
            <div class="scene">
                <h2 class="scene-title">${scene.title}</h2>
                <p class="scene-content">${scene.content}</p>
            </div>
        `
          )
          .join('')}
    </div>
</body>
</html>`;
    return html;
  }

  /**
   * ⚙️ デフォルトナラティブ設定
   */
  private getDefaultNarrative(): StoryNarrative {
    return {
      voiceOver: {
        enabled: false,
        voice: 'neutral',
        speed: 1.0,
        language: 'ja',
      },
      captions: {
        enabled: true,
        fontSize: 16,
        position: 'bottom',
      },
      progression: 'manual',
      timeline: [],
    };
  }

  // ゲッター
  getStory(storyId: string): DataStory | undefined {
    return this.stories.get(storyId);
  }

  getAllStories(): DataStory[] {
    return Array.from(this.stories.values());
  }

  getTemplate(templateId: string): StoryTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): StoryTemplate[] {
    return Array.from(this.templates.values());
  }

  getInsights(dataId: string): DataInsight[] {
    return this.insights.get(dataId) || [];
  }

  isPlaying(storyId: string): boolean {
    return this.playingStories.has(storyId);
  }
}

export const dataStorytellingService = DataStorytellingService.getInstance();
