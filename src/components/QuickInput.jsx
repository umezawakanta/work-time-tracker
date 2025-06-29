// QuickInput.jsx
// 資産・負債のクイック追加コンポーネント

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Check,
  CreditCard,
  Wallet,
  DollarSign,
  Building,
  Car,
  Home,
  Briefcase,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addAsset } from '@/store/assetSlice';
import { addDebt } from '@/store/debtSlice';

// クイック入力用のテンプレート
const assetTemplates = [
  { name: '当座預金', icon: <Wallet className="h-4 w-4" />, category: 'cash' },
  { name: '普通預金', icon: <Wallet className="h-4 w-4" />, category: 'cash' },
  { name: '定期預金', icon: <DollarSign className="h-4 w-4" />, category: 'savings' },
  { name: '株式投資', icon: <Briefcase className="h-4 w-4" />, category: 'investment' },
  { name: '投資信託', icon: <Briefcase className="h-4 w-4" />, category: 'investment' },
  { name: '不動産', icon: <Building className="h-4 w-4" />, category: 'property' },
  { name: '自動車', icon: <Car className="h-4 w-4" />, category: 'property' },
  { name: 'その他資産', icon: <Plus className="h-4 w-4" />, category: 'other' },
];

const debtTemplates = [
  { name: '住宅ローン', icon: <Home className="h-4 w-4" />, category: 'mortgage' },
  { name: 'カーローン', icon: <Car className="h-4 w-4" />, category: 'loan' },
  { name: 'クレジットカード', icon: <CreditCard className="h-4 w-4" />, category: 'credit' },
  { name: '学生ローン', icon: <Briefcase className="h-4 w-4" />, category: 'loan' },
  { name: 'その他負債', icon: <Plus className="h-4 w-4" />, category: 'other' },
];

export function QuickInput({ onClose, updateLastBalanceDate }) {
  const [activeTab, setActiveTab] = useState('asset');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    account: '',
    value: '',
    category: '',
    institution: '',
    interestRate: '',
    notes: '',
  });
  const [recents, setRecents] = useState([
    { type: 'asset', account: '三菱UFJ銀行', value: 850000 },
    { type: 'debt', account: '住宅ローン', value: 15000000 },
  ]);

  const dispatch = useDispatch();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      account: template.name,
      category: template.category,
    });
  };

  const handleRecentSelect = (recent) => {
    setActiveTab(recent.type);
    setFormData({
      ...formData,
      account: recent.account,
      value: recent.value,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const clearForm = () => {
    setFormData({
      account: '',
      value: '',
      category: '',
      institution: '',
      interestRate: '',
      notes: '',
    });
    setSelectedTemplate(null);
  };

  const validateForm = () => {
    if (!formData.account.trim()) {
      toast.error('アカウント名を入力してください');
      return false;
    }

    if (!formData.value || isNaN(parseFloat(formData.value)) || parseFloat(formData.value) <= 0) {
      toast.error('有効な金額を入力してください');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // 追加データの準備
    const newEntry = {
      account: formData.account,
      value: parseFloat(formData.value),
      date: new Date().toISOString().split('T')[0],
      category: formData.category || (activeTab === 'asset' ? 'other' : 'loan'),
      institution: formData.institution || '',
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 0,
      notes: formData.notes || '',
    };

    // Reduxアクションのディスパッチ
    setTimeout(() => {
      try {
        if (activeTab === 'asset') {
          dispatch(addAsset(newEntry));
        } else {
          dispatch(addDebt(newEntry));
        }

        // 最終更新日を更新
        updateLastBalanceDate && updateLastBalanceDate();

        // 最近追加したリストに追加
        setRecents([
          { type: activeTab, account: newEntry.account, value: newEntry.value },
          ...recents.slice(0, 4), // 最大5件まで保持
        ]);

        toast.success(`${activeTab === 'asset' ? '資産' : '負債'}を追加しました！`);

        // フォームをクリア
        clearForm();
      } catch (error) {
        console.error('Error adding entry:', error);
        toast.error('追加中にエラーが発生しました');
      } finally {
        setIsSubmitting(false);
      }
    }, 500); // ローディングの演出のための遅延
  };

  const handleAddAnother = () => {
    handleSubmit();
    // フォームはクリアするが、モーダルは閉じない
  };

  return (
    <div className="space-y-4 py-2">
      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="asset" className="flex-1">
            <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500" />
            資産の追加
          </TabsTrigger>
          <TabsTrigger value="debt" className="flex-1">
            <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500" />
            負債の追加
          </TabsTrigger>
        </TabsList>

        <TabsContent value="asset" className="pt-4">
          <div className="space-y-4">
            <div>
              <Label>テンプレートから選択</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                {assetTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant={selectedTemplate === template ? 'default' : 'outline'}
                    className={`h-auto py-2 px-3 justify-start ${
                      selectedTemplate === template ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center">
                      {template.icon}
                      <span className="ml-2 text-sm">{template.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="debt" className="pt-4">
          <div className="space-y-4">
            <div>
              <Label>テンプレートから選択</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
                {debtTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant={selectedTemplate === template ? 'default' : 'outline'}
                    className={`h-auto py-2 px-3 justify-start ${
                      selectedTemplate === template ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center">
                      {template.icon}
                      <span className="ml-2 text-sm">{template.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 最近追加したアカウント */}
      {recents.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">最近追加したアカウント</Label>
          <div className="flex flex-wrap gap-2">
            {recents.map((recent, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleRecentSelect(recent)}
              >
                {recent.type === 'asset' ? (
                  <ArrowUpCircle className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-3 w-3 mr-1 text-red-500" />
                )}
                {recent.account}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* 入力フォーム */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account">
              アカウント名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="account"
              name="account"
              placeholder={activeTab === 'asset' ? '銀行口座名など' : 'ローン名など'}
              value={formData.account}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              金額 (円) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="value"
              name="value"
              type="number"
              placeholder="0"
              value={formData.value}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="institution">金融機関</Label>
            <Input
              id="institution"
              name="institution"
              placeholder={
                activeTab === 'asset'
                  ? '銀行名、証券会社名など'
                  : 'クレジットカード会社、銀行名など'
              }
              value={formData.institution}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">{activeTab === 'asset' ? '金利' : '金利'}（%）</Label>
            <Input
              id="interestRate"
              name="interestRate"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.interestRate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">メモ</Label>
          <Input
            id="notes"
            name="notes"
            placeholder="補足情報を入力（任意）"
            value={formData.notes}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
          キャンセル
        </Button>
        <Button type="button" variant="ghost" disabled={isSubmitting} onClick={clearForm}>
          <RefreshCw className="h-4 w-4 mr-2" />
          クリア
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={handleAddAnother}
          className="gap-1"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          追加して続ける
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            handleSubmit();
            if (validateForm()) {
              // フォームが有効であれば閉じる
              setTimeout(() => onClose(), 500);
            }
          }}
          className="gap-1"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          追加
        </Button>
      </div>
    </div>
  );
}
