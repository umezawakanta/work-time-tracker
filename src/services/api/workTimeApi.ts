// src/api/workTimeApi.ts
import { AxiosResponse } from "axios";
import { WorkTimeEntry } from "../../types/workTimeEntry";
import { api, USE_MOCK_DATA } from "./apiConfig";

const mockWorkTimeData: WorkTimeEntry[] = [
  {
    _id: "1",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    duration: 28800,
    projectName: "Project A",
    description: "Worked on feature X",
    userId: "mock-user-id", // ここにユーザーIDを追加
  },
  {
    _id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "18:00",
    duration: 28800,
    projectName: "Project B",
    description: "Fixed bug Y",
    userId: "mock-user-id", // ここにユーザーIDを追加
  },
];

interface WorkTimeApiResponse {
  message: string;
  workTime: WorkTimeEntry;
}

export const workTimeApi = {
  getAll: (): Promise<AxiosResponse<WorkTimeEntry[]>> => {
    console.log("Fetching all work time entries");
    return USE_MOCK_DATA
      ? Promise.resolve({ data: mockWorkTimeData } as AxiosResponse<
          WorkTimeEntry[]
        >)
      : api.get<WorkTimeEntry[]>("/worktime").then((response) => {
          console.log("Received work time entries:", response.data);
          return response;
        });
  },
  create: (
    entry: Omit<WorkTimeEntry, "_id">
  ): Promise<AxiosResponse<WorkTimeApiResponse>> => {
    console.log("Creating new work time entry:", entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "作業時間が正常に記録されました",
            workTime: { ...entry, _id: String(mockWorkTimeData.length + 1) },
          },
        } as AxiosResponse<WorkTimeApiResponse>)
      : api.post<WorkTimeApiResponse>("/worktime", entry).then((response) => {
          console.log("Created work time entry:", response.data);
          return response;
        });
  },
  update: (
    _id: string,
    entry: Partial<WorkTimeEntry>
  ): Promise<AxiosResponse<WorkTimeApiResponse>> => {
    console.log("Updating work time entry:", _id, entry);
    return USE_MOCK_DATA
      ? Promise.resolve({
          data: {
            message: "作業時間が正常に更新されました",
            workTime: {
              ...mockWorkTimeData.find((e) => e._id === _id),
              ...entry,
              _id: _id,
            },
          },
        } as AxiosResponse<WorkTimeApiResponse>)
      : api
          .put<WorkTimeApiResponse>(`/worktime/${_id}`, entry)
          .then((response) => {
            console.log("Updated work time entry:", response.data);
            return response;
          });
  },
  delete: (_id: string): Promise<AxiosResponse<void>> => {
    console.log("Deleting work time entry:", _id);
    return USE_MOCK_DATA
      ? Promise.resolve({} as AxiosResponse<void>)
      : api.delete(`/worktime/${_id}`).then((response) => {
          console.log("Deleted work time entry:", _id);
          return response;
        });
  },
};
