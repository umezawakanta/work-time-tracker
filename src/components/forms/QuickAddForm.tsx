'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addAsset } from '@/store/assetSlice';
import { addDebt } from '@/store/debtSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

// フォームのバリデーションスキーマ
const formSchema = z.object({
  type: z.enum(['asset', 'debt'], {
    required_error: '種類を選択してください',
  }),
  accountName: z.string().min(1, {
    message: '口座名を入力してください',
  }),
  amount: z.coerce
    .number({
      invalid_type_error: '有効な金額を入力してください',
    })
    .positive({
      message: '金額は0より大きい値を入力してください',
    }),
  category: z.string().optional(),
  description: z.string().optional(), // 説明フィールドを追加
});

interface QuickAddFormProps {
  onClose: () => void;
  updateLastBalanceDate: () => void;
}

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ onClose, updateLastBalanceDate }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォームの初期化
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'asset',
      accountName: '',
      amount: undefined,
      category: '',
      description: '', // 説明フィールドの初期値
    },
  });

  // フォーム送信ハンドラ
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // 共通のエントリ情報を作成
      const entryData = {
        id: uuidv4(),
        account: values.accountName,
        value: values.amount,
        lastUpdated: new Date().toISOString(),
        date: new Date().toISOString(), // date プロパティを追加
        description: values.description || '', // 説明フィールドを追加
      };

      // 種類に応じてストアにデータを追加
      if (values.type === 'asset') {
        dispatch(
          addAsset({
            ...entryData,
            category: values.category || 'その他',
          })
        );
        toast.success('資産を追加しました');
      } else {
        dispatch(
          addDebt({
            ...entryData,
            category: values.category || 'その他',
          })
        );
        toast.success('負債を追加しました');
      }

      // 残高更新日を更新
      updateLastBalanceDate();

      // フォームをクローズ
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('追加エラー:', error);
      toast.error('追加に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>種類</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="種類を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="asset">資産</SelectItem>
                  <SelectItem value="debt">負債</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>追加する項目の種類を選択してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>口座名</FormLabel>
              <FormControl>
                <Input placeholder="例：三菱UFJ銀行" {...field} />
              </FormControl>
              <FormDescription>資産・負債の名前を入力してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>金額</FormLabel>
              <FormControl>
                <Input type="number" placeholder="例：100000" {...field} />
              </FormControl>
              <FormDescription>資産または負債の金額を入力してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カテゴリ（任意）</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {form.watch('type') === 'asset' ? (
                    <>
                      <SelectItem value="現金・預金">現金・預金</SelectItem>
                      <SelectItem value="投資">投資</SelectItem>
                      <SelectItem value="不動産">不動産</SelectItem>
                      <SelectItem value="年金・保険">年金・保険</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="住宅ローン">住宅ローン</SelectItem>
                      <SelectItem value="自動車ローン">自動車ローン</SelectItem>
                      <SelectItem value="クレジットカード">クレジットカード</SelectItem>
                      <SelectItem value="教育ローン">教育ローン</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>分類するカテゴリを選択してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明（任意）</FormLabel>
              <FormControl>
                <Input placeholder="例：年利2.5%" {...field} />
              </FormControl>
              <FormDescription>資産・負債の詳細説明を入力してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '追加中...' : '追加'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
