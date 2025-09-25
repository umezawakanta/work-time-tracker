import { useState } from 'react';

// Error types for better error handling
interface ErrorReport {
  title: string;
  content: string;
  errorDetails: string;
  userAgent: string;
  timestamp: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: string;
}
import { ErrorInfo } from '../types/errorTypes';
import { ApiErrorInfo } from '../utils/apiErrorHandler';

export const useErrorHandling = () => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentError, setCurrentError] = useState<Error | null>(null);
  const [showSimpleErrorModal, setShowSimpleErrorModal] = useState(false);
  const [errorModalButtonPosition, setErrorModalButtonPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [showUpdateRequestModal, setShowUpdateRequestModal] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);

  const handleErrorReport = (event: CustomEvent) => {
    const errorInfo = event.detail as ErrorInfo;
    setCurrentError(new Error(errorInfo.message));
    setShowErrorModal(true);
  };

  const handleApiErrorReport = (errorInfo: ApiErrorInfo) => {
    console.log('useErrorHandling - API error report received:', errorInfo);
    setCurrentError(new Error(errorInfo.message));
    setShowErrorModal(true);
  };

  const handleSimpleErrorReport = async (report: ErrorReport) => {
    try {
      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        console.log('Error report submitted successfully');
        setShowSimpleErrorModal(false);
      } else {
        const errorData: ApiError = await response.json().catch(() => ({
          code: 'SUBMISSION_FAILED',
          message: 'Error report submission failed',
          details: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(`Failed to submit error report: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleUpdateRequest = async (updateRequest: {
    title: string;
    content: string;
    category: string;
    priority: string;
  }) => {
    try {
      const response = await fetch('/api/update-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateRequest),
      });

      if (response.ok) {
        console.log('Update request submitted successfully');
        setShowUpdateRequestModal(false);
      } else {
        console.error('Failed to submit update request');
      }
    } catch (error) {
      console.error('Error submitting update request:', error);
    }
  };

  const handleBugReport = async (bugReport: {
    title: string;
    content: string;
    category: string;
    severity: string;
    steps: string;
    expectedBehavior: string;
    actualBehavior: string;
  }) => {
    try {
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bugReport),
      });

      if (response.ok) {
        console.log('Bug report submitted successfully');
        setShowBugReportModal(false);
      } else {
        console.error('Failed to submit bug report');
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
    }
  };

  return {
    showErrorModal,
    setShowErrorModal,
    currentError,
    setCurrentError,
    showSimpleErrorModal,
    setShowSimpleErrorModal,
    errorModalButtonPosition,
    setErrorModalButtonPosition,
    showUpdateRequestModal,
    setShowUpdateRequestModal,
    showBugReportModal,
    setShowBugReportModal,
    handleErrorReport,
    handleApiErrorReport,
    handleSimpleErrorReport,
    handleUpdateRequest,
    handleBugReport,
  };
};
