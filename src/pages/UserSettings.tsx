import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, Trash2, RefreshCw, CheckCircle2, AlertCircle, Fingerprint, Download, Lock, Info } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getPrivateKey, generateKeyPair, savePrivateKey } from '../utils/cryptoUtils';

const UserSettings: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const privateKey = await getPrivateKey();
      setHasKey(!!privateKey);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setPublicKey(userDoc.data().publicKey || null);
      }
    } catch (error) {
      console.error("Error checking key status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!user) return;
    if (hasKey && !window.confirm("Bạn đã có khóa ký số. Việc tạo khóa mới sẽ thay thế khóa cũ và các chứng từ đã ký trước đó có thể không xác thực được bằng khóa mới này. Bạn có chắc chắn muốn tiếp tục?")) {
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      const { publicKey, privateKey } = await generateKeyPair();
      await savePrivateKey(privateKey);
      
      await updateDoc(doc(db, 'users', user.uid), {
        publicKey: publicKey,
        lastUpdated: new Date().toISOString()
      });
      
      setHasKey(true);
      setPublicKey(publicKey);
      setMessage({ type: 'success', text: 'Đã tạo và lưu trữ khóa ký số mới thành công!' });
    } catch (err) {
      console.error("Error generating key:", err);
      setMessage({ type: 'error', text: 'Không thể tạo khóa bảo mật. Vui lòng thử lại.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa riêng tư khỏi trình duyệt này? Bạn sẽ không thể ký số cho đến khi tạo khóa mới.")) {
      return;
    }

    setActionLoading(true);
    try {
      // We don't have a delete function in cryptoUtils yet, let's just overwrite with null or clear store
      // For now, I'll just use the IndexedDB API directly to clear the store
      const request = indexedDB.open("AccountingAppAuth", 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction("keys", "readwrite");
        const store = transaction.objectStore("keys");
        store.delete('accounting-app-private-key');
        transaction.oncomplete = () => {
          setHasKey(false);
          setMessage({ type: 'success', text: 'Đã xóa khóa riêng tư khỏi thiết bị này.' });
          setActionLoading(false);
        };
      };
    } catch (error) {
      console.error("Error deleting key:", error);
      setMessage({ type: 'error', text: 'Không thể xóa khóa. Vui lòng thử lại.' });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
            <Shield className="mr-3 text-blue-600" size={32} />
            Cài đặt người dùng
          </h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin cá nhân và bảo mật chữ ký số</p>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Digital Signature Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Fingerprint size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Chữ ký số cá nhân</h3>
                  <p className="text-xs text-slate-500">Xác thực và bảo mật chứng từ</p>
                </div>
              </div>
              {hasKey ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Đã kích hoạt
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Chưa thiết lập
                </span>
              )}
            </div>

            <div className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 flex flex-col items-center text-center space-y-4">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner ${hasKey ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                    <Key size={48} className={hasKey ? '' : 'opacity-50'} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Trạng thái khóa</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {hasKey ? 'Khóa riêng tư đã được lưu an toàn trong trình duyệt này.' : 'Chưa tìm thấy khóa riêng tư trên thiết bị này.'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                      <Info className="text-blue-600 mt-0.5" size={18} />
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Khóa riêng tư (Private Key) được lưu trữ trong <b>IndexedDB</b> của trình duyệt. Nó không bao giờ được gửi lên máy chủ, đảm bảo tính bảo mật tuyệt đối cho chữ ký của bạn.
                      </p>
                    </div>

                    {publicKey && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khóa công khai (Public Key)</label>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-500 break-all leading-relaxed">
                          {publicKey}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleGenerateKey}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      {actionLoading ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <RefreshCw size={18} className="mr-2" />}
                      {hasKey ? 'Tạo lại khóa mới' : 'Thiết lập chữ ký số'}
                    </button>
                    
                    {hasKey && (
                      <button
                        onClick={handleDeleteKey}
                        disabled={actionLoading}
                        className="flex items-center justify-center px-6 py-3 bg-white text-rose-600 border border-rose-100 rounded-xl font-semibold hover:bg-rose-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h4 className="font-bold text-slate-900">Bảo mật khóa</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khóa của bạn được bảo vệ bởi cơ chế bảo mật của trình duyệt. Tuy nhiên, nếu bạn xóa dữ liệu trang web hoặc đổi trình duyệt, bạn sẽ cần tạo lại khóa mới.
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Download size={20} />
              </div>
              <h4 className="font-bold text-slate-900">Sao lưu khóa</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hiện tại khóa được lưu cục bộ. Chúng tôi khuyến nghị không chia sẻ thiết bị dùng để ký số để đảm bảo an toàn cao nhất.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
            <div className="relative inline-block">
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} 
                className="w-24 h-24 rounded-3xl border-4 border-slate-50 shadow-sm mx-auto"
                alt="Avatar"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center border-4 border-white">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{user?.displayName}</h3>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">ID Người dùng</span>
                <span className="font-mono text-slate-600">{user?.uid.substring(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Ngày tham gia</span>
                <span className="text-slate-600">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
