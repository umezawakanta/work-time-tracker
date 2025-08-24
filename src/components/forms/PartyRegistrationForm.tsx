// src/components/forms/PartyRegistrationForm.tsx
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { partyApi } from '@/services/api/partyApi';
import { toast } from 'react-hot-toast';
import { PoliticalParty } from '@/types/survey';

export const PartyRegistrationForm = () => {
  const { register, handleSubmit, reset } = useForm<Omit<PoliticalParty, '_id'>>();

  const onSubmit = async (data: Omit<PoliticalParty, '_id'>) => {
    try {
      await partyApi.create(data);
      toast.success('政党を登録しました');
      reset();
    } catch {
      toast.error('登録に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">政党名</label>
        <Input {...register('name')} required />
      </div>
      <div>
        <label className="block text-sm font-medium">略称</label>
        <Input {...register('shortName')} required />
      </div>
      <div>
        <label className="block text-sm font-medium">カラーコード</label>
        <Input {...register('colorCode')} type="color" required />
      </div>
      <Button type="submit">登録</Button>
    </form>
  );
};
