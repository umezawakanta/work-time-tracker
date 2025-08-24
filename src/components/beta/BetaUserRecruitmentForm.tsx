/**
 * 📝 ベータユーザー募集フォーム
 * ADHD/ASD特性を考慮したアクセシブルデザイン・段階的入力・認知負荷軽減
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Brain,
  Shield,
  Users,
  Clock,
  Computer,
  Heart,
  Info,
  HelpCircle,
  Star,
  Lightbulb,
  Eye,
} from 'lucide-react';
import {
  betaUserRecruitmentService,
  BetaUserProfile,
} from '@/services/beta/BetaUserRecruitmentService';

// フォームステップ定義
type FormStep =
  | 'welcome'
  | 'personal'
  | 'neurodiversity'
  | 'technical'
  | 'participation'
  | 'consent'
  | 'community'
  | 'review'
  | 'complete';

interface BetaUserRecruitmentFormProps {
  onComplete?: (applicationId: string) => void;
  onCancel?: () => void;
}

export const BetaUserRecruitmentForm: React.FC<BetaUserRecruitmentFormProps> = ({
  onComplete,
  onCancel,
}) => {
  // フォーム状態管理
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [formData, setFormData] = useState<Partial<BetaUserProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveProgress, setSaveProgress] = useState(true);

  // ADHD/ASD配慮: 自動保存とセッション復元
  useEffect(() => {
    if (saveProgress) {
      const savedData = localStorage.getItem('betaUserRecruitmentForm');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed.formData || {});
          setCurrentStep(parsed.currentStep || 'welcome');
        } catch (error) {
          console.error('Failed to restore form data:', error);
        }
      }
    }
  }, []);

  // 自動保存
  useEffect(() => {
    if (saveProgress && Object.keys(formData).length > 0) {
      localStorage.setItem(
        'betaUserRecruitmentForm',
        JSON.stringify({
          formData,
          currentStep,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }, [formData, currentStep, saveProgress]);

  // ステップ進捗計算
  const steps: FormStep[] = [
    'welcome',
    'personal',
    'neurodiversity',
    'technical',
    'participation',
    'consent',
    'community',
    'review',
    'complete',
  ];
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;

  // バリデーション
  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'personal':
        if (!formData.personalInfo?.name) newErrors.name = '名前は必須です';
        if (!formData.personalInfo?.email) newErrors.email = 'メールアドレスは必須です';
        if (!formData.personalInfo?.age || formData.personalInfo.age < 18) {
          newErrors.age = '18歳以上である必要があります';
        }
        break;

      case 'neurodiversity':
        if (!formData.neurodiversityProfile?.hasADHD && !formData.neurodiversityProfile?.hasASD) {
          newErrors.neurodiversity = 'ADHD又はASDのいずれかを選択してください';
        }
        break;

      case 'consent':
        if (!formData.consentProfile?.dataCollection) {
          newErrors.dataCollection = 'データ収集への同意は必須です';
        }
        if (!formData.consentProfile?.researchParticipation) {
          newErrors.researchParticipation = '研究参加への同意は必須です';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム更新
  const updateFormData = (section: string, data: any) => {
    setFormData((prev) => {
      const existingSection = prev[section as keyof BetaUserProfile];
      return {
        ...prev,
        [section]: {
          ...(typeof existingSection === 'object' && existingSection !== null
            ? existingSection
            : {}),
          ...data,
        },
      };
    });
    setErrors({});
  };

  // ナビゲーション
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  // フォーム送信
  const handleSubmit = async () => {
    if (!validateStep('review')) return;

    setIsSubmitting(true);
    try {
      const applicationId = await betaUserRecruitmentService.submitApplication(
        formData as Omit<BetaUserProfile, 'id' | 'recruitmentStatus'>
      );

      // 保存されたフォームデータを削除
      localStorage.removeItem('betaUserRecruitmentForm');

      setCurrentStep('complete');
      onComplete?.(applicationId);
    } catch (error) {
      console.error('Application submission failed:', error);
      setErrors({ submit: 'アプリケーションの送信に失敗しました。もう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ウェルカムステップ
  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-full">
          <Users className="h-12 w-12 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">🌟 ベータテスター募集</h1>
        <p className="text-xl text-gray-600">
          ADHD/ASD特化ライフマネジメントシステムの開発にご協力ください
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg text-left space-y-4">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
          <Star className="h-5 w-5" />
          参加することで得られるもの
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <span>個人の認知特性に最適化されたツールへの早期アクセス</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <span>専門家による認知機能評価とフィードバック</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <span>同じ特性を持つコミュニティとのつながり</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <span>研究成果への貢献とテクノロジーの未来への影響</span>
          </li>
        </ul>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-left">
            <p className="font-medium text-amber-900">予想時間</p>
            <p className="text-sm text-amber-800">
              このフォーム: 15-20分 | ベータテスト: 週2-4時間 | 期間: 4-8週間
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Checkbox
            id="save-progress"
            checked={saveProgress}
            onCheckedChange={(checked) => setSaveProgress(checked === true)}
          />
          <Label htmlFor="save-progress" className="text-sm">
            進捗を自動保存する（ADHD配慮機能）
          </Label>
        </div>

        <Button onClick={goToNextStep} className="w-full" size="lg">
          <Heart className="h-5 w-5 mr-2" />
          参加申し込みを始める
        </Button>
      </div>
    </div>
  );

  // 個人情報ステップ
  const renderPersonalStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Brain className="h-8 w-8 mx-auto text-purple-600" />
        <h2 className="text-2xl font-bold">基本情報</h2>
        <p className="text-gray-600">あなたについて教えてください</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">お名前 *</Label>
          <Input
            id="name"
            value={formData.personalInfo?.name || ''}
            onChange={(e) => updateFormData('personalInfo', { name: e.target.value })}
            placeholder="山田太郎"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス *</Label>
          <Input
            id="email"
            type="email"
            value={formData.personalInfo?.email || ''}
            onChange={(e) => updateFormData('personalInfo', { email: e.target.value })}
            placeholder="example@email.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">年齢 *</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="100"
            value={formData.personalInfo?.age || ''}
            onChange={(e) => updateFormData('personalInfo', { age: parseInt(e.target.value) })}
            className={errors.age ? 'border-red-500' : ''}
          />
          {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">お住まいの国</Label>
          <Select onValueChange={(value) => updateFormData('personalInfo', { country: value })}>
            <SelectTrigger>
              <SelectValue placeholder="国を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="japan">日本</SelectItem>
              <SelectItem value="usa">アメリカ</SelectItem>
              <SelectItem value="canada">カナダ</SelectItem>
              <SelectItem value="uk">イギリス</SelectItem>
              <SelectItem value="australia">オーストラリア</SelectItem>
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">タイムゾーン</Label>
          <Select onValueChange={(value) => updateFormData('personalInfo', { timezone: value })}>
            <SelectTrigger>
              <SelectValue placeholder="タイムゾーンを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
              <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-preference">連絡方法の希望</Label>
          <Select
            onValueChange={(value) => updateFormData('personalInfo', { contactPreference: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="連絡方法を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">メール</SelectItem>
              <SelectItem value="secure_message">セキュアメッセージ</SelectItem>
              <SelectItem value="video_call">ビデオ通話</SelectItem>
              <SelectItem value="phone">電話</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          個人情報は暗号化され、研究目的でのみ使用されます。GDPR・個人情報保護法に完全準拠しています。
        </AlertDescription>
      </Alert>
    </div>
  );

  // 神経多様性ステップ
  const renderNeurodiversityStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Brain className="h-8 w-8 mx-auto text-indigo-600" />
        <h2 className="text-2xl font-bold">神経多様性について</h2>
        <p className="text-gray-600">あなたの神経多様性特性について教えてください</p>
      </div>

      {/* ADHD情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ADHD（注意欠如・多動症）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-adhd"
              checked={formData.neurodiversityProfile?.hasADHD || false}
              onCheckedChange={(checked) =>
                updateFormData('neurodiversityProfile', { hasADHD: checked })
              }
            />
            <Label htmlFor="has-adhd">ADHDの特性があります</Label>
          </div>

          {formData.neurodiversityProfile?.hasADHD && (
            <div className="space-y-4 pl-6 border-l-2 border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adhd-diagnosed"
                    checked={formData.neurodiversityProfile?.adhdDiagnosed || false}
                    onCheckedChange={(checked) =>
                      updateFormData('neurodiversityProfile', { adhdDiagnosed: checked })
                    }
                  />
                  <Label htmlFor="adhd-diagnosed">正式に診断済み</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adhd-self-identified"
                    checked={formData.neurodiversityProfile?.adhdSelfIdentified || false}
                    onCheckedChange={(checked) =>
                      updateFormData('neurodiversityProfile', { adhdSelfIdentified: checked })
                    }
                  />
                  <Label htmlFor="adhd-self-identified">自己認識</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ADHDのタイプ</Label>
                <RadioGroup
                  value={formData.neurodiversityProfile?.adhdType || ''}
                  onValueChange={(value) =>
                    updateFormData('neurodiversityProfile', { adhdType: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inattentive" id="adhd-inattentive" />
                    <Label htmlFor="adhd-inattentive">不注意型</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hyperactive" id="adhd-hyperactive" />
                    <Label htmlFor="adhd-hyperactive">多動・衝動型</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="combined" id="adhd-combined" />
                    <Label htmlFor="adhd-combined">混合型</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unknown" id="adhd-unknown" />
                    <Label htmlFor="adhd-unknown">不明・未確定</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adhd-medication"
                  checked={formData.neurodiversityProfile?.adhdMedication || false}
                  onCheckedChange={(checked) =>
                    updateFormData('neurodiversityProfile', { adhdMedication: checked })
                  }
                />
                <Label htmlFor="adhd-medication">現在、ADHD治療薬を服用中</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ASD情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ASD（自閉スペクトラム症）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-asd"
              checked={formData.neurodiversityProfile?.hasASD || false}
              onCheckedChange={(checked) =>
                updateFormData('neurodiversityProfile', { hasASD: checked })
              }
            />
            <Label htmlFor="has-asd">ASDの特性があります</Label>
          </div>

          {formData.neurodiversityProfile?.hasASD && (
            <div className="space-y-4 pl-6 border-l-2 border-green-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="asd-diagnosed"
                    checked={formData.neurodiversityProfile?.asdDiagnosed || false}
                    onCheckedChange={(checked) =>
                      updateFormData('neurodiversityProfile', { asdDiagnosed: checked })
                    }
                  />
                  <Label htmlFor="asd-diagnosed">正式に診断済み</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="asd-self-identified"
                    checked={formData.neurodiversityProfile?.asdSelfIdentified || false}
                    onCheckedChange={(checked) =>
                      updateFormData('neurodiversityProfile', { asdSelfIdentified: checked })
                    }
                  />
                  <Label htmlFor="asd-self-identified">自己認識</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>支援の必要度</Label>
                <RadioGroup
                  value={formData.neurodiversityProfile?.asdSupportLevel?.toString() || ''}
                  onValueChange={(value) =>
                    updateFormData('neurodiversityProfile', { asdSupportLevel: parseInt(value) })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="asd-level1" />
                    <Label htmlFor="asd-level1">レベル1（支援を要する）</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="asd-level2" />
                    <Label htmlFor="asd-level2">レベル2（十分な支援を要する）</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="asd-level3" />
                    <Label htmlFor="asd-level3">レベル3（非常に十分な支援を要する）</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 機能的影響 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">日常生活への影響</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['dailyLiving', 'work', 'social', 'academic'].map((area) => (
            <div key={area} className="space-y-2">
              <Label>
                {area === 'dailyLiving' && '日常生活'}
                {area === 'work' && '仕事'}
                {area === 'social' && '社会的関係'}
                {area === 'academic' && '学習・教育'}
                への影響
              </Label>
              <Select
                onValueChange={(value) =>
                  updateFormData('neurodiversityProfile', {
                    functionalImpact: {
                      ...formData.neurodiversityProfile?.functionalImpact,
                      [area]: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="影響の程度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">最小限</SelectItem>
                  <SelectItem value="mild">軽度</SelectItem>
                  <SelectItem value="moderate">中程度</SelectItem>
                  <SelectItem value="significant">重度</SelectItem>
                  <SelectItem value="severe">最重度</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      {errors.neurodiversity && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.neurodiversity}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  // フッターナビゲーション
  const renderNavigation = () => (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button variant="outline" onClick={goToPreviousStep} disabled={currentStepIndex === 0}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        前へ
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {currentStepIndex + 1} / {steps.length - 1}
        </span>
      </div>

      {currentStep !== 'review' ? (
        <Button onClick={goToNextStep}>
          次へ
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? '送信中...' : '申し込み完了'}
          <Check className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );

  // メインレンダリング
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* プログレスバー */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>進捗状況</span>
            <span>{Math.round(progressPercentage)}% 完了</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* メインコンテンツ */}
      <Card className="min-h-[600px]">
        <CardContent className="p-8">
          {currentStep === 'welcome' && renderWelcomeStep()}
          {currentStep === 'personal' && renderPersonalStep()}
          {currentStep === 'neurodiversity' && renderNeurodiversityStep()}
          {/* 他のステップはここに追加 */}

          {/* ナビゲーション */}
          {currentStep !== 'welcome' && currentStep !== 'complete' && renderNavigation()}
        </CardContent>
      </Card>

      {/* エラー表示 */}
      {errors.submit && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BetaUserRecruitmentForm;
