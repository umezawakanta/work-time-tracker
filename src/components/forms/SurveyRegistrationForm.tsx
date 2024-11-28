import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { surveyApi } from '@/services/api/surveyApi';
import { partyApi } from '@/services/api/partyApi';
import { toast } from 'react-hot-toast';
import { Survey, SupportRate, PoliticalParty } from '@/types/survey';

interface SurveyFormData {
  survey: Omit<Survey, '_id'>;
  supportRates: Omit<SupportRate, '_id' | 'surveyId'>[];
}

interface SurveyRegistrationFormProps {
  onSubmitSuccess: () => void;
}

export const SurveyRegistrationForm = ({ onSubmitSuccess }: SurveyRegistrationFormProps) => {
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const { register, handleSubmit, reset } = useForm<SurveyFormData>();

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await partyApi.getAll();
        setParties(response.data);
      } catch (error) {
        console.error('Error fetching parties:', error);
        toast.error('政党データの取得に失敗しました');
      }
    };
    fetchParties();
  }, []);

  const onSubmit = async (data: SurveyFormData) => {
    try {
      await surveyApi.create(data.survey, data.supportRates);
      toast.success('調査結果を登録しました');
      reset();
      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('登録に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">メディア</label>
          <Input {...register('survey.mediaOutlet')} required />
        </div>
        <div>
          <label className="block text-sm font-medium">調査開始日</label>
          <Input {...register('survey.surveyStartDate')} type="date" required />
        </div>
        <div>
          <label className="block text-sm font-medium">調査終了日</label>
          <Input {...register('survey.surveyEndDate')} type="date" required />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">支持率データ</h3>
        {parties.map((party, index) => (
          <div key={party._id} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{party.name}</label>
              <Input
                {...register(`supportRates.${index}.supportRate`)}
                type="number"
                step="0.1"
                required
              />
              <Input
                type="hidden"
                {...register(`supportRates.${index}.partyId`)}
                value={party._id}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">前回比</label>
              <Input
                {...register(`supportRates.${index}.rateChange`)}
                type="number"
                step="0.1"
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit">登録</Button>
    </form>
  );
};

