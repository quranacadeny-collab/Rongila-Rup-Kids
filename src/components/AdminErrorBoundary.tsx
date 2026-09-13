import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, LifeBuoy } from 'lucide-react';

interface Props {
  tabKey: string;
  onResetTab?: () => void;
  children: ReactNode;
  lang?: 'bn' | 'en';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Panel caught runtime error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.tabKey !== this.props.tabKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isBn = this.props.lang !== 'en';
      return (
        <div className="max-w-3xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl border-2 border-rose-200 shadow-xl space-y-6 animate-fade-in text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-800 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif font-extrabold text-xl text-stone-900">
              {isBn 
                ? 'এই ফিচারটিতে সাময়িক লোডিং সমস্যা হয়েছে' 
                : 'Temporary loading issue in this section'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              {isBn 
                ? 'আপনার শপের ডাটা সম্পূর্ণ নিরাপদ রয়েছে। নিচের বোতাম চেপে পুনরায় চেষ্টা করুন অথবা অন্য সেকশনে যান।'
                : 'Your store data is safe. Please retry or navigate to another section using the sidebar.'}
            </p>
          </div>

          {this.state.error && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-left max-w-lg mx-auto">
              <span className="text-[10px] font-mono font-bold text-stone-400 block mb-1 uppercase tracking-wider">
                Error Details:
              </span>
              <p className="text-[11px] font-mono text-rose-900 break-words line-clamp-3">
                {this.state.error.message || 'Unknown render exception'}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 bg-rose-950 hover:bg-rose-900 text-amber-300 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} />
              <span>{isBn ? 'পুনরায় চেষ্টা করুন' : 'Retry This Tab'}</span>
            </button>

            {this.props.onResetTab && (
              <button
                onClick={this.props.onResetTab}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 cursor-pointer transition-all flex items-center gap-2"
              >
                <Home size={14} />
                <span>{isBn ? 'প্রধান ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <LifeBuoy size={14} />
              <span>{isBn ? 'পুরো পেজ রিফ্রেশ' : 'Reload Page'}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
