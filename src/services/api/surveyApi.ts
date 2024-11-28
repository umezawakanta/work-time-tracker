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
  { _id: "2", name: "自由民主党", shortName: "自民", colorCode: "#00ff00" }
];

const mockData: SurveyApiResponse = {
  message: "取得成功",
  survey: {
    _id: "1",
    mediaOutlet: "NHK",
    surveyStartDate: "2024-11-15",
    surveyEndDate: "2024-11-17"
  },
  supportRates: [
    { _id: "1", surveyId: "1", partyId: "1", supportRate: 31.6, rateChange: -3.2 },
    { _id: "2", surveyId: "1", partyId: "2", supportRate: 30.1, rateChange: -1.2 }
  ]
};

interface SurveyApiResponse {
  message: string;
  survey: Survey;
  supportRates: SupportRate[];
}

export const surveyApi = {
  getAll: (): Promise<AxiosResponse<SurveyApiResponse[]>> => {
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: [mockData],
          status: 200,
          statusText: "OK",
          headers: {},
          config: mockAxiosConfig
        })
      : api.get<SurveyApiResponse[]>("/surveys");
  },

  create: (survey: Omit<Survey, "_id">, supportRates: Omit<SupportRate, "_id" | "surveyId">[]): Promise<AxiosResponse<SurveyApiResponse>> => {
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: mockData,
          status: 201,
          statusText: "Created",
          headers: {},
          config: mockAxiosConfig
        })
      : api.post<SurveyApiResponse>("/surveys", { survey, supportRates })
        .then(response => {
          toast.success(response.data.message);
          return response;
        })
        .catch(error => {
          console.error('Error creating/updating survey:', error);
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`エラー: ${error.response.data.message}`);
          } else {
            toast.error('調査結果の登録/更新に失敗しました');
          }
          throw error;
        });
  },

  getParties: (): Promise<AxiosResponse<PoliticalParty[]>> => {
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: mockParties,
          status: 200,
          statusText: "OK",
          headers: {},
          config: mockAxiosConfig
        })
      : api.get<PoliticalParty[]>("/api/parties");
  },

  deleteSurvey: (surveyId: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/surveys/${surveyId}`)
      .then(response => {
        toast.success('調査データが正常に削除されました');
        return response;
      })
      .catch(error => {
        console.error('Error deleting survey:', error);
        toast.error('調査データの削除に失敗しました');
        throw error;
      });
  }
};

