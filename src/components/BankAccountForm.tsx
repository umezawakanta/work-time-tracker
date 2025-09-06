import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Building2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface BankAccountFormData {
  bankName: string;
  accountType: 'checking' | 'savings' | 'time_deposit' | 'credit_card';
  accountNumber: string;
  branchName: string;
  accountName: string;
  isMain: boolean;
  lastBalance: number;
}

interface BankAccountFormProps {
  onAccountAdded: (account: any) => void;
  onCancel: () => void;
  existingMainAccount?: boolean;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  onAccountAdded,
  onCancel,
  existingMainAccount = false,
}) => {
  const [formData, setFormData] = useState<BankAccountFormData>({
    bankName: '',
    accountType: 'checking',
    accountNumber: '',
    branchName: '',
    accountName: '',
    isMain: !existingMainAccount, // 既存のメイン口座がない場合のみデフォルトでメインに設定
    lastBalance: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('銀行口座を登録しました');
        onAccountAdded(result.data);
        // フォームをリセット
        setFormData({
          bankName: '',
          accountType: 'checking',
          accountNumber: '',
          branchName: '',
          accountName: '',
          isMain: false,
          lastBalance: 0,
        });
      } else {
        toast.error(result.message || '口座の登録に失敗しました');
      }
    } catch (error) {
      console.error('Bank account creation error:', error);
      toast.error('口座の登録中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BankAccountFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          新しい銀行口座を登録
        </CardTitle>
        <CardDescription>手動で銀行口座の情報を入力して登録します</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">銀行名 *</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                placeholder="例: 三井住友銀行"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">口座種別 *</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => handleInputChange('accountType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="口座種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">普通預金</SelectItem>
                  <SelectItem value="savings">貯蓄預金</SelectItem>
                  <SelectItem value="time_deposit">定期預金</SelectItem>
                  <SelectItem value="credit_card">クレジットカード</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">口座番号 *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="例: 1234567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchName">支店名</Label>
              <Input
                id="branchName"
                value={formData.branchName}
                onChange={(e) => handleInputChange('branchName', e.target.value)}
                placeholder="例: 本店"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">口座名 *</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                placeholder="例: メイン口座"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastBalance">現在の残高</Label>
              <Input
                id="lastBalance"
                type="number"
                value={formData.lastBalance}
                onChange={(e) => handleInputChange('lastBalance', parseFloat(e.target.value) || 0)}
                placeholder="例: 1000000"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isMain"
              checked={formData.isMain}
              onCheckedChange={(checked) => handleInputChange('isMain', checked)}
              disabled={existingMainAccount}
            />
            <Label htmlFor="isMain" className="text-sm">
              メイン口座として設定
              {existingMainAccount && (
                <span className="text-gray-500 ml-1">(既にメイン口座が登録されています)</span>
              )}
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登録中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  口座を登録
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankAccountForm;
