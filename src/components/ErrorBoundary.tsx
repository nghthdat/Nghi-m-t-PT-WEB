import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Last-resort safety net: catches unexpected render/runtime errors anywhere
// in the tree (e.g. during checkout) and shows a recoverable message instead
// of letting React unmount everything into a blank white page.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-[#EAE0D5] shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B2118]">Đã có lỗi xảy ra</h2>
              <p className="text-xs text-[#6B5D4F] mt-1.5">
                Rất tiếc, trang gặp sự cố ngoài dự kiến. Vui lòng tải lại trang để tiếp tục sử dụng.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 inline-flex items-center gap-2 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
