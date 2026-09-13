import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDrive, 
  CloudUpload, 
  FileText, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Download, 
  Database, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  FolderPlus,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  listDriveFiles, 
  uploadTextToDrive, 
  uploadFileBlobToDrive, 
  deleteDriveFile, 
  getDriveQuota, 
  DriveFile 
} from '../lib/googleDrive';
import { Product, Order, Language } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  products: Product[];
  orders: Order[];
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  lang,
  products,
  orders
}) => {
  if (!isOpen) return null;

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Drive state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quota, setQuota] = useState<{ limit: string; usage: string }>({ limit: '0', usage: '0' });

  // Action status
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab: 'files' | 'export_catalog' | 'export_orders' | 'upload'
  const [activeTab, setActiveTab] = useState<'files' | 'export_catalog' | 'export_orders' | 'upload'>('files');

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Drive Files when logged in or searching
  const fetchFiles = async () => {
    if (!token) return;
    setLoadingFiles(true);
    try {
      const driveFiles = await listDriveFiles(token, searchQuery);
      setFiles(driveFiles);
      const q = await getDriveQuota(token);
      setQuota(q);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        type: 'error', 
        text: lang === 'bn' ? 'ড্রাইভ ফাইল লোড করতে সমস্যা হয়েছে।' : 'Failed to fetch files from Google Drive.' 
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({
          type: 'success',
          text: lang === 'bn' ? 'গুগল ড্রাইভে সফলভাবে সাইন ইন করা হয়েছে!' : 'Signed in with Google Drive successfully!'
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: lang === 'bn' ? 'সাইন ইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' : 'Google Drive Sign-In failed. Please try again.'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setFiles([]);
    setStatusMessage({
      type: 'success',
      text: lang === 'bn' ? 'সাইন আউট করা হয়েছে।' : 'Signed out successfully.'
    });
  };

  // Export Store Product Catalog to Drive
  const handleExportCatalog = async () => {
    if (!token) return;
    setUploading(true);
    setStatusMessage(null);
    try {
      const catalogData = {
        storeName: 'রঙিলা রূপ (Rongila Rup)',
        exportedAt: new Date().toISOString(),
        totalProducts: products.length,
        products: products
      };

      const fileName = `RongilaRup_Products_Catalog_${new Date().toISOString().slice(0, 10)}.json`;
      const result = await uploadTextToDrive(token, fileName, JSON.stringify(catalogData, null, 2));

      setStatusMessage({
        type: 'success',
        text: lang === 'bn' 
          ? `পণ্য ক্যাটালগ Google Drive এ সেভ হয়েছে! (ফাইল: ${result.name})` 
          : `Product Catalog exported to Google Drive! (${result.name})`
      });
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: lang === 'bn' ? 'গুগল ড্রাইভে ফাইল আপলোড ব্যর্থ হয়েছে।' : 'Failed to upload Catalog to Google Drive.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Export Order Records to Drive
  const handleExportOrders = async () => {
    if (!token) return;
    setUploading(true);
    setStatusMessage(null);
    try {
      const ordersData = {
        storeName: 'রঙিলা রূপ (Rongila Rup)',
        exportedAt: new Date().toISOString(),
        totalOrders: orders.length,
        totalRevenue: orders.reduce((acc, o) => acc + o.totalAmount, 0),
        orders: orders
      };

      const fileName = `RongilaRup_Orders_Export_${new Date().toISOString().slice(0, 10)}.json`;
      const result = await uploadTextToDrive(token, fileName, JSON.stringify(ordersData, null, 2));

      setStatusMessage({
        type: 'success',
        text: lang === 'bn' 
          ? `অর্ডার হিস্ট্রি Google Drive এ সেভ হয়েছে! (ফাইল: ${result.name})` 
          : `Orders History exported to Google Drive! (${result.name})`
      });
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: lang === 'bn' ? 'অর্ডার ফাইল ড্রাইভে সেভ করা যায়নি।' : 'Failed to save orders to Google Drive.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Upload Custom File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setStatusMessage(null);
    try {
      const result = await uploadFileBlobToDrive(token, file);
      setStatusMessage({
        type: 'success',
        text: lang === 'bn' 
          ? `ফাইল '${result.name}' সফলভাবে গুগল ড্রাইভে আপলোড করা হয়েছে!` 
          : `File '${result.name}' uploaded to Google Drive!`
      });
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: lang === 'bn' ? 'ফাইল আপলোড ব্যর্থ হয়েছে।' : 'File upload failed.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete Drive File (WITH EXPLICIT MANDATORY USER CONFIRMATION)
  const handleDeleteFile = async (file: DriveFile) => {
    if (!token) return;

    // Explicit confirmation dialog (Mandatory per Google Workspace Integration guidelines)
    const confirmed = window.confirm(
      lang === 'bn'
        ? `আপনি কি নিশ্চিত যে Google Drive থেকে '${file.name}' ফাইলটি স্থায়ীভাবে মুছে ফেলতে চান?`
        : `Are you sure you want to permanently delete '${file.name}' from Google Drive? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteDriveFile(token, file.id);
      setStatusMessage({
        type: 'success',
        text: lang === 'bn' ? `'${file.name}' ফাইলটি ড্রাইভ থেকে মুছে ফেলা হয়েছে।` : `'${file.name}' deleted from Google Drive.`
      });
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: lang === 'bn' ? 'ফাইল মুছতে সমস্যা হয়েছে।' : 'Failed to delete file from Google Drive.'
      });
    }
  };

  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return 'N/A';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-stone-50 rounded-3xl shadow-2xl overflow-hidden border border-amber-500/30 my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950 text-amber-50 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-rose-500 text-rose-950 rounded-xl font-bold">
              <HardDrive size={22} />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-amber-100 flex items-center gap-2">
                <span>{lang === 'bn' ? 'গুগল ড্রাইভ ইন্টিগ্রেশন' : 'Google Drive Workspace Integration'}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] rounded-full uppercase font-mono">OAuth Active</span>
              </h3>
              <p className="text-[11px] text-amber-300/70">
                {lang === 'bn' ? 'স্টোর ইনভেন্টরি, ব্যাকআপ ও রিসোর্স গুগল ড্রাইভে সংরক্ষণ করুন' : 'Backup catalog, export order history & manage Google Drive files'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-900 text-amber-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Auth status bar / Sign In banner */}
        <div className="bg-amber-950/90 px-6 py-3 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100 shrink-0">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-amber-400" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-rose-950 font-bold flex items-center justify-center">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <span className="font-bold text-amber-200 block">{user.displayName || 'Connected Account'}</span>
                  <span className="text-[10px] text-amber-300/80 font-mono">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchFiles}
                  disabled={loadingFiles}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} className={loadingFiles ? 'animate-spin' : ''} />
                  <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-amber-200 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <LogOut size={12} />
                  <span>{lang === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 py-1">
              <div className="flex items-center gap-2 text-amber-200 text-xs">
                <ShieldCheck size={18} className="text-amber-400" />
                <span>{lang === 'bn' ? 'গুগল ড্রাইভ কানেক্ট করে ফাইল সেভ ও ব্যাকআপ নেভিগেট করুন:' : 'Sign in with Google to enable Drive backups and cloud file management:'}</span>
              </div>

              {/* Official Google Sign-In Styled Button */}
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button bg-white hover:bg-stone-100 text-stone-800 font-bold px-4 py-2 rounded-xl shadow-md border border-stone-300 flex items-center gap-2.5 transition-all text-xs cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingIn ? (lang === 'bn' ? 'সাইন ইন হচ্ছে...' : 'Signing in...') : (lang === 'bn' ? 'Sign in with Google' : 'Sign in with Google')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Notification Message */}
        {statusMessage && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-200' : 'bg-rose-100 text-rose-900 border-b border-rose-200'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-700" /> : <AlertCircle size={16} className="text-rose-700" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Main Interface Content */}
        {user ? (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Tabs */}
            <div className="px-6 pt-3 bg-white border-b border-stone-200 flex gap-3 overflow-x-auto text-xs shrink-0 font-bold">
              <button
                onClick={() => setActiveTab('files')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'files' ? 'border-rose-900 text-rose-950' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <HardDrive size={15} />
                <span>{lang === 'bn' ? 'ড্রাইভ ফাইল ব্রাউজার' : 'Drive Files Browser'}</span>
                <span className="px-1.5 py-0.2 bg-stone-100 text-stone-700 rounded-full text-[10px]">{files.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('export_catalog')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'export_catalog' ? 'border-rose-900 text-rose-950' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Database size={15} className="text-amber-600" />
                <span>{lang === 'bn' ? 'প্রডাক্ট ব্যাকআপ ড্রাইভে সেভ' : 'Export Products Catalog'}</span>
              </button>

              <button
                onClick={() => setActiveTab('export_orders')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'export_orders' ? 'border-rose-900 text-rose-950' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileSpreadsheet size={15} className="text-emerald-700" />
                <span>{lang === 'bn' ? 'অর্ডার রেকর্ড ব্যাকআপ' : 'Export Orders History'}</span>
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'upload' ? 'border-rose-900 text-rose-950' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <CloudUpload size={15} className="text-blue-600" />
                <span>{lang === 'bn' ? 'কাস্টম ফাইল আপলোড' : 'Upload File to Drive'}</span>
              </button>
            </div>

            {/* Tab 1: Drive File Browser */}
            {activeTab === 'files' && (
              <div className="p-6 space-y-4 flex-1">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-2xl border border-stone-200">
                  <div className="relative w-full sm:w-80">
                    <Search size={14} className="absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
                      placeholder={lang === 'bn' ? 'ড্রাইভ ফাইলে খুঁজুন (এন্টার প্রেস করুন)...' : 'Search Drive files (press Enter)...'}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={fetchFiles}
                    className="px-3 py-2 bg-rose-950 hover:bg-rose-900 text-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Search size={14} />
                    <span>{lang === 'bn' ? 'খুঁজুন' : 'Search'}</span>
                  </button>
                </div>

                {loadingFiles ? (
                  <div className="p-12 text-center text-stone-500 space-y-2">
                    <RefreshCw size={28} className="mx-auto animate-spin text-amber-600" />
                    <p className="text-xs font-bold">{lang === 'bn' ? 'গুগল ড্রাইভ থেকে ফাইল লোড হচ্ছে...' : 'Loading files from Google Drive...'}</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-2">
                    <FileText size={32} className="mx-auto text-stone-300" />
                    <p className="text-xs text-stone-600 font-semibold">
                      {lang === 'bn' ? 'গুগল ড্রাইভে কোনো ফাইল পাওয়া যায়নি।' : 'No files found in Google Drive matching query.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map(file => (
                      <div key={file.id} className="p-3 bg-white rounded-2xl border border-stone-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-amber-100 text-rose-950 rounded-xl shrink-0 font-bold">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-stone-900 truncate">{file.name}</h5>
                            <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                              <span>{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>{file.mimeType.split('.').pop()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1 transition-colors"
                              title="Open in Google Drive"
                            >
                              <ExternalLink size={13} />
                              <span className="hidden sm:inline">{lang === 'bn' ? 'ড্রাইভে খুলুন' : 'Open'}</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors cursor-pointer"
                            title="Delete file permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Export Products Catalog */}
            {activeTab === 'export_catalog' && (
              <div className="p-6 space-y-4 max-w-xl mx-auto text-xs">
                <div className="p-5 bg-white rounded-3xl border border-stone-200 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
                    <Database size={20} className="text-amber-600" />
                    <span>{lang === 'bn' ? 'ওয়েবসাইট ইনভেন্টরি ড্রাইভ ব্যাকআপ' : 'Backup Products Catalog to Google Drive'}</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    {lang === 'bn'
                      ? `বর্তমান ওয়েবসাইটের মোট ${products.length}টি পণ্যের সকল তথ্য (দাম, ছবি, ক্যাটাগরি, বিবরণ) Google Drive এ JSON ব্যাকআপ ফরম্যাটে ফাইল হিসেবে সংরক্ষণ করতে পারবেন।`
                      : `Backup all ${products.length} store products (pricing, descriptions, stock, categories) directly into your personal Google Drive.`}
                  </p>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 font-mono text-[11px] text-stone-700 space-y-1">
                    <div><strong>File format:</strong> JSON (.json)</div>
                    <div><strong>Target Drive:</strong> Google Drive Root</div>
                    <div><strong>Items included:</strong> {products.length} Products</div>
                  </div>

                  <button
                    onClick={handleExportCatalog}
                    disabled={uploading}
                    className="w-full py-3 bg-rose-950 hover:bg-rose-900 text-amber-300 font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CloudUpload size={16} />
                    <span>{uploading ? (lang === 'bn' ? 'ড্রাইভে সেভ হচ্ছে...' : 'Saving to Drive...') : (lang === 'bn' ? 'এখনই ক্যাটালগ ব্যাকআপ তৈরি করুন' : 'Export Catalog Now')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Export Orders History */}
            {activeTab === 'export_orders' && (
              <div className="p-6 space-y-4 max-w-xl mx-auto text-xs">
                <div className="p-5 bg-white rounded-3xl border border-stone-200 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
                    <FileSpreadsheet size={20} className="text-emerald-700" />
                    <span>{lang === 'bn' ? 'কাস্টমার অর্ডার ও রেভিনিউ রেকর্ড সেভ' : 'Export Customer Orders History'}</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    {lang === 'bn'
                      ? `স্টোরের সর্বমোট ${orders.length}টি অর্ডারের কাস্টমার তথ্য, ফোন নম্বর, ঠিকানা ও পেমেন্ট হিস্ট্রি Google Drive এ ব্যাকআপ করে রাখুন।`
                      : `Export all ${orders.length} order entries including total revenue, shipping addresses, phone numbers, and status to Google Drive.`}
                  </p>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 font-mono text-[11px] text-stone-700 space-y-1">
                    <div><strong>Total Orders:</strong> {orders.length}</div>
                    <div><strong>Total Sales:</strong> ৳{orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}</div>
                  </div>

                  <button
                    onClick={handleExportOrders}
                    disabled={uploading}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CloudUpload size={16} />
                    <span>{uploading ? (lang === 'bn' ? 'ড্রাইভে সেভ হচ্ছে...' : 'Saving to Drive...') : (lang === 'bn' ? 'অর্ডার ফাইল ড্রাইভে এক্সপোর্ট করুন' : 'Export Orders to Drive')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Upload Custom File */}
            {activeTab === 'upload' && (
              <div className="p-6 space-y-4 max-w-xl mx-auto text-xs">
                <div className="p-6 bg-white rounded-3xl border border-2 border-dashed border-stone-300 text-center space-y-3">
                  <CloudUpload size={36} className="mx-auto text-amber-600" />
                  <div>
                    <h5 className="font-bold text-stone-900 text-sm">{lang === 'bn' ? 'যেকোনো ফাইল ব্রাউজ করে আপলোড করুন' : 'Select File to Upload to Drive'}</h5>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {lang === 'bn' ? 'ছবি, পিডিএফ, ব্যানার বা ফাইল সিলেক্ট করুন' : 'Upload photos, banners, invoices or documents'}
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-950 hover:bg-rose-900 text-amber-300 font-bold rounded-2xl cursor-pointer shadow-md transition-all">
                    <span>{uploading ? (lang === 'bn' ? 'আপলোড চলছে...' : 'Uploading...') : (lang === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Choose File')}</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Logged out state info */
          <div className="p-8 text-center space-y-4 max-w-md mx-auto my-auto">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <HardDrive size={32} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-base">{lang === 'bn' ? 'গুগল ড্রাইভ কানেক্ট করুন' : 'Connect Your Google Drive'}</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার গুগল ড্রাইভ দিয়ে লগইন করে ওয়েবসাইটের পণ্য ব্যাকআপ, কাস্টমার অর্ডার ডাটা ও অন্যান্য ফাইল ড্রাইভে নিরাপদ রাখুন।'
                  : 'Sign in with Google to enable seamless Drive backups, catalog synchronization, and cloud storage features.'}
              </p>
            </div>

            {/* Official Google Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="w-full py-3 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-2xl shadow-md border border-stone-300 flex items-center justify-center gap-3 transition-all text-xs cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? (lang === 'bn' ? 'সাইন ইন প্রসেসিং...' : 'Signing in...') : (lang === 'bn' ? 'Sign in with Google' : 'Sign in with Google')}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
