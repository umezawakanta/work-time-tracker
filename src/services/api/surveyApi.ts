import { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { Survey, SupportRate, PoliticalParty } from "@/types/survey";
import { api, USE_MOCK_DATA } from "./apiConfig";
import { toast } from 'react-toastify';

const mockAxiosConfig: InternalAxiosRequestConfig = {
  headers: new AxiosHeaders({
    'Content-Type': 'application/json'
  }),
  method: 'get',
  url: '',
  data: undefined
};

const mockParties: PoliticalParty[] = [
  { _id: "1", name: "無所属", shortName: "無党派", colorCode: "#808080" },
  { _id: "2", name: "自由民主党", shortName: "自民", colorCode: "#00ff00" },
  { _id: "3", name: "立憲民主党", shortName: "立民", colorCode: "#ff0000" },
  { _id: "4", name: "日本維新の会", shortName: "維新", colorCode: "#ffa500" },
  { _id: "5", name: "公明党", shortName: "公明", colorCode: "#ffff00" }
];

// 複数の調査データをモック
const mockSurveys: SurveyApiResponse[] = [
  {
    message: "取得成功",
    survey: {
      _id: "1",
      mediaOutlet: "NHK",
      surveyStartDate: "2024-11-15",
      surveyEndDate: "2024-11-17"
    },
    supportRates: [
      { _id: "1", surveyId: "1", partyId: "1", supportRate: 31.6, rateChange: -3.2 },
      { _id: "2", surveyId: "1", partyId: "2", supportRate: 30.1, rateChange: -1.2 },
      { _id: "3", surveyId: "1", partyId: "3", supportRate: 10.5, rateChange: 0.8 },
      { _id: "4", surveyId: "1", partyId: "4", supportRate: 8.2, rateChange: -0.5 },
      { _id: "5", surveyId: "1", partyId: "5", supportRate: 5.3, rateChange: -0.1 }
    ]
  },
  {
    message: "取得成功",
    survey: {
      _id: "2",
      mediaOutlet: "読売新聞",
      surveyStartDate: "2024-11-10",
      surveyEndDate: "2024-11-12"
    },
    supportRates: [
      { _id: "6", surveyId: "2", partyId: "1", supportRate: 34.8, rateChange: 1.2 },
      { _id: "7", surveyId: "2", partyId: "2", supportRate: 31.3, rateChange: 0.5 },
      { _id: "8", surveyId: "2", partyId: "3", supportRate: 9.7, rateChange: -1.3 },
      { _id: "9", surveyId: "2", partyId: "4", supportRate: 8.7, rateChange: 0.2 },
      { _id: "10", surveyId: "2", partyId: "5", supportRate: 5.4, rateChange: 0.0 }
    ]
  }
];

interface SurveyApiResponse {
  message: string;
  survey: Survey;
  supportRates: SupportRate[];
}

export const surveyApi = {
  // すべての調査を取得
  getAll: (): Promise<AxiosResponse<SurveyApiResponse[]>> => {
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: mockSurveys,
          status: 200,
          statusText: "OK",
          headers: {},
          config: mockAxiosConfig
        })
      : api.get<SurveyApiResponse[]>("/surveys")
        .catch(error => {
          console.error('Error fetching surveys:', error);
          toast.error('調査データの取得に失敗しました');
          throw error;
        });
  },

  // IDで調査と支持率データを取得
  getById: (id: string): Promise<AxiosResponse<SurveyApiResponse>> => {
    // モックの場合は配列から該当IDの調査を探す
    if (USE_MOCK_DATA) {
      const survey = mockSurveys.find(s => s.survey._id === id);
      if (survey) {
        return Promise.resolve({
          data: survey,
          status: 200,
          statusText: "OK",
          headers: {},
          config: mockAxiosConfig
        });
      } else {
        return Promise.reject(new Error('調査が見つかりません'));
      }
    } else {
      return api.get<SurveyApiResponse>(`/surveys/${id}`)
        .catch(error => {
          console.error(`Error fetching survey with ID ${id}:`, error);
          toast.error('調査データの取得に失敗しました');
          throw error;
        });
    }
  },

  // 最新の調査結果を取得
  getLatest: (): Promise<AxiosResponse<SurveyApiResponse>> => {
    if (USE_MOCK_DATA) {
      // モックの場合、最初の調査を最新として返す
      return Promise.resolve({
        data: mockSurveys[0],
        status: 200,
        statusText: "OK",
        headers: {},
        config: mockAxiosConfig
      });
    } else {
      return api.get<SurveyApiResponse>("/surveys/latest")
        .catch(error => {
          console.error('Error fetching latest survey:', error);
          toast.error('最新の調査データの取得に失敗しました');
          throw error;
        });
    }
  },

  // 新規調査と支持率データを作成
  create: (
    survey: Omit<Survey, "_id">, 
    supportRates: Omit<SupportRate, "_id" | "surveyId">[]
  ): Promise<AxiosResponse<SurveyApiResponse>> => {
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "調査結果が正常に登録されました",
            survey: { ...survey, _id: String(Math.floor(Math.random() * 1000)) },
            supportRates: supportRates.map((rate, index) => ({
              ...rate,
              _id: String(Math.floor(Math.random() * 1000) + index),
              surveyId: String(Math.floor(Math.random() * 1000))
            }))
          },
          status: 201,
          statusText: "Created",
          headers: {},
          config: mockAxiosConfig
        })
      : api.post<SurveyApiResponse>("/surveys", { survey, supportRates })
        .then(response => {
          toast.success(response.data.message || '調査結果が正常に登録されました');
          return response;
        })
        .catch(error => {
          console.error('Error creating survey:', error);
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`エラー: ${error.response.data.message}`);
          } else {
            toast.error('調査結果の登録に失敗しました');
          }
          throw error;
        });
  },

  // 調査と支持率データを更新
  update: (
    surveyId: string,
    survey: Omit<Survey, "_id">,
    supportRates: Omit<SupportRate, "_id" | "surveyId">[]
  ): Promise<AxiosResponse<SurveyApiResponse>> => {
    if (USE_MOCK_DATA) {
      // モックの場合、成功レスポンスを返す
      return Promise.resolve({
        data: {
          message: "調査結果が正常に更新されました",
          survey: { ...survey, _id: surveyId },
          supportRates: supportRates.map((rate, index) => ({
            ...rate,
            _id: String(Math.floor(Math.random() * 1000) + index),
            surveyId: surveyId
          }))
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: mockAxiosConfig
      });
    } else {
      return api.put<SurveyApiResponse>(`/surveys/${surveyId}`, { survey, supportRates })
        .then(response => {
          toast.success(response.data.message || '調査結果が正常に更新されました');
          return response;
        })
        .catch(error => {
          console.error(`Error updating survey with ID ${surveyId}:`, error);
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`エラー: ${error.response.data.message}`);
          } else {
            toast.error('調査結果の更新に失敗しました');
          }
          throw error;
        });
    }
  },

  // 調査と関連する支持率データを削除
  deleteSurvey: (surveyId: string): Promise<AxiosResponse<{ message: string }>> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { message: '調査データが正常に削除されました' },
        status: 200,
        statusText: "OK",
        headers: {},
        config: mockAxiosConfig
      });
    } else {
      return api.delete<{ message: string }>(`/surveys/${surveyId}`)
        .then(response => {
          toast.success(response.data.message || '調査データが正常に削除されました');
          return response;
        })
        .catch(error => {
          console.error(`Error deleting survey with ID ${surveyId}:`, error);
          toast.error('調査データの削除に失敗しました');
          throw error;
        });
    }
  },

  // 政党一覧を取得
  getParties: (): Promise<AxiosResponse<PoliticalParty[]>> => {
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: mockParties,
          status: 200,
          statusText: "OK",
          headers: {},
          config: mockAxiosConfig
        })
      : api.get<PoliticalParty[]>("/parties")
        .catch(error => {
          console.error('Error fetching parties:', error);
          toast.error('政党データの取得に失敗しました');
          throw error;
        });
  }
};