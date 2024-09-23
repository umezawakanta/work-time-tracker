import React, { ReactNode } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import WorkTimeEntryForm from "../WorkTimeEntryForm";
import workTimeReducer from "../../../store/workTimeSlice";

// APIのモック
jest.mock("../../../services/api", () => ({
  workTimeApi: {
    create: jest.fn(),
  },
}));

const createMockStore = () =>
  configureStore({
    reducer: {
      workTime: workTimeReducer,
    },
  });

// テスト用のラッパーコンポーネントの型定義
interface TestWrapperProps {
  children: ReactNode;
}

// テスト用のラッパーコンポーネント
const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => (
  <Provider store={createMockStore()}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe("WorkTimeEntryForm", () => {
  beforeEach(() => {
    // タイマーのモック
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders WorkTimeEntryForm component", () => {
    render(<WorkTimeEntryForm />, { wrapper: TestWrapper });
    expect(screen.getByText("作業時間トラッカー")).toBeInTheDocument();
    expect(screen.getByText("タイムトラッカー")).toBeInTheDocument();
    expect(screen.getByText("作業時間の記録")).toBeInTheDocument();
  });

  test("starts and stops timer", () => {
    render(<WorkTimeEntryForm />, { wrapper: TestWrapper });
    const startButton = screen.getByText("開始");
    fireEvent.click(startButton);

    act(() => {
      jest.advanceTimersByTime(5000); // 5秒進める
    });

    expect(screen.getByText("00:00:05")).toBeInTheDocument();

    const pauseButton = screen.getByText("一時停止");
    fireEvent.click(pauseButton);

    act(() => {
      jest.advanceTimersByTime(3000); // さらに3秒進める
    });

    // タイマーが一時停止しているので、時間は変わらないはず
    expect(screen.getByText("00:00:05")).toBeInTheDocument();
  });

  test("resets timer", () => {
    render(<WorkTimeEntryForm />, { wrapper: TestWrapper });
    const startButton = screen.getByText("開始");
    fireEvent.click(startButton);

    act(() => {
      jest.advanceTimersByTime(10000); // 10秒進める
    });

    const resetButton = screen.getByText("リセット");
    fireEvent.click(resetButton);

    expect(screen.getByText("00:00:00")).toBeInTheDocument();
  });

  test("submits form with correct data", async () => {
    const user = userEvent.setup();
    render(<WorkTimeEntryForm />, { wrapper: TestWrapper });

    // フォームに入力
    await user.type(
      screen.getByLabelText("プロジェクト名"),
      "テストプロジェクト"
    );
    await user.type(screen.getByLabelText("作業内容"), "テスト作業");

    // タイマーを開始して5秒進める
    fireEvent.click(screen.getByText("開始"));
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // フォームを送信
    await user.click(screen.getByText("記録を保存"));

    // ここでReduxストアの状態を確認するなどの追加の検証を行うことができます
    // 例: expect(store.getState().workTime.entries).toHaveLength(1);
  });
});
