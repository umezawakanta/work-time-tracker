import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { cors } from '../../lib/cors';

interface LegalMetrics {
  contracts: {
    active: number;
    expiring: number;
    renewal: number;
    drafts: number;
  };
  compliance: {
    score: number;
    risks: number;
    audits: number;
    violations: number;
  };
  privacy: {
    gdprCompliance: number;
    dataRequests: number;
    breaches: number;
    assessments: number;
  };
  intellectual: {
    trademarks: number;
    patents: number;
    copyrights: number;
    disputes: number;
  };
}

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const metrics: LegalMetrics = {
      contracts: {
        active: 45,
        expiring: 7,
        renewal: 12,
        drafts: 5,
      },
      compliance: {
        score: 87,
        risks: 8,
        audits: 3,
        violations: 1,
      },
      privacy: {
        gdprCompliance: 92,
        dataRequests: 15,
        breaches: 0,
        assessments: 4,
      },
      intellectual: {
        trademarks: 12,
        patents: 3,
        copyrights: 28,
        disputes: 2,
      },
    };

    const contracts = [
      {
        id: 'contract-001',
        title: 'クラウドサービス契約',
        party: 'AWS Japan株式会社',
        type: 'vendor',
        status: 'signed',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        value: 2400000,
        autoRenewal: true,
        riskLevel: 'low',
        assignedLawyer: '田中弁護士',
      },
      {
        id: 'contract-002',
        title: '業務委託契約',
        party: 'フリーランス開発者A',
        type: 'service',
        status: 'review',
        startDate: '2025-02-01',
        endDate: '2025-07-31',
        value: 1800000,
        autoRenewal: false,
        riskLevel: 'medium',
        assignedLawyer: '佐藤弁護士',
      },
      {
        id: 'contract-003',
        title: '秘密保持契約',
        party: 'XYZ商事株式会社',
        type: 'nda',
        status: 'negotiation',
        startDate: '2025-02-01',
        endDate: '2027-01-31',
        autoRenewal: false,
        riskLevel: 'low',
      },
    ];

    const complianceTasks = [
      {
        id: 'compliance-001',
        title: 'GDPR年次監査',
        description: '個人データ処理活動の包括的レビューと監査',
        category: 'gdpr',
        priority: 'high',
        dueDate: '2025-03-31',
        status: 'in-progress',
        assignee: '法務部',
        documents: ['audit-checklist.pdf', 'data-mapping.xlsx'],
      },
      {
        id: 'compliance-002',
        title: '就業規則改定',
        description: 'リモートワーク規定の追加と既存規則の見直し',
        category: 'employment',
        priority: 'medium',
        dueDate: '2025-02-28',
        status: 'pending',
        assignee: '人事部',
        documents: ['current-rules.pdf'],
      },
      {
        id: 'compliance-003',
        title: 'セキュリティポリシー更新',
        description: '情報セキュリティポリシーの年次見直し',
        category: 'security',
        priority: 'critical',
        dueDate: '2025-02-15',
        status: 'overdue',
        assignee: 'IT部',
        documents: ['security-policy.pdf', 'risk-assessment.docx'],
      },
    ];

    const legalRisks = [
      {
        id: 'risk-001',
        title: 'データプライバシー規制強化',
        description: '新しいプライバシー法制への対応が必要',
        category: 'プライバシー',
        severity: 'high',
        probability: 85,
        impact: '高額な制裁金のリスク',
        mitigation: 'プライバシー・バイ・デザインの実装',
        status: 'mitigating',
        owner: '法務部',
      },
      {
        id: 'risk-002',
        title: '契約更新期限切れ',
        description: '重要な業務委託契約の期限が迫っている',
        category: '契約管理',
        severity: 'medium',
        probability: 70,
        impact: 'サービス継続に影響',
        mitigation: '早期更新交渉の開始',
        status: 'identified',
        owner: '営業部',
      },
    ];

    console.log('✅ Legal metrics fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        metrics,
        contracts,
        complianceTasks,
        legalRisks,
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch legal metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '法務メトリクスの取得に失敗しました',
    });
  }
};

export default withAuth(handler, {
  requireAuth: true,
  requireVerified: true,
});
