import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, CheckCircle2, Fingerprint, Lock, Info, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Voucher, DigitalSignature } from '../../types/accounting';
import { getPrivateKey, signData, hashVoucher, generateKeyPair, savePrivateKey } from '../../utils/cryptoUtils';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: DigitalSignature) => void;
  voucher: Voucher | null;
}

const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onSign,
  voucher
}) => {
  const [step, setStep] = useState<'confirm' | 'signing' | 'success' | 'no-key' | 'generating-key'>('confirm');
  const [error, setError] = useState<string | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string>('');
  const user = auth.currentUser;

  useEffect(() => {
    if (isOpen) {
      checkKey();
    }
  }, [isOpen]);

  const checkKey = async () => {
    const privateKey = await getPrivateKey();
    if (!privateKey) {
      setStep('no-key');
    } else {
      setStep('confirm');
    }
  };

  const handleGenerateKey = async () => {
    if (!user) return;
    setStep('generating-key');
    try {
      const { publicKey, privateKey } = await generateKeyPair();
      await savePrivateKey(privateKey);
      
      // Save public key to user profile in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        publicKey: publicKey,
        lastUpdated: new Date().toISOString()
      });
      
      setStep('confirm');
    } catch (err) {
      console.error("Error generating key:", err);
      setError("Không thể tạo khóa bảo mật. Vui lòng thử lại.");
      setStep('no-key');
    }
  };

  const handleSign = async () => {
    if (!voucher || !user) return;
    setStep('signing');
    setError(null);
    
    try {
      const privateKey = await getPrivateKey();
      if (!privateKey) {
        setStep('no-key');
        return;
      }

      // 1. Create hash of voucher data
      const hash = await hashVoucher(voucher);
      setGeneratedHash(hash);

      // 2. Sign the hash
      const signature = await signData(hash, privateKey);

      // 3. Get public key from user profile (or we could have it in state)
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const publicKey = userDoc.data()?.publicKey;

      if (!publicKey) {
        throw new Error("Public key not found in profile");
      }

      // Simulate a small delay for UX
      setTimeout(() => {
        onSign({
          signerName: user.displayName || 'Unknown',
          signerEmail: user.email || 'Unknown',
          signatureHash: hash,
          signature: signature,
          publicKey: publicKey,
          certificateInfo: 'WebCrypto RSA-PSS 2048-bit',
          timestamp: new Date().toISOString()
        });
        setStep('success');
      }, 1500);
    } catch (err) {
      console.error("Signing error:", err);
      setError("Lỗi trong quá trình ký số. Vui lòng thử lại.");
      setStep('confirm');
    }
  };

  if (!isOpen || !voucher) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Ký số chứng từ</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Digital Signature</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}

            {step === 'no-key' && (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Key size={40} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Chưa có khóa ký số</h4>
                  <p className="text-slate-500 text-sm mt-2">
                    Bạn cần tạo một cặp khóa bảo mật trên thiết bị này để thực hiện ký số chứng từ.
                  </p>
                </div>
                <button
                  onClick={handleGenerateKey}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
                >
                  <RefreshCw size={20} />
                  Tạo khóa mới ngay
                </button>
                <p className="text-[10px] text-slate-400">
                  Bạn có thể quản lý khóa tại <Link to="/user-settings" onClick={onClose} className="text-blue-500 hover:underline">Cài đặt người dùng</Link>
                </p>
              </div>
            )}

            {step === 'generating-key' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-4 border-slate-100 border-t-blue-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                    <Key size={40} className="animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Đang tạo khóa bảo mật...</h4>
                  <p className="text-slate-500 text-sm mt-2">Quá trình này chỉ diễn ra một lần</p>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 mt-0.5" size={18} />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-blue-900">Xác nhận nội dung ký</p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Bạn đang thực hiện ký số cho chứng từ <b>{voucher.number}</b> với tổng số tiền <b>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.totalAmount)}</b>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="text-slate-400" size={20} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Người ký</p>
                        <p className="text-sm font-bold text-slate-900">{user?.displayName}</p>
                      </div>
                    </div>
                    <Lock className="text-emerald-500" size={16} />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-xs leading-relaxed">
                      Chữ ký số có giá trị pháp lý tương đương chữ ký tay và con dấu của doanh nghiệp. Quản lý khóa tại <Link to="/user-settings" onClick={onClose} className="text-amber-900 font-bold underline">đây</Link>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSign}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                >
                  <Fingerprint size={20} />
                  Xác nhận ký số
                </button>
              </div>
            )}

            {step === 'signing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                    <Fingerprint size={40} className="animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Đang thực hiện ký số...</h4>
                  <p className="text-slate-500 text-sm mt-2">Vui lòng không đóng cửa sổ này</p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">Ký số thành công!</h4>
                  <p className="text-slate-500 text-sm mt-2">Chứng từ đã được xác thực và lưu trữ an toàn.</p>
                </div>
                <div className="w-full p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-mono text-[10px] text-slate-400 break-all">
                  HASH: {generatedHash.toUpperCase()}
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                >
                  Hoàn tất
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DigitalSignatureModal;
