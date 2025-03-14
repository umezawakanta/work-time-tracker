import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { surveyApi } from '@/services/api/surveyApi';
import { Survey, SupportRate, PoliticalParty } from '@/types/survey';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Save, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SurveyFormData {
  survey: Omit<Survey, '_id'>;
  supportRates: Omit<SupportRate, '_id' | 'surveyId'>[];
}

export const SurveyRegistrationForm = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [supportRates, setSupportRates] = useState<SupportRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SurveyFormData>();

  // 政党情報の取得
  useEffect(() => {
    const fetchParties = async () => {
      try {
        setIsLoading(true);
        const response = await surveyApi.getParties();
        setParties(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('政党情報の取得に失敗しました');
        setIsLoading(false);
        console.error(err);
      }
    };
    fetchParties();
  }, []);

  // 既存の調査結果の取得
  useEffect(() => {
    if (activeTab === 'update') {
      const fetchSurveys = async () => {
        try {
          setIsLoading(true);
          const response = await surveyApi.getAll();
          // 調査データだけをリストに追加
          const allSurveys = response.data.map(item => item.survey);
          setSurveys(allSurveys);
          setIsLoading(false);
        } catch (err) {
          setError('調査結果の取得に失敗しました');
          setIsLoading(false);
          console.error(err);
        }
      };
      fetchSurveys();
    }
  }, [activeTab]);

  // 調査詳細の取得
  const fetchSurveyDetails = async (surveyId: string) => {
    try {
      setIsLoading(true);
      const response = await surveyApi.getById(surveyId);
      setSelectedSurvey(response.data.survey);
      setSupportRates(response.data.supportRates);
      
      // フォームに値をセット
      setValue('survey.mediaOutlet', response.data.survey.mediaOutlet);
      setValue('survey.surveyStartDate', formatDateForInput(response.data.survey.surveyStartDate));
      setValue('survey.surveyEndDate', formatDateForInput(response.data.survey.surveyEndDate));

      // 支持率データをセット
      response.data.supportRates.forEach((rate) => {
        const index = parties.findIndex(party => party._id === rate.partyId);
        if (index !== -1) {
          setValue(`supportRates.${index}.partyId`, rate.partyId);
          setValue(`supportRates.${index}.supportRate`, rate.supportRate);
          setValue(`supportRates.${index}.rateChange`, rate.rateChange || 0);
        }
      });
      
      setIsLoading(false);
    } catch (err) {
      setError('調査詳細の取得に失敗しました');
      setIsLoading(false);
      console.error(err);
    }
  };

  // 日付フォーマット変換（YYYY-MM-DD形式に）
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 新規登録処理
  const handleCreate = async (data: SurveyFormData) => {
    try {
      setIsLoading(true);
      await surveyApi.create(data.survey, data.supportRates);
      reset();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      // toast通知はAPI内部で処理
    }
  };

  // 更新処理
  const handleUpdate = async (data: SurveyFormData) => {
    if (!selectedSurvey) {
      setError('更新する調査を選択してください');
      return;
    }

    try {
      setIsLoading(true);
      await surveyApi.update(selectedSurvey._id, data.survey, data.supportRates);
      setIsLoading(false);
      
      // 調査一覧を更新
      const response = await surveyApi.getAll();
      setSurveys(response.data.map(item => item.survey));
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      // toast通知はAPI内部で処理
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!selectedSurvey) {
      setError('削除する調査を選択してください');
      return;
    }

    try {
      setIsLoading(true);
      await surveyApi.deleteSurvey(selectedSurvey._id);
      
      // 削除後はフォームをリセットし、リストを更新
      reset();
      setSelectedSurvey(null);
      setSupportRates([]);
      
      // 調査一覧を更新
      const response = await surveyApi.getAll();
      setSurveys(response.data.map(item => item.survey));
      
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      // toast通知はAPI内部で処理
    }
  };

  // タブに応じた送信処理
  const onSubmit = (data: SurveyFormData) => {
    if (activeTab === 'create') {
      handleCreate(data);
    } else {
      handleUpdate(data);
    }
  };

  // 選択された調査が変更されたときの処理
  const handleSurveySelect = (surveyId: string) => {
    fetchSurveyDetails(surveyId);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="create">
            <PlusCircle className="mr-2 h-4 w-4" />
            新規登録
          </TabsTrigger>
          <TabsTrigger value="update">
            <RefreshCw className="mr-2 h-4 w-4" />
            更新・削除
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">メディア</label>
                <Input 
                  {...register('survey.mediaOutlet', { required: 'メディア名は必須です' })} 
                  placeholder="例: NHK、読売新聞"
                />
                {errors.survey?.mediaOutlet && (
                  <p className="text-sm text-red-500 mt-1">{errors.survey.mediaOutlet.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">調査開始日</label>
                  <Input 
                    {...register('survey.surveyStartDate', { required: '調査開始日は必須です' })} 
                    type="date" 
                  />
                  {errors.survey?.surveyStartDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.survey.surveyStartDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">調査終了日</label>
                  <Input 
                    {...register('survey.surveyEndDate', { required: '調査終了日は必須です' })} 
                    type="date" 
                  />
                  {errors.survey?.surveyEndDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.survey.surveyEndDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">支持率データ</h3>
              {parties.map((party, index) => (
                <div key={party._id} className="grid grid-cols-2 gap-4 p-2 border rounded hover:bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium">{party.name}</label>
                    <Input
                      {...register(`supportRates.${index}.supportRate`, { 
                        required: `${party.name}の支持率は必須です`,
                        min: { value: 0, message: '0以上の値を入力してください' },
                        max: { value: 100, message: '100以下の値を入力してください' }
                      })}
                      type="number"
                      step="0.1"
                      placeholder="支持率 (%)"
                    />
                    <Input
                      type="hidden"
                      {...register(`supportRates.${index}.partyId`)}
                      value={party._id}
                    />
                    {errors.supportRates && errors.supportRates[index]?.supportRate && (
                      <p className="text-sm text-red-500 mt-1">{errors.supportRates[index]?.supportRate?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">前回比</label>
                    <Input
                      {...register(`supportRates.${index}.rateChange`, {
                        min: { value: -100, message: '-100以上の値を入力してください' },
                        max: { value: 100, message: '100以下の値を入力してください' }
                      })}
                      type="number"
                      step="0.1"
                      placeholder="±0.0"
                    />
                    {errors.supportRates && errors.supportRates[index]?.rateChange && (
                      <p className="text-sm text-red-500 mt-1">{errors.supportRates[index]?.rateChange?.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  登録する
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="update">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">更新する調査を選択</label>
            <Select onValueChange={handleSurveySelect} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="調査を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {surveys.map((survey) => (
                  <SelectItem key={survey._id} value={survey._id}>
                    {survey.mediaOutlet} ({formatDateForInput(survey.surveyEndDate)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSurvey && (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">メディア</label>
                    <Input 
                      {...register('survey.mediaOutlet', { required: 'メディア名は必須です' })} 
                    />
                    {errors.survey?.mediaOutlet && (
                      <p className="text-sm text-red-500 mt-1">{errors.survey.mediaOutlet.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">調査開始日</label>
                      <Input 
                        {...register('survey.surveyStartDate', { required: '調査開始日は必須です' })} 
                        type="date" 
                      />
                      {errors.survey?.surveyStartDate && (
                        <p className="text-sm text-red-500 mt-1">{errors.survey.surveyStartDate.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium">調査終了日</label>
                      <Input 
                        {...register('survey.surveyEndDate', { required: '調査終了日は必須です' })} 
                        type="date" 
                      />
                      {errors.survey?.surveyEndDate && (
                        <p className="text-sm text-red-500 mt-1">{errors.survey.surveyEndDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">支持率データ</h3>
                  {parties.map((party, index) => {
                    const supportRate = supportRates.find(rate => rate.partyId === party._id);
                    return (
                      <div key={party._id} className="grid grid-cols-2 gap-4 p-2 border rounded hover:bg-gray-50">
                        <div>
                          <label className="block text-sm font-medium">{party.name}</label>
                          <Input
                            {...register(`supportRates.${index}.supportRate`, { 
                              required: `${party.name}の支持率は必須です`,
                              min: { value: 0, message: '0以上の値を入力してください' },
                              max: { value: 100, message: '100以下の値を入力してください' }
                            })}
                            type="number"
                            step="0.1"
                            placeholder="支持率 (%)"
                            defaultValue={supportRate?.supportRate}  // ここで使用
                          />
                          <Input
                            type="hidden"
                            {...register(`supportRates.${index}.partyId`)}
                            value={party._id}
                          />
                          {errors.supportRates && errors.supportRates[index]?.supportRate && (
                            <p className="text-sm text-red-500 mt-1">{errors.supportRates[index]?.supportRate?.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium">前回比</label>
                          <Input
                            {...register(`supportRates.${index}.rateChange`, {
                              min: { value: -100, message: '-100以上の値を入力してください' },
                              max: { value: 100, message: '100以下の値を入力してください' }
                            })}
                            type="number"
                            step="0.1"
                            placeholder="±0.0"
                          />
                          {errors.supportRates && errors.supportRates[index]?.rateChange && (
                            <p className="text-sm text-red-500 mt-1">{errors.supportRates[index]?.rateChange?.message}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        更新する
                      </>
                    )}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" disabled={isLoading} className="w-32">
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>調査データの削除</AlertDialogTitle>
                        <AlertDialogDescription>
                          この調査データを削除してもよろしいですか？この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>削除する</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </form>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};