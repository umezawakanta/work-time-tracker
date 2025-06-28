import { toast } from '@/components/ui/use-toast';

export interface ThreeDVisualizationConfig {
  id: string;
  type: ThreeDVisualizationType;
  title: string;
  description?: string;
  scene: SceneConfig;
  camera: CameraConfig;
  lighting: LightingConfig;
  data: ThreeDDataSet;
  interactions: ThreeDInteractionConfig;
  animations: ThreeDAnimationConfig;
  rendering: RenderingConfig;
  controls: ControlsConfig;
}

export interface SceneConfig {
  background: {
    type: 'color' | 'gradient' | 'skybox' | 'environment';
    value: string | string[] | TextureConfig;
  };
  fog: {
    enabled: boolean;
    type: 'linear' | 'exponential';
    color: string;
    near: number;
    far: number;
    density?: number;
  };
  grid: {
    enabled: boolean;
    size: number;
    divisions: number;
    color: string;
    opacity: number;
  };
  axes: {
    enabled: boolean;
    size: number;
    labels: boolean;
  };
}

export interface CameraConfig {
  type: 'perspective' | 'orthographic';
  position: Vector3D;
  target: Vector3D;
  fov: number;
  near: number;
  far: number;
  zoom: number;
  autoRotate: boolean;
  constraints: {
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
  };
}

export interface LightingConfig {
  ambient: {
    enabled: boolean;
    color: string;
    intensity: number;
  };
  directional: {
    enabled: boolean;
    color: string;
    intensity: number;
    position: Vector3D;
    shadows: boolean;
  };
  point: PointLight[];
  spotlight: SpotLight[];
  hemisphere: {
    enabled: boolean;
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
}

export interface PointLight {
  id: string;
  color: string;
  intensity: number;
  position: Vector3D;
  distance: number;
  decay: number;
  shadows: boolean;
}

export interface SpotLight {
  id: string;
  color: string;
  intensity: number;
  position: Vector3D;
  target: Vector3D;
  angle: number;
  penumbra: number;
  distance: number;
  decay: number;
  shadows: boolean;
}

export interface ThreeDDataSet {
  id: string;
  name: string;
  points: ThreeDDataPoint[];
  surfaces: Surface[];
  volumes: Volume[];
  networks: NetworkEdge[];
  metadata: {
    bounds: {
      min: Vector3D;
      max: Vector3D;
    };
    scale: Vector3D;
    center: Vector3D;
    pointCount: number;
    lastUpdated: string;
  };
}

export interface ThreeDDataPoint {
  id: string;
  position: Vector3D;
  value: number;
  color?: string;
  size?: number;
  opacity?: number;
  label?: string;
  category?: string;
  metadata?: Record<string, any>;
  interactive?: boolean;
  animated?: boolean;
  shape?: 'sphere' | 'cube' | 'cylinder' | 'cone' | 'custom';
  texture?: TextureConfig;
}

export interface Surface {
  id: string;
  vertices: Vector3D[];
  faces: number[][];
  colors?: string[];
  normals?: Vector3D[];
  uvs?: Vector2D[];
  material: MaterialConfig;
  interactive: boolean;
  animated: boolean;
}

export interface Volume {
  id: string;
  dimensions: Vector3D;
  voxels: VoxelData[][][];
  threshold: number;
  material: MaterialConfig;
  interactive: boolean;
  animated: boolean;
}

export interface VoxelData {
  value: number;
  color?: string;
  opacity?: number;
  metadata?: Record<string, any>;
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  color?: string;
  thickness?: number;
  animated?: boolean;
  curve?: boolean;
  metadata?: Record<string, any>;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface TextureConfig {
  type: 'image' | 'canvas' | 'video' | 'procedural';
  source: string | HTMLCanvasElement | HTMLVideoElement;
  repeat: Vector2D;
  offset: Vector2D;
  rotation: number;
  flipY: boolean;
}

export interface MaterialConfig {
  type: 'basic' | 'lambert' | 'phong' | 'standard' | 'physical' | 'toon' | 'shader';
  color: string;
  opacity: number;
  transparent: boolean;
  wireframe: boolean;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  normalMap?: TextureConfig;
  bumpMap?: TextureConfig;
  displacementMap?: TextureConfig;
  envMap?: TextureConfig;
  reflectivity?: number;
  refractionRatio?: number;
}

export interface ThreeDInteractionConfig {
  hover: {
    enabled: boolean;
    highlightColor: string;
    scaleFactor: number;
    showTooltip: boolean;
  };
  click: {
    enabled: boolean;
    selectColor: string;
    multiSelect: boolean;
    onClickCallback?: (object: any) => void;
  };
  drag: {
    enabled: boolean;
    constrainToPlane: boolean;
    plane: 'xy' | 'xz' | 'yz';
  };
  zoom: {
    enabled: boolean;
    speed: number;
    smooth: boolean;
  };
  rotation: {
    enabled: boolean;
    speed: number;
    smooth: boolean;
    autoRotate: boolean;
    autoRotateSpeed: number;
  };
}

export interface ThreeDAnimationConfig {
  enabled: boolean;
  autoPlay: boolean;
  loop: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  transitions: TransitionConfig[];
  morphing: MorphingConfig;
  particles: ParticleAnimationConfig;
}

export interface TransitionConfig {
  id: string;
  property: 'position' | 'rotation' | 'scale' | 'color' | 'opacity';
  from: any;
  to: any;
  duration: number;
  delay: number;
  easing: string;
}

export interface MorphingConfig {
  enabled: boolean;
  targets: string[];
  morphSpeed: number;
  smoothing: boolean;
}

export interface ParticleAnimationConfig {
  enabled: boolean;
  count: number;
  lifetime: number;
  speed: Vector3D;
  acceleration: Vector3D;
  size: {
    start: number;
    end: number;
  };
  color: {
    start: string;
    end: string;
  };
  opacity: {
    start: number;
    end: number;
  };
}

export interface RenderingConfig {
  antialias: boolean;
  alpha: boolean;
  shadowMap: {
    enabled: boolean;
    type: 'basic' | 'pcf' | 'pcf_soft' | 'variance';
    autoUpdate: boolean;
  };
  toneMapping: {
    enabled: boolean;
    type: 'linear' | 'reinhard' | 'cineon' | 'aces_filmic';
    exposure: number;
  };
  postProcessing: {
    enabled: boolean;
    effects: PostProcessingEffect[];
  };
  performance: {
    pixelRatio: number;
    maxPixelRatio: number;
    powerPreference: 'default' | 'high-performance' | 'low-power';
    fps: number;
    adaptivePerformance: boolean;
  };
}

export interface PostProcessingEffect {
  type: 'bloom' | 'blur' | 'fxaa' | 'ssao' | 'ssr' | 'outline' | 'glitch' | 'film';
  enabled: boolean;
  settings: Record<string, any>;
}

export interface ControlsConfig {
  type: 'orbit' | 'fly' | 'first_person' | 'trackball' | 'transform';
  enabled: boolean;
  smoothing: boolean;
  sensitivity: number;
  invert: {
    x: boolean;
    y: boolean;
  };
  keyboard: {
    enabled: boolean;
    bindings: Record<string, string>;
  };
  touch: {
    enabled: boolean;
    multitouch: boolean;
  };
  gamepad: {
    enabled: boolean;
    deadzone: number;
  };
}

export type ThreeDVisualizationType =
  | '3d-scatter'
  | '3d-surface'
  | '3d-volume'
  | '3d-network'
  | '3d-heatmap'
  | '3d-bar'
  | '3d-line'
  | '3d-mesh'
  | '3d-point-cloud'
  | '3d-molecular'
  | '3d-terrain'
  | '3d-architectural'
  | '3d-flow-field'
  | '3d-particle-system'
  | '3d-fractal'
  | '3d-procedural';

export interface ThreeDPerformanceMetrics {
  fps: number;
  frameTime: number;
  vertices: number;
  triangles: number;
  drawCalls: number;
  memoryUsage: number;
  gpuMemory: number;
  renderTime: number;
  updateTime: number;
  interactions: number;
}

export interface ThreeDExportOptions {
  format: 'gltf' | 'obj' | 'ply' | 'stl' | 'collada' | 'fbx' | 'json' | 'image' | 'video';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  compression: boolean;
  embedTextures: boolean;
  includeAnimations: boolean;
  includeMetadata: boolean;
  resolution?: {
    width: number;
    height: number;
  };
  framerate?: number;
  duration?: number;
}

/**
 * 📊 データビジュアライゼーションマスター: 3D可視化サービス
 * Three.js を使用した高度な3Dデータ可視化システム
 */
class ThreeDVisualizationService {
  private static instance: ThreeDVisualizationService | null = null;
  private visualizations: Map<string, ThreeDVisualizationConfig> = new Map();
  private scenes: Map<string, any> = new Map(); // THREE.Scene
  private renderers: Map<string, any> = new Map(); // THREE.WebGLRenderer
  private performanceMetrics: Map<string, ThreeDPerformanceMetrics> = new Map();
  private animationFrames: Map<string, number> = new Map();
  private isMonitoring: boolean = false;

  private constructor() {
    this.initializeDefaultVisualizations();
    this.startPerformanceMonitoring();
  }

  public static getInstance(): ThreeDVisualizationService {
    if (!ThreeDVisualizationService.instance) {
      ThreeDVisualizationService.instance = new ThreeDVisualizationService();
    }
    return ThreeDVisualizationService.instance;
  }

  /**
   * 🎨 デフォルト3D可視化初期化
   */
  private initializeDefaultVisualizations(): void {
    const defaultVisualizations: ThreeDVisualizationConfig[] = [
      {
        id: 'productivity-3d-scatter',
        type: '3d-scatter',
        title: '3D生産性スキャッタープロット',
        description: '時間・タスク・生産性の3次元関係',
        scene: {
          background: {
            type: 'gradient',
            value: ['#1a1a2e', '#16213e', '#0f0f23'],
          },
          fog: {
            enabled: true,
            type: 'exponential',
            color: '#1a1a2e',
            near: 1,
            far: 1000,
            density: 0.0008,
          },
          grid: {
            enabled: true,
            size: 100,
            divisions: 10,
            color: '#444',
            opacity: 0.3,
          },
          axes: {
            enabled: true,
            size: 50,
            labels: true,
          },
        },
        camera: {
          type: 'perspective',
          position: { x: 50, y: 50, z: 50 },
          target: { x: 0, y: 0, z: 0 },
          fov: 75,
          near: 0.1,
          far: 1000,
          zoom: 1,
          autoRotate: true,
          constraints: {
            minDistance: 10,
            maxDistance: 200,
            minPolarAngle: 0,
            maxPolarAngle: Math.PI,
            enableZoom: true,
            enableRotate: true,
            enablePan: true,
          },
        },
        lighting: {
          ambient: {
            enabled: true,
            color: '#404040',
            intensity: 0.4,
          },
          directional: {
            enabled: true,
            color: '#ffffff',
            intensity: 1.0,
            position: { x: 10, y: 10, z: 5 },
            shadows: true,
          },
          point: [
            {
              id: 'point1',
              color: '#3B82F6',
              intensity: 0.8,
              position: { x: 25, y: 25, z: 25 },
              distance: 100,
              decay: 2,
              shadows: false,
            },
          ],
          spotlight: [],
          hemisphere: {
            enabled: true,
            skyColor: '#87ceeb',
            groundColor: '#8b4513',
            intensity: 0.3,
          },
        },
        data: this.generateSample3DData('3d-scatter'),
        interactions: {
          hover: {
            enabled: true,
            highlightColor: '#FFD700',
            scaleFactor: 1.5,
            showTooltip: true,
          },
          click: {
            enabled: true,
            selectColor: '#FF4444',
            multiSelect: true,
          },
          drag: {
            enabled: false,
            constrainToPlane: false,
            plane: 'xy',
          },
          zoom: {
            enabled: true,
            speed: 1.2,
            smooth: true,
          },
          rotation: {
            enabled: true,
            speed: 1.0,
            smooth: true,
            autoRotate: true,
            autoRotateSpeed: 2.0,
          },
        },
        animations: {
          enabled: true,
          autoPlay: true,
          loop: true,
          duration: 5000,
          easing: 'ease-in-out',
          transitions: [],
          morphing: {
            enabled: false,
            targets: [],
            morphSpeed: 1.0,
            smoothing: true,
          },
          particles: {
            enabled: false,
            count: 100,
            lifetime: 3000,
            speed: { x: 0, y: 1, z: 0 },
            acceleration: { x: 0, y: -0.1, z: 0 },
            size: { start: 1, end: 0 },
            color: { start: '#ffffff', end: '#000000' },
            opacity: { start: 1, end: 0 },
          },
        },
        rendering: {
          antialias: true,
          alpha: true,
          shadowMap: {
            enabled: true,
            type: 'pcf_soft',
            autoUpdate: true,
          },
          toneMapping: {
            enabled: true,
            type: 'aces_filmic',
            exposure: 1.0,
          },
          postProcessing: {
            enabled: true,
            effects: [
              {
                type: 'bloom',
                enabled: true,
                settings: {
                  strength: 0.5,
                  radius: 0.8,
                  threshold: 0.9,
                },
              },
              {
                type: 'fxaa',
                enabled: true,
                settings: {},
              },
            ],
          },
          performance: {
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            maxPixelRatio: 2,
            powerPreference: 'high-performance',
            fps: 60,
            adaptivePerformance: true,
          },
        },
        controls: {
          type: 'orbit',
          enabled: true,
          smoothing: true,
          sensitivity: 1.0,
          invert: { x: false, y: false },
          keyboard: {
            enabled: true,
            bindings: {
              KeyW: 'forward',
              KeyS: 'backward',
              KeyA: 'left',
              KeyD: 'right',
              Space: 'up',
              ShiftLeft: 'down',
            },
          },
          touch: {
            enabled: true,
            multitouch: true,
          },
          gamepad: {
            enabled: false,
            deadzone: 0.1,
          },
        },
      },
      {
        id: 'performance-3d-surface',
        type: '3d-surface',
        title: '3Dパフォーマンスサーフェス',
        description: '時間と日付による3Dパフォーマンス表面',
        scene: {
          background: {
            type: 'color',
            value: '#000611',
          },
          fog: {
            enabled: false,
            type: 'linear',
            color: '#000000',
            near: 50,
            far: 200,
          },
          grid: {
            enabled: false,
            size: 50,
            divisions: 20,
            color: '#333',
            opacity: 0.5,
          },
          axes: {
            enabled: true,
            size: 30,
            labels: true,
          },
        },
        camera: {
          type: 'perspective',
          position: { x: 30, y: 40, z: 30 },
          target: { x: 0, y: 0, z: 0 },
          fov: 60,
          near: 0.1,
          far: 500,
          zoom: 1,
          autoRotate: false,
          constraints: {
            minDistance: 20,
            maxDistance: 100,
            minPolarAngle: 0,
            maxPolarAngle: Math.PI * 0.7,
            enableZoom: true,
            enableRotate: true,
            enablePan: true,
          },
        },
        lighting: {
          ambient: {
            enabled: true,
            color: '#222244',
            intensity: 0.3,
          },
          directional: {
            enabled: true,
            color: '#ffffff',
            intensity: 1.2,
            position: { x: 10, y: 20, z: 10 },
            shadows: true,
          },
          point: [
            {
              id: 'point1',
              color: '#10B981',
              intensity: 1.0,
              position: { x: 0, y: 30, z: 0 },
              distance: 80,
              decay: 1,
              shadows: false,
            },
          ],
          spotlight: [
            {
              id: 'spot1',
              color: '#F59E0B',
              intensity: 1.5,
              position: { x: 20, y: 30, z: 20 },
              target: { x: 0, y: 0, z: 0 },
              angle: Math.PI / 6,
              penumbra: 0.2,
              distance: 100,
              decay: 1,
              shadows: true,
            },
          ],
          hemisphere: {
            enabled: false,
            skyColor: '#sky',
            groundColor: '#ground',
            intensity: 0.3,
          },
        },
        data: this.generateSample3DData('3d-surface'),
        interactions: {
          hover: {
            enabled: true,
            highlightColor: '#FFFFFF',
            scaleFactor: 1.1,
            showTooltip: true,
          },
          click: {
            enabled: true,
            selectColor: '#FF6B6B',
            multiSelect: false,
          },
          drag: {
            enabled: false,
            constrainToPlane: false,
            plane: 'xy',
          },
          zoom: {
            enabled: true,
            speed: 1.1,
            smooth: true,
          },
          rotation: {
            enabled: true,
            speed: 0.8,
            smooth: true,
            autoRotate: false,
            autoRotateSpeed: 1.0,
          },
        },
        animations: {
          enabled: true,
          autoPlay: false,
          loop: true,
          duration: 8000,
          easing: 'ease-in-out',
          transitions: [
            {
              id: 'wave',
              property: 'position',
              from: { y: 0 },
              to: { y: 5 },
              duration: 2000,
              delay: 0,
              easing: 'ease-in-out',
            },
          ],
          morphing: {
            enabled: true,
            targets: ['wave1', 'wave2', 'wave3'],
            morphSpeed: 0.5,
            smoothing: true,
          },
          particles: {
            enabled: false,
            count: 50,
            lifetime: 2000,
            speed: { x: 0, y: 0.5, z: 0 },
            acceleration: { x: 0, y: 0, z: 0 },
            size: { start: 0.5, end: 0 },
            color: { start: '#ffffff', end: '#0000ff' },
            opacity: { start: 0.8, end: 0 },
          },
        },
        rendering: {
          antialias: true,
          alpha: true,
          shadowMap: {
            enabled: true,
            type: 'pcf',
            autoUpdate: true,
          },
          toneMapping: {
            enabled: true,
            type: 'cineon',
            exposure: 1.2,
          },
          postProcessing: {
            enabled: true,
            effects: [
              {
                type: 'ssao',
                enabled: true,
                settings: {
                  kernelRadius: 8,
                  minDistance: 0.005,
                  maxDistance: 0.1,
                },
              },
            ],
          },
          performance: {
            pixelRatio: 1,
            maxPixelRatio: 2,
            powerPreference: 'high-performance',
            fps: 60,
            adaptivePerformance: true,
          },
        },
        controls: {
          type: 'orbit',
          enabled: true,
          smoothing: true,
          sensitivity: 0.8,
          invert: { x: false, y: false },
          keyboard: {
            enabled: false,
            bindings: {},
          },
          touch: {
            enabled: true,
            multitouch: true,
          },
          gamepad: {
            enabled: false,
            deadzone: 0.1,
          },
        },
      },
    ];

    defaultVisualizations.forEach((viz) => {
      this.visualizations.set(viz.id, viz);
      this.initializePerformanceMetrics(viz.id);
    });

    console.log('📊 3D可視化を初期化しました', this.visualizations.size, '可視化');
  }

  /**
   * 📊 サンプル3Dデータ生成
   */
  private generateSample3DData(type: ThreeDVisualizationType): ThreeDDataSet {
    const dataSet: ThreeDDataSet = {
      id: `sample_${type}`,
      name: `Sample ${type} data`,
      points: [],
      surfaces: [],
      volumes: [],
      networks: [],
      metadata: {
        bounds: { min: { x: -50, y: -50, z: -50 }, max: { x: 50, y: 50, z: 50 } },
        scale: { x: 1, y: 1, z: 1 },
        center: { x: 0, y: 0, z: 0 },
        pointCount: 0,
        lastUpdated: new Date().toISOString(),
      },
    };

    switch (type) {
      case '3d-scatter':
        // 3Dスキャッタープロット用のランダムポイント生成
        for (let i = 0; i < 200; i++) {
          dataSet.points.push({
            id: `point_${i}`,
            position: {
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
              z: (Math.random() - 0.5) * 100,
            },
            value: Math.random() * 100,
            size: Math.random() * 3 + 1,
            color: this.getColorByValue(Math.random() * 100),
            opacity: 0.8,
            label: `データポイント ${i + 1}`,
            category: Math.random() > 0.5 ? '高生産性' : '低生産性',
            interactive: true,
            animated: true,
            shape: 'sphere',
          });
        }
        break;

      case '3d-surface': {
        // 3Dサーフェス用のグリッドポイント生成
        const resolution = 20;
        for (let x = 0; x < resolution; x++) {
          for (let z = 0; z < resolution; z++) {
            const xPos = (x - resolution / 2) * 2;
            const zPos = (z - resolution / 2) * 2;
            const yPos =
              Math.sin(Math.sqrt(xPos * xPos + zPos * zPos) * 0.1) * 10 +
              Math.cos(xPos * 0.1) * Math.sin(zPos * 0.1) * 5;

            dataSet.points.push({
              id: `surface_${x}_${z}`,
              position: { x: xPos, y: yPos, z: zPos },
              value: yPos + 15,
              color: this.getColorByValue(yPos + 15),
              opacity: 0.9,
              interactive: true,
              animated: false,
              shape: 'cube',
            });
          }
        }
        break;
      }
    }

    dataSet.metadata.pointCount = dataSet.points.length;
    return dataSet;
  }

  /**
   * 🎨 値による色取得
   */
  private getColorByValue(value: number, min: number = 0, max: number = 100): string {
    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // ヒートマップカラー（青→緑→黄→赤）
    if (normalized < 0.25) {
      const t = normalized / 0.25;
      return `rgb(${Math.floor(0 + t * 0)}, ${Math.floor(0 + t * 255)}, ${Math.floor(255 - t * 255)})`;
    } else if (normalized < 0.5) {
      const t = (normalized - 0.25) / 0.25;
      return `rgb(${Math.floor(0 + t * 0)}, ${Math.floor(255)}, ${Math.floor(0)})`;
    } else if (normalized < 0.75) {
      const t = (normalized - 0.5) / 0.25;
      return `rgb(${Math.floor(0 + t * 255)}, ${Math.floor(255)}, ${Math.floor(0)})`;
    } else {
      const t = (normalized - 0.75) / 0.25;
      return `rgb(${Math.floor(255)}, ${Math.floor(255 - t * 255)}, ${Math.floor(0)})`;
    }
  }

  /**
   * 📈 パフォーマンスメトリクス初期化
   */
  private initializePerformanceMetrics(vizId: string): void {
    this.performanceMetrics.set(vizId, {
      fps: 60,
      frameTime: 16.67,
      vertices: 0,
      triangles: 0,
      drawCalls: 0,
      memoryUsage: 0,
      gpuMemory: 0,
      renderTime: 0,
      updateTime: 0,
      interactions: 0,
    });
  }

  /**
   * 🔄 パフォーマンス監視開始
   */
  private startPerformanceMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);

    console.log('📊 3D可視化パフォーマンス監視を開始しました');
  }

  /**
   * 📊 パフォーマンスメトリクス更新
   */
  private updatePerformanceMetrics(): void {
    this.performanceMetrics.forEach((metrics, vizId) => {
      const viz = this.visualizations.get(vizId);
      if (viz) {
        // メトリクス更新（実際の実装ではThree.jsから取得）
        metrics.vertices = viz.data.points.length;
        metrics.triangles = Math.floor(metrics.vertices / 3);
        metrics.drawCalls = Math.ceil(viz.data.points.length / 1000);
        metrics.memoryUsage = viz.data.points.length * 100; // 推定バイト
        metrics.gpuMemory = metrics.memoryUsage * 2; // GPU推定使用量
        metrics.fps = Math.floor(Math.random() * 10) + 55; // 55-65 FPS
        metrics.frameTime = 1000 / metrics.fps;
      }
    });
  }

  /**
   * 📊 3D可視化作成
   */
  create3DVisualization(config: Partial<ThreeDVisualizationConfig>): string {
    const vizId = config.id || `viz3d_${Date.now()}`;

    const fullConfig: ThreeDVisualizationConfig = {
      id: vizId,
      type: config.type || '3d-scatter',
      title: config.title || 'Untitled 3D Visualization',
      description: config.description,
      scene: config.scene || this.getDefaultSceneConfig(),
      camera: config.camera || this.getDefaultCameraConfig(),
      lighting: config.lighting || this.getDefaultLightingConfig(),
      data: config.data || this.generateSample3DData(config.type || '3d-scatter'),
      interactions: config.interactions || this.getDefaultInteractionConfig(),
      animations: config.animations || this.getDefaultAnimationConfig(),
      rendering: config.rendering || this.getDefaultRenderingConfig(),
      controls: config.controls || this.getDefaultControlsConfig(),
    };

    this.visualizations.set(vizId, fullConfig);
    this.initializePerformanceMetrics(vizId);

    console.log('📊 新しい3D可視化を作成しました:', vizId);

    toast({
      title: '3D可視化作成完了',
      description: `${fullConfig.title}を作成しました`,
      variant: 'default',
    });

    return vizId;
  }

  /**
   * ⚙️ デフォルト設定取得メソッド群
   */
  private getDefaultSceneConfig(): SceneConfig {
    return {
      background: { type: 'color', value: '#000000' },
      fog: { enabled: false, type: 'linear', color: '#000000', near: 1, far: 1000 },
      grid: { enabled: true, size: 10, divisions: 10, color: '#444444', opacity: 0.5 },
      axes: { enabled: true, size: 10, labels: true },
    };
  }

  private getDefaultCameraConfig(): CameraConfig {
    return {
      type: 'perspective',
      position: { x: 10, y: 10, z: 10 },
      target: { x: 0, y: 0, z: 0 },
      fov: 75,
      near: 0.1,
      far: 1000,
      zoom: 1,
      autoRotate: false,
      constraints: {
        minDistance: 1,
        maxDistance: 100,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        enableZoom: true,
        enableRotate: true,
        enablePan: true,
      },
    };
  }

  private getDefaultLightingConfig(): LightingConfig {
    return {
      ambient: { enabled: true, color: '#404040', intensity: 0.4 },
      directional: {
        enabled: true,
        color: '#ffffff',
        intensity: 1.0,
        position: { x: 1, y: 1, z: 1 },
        shadows: false,
      },
      point: [],
      spotlight: [],
      hemisphere: { enabled: false, skyColor: '#87ceeb', groundColor: '#8b4513', intensity: 0.3 },
    };
  }

  private getDefaultInteractionConfig(): ThreeDInteractionConfig {
    return {
      hover: { enabled: true, highlightColor: '#ffff00', scaleFactor: 1.2, showTooltip: true },
      click: { enabled: true, selectColor: '#ff0000', multiSelect: false },
      drag: { enabled: false, constrainToPlane: false, plane: 'xy' },
      zoom: { enabled: true, speed: 1.1, smooth: true },
      rotation: {
        enabled: true,
        speed: 1.0,
        smooth: true,
        autoRotate: false,
        autoRotateSpeed: 2.0,
      },
    };
  }

  private getDefaultAnimationConfig(): ThreeDAnimationConfig {
    return {
      enabled: false,
      autoPlay: false,
      loop: false,
      duration: 1000,
      easing: 'ease',
      transitions: [],
      morphing: { enabled: false, targets: [], morphSpeed: 1.0, smoothing: true },
      particles: {
        enabled: false,
        count: 100,
        lifetime: 1000,
        speed: { x: 0, y: 1, z: 0 },
        acceleration: { x: 0, y: -0.1, z: 0 },
        size: { start: 1, end: 0 },
        color: { start: '#ffffff', end: '#000000' },
        opacity: { start: 1, end: 0 },
      },
    };
  }

  private getDefaultRenderingConfig(): RenderingConfig {
    return {
      antialias: true,
      alpha: false,
      shadowMap: { enabled: false, type: 'basic', autoUpdate: true },
      toneMapping: { enabled: false, type: 'linear', exposure: 1.0 },
      postProcessing: { enabled: false, effects: [] },
      performance: {
        pixelRatio: 1,
        maxPixelRatio: 2,
        powerPreference: 'default',
        fps: 60,
        adaptivePerformance: false,
      },
    };
  }

  private getDefaultControlsConfig(): ControlsConfig {
    return {
      type: 'orbit',
      enabled: true,
      smoothing: false,
      sensitivity: 1.0,
      invert: { x: false, y: false },
      keyboard: { enabled: false, bindings: {} },
      touch: { enabled: true, multitouch: false },
      gamepad: { enabled: false, deadzone: 0.1 },
    };
  }

  /**
   * 🔄 3Dデータ更新
   */
  update3DData(vizId: string, newData: Partial<ThreeDDataSet>): void {
    const viz = this.visualizations.get(vizId);
    if (!viz) {
      throw new Error(`3D Visualization not found: ${vizId}`);
    }

    const startTime = performance.now();

    viz.data = {
      ...viz.data,
      ...newData,
      metadata: {
        ...viz.data.metadata,
        ...newData.metadata,
        lastUpdated: new Date().toISOString(),
      },
    };

    const endTime = performance.now();
    const metrics = this.performanceMetrics.get(vizId);
    if (metrics) {
      metrics.updateTime = endTime - startTime;
    }

    console.log(`📊 3Dデータを更新しました: ${vizId} (${(endTime - startTime).toFixed(2)}ms)`);
  }

  /**
   * 🎬 アニメーション開始
   */
  startAnimation(vizId: string): void {
    const viz = this.visualizations.get(vizId);
    if (!viz || !viz.animations.enabled) {
      return;
    }

    const animate = () => {
      const frame = requestAnimationFrame(animate);
      this.animationFrames.set(vizId, frame);

      // アニメーション更新ロジック（実際の実装ではThree.jsアニメーション）
      const now = Date.now();
      viz.data.points.forEach((point, index) => {
        if (point.animated) {
          const time = (now + index * 100) * 0.001;
          point.position.y += Math.sin(time) * 0.1;
        }
      });

      // パフォーマンスメトリクス更新
      const metrics = this.performanceMetrics.get(vizId);
      if (metrics) {
        metrics.renderTime = performance.now() - now;
      }
    };

    animate();
    console.log(`🎬 3Dアニメーションを開始: ${vizId}`);
  }

  /**
   * ⏹️ アニメーション停止
   */
  stopAnimation(vizId: string): void {
    const frame = this.animationFrames.get(vizId);
    if (frame) {
      cancelAnimationFrame(frame);
      this.animationFrames.delete(vizId);
      console.log(`⏹️ 3Dアニメーションを停止: ${vizId}`);
    }
  }

  /**
   * 📤 3D可視化エクスポート
   */
  async export3DVisualization(vizId: string, options: ThreeDExportOptions): Promise<Blob | string> {
    const viz = this.visualizations.get(vizId);
    if (!viz) {
      throw new Error(`3D Visualization not found: ${vizId}`);
    }

    const metrics = this.performanceMetrics.get(vizId);
    if (metrics) {
      metrics.interactions++;
    }

    // 実際の実装では、Three.jsのエクスポート機能を使用
    const exportData = {
      config: viz,
      data: viz.data,
      options: options,
      timestamp: new Date().toISOString(),
    };

    switch (options.format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'gltf':
      case 'obj':
      case 'ply':
      case 'stl':
        // 実際の実装では3Dモデルのバイナリデータを返す
        return new Blob([JSON.stringify(exportData)], { type: 'application/octet-stream' });
      case 'image':
        // 実際の実装ではレンダリング結果の画像を返す
        return new Blob([''], { type: 'image/png' });
      default:
        return JSON.stringify(exportData, null, 2);
    }
  }

  // ゲッター
  get3DVisualization(vizId: string): ThreeDVisualizationConfig | undefined {
    return this.visualizations.get(vizId);
  }

  getAll3DVisualizations(): ThreeDVisualizationConfig[] {
    return Array.from(this.visualizations.values());
  }

  get3DVisualizationsByType(type: ThreeDVisualizationType): ThreeDVisualizationConfig[] {
    return Array.from(this.visualizations.values()).filter((viz) => viz.type === type);
  }

  get3DPerformanceMetrics(vizId: string): ThreeDPerformanceMetrics | undefined {
    return this.performanceMetrics.get(vizId);
  }

  // サービス停止
  shutdown(): void {
    // すべてのアニメーション停止
    this.animationFrames.forEach((frame, vizId) => {
      this.stopAnimation(vizId);
    });

    this.visualizations.clear();
    this.scenes.clear();
    this.renderers.clear();
    this.performanceMetrics.clear();
    this.animationFrames.clear();
    this.isMonitoring = false;

    console.log('🛑 3D可視化サービス停止');
  }
}

export const threeDVisualizationService = ThreeDVisualizationService.getInstance();
