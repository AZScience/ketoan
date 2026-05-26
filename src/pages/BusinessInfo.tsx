import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Save, Globe, Mail, Phone, MapPin, Hash, Briefcase, User, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface BusinessInfoData {
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  director: string;
  chiefAccountant: string;
  field: string;
  fiscalYearStart: '01-01' | '04-01' | '07-01' | '10-01';
}

const BusinessInfo: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [data, setData] = useState<BusinessInfoData>({
    name: '',
    taxCode: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    director: '',
    chiefAccountant: '',
    field: '',
    fiscalYearStart: '01-01',
  });

  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const docRef = doc(db, 'settings', 'company');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'settings/company');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await setDoc(doc(db, 'settings', 'company'), data);
      setMessage({ type: 'success', text: 'Đã lưu thông tin doanh nghiệp thành công!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/company');
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu thông tin.' });
    } finally {
      setSaving(false);
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
            <Building2 className="mr-3 text-blue-600" size={32} />
            Thông tin Doanh nghiệp
          </h1>
          <p className="text-slate-500 mt-1">Cấu hình thông tin cơ bản của đơn vị kế toán</p>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Building2 size={16} className="mr-2 text-blue-500" />
                Tên doanh nghiệp
              </label>
              <input
                type="text"
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="VD: Công ty TNHH Giải pháp Kế toán Việt Nam"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Hash size={16} className="mr-2 text-emerald-500" />
                Mã số thuế
              </label>
              <input
                type="text"
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="0123456789"
                value={data.taxCode}
                onChange={(e) => setData({ ...data, taxCode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Briefcase size={16} className="mr-2 text-amber-500" />
                Lĩnh vực kinh doanh
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="VD: Thương mại, Dịch vụ"
                value={data.field}
                onChange={(e) => setData({ ...data, field: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <MapPin size={16} className="mr-2 text-rose-500" />
                Địa chỉ trụ sở
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Phone size={16} className="mr-2 text-purple-500" />
                Số điện thoại
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="024..."
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Mail size={16} className="mr-2 text-red-500" />
                Email liên hệ
              </label>
              <input
                type="email"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="contact@company.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Globe size={16} className="mr-2 text-cyan-500" />
                Website
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="https://company.com"
                value={data.website}
                onChange={(e) => setData({ ...data, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <User size={16} className="mr-2 text-indigo-500" />
                Giám đốc / Người đại diện
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Họ và tên"
                value={data.director}
                onChange={(e) => setData({ ...data, director: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <User size={16} className="mr-2 text-teal-500" />
                Kế toán trưởng
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Họ và tên"
                value={data.chiefAccountant}
                onChange={(e) => setData({ ...data, chiefAccountant: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Calendar size={16} className="mr-2 text-indigo-500" />
                Ngày bắt đầu năm tài chính
              </label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                value={data.fiscalYearStart}
                onChange={(e) => setData({ ...data, fiscalYearStart: e.target.value as any })}
              >
                <option value="01-01">Ngày 01 tháng 01 (Năm dương lịch)</option>
                <option value="04-01">Ngày 01 tháng 04</option>
                <option value="07-01">Ngày 01 tháng 07</option>
                <option value="10-01">Ngày 01 tháng 10</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {saving ? <RefreshCw size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />}
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BusinessInfo;
