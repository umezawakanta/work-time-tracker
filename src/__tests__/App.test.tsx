import "@testing-library/jest-dom";
import React, { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "../App";
import workTimeReducer from "../store/workTimeSlice";

// APIのモック
const mockWorkTimeApi = {
  create: jest.fn(),
  getAll: jest.fn(),
};

jest.mock("../services/api", () => ({
  workTimeApi: mockWorkTimeApi,
}));

const createMockStore = () =>
  configureStore({
    reducer: {
      workTime: workTimeReducer,
    },
  });

interface TestWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialEntries = ["/"],
}) => (
  <Provider store={createMockStore()}>
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  </Provider>
);

describe("App", () => {
  test("renders home page by default", () => {
    render(<App />, { wrapper: TestWrapper });
    expect(
      screen.getByText("作業時間トラッカーへようこそ")
    ).toBeInTheDocument();
  });

  test("renders work time entry page", () => {
    render(<App />, {
      wrapper: (props) => (
        <TestWrapper {...props} initialEntries={["/work-time"]} />
      ),
    });
    expect(screen.getByText("作業時間トラッカー")).toBeInTheDocument();
    expect(screen.getByText("タイムトラッカー")).toBeInTheDocument();
  });

  test("renders reports page", () => {
    render(<App />, {
      wrapper: (props) => (
        <TestWrapper {...props} initialEntries={["/reports"]} />
      ),
    });
    expect(screen.getByText("作業時間レポート")).toBeInTheDocument();
  });

  test("renders not found page for invalid route", () => {
    render(<App />, {
      wrapper: (props) => (
        <TestWrapper {...props} initialEntries={["/invalid-route"]} />
      ),
    });
    expect(
      screen.getByText("404 - ページが見つかりません")
    ).toBeInTheDocument();
  });
});
