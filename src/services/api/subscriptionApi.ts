import { AxiosResponse } from "axios";
import { Subscription } from "@/types/subscription";
import { api, USE_MOCK_DATA } from "./apiConfig";

const mockSubscriptionData: Subscription[] = [
  {
    _id: "1",
    name: "Netflix",
    billingDate: "2024/01/01",
    type: "エンターテイメント",
    amount: 1490,
  },
  {
    _id: "2",
    name: "Spotify",
    billingDate: "2024/01/15",
    type: "音楽",
    amount: 980,
  },
];

interface SubscriptionApiResponse {
  message: string;
  subscription: Subscription;
}

export const subscriptionApi = {
  getAll: (): Promise<AxiosResponse<Subscription[]>> => {
    console.log("Fetching all subscription entries");
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockSubscriptionData } as AxiosResponse<
          Subscription[]
        >)
      : api.get<Subscription[]>("/subscription").then((response) => {
          console.log("Received subscription entries:", response.data);
          return response;
        });
  },
  create: (
    entry: Omit<Subscription, "_id">
  ): Promise<AxiosResponse<SubscriptionApiResponse>> => {
    console.log("Creating new subscription entry:", entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "サブスクリプション情報が正常に記録されました",
            subscription: {
              ...entry,
              _id: String(mockSubscriptionData.length + 1),
            },
          },
        } as AxiosResponse<SubscriptionApiResponse>)
      : api
          .post<SubscriptionApiResponse>("/subscription", entry)
          .then((response) => {
            console.log("Created subscription entry:", response.data);
            return response;
          });
  },
  update: (
    _id: string,
    entry: Partial<Subscription>
  ): Promise<AxiosResponse<SubscriptionApiResponse>> => {
    console.log("Updating subscription entry:", _id, entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "サブスクリプション情報が正常に更新されました",
            subscription: {
              ...mockSubscriptionData.find((e) => e._id === _id),
              ...entry,
              _id: _id,
            },
          },
        } as AxiosResponse<SubscriptionApiResponse>)
      : api
          .put<SubscriptionApiResponse>(`/subscription/${_id}`, entry)
          .then((response) => {
            console.log("Updated subscription entry:", response.data);
            return response;
          });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log("Deleting subscription entry:", _id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api
          .delete(`/subscription/${_id}`)
          .then((response) => {
            console.log("Deleted subscription entry:", _id);
            return response;
          })
          .catch((error) => {
            console.error("Error deleting subscription entry:", error);
            if (error.response) {
              console.error("Server responded with:", error.response.data);
            }
            throw error;
          });
  },
};
