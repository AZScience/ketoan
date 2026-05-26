import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ quản trị viên.";
      
      try {
        // Check if the error is a FirestoreErrorInfo JSON string
        const errorData = JSON.parse(this.state.error?.message || '');
        if (errorData.error && errorData.operationType) {
          errorMessage = `Lỗi cơ sở dữ liệu (${errorData.operationType}): ${errorData.error}`;
        }
      } catch (e) {
        // Not a JSON string, use default or the error message itself
        if (this.state.error?.message) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
            <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto flex items-center justify-center mb-6 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Rất tiếc!</h2>
            <p className="text-slate-500 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <RefreshCw size={20} />
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
