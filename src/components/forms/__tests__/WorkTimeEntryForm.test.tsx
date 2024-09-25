import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import workTimeReducer from "../../../store/workTimeSlice";
import WorkTimeEntryForm from "../WorkTimeEntryForm";

const store = configureStore({
  reducer: {
    workTime: workTimeReducer,
  },
});

test("renders WorkTimeEntryForm", () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <WorkTimeEntryForm />
      </BrowserRouter>
    </Provider>
  );

  expect(screen.getByText("作業時間の記録")).toBeInTheDocument();
  expect(screen.getByLabelText("プロジェクト名")).toBeInTheDocument();
  expect(screen.getByLabelText("作業内容")).toBeInTheDocument();
  expect(screen.getByLabelText("開始時間")).toBeInTheDocument();
  expect(screen.getByLabelText("終了時間")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "記録を保存" })
  ).toBeInTheDocument();
});

// Add more tests for form submission, validation, etc.
