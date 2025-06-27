/**
 * コンテナ化管理サービス
 * Docker、Kubernetes、CI/CD統合によるコンテナ化戦略を提供
 */

interface ContainerConfig {
  name: string;
  image: string;
  tag: string;
  ports: PortMapping[];
  environment: EnvironmentVariable[];
  volumes: VolumeMapping[];
  resources: ResourceLimits;
  healthCheck: HealthCheck;
  restartPolicy: RestartPolicy;
  networkMode: string;
}

interface PortMapping {
  containerPort: number;
  hostPort: number;
  protocol: 'tcp' | 'udp';
}

interface EnvironmentVariable {
  name: string;
  value: string;
  secret?: boolean;
}

interface VolumeMapping {
  hostPath: string;
  containerPath: string;
  readOnly: boolean;
}

interface ResourceLimits {
  cpu: string; // e.g., "0.5", "1"
  memory: string; // e.g., "512Mi", "1Gi"
  storage: string; // e.g., "10Gi"
}

interface HealthCheck {
  command: string[];
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
  startPeriod: number; // seconds
}

interface RestartPolicy {
  policy: 'always' | 'unless-stopped' | 'on-failure' | 'no';
  maximumRetryCount?: number;
}

interface DeploymentStatus {
  service: string;
  status: 'running' | 'stopped' | 'failed' | 'pending' | 'updating';
  replicas: {
    desired: number;
    available: number;
    ready: number;
  };
  lastUpdated: string;
  uptime: number; // seconds
  resourceUsage: {
    cpu: number; // percentage
    memory: number; // percentage
    network: {
      received: number; // bytes
      transmitted: number; // bytes
    };
  };
}

interface BuildConfig {
  dockerfile: string;
  context: string;
  buildArgs: Record<string, string>;
  target?: string; // for multi-stage builds
  registry: RegistryConfig;
}

interface RegistryConfig {
  url: string;
  username: string;
  password: string;
  namespace: string;
}

interface KubernetesManifest {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    labels: Record<string, string>;
  };
  spec: any;
}

export class ContainerizationService {
  private containers: Map<string, ContainerConfig> = new Map();
  private deployments: Map<string, DeploymentStatus> = new Map();
  private registries: Map<string, RegistryConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigurations();
    this.startMonitoring();
  }

  /**
   * デフォルト設定の初期化
   */
  private initializeDefaultConfigurations(): void {
    // フロントエンドアプリケーション
    this.addContainer('frontend', {
      name: 'work-time-tracker-frontend',
      image: 'work-time-tracker/frontend',
      tag: 'latest',
      ports: [
        { containerPort: 80, hostPort: 3000, protocol: 'tcp' },
        { containerPort: 443, hostPort: 3443, protocol: 'tcp' },
      ],
      environment: [
        { name: 'NODE_ENV', value: 'production' },
        { name: 'API_BASE_URL', value: 'http://backend:5000' },
        { name: 'VITE_APP_VERSION', value: process.env.npm_package_version || '1.0.0' },
      ],
      volumes: [
        { hostPath: './uploads', containerPath: '/app/uploads', readOnly: false },
        { hostPath: './logs', containerPath: '/app/logs', readOnly: false },
      ],
      resources: {
        cpu: '0.5',
        memory: '512Mi',
        storage: '10Gi',
      },
      healthCheck: {
        command: ['curl', '-f', 'http://localhost/health'],
        interval: 30,
        timeout: 10,
        retries: 3,
        startPeriod: 60,
      },
      restartPolicy: {
        policy: 'always',
      },
      networkMode: 'app-network',
    });

    // バックエンドAPI
    this.addContainer('backend', {
      name: 'work-time-tracker-backend',
      image: 'work-time-tracker/backend',
      tag: 'latest',
      ports: [{ containerPort: 5000, hostPort: 5000, protocol: 'tcp' }],
      environment: [
        { name: 'NODE_ENV', value: 'production' },
        { name: 'DATABASE_URL', value: 'postgresql://user:pass@db:5432/worktime', secret: true },
        { name: 'JWT_SECRET', value: 'jwt-secret-key', secret: true },
        { name: 'REDIS_URL', value: 'redis://redis:6379' },
      ],
      volumes: [
        { hostPath: './data', containerPath: '/app/data', readOnly: false },
        { hostPath: './logs', containerPath: '/app/logs', readOnly: false },
      ],
      resources: {
        cpu: '1',
        memory: '1Gi',
        storage: '20Gi',
      },
      healthCheck: {
        command: ['curl', '-f', 'http://localhost:5000/health'],
        interval: 30,
        timeout: 10,
        retries: 3,
        startPeriod: 60,
      },
      restartPolicy: {
        policy: 'always',
      },
      networkMode: 'app-network',
    });

    // データベース
    this.addContainer('database', {
      name: 'work-time-tracker-db',
      image: 'postgres',
      tag: '15-alpine',
      ports: [{ containerPort: 5432, hostPort: 5432, protocol: 'tcp' }],
      environment: [
        { name: 'POSTGRES_DB', value: 'worktime' },
        { name: 'POSTGRES_USER', value: 'user', secret: true },
        { name: 'POSTGRES_PASSWORD', value: 'password', secret: true },
      ],
      volumes: [
        { hostPath: './postgres-data', containerPath: '/var/lib/postgresql/data', readOnly: false },
        {
          hostPath: './postgres-init',
          containerPath: '/docker-entrypoint-initdb.d',
          readOnly: true,
        },
      ],
      resources: {
        cpu: '0.5',
        memory: '1Gi',
        storage: '50Gi',
      },
      healthCheck: {
        command: ['pg_isready', '-U', 'user', '-d', 'worktime'],
        interval: 10,
        timeout: 5,
        retries: 5,
        startPeriod: 30,
      },
      restartPolicy: {
        policy: 'always',
      },
      networkMode: 'app-network',
    });

    // Redis Cache
    this.addContainer('redis', {
      name: 'work-time-tracker-redis',
      image: 'redis',
      tag: '7-alpine',
      ports: [{ containerPort: 6379, hostPort: 6379, protocol: 'tcp' }],
      environment: [],
      volumes: [{ hostPath: './redis-data', containerPath: '/data', readOnly: false }],
      resources: {
        cpu: '0.25',
        memory: '256Mi',
        storage: '5Gi',
      },
      healthCheck: {
        command: ['redis-cli', 'ping'],
        interval: 10,
        timeout: 3,
        retries: 3,
        startPeriod: 15,
      },
      restartPolicy: {
        policy: 'always',
      },
      networkMode: 'app-network',
    });

    // レジストリ設定
    this.addRegistry('docker-hub', {
      url: 'https://registry.hub.docker.com',
      username: 'username',
      password: 'password',
      namespace: 'work-time-tracker',
    });

    this.addRegistry('private-registry', {
      url: 'https://registry.company.com',
      username: 'username',
      password: 'password',
      namespace: 'work-time-tracker',
    });
  }

  /**
   * コンテナ設定の追加
   */
  addContainer(id: string, config: ContainerConfig): void {
    this.containers.set(id, config);
    this.deployments.set(id, {
      service: config.name,
      status: 'pending',
      replicas: { desired: 1, available: 0, ready: 0 },
      lastUpdated: new Date().toISOString(),
      uptime: 0,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        network: { received: 0, transmitted: 0 },
      },
    });
  }

  /**
   * レジストリ設定の追加
   */
  addRegistry(id: string, config: RegistryConfig): void {
    this.registries.set(id, config);
  }

  /**
   * Docker Composeファイルの生成
   */
  generateDockerCompose(): string {
    const services: Record<string, any> = {};
    const networks = {
      'app-network': {
        driver: 'bridge',
      },
    };
    const volumes: Record<string, any> = {};

    this.containers.forEach((config, id) => {
      // サービス定義
      services[id] = {
        image: `${config.image}:${config.tag}`,
        container_name: config.name,
        ports: config.ports.map((p) => `${p.hostPort}:${p.containerPort}`),
        environment: config.environment.reduce(
          (env, item) => {
            env[item.name] = item.value;
            return env;
          },
          {} as Record<string, string>
        ),
        volumes: config.volumes.map(
          (v) => `${v.hostPath}:${v.containerPath}${v.readOnly ? ':ro' : ''}`
        ),
        networks: [config.networkMode],
        restart: config.restartPolicy.policy,
        healthcheck: {
          test: config.healthCheck.command,
          interval: `${config.healthCheck.interval}s`,
          timeout: `${config.healthCheck.timeout}s`,
          retries: config.healthCheck.retries,
          start_period: `${config.healthCheck.startPeriod}s`,
        },
        deploy: {
          resources: {
            limits: {
              cpus: config.resources.cpu,
              memory: config.resources.memory,
            },
          },
        },
      };

      // ボリューム定義
      config.volumes.forEach((volume) => {
        if (!volumes[volume.hostPath.replace('./', '').replace('/', '_')]) {
          volumes[volume.hostPath.replace('./', '').replace('/', '_')] = {
            driver: 'local',
          };
        }
      });
    });

    const compose = {
      version: '3.8',
      services,
      networks,
      volumes,
    };

    return JSON.stringify(compose, null, 2);
  }

  /**
   * Kubernetesマニフェストの生成
   */
  generateKubernetesManifests(): KubernetesManifest[] {
    const manifests: KubernetesManifest[] = [];

    this.containers.forEach((config, id) => {
      // Deployment
      manifests.push({
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: config.name,
          namespace: 'work-time-tracker',
          labels: {
            app: config.name,
            component: id,
          },
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {
              app: config.name,
            },
          },
          template: {
            metadata: {
              labels: {
                app: config.name,
              },
            },
            spec: {
              containers: [
                {
                  name: config.name,
                  image: `${config.image}:${config.tag}`,
                  ports: config.ports.map((p) => ({
                    containerPort: p.containerPort,
                    protocol: p.protocol.toUpperCase(),
                  })),
                  env: config.environment.map((env) => ({
                    name: env.name,
                    value: env.value,
                  })),
                  volumeMounts: config.volumes.map((v) => ({
                    name: v.hostPath.replace('./', '').replace('/', '-'),
                    mountPath: v.containerPath,
                    readOnly: v.readOnly,
                  })),
                  resources: {
                    limits: {
                      cpu: config.resources.cpu,
                      memory: config.resources.memory,
                    },
                    requests: {
                      cpu: config.resources.cpu,
                      memory: config.resources.memory,
                    },
                  },
                  livenessProbe: {
                    exec: {
                      command: config.healthCheck.command,
                    },
                    initialDelaySeconds: config.healthCheck.startPeriod,
                    periodSeconds: config.healthCheck.interval,
                    timeoutSeconds: config.healthCheck.timeout,
                    failureThreshold: config.healthCheck.retries,
                  },
                  readinessProbe: {
                    exec: {
                      command: config.healthCheck.command,
                    },
                    initialDelaySeconds: 10,
                    periodSeconds: 5,
                    timeoutSeconds: config.healthCheck.timeout,
                  },
                },
              ],
              volumes: config.volumes.map((v) => ({
                name: v.hostPath.replace('./', '').replace('/', '-'),
                hostPath: {
                  path: v.hostPath,
                },
              })),
            },
          },
        },
      });

      // Service
      if (config.ports.length > 0) {
        manifests.push({
          apiVersion: 'v1',
          kind: 'Service',
          metadata: {
            name: `${config.name}-service`,
            namespace: 'work-time-tracker',
            labels: {
              app: config.name,
            },
          },
          spec: {
            selector: {
              app: config.name,
            },
            ports: config.ports.map((p) => ({
              port: p.hostPort,
              targetPort: p.containerPort,
              protocol: p.protocol.toUpperCase(),
            })),
            type: id === 'frontend' ? 'LoadBalancer' : 'ClusterIP',
          },
        });
      }
    });

    return manifests;
  }

  /**
   * Dockerfileの生成
   */
  generateDockerfile(type: 'frontend' | 'backend'): string {
    if (type === 'frontend') {
      return `
# Multi-stage build for React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set permissions
RUN chown -R nextjs:nodejs /usr/share/nginx/html
RUN chown -R nextjs:nodejs /var/cache/nginx
RUN chown -R nextjs:nodejs /var/log/nginx
RUN chown -R nextjs:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nextjs:nodejs /var/run/nginx.pid

USER nextjs

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
      `.trim();
    } else {
      return `
# Node.js backend application
FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=nextjs:nodejs . .

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["npm", "start"]
      `.trim();
    }
  }

  /**
   * CI/CDパイプライン設定の生成
   */
  generateCIPipeline(): string {
    return `
name: Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Run security audit
      run: npm audit

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: \${{ secrets.DOCKER_USERNAME }}
        password: \${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Frontend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile.frontend
        push: true
        tags: work-time-tracker/frontend:latest,work-time-tracker/frontend:\${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Build and push Backend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile.backend
        push: true
        tags: work-time-tracker/backend:latest,work-time-tracker/backend:\${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Kubernetes
      run: |
        echo "\${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl apply -f k8s/
        kubectl rollout status deployment/work-time-tracker-frontend
        kubectl rollout status deployment/work-time-tracker-backend
    
    - name: Run smoke tests
      run: |
        kubectl port-forward service/work-time-tracker-frontend-service 3000:80 &
        sleep 10
        curl -f http://localhost:3000/health || exit 1
    `.trim();
  }

  /**
   * 監視とログ設定
   */
  generateMonitoringConfig(): object {
    return {
      prometheus: {
        scrape_configs: [
          {
            job_name: 'work-time-tracker',
            static_configs: [
              {
                targets: ['frontend:80', 'backend:5000', 'postgres:5432', 'redis:6379'],
              },
            ],
          },
        ],
      },
      grafana: {
        dashboards: ['container-metrics', 'application-metrics', 'infrastructure-metrics'],
      },
      logging: {
        driver: 'fluentd',
        options: {
          'fluentd-address': 'localhost:24224',
          tag: 'work-time-tracker',
        },
      },
    };
  }

  /**
   * セキュリティ設定の生成
   */
  generateSecurityConfig(): object {
    return {
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 1001,
        runAsGroup: 1001,
        fsGroup: 1001,
        capabilities: {
          drop: ['ALL'],
        },
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
      },
      networkPolicies: {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'NetworkPolicy',
        metadata: {
          name: 'work-time-tracker-network-policy',
        },
        spec: {
          podSelector: {
            matchLabels: {
              app: 'work-time-tracker',
            },
          },
          policyTypes: ['Ingress', 'Egress'],
          ingress: [
            {
              from: [
                {
                  podSelector: {
                    matchLabels: {
                      app: 'work-time-tracker',
                    },
                  },
                },
              ],
            },
          ],
          egress: [
            {
              to: [
                {
                  podSelector: {
                    matchLabels: {
                      app: 'work-time-tracker',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };
  }

  /**
   * 監視の開始
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.updateDeploymentStatus();
    }, 30000); // 30秒ごとに更新
  }

  /**
   * デプロイメント状態の更新
   */
  private updateDeploymentStatus(): void {
    this.deployments.forEach((status, id) => {
      // シミュレーション: ランダムな状態更新
      const statuses: DeploymentStatus['status'][] = [
        'running',
        'stopped',
        'failed',
        'pending',
        'updating',
      ];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      status.status = randomStatus;
      status.lastUpdated = new Date().toISOString();
      status.uptime += 30;
      status.resourceUsage = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: {
          received: Math.random() * 1000000,
          transmitted: Math.random() * 1000000,
        },
      };

      if (randomStatus === 'running') {
        status.replicas.available = status.replicas.desired;
        status.replicas.ready = status.replicas.desired;
      } else {
        status.replicas.available = Math.floor(Math.random() * status.replicas.desired);
        status.replicas.ready = Math.floor(Math.random() * status.replicas.available);
      }
    });
  }

  /**
   * 全コンテナ設定の取得
   */
  getAllContainers(): Map<string, ContainerConfig> {
    return new Map(this.containers);
  }

  /**
   * 全デプロイメント状態の取得
   */
  getAllDeployments(): Map<string, DeploymentStatus> {
    return new Map(this.deployments);
  }

  /**
   * 特定コンテナの取得
   */
  getContainer(id: string): ContainerConfig | undefined {
    return this.containers.get(id);
  }

  /**
   * 特定デプロイメント状態の取得
   */
  getDeploymentStatus(id: string): DeploymentStatus | undefined {
    return this.deployments.get(id);
  }

  /**
   * 全レジストリ設定の取得
   */
  getAllRegistries(): Map<string, RegistryConfig> {
    return new Map(this.registries);
  }

  /**
   * システム全体の健全性チェック
   */
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    runningServices: number;
    totalServices: number;
    issues: string[];
  } {
    const totalServices = this.deployments.size;
    const runningServices = Array.from(this.deployments.values()).filter(
      (d) => d.status === 'running'
    ).length;

    const healthRatio = runningServices / totalServices;
    let status: 'healthy' | 'degraded' | 'unhealthy';

    if (healthRatio >= 0.9) {
      status = 'healthy';
    } else if (healthRatio >= 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const issues: string[] = [];
    this.deployments.forEach((deployment, id) => {
      if (deployment.status === 'failed') {
        issues.push(`${id} service is failing`);
      }
      if (deployment.replicas.ready < deployment.replicas.desired) {
        issues.push(`${id} has insufficient ready replicas`);
      }
    });

    return {
      status,
      runningServices,
      totalServices,
      issues,
    };
  }
}

// シングルトンインスタンス
export const containerizationService = new ContainerizationService();
