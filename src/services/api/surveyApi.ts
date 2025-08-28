import { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Survey, SupportRate, PoliticalParty } from '@/types/survey';
import { api } from './apiConfig';
import { toast } from 'react-toastify';

const mockAxiosConfig: InternalAxiosRequestConfig = {
  headers: new AxiosHeaders({
    'Content-Type': 'application/json',
  }),
  method: 'get',
  url: '',
  data: undefined,
};

// モックデータは廃止

// モックデータは廃止

interface SurveyApiResponse {
  message: string;
  survey: Survey;
  supportRates: SupportRate[];
}

export const surveyApi = {
  // すべての調査を取得
  getAll: (): Promise<AxiosResponse<SurveyApiResponse[]>> => {
    return api.get<SurveyApiResponse[]>('/surveys').catch((error) => {
      console.error('Error fetching surveys:', error);
      toast.error('調査データの取得に失敗しました');
      throw error;
    });
  },

  // IDで調査と支持率データを取得
  getById: (id: string): Promise<AxiosResponse<SurveyApiResponse>> => {
    return api.get<SurveyApiResponse>(`/surveys/${id}`).catch((error) => {
      console.error(`Error fetching survey with ID ${id}:`, error);
      toast.error('調査データの取得に失敗しました');
      throw error;
    });
  },

  // 最新の調査結果を取得
  getLatest: (): Promise<AxiosResponse<SurveyApiResponse>> => {
    return api.get<SurveyApiResponse>('/surveys/latest').catch((error) => {
      console.error('Error fetching latest survey:', error);
      toast.error('最新の調査データの取得に失敗しました');
      throw error;
    });
  },

  // 新規調査と支持率データを作成
  create: (
    survey: Omit<Survey, '_id'>,
    supportRates: Omit<SupportRate, '_id' | 'surveyId'>[]
  ): Promise<AxiosResponse<SurveyApiResponse>> => {
    return api
      .post<SurveyApiResponse>('/surveys', { survey, supportRates })
      .then((response) => {
        toast.success(response.data.message || '調査結果が正常に登録されました');
        return response;
      })
      .catch((error) => {
        console.error('Error creating survey:', error);
        if (
          (error as any).response &&
          (error as any).response.data &&
          (error as any).response.data.message
        ) {
          toast.error(`エラー: ${(error as any).response.data.message}`);
        } else {
          toast.error('調査結果の登録に失敗しました');
        }
        throw error;
      });
  },

  // 調査と支持率データを更新
  update: (
    surveyId: string,
    survey: Omit<Survey, '_id'>,
    supportRates: Omit<SupportRate, '_id' | 'surveyId'>[]
  ): Promise<AxiosResponse<SurveyApiResponse>> => {
    return api
      .put<SurveyApiResponse>(`/surveys/${surveyId}`, { survey, supportRates })
      .then((response) => {
        toast.success(response.data.message || '調査結果が正常に更新されました');
        return response;
      })
      .catch((error) => {
        console.error(`Error updating survey with ID ${surveyId}:`, error);
        if (
          (error as any).response &&
          (error as any).response.data &&
          (error as any).response.data.message
        ) {
          toast.error(`エラー: ${(error as any).response.data.message}`);
        } else {
          toast.error('調査結果の更新に失敗しました');
        }
        throw error;
      });
  },

  // 調査と関連する支持率データを削除
  deleteSurvey: (surveyId: string): Promise<AxiosResponse<{ message: string }>> => {
    return api
      .delete<{ message: string }>(`/surveys/${surveyId}`)
      .then((response) => {
        toast.success(response.data.message || '調査データが正常に削除されました');
        return response;
      })
      .catch((error) => {
        console.error(`Error deleting survey with ID ${surveyId}:`, error);
        toast.error('調査データの削除に失敗しました');
        throw error;
      });
  },

  // 政党一覧を取得
  getParties: (): Promise<AxiosResponse<PoliticalParty[]>> => {
    return api.get<PoliticalParty[]>('/parties').catch((error) => {
      console.error('Error fetching parties:', error);
      toast.error('政党データの取得に失敗しました');
      throw error;
    });
  },
};
