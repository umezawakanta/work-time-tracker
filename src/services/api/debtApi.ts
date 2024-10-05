// src/api/debtApi.ts
import { AxiosResponse } from "axios";
import { DebtEntry } from "../../types/debtEntry";
import { api, USE_MOCK_DATA } from "./apiConfig";

const mockDebtData: DebtEntry[] = [
  {
    _id: "1",
    date: new Date().toISOString().split("T")[0],
    value: 500000,
    description: "住宅ローン",
    account: "銀行A",
  },
  {
    _id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    value: 100000,
    description: "クレジットカード",
    account: "カード会社B",
  },
];

interface DebtApiResponse {
  message: string;
  debt: DebtEntry;
}

export const debtApi = {
  getAll: (): Promise<AxiosResponse<DebtEntry[]>> => {
    console.log("Fetching all debt entries");
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockDebtData } as AxiosResponse<DebtEntry[]>)
      : api.get<DebtEntry[]>("/debt").then((response) => {
          console.log("Received debt entries:", response.data);
          return response;
        });
  },
  create: (
    entry: Omit<DebtEntry, "_id">
  ): Promise<AxiosResponse<DebtApiResponse>> => {
    console.log("Creating new debt entry:", entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "負債情報が正常に記録されました",
            debt: { ...entry, _id: String(mockDebtData.length + 1) },
          },
        } as AxiosResponse<DebtApiResponse>)
      : api.post<DebtApiResponse>("/debt", entry).then((response) => {
          console.log("Created debt entry:", response.data);
          return response;
        });
  },
  update: (
    _id: string,
    entry: Partial<DebtEntry>
  ): Promise<AxiosResponse<DebtApiResponse>> => {
    console.log("Updating debt entry:", _id, entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "負債情報が正常に更新されました",
            debt: {
              ...mockDebtData.find((e) => e._id === _id),
              ...entry,
              _id: _id,
            },
          },
        } as AxiosResponse<DebtApiResponse>)
      : api.put<DebtApiResponse>(`/debt/${_id}`, entry).then((response) => {
          console.log("Updated debt entry:", response.data);
          return response;
        });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log("Deleting debt entry:", _id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api
          .delete(`/debt/${_id}`)
          .then((response) => {
            console.log("Deleted debt entry:", _id);
            return response;
          })
          .catch((error) => {
            console.error("Error deleting debt entry:", error);
            if (error.response) {
              console.error("Server responded with:", error.response.data);
            }
            throw error;
          });
  },
};
