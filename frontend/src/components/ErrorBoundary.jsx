import React from 'react';
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl shadow-2xl text-center space-y-5 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Đã Xảy Ra Sự Cố Hiển Thị
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hệ thống đã tự động ngăn chặn sự cố sập trang. Vui lòng bấm bên dưới để quay lại.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-rose-600 dark:text-rose-400 text-left overflow-x-auto max-h-32">
            {this.state.error?.toString()}
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                if (this.props.onReset) this.props.onReset();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Quay Lại Danh Mục
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
