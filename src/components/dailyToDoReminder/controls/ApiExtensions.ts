/**
 * API拡張メソッド
 * APIクラスに拡張機能を提供します
 */

// 拡張モジュールのインポート
import { batchMethods } from './ApiBatchMethods';
import { resourceMethods } from './ApiResourceMethods';
import { subscriptionMethods } from './ApiSubscriptionMethods';
import { analyticsExportMethods } from './ApiAnalyticsExportMethods';
import { aiMethods } from './ApiAIMethods';
import { securityMethods } from './ApiSecurityMethods';
import { integrationMethods } from './ApiIntegrationMethods';

/**
 * API型定義（拡張用）
 */
interface APIClass {
    // バッチ関連メソッド
    batch: typeof batchMethods.batch;
    getBatchStatus: typeof batchMethods.getBatchStatus;
    cancelBatch: typeof batchMethods.cancelBatch;

    // リソース関連メソッド
    getResource: typeof resourceMethods.getResource;
    createResource: typeof resourceMethods.createResource;
    updateResource: typeof resourceMethods.updateResource;
    deleteResource: typeof resourceMethods.deleteResource;
    invalidateResourceCache: typeof resourceMethods.invalidateResourceCache;
    clearResourceCache: typeof resourceMethods.clearResourceCache;

    // サブスクリプション関連メソッド
    getSubscriptionInfo: typeof subscriptionMethods.getSubscriptionInfo;
    upgradeSubscription: typeof subscriptionMethods.upgradeSubscription;
    downgradeSubscription: typeof subscriptionMethods.downgradeSubscription;
    startTrial: typeof subscriptionMethods.startTrial;
    getBillingHistory: typeof subscriptionMethods.getBillingHistory;
    managePaymentMethods: typeof subscriptionMethods.managePaymentMethods;

    // 分析エクスポートメソッド
    exportAnalyticsData: typeof analyticsExportMethods.exportData;
    getAnalyticsReport: typeof analyticsExportMethods.getReport;
    scheduleAnalyticsReport: typeof analyticsExportMethods.scheduleReport;

    // AI関連メソッド
    generateAIContent: typeof aiMethods.generateContent;
    analyzeDataWithAI: typeof aiMethods.analyzeData;
    optimizeQueryWithAI: typeof aiMethods.optimizeQuery;

    // セキュリティメソッド
    checkPermission: typeof securityMethods.checkPermission;
    validateData: typeof securityMethods.validateData;
    getSecurityStatus: typeof securityMethods.getSecurityStatus;

    // 統合メソッド
    connectService: typeof integrationMethods.connectService;
    synchronizeData: typeof integrationMethods.synchronizeData;
    getIntegrationStatus: typeof integrationMethods.getIntegrationStatus;

    // 他の拡張メソッドがある場合はここに追加
}

/**
 * API拡張メソッドを適用する
 * @param api APIクラス
 */
export function applyExtensionMethods(api: any): void {
    // バッチ関連メソッド
    api.batch = batchMethods.batch;
    api.getBatchStatus = batchMethods.getBatchStatus;
    api.cancelBatch = batchMethods.cancelBatch;

    // リソース関連メソッド
    api.getResource = resourceMethods.getResource;
    api.createResource = resourceMethods.createResource;
    api.updateResource = resourceMethods.updateResource;
    api.deleteResource = resourceMethods.deleteResource;
    api.invalidateResourceCache = resourceMethods.invalidateResourceCache;
    api.clearResourceCache = resourceMethods.clearResourceCache;

    // サブスクリプション関連メソッド
    api.getSubscriptionInfo = subscriptionMethods.getSubscriptionInfo;
    api.upgradeSubscription = subscriptionMethods.upgradeSubscription;
    api.downgradeSubscription = subscriptionMethods.downgradeSubscription;
    api.startTrial = subscriptionMethods.startTrial;
    api.getBillingHistory = subscriptionMethods.getBillingHistory;
    api.managePaymentMethods = subscriptionMethods.managePaymentMethods;

    // 分析エクスポートメソッド
    api.exportAnalyticsData = analyticsExportMethods.exportData;
    api.getAnalyticsReport = analyticsExportMethods.getReport;
    api.scheduleAnalyticsReport = analyticsExportMethods.scheduleReport;

    // AI関連メソッド
    api.generateAIContent = aiMethods.generateContent;
    api.analyzeDataWithAI = aiMethods.analyzeData;
    api.optimizeQueryWithAI = aiMethods.optimizeQuery;

    // セキュリティメソッド
    api.checkPermission = securityMethods.checkPermission;
    api.validateData = securityMethods.validateData;
    api.getSecurityStatus = securityMethods.getSecurityStatus;

    // 統合メソッド
    api.connectService = integrationMethods.connectService;
    api.synchronizeData = integrationMethods.synchronizeData;
    api.getIntegrationStatus = integrationMethods.getIntegrationStatus;
}