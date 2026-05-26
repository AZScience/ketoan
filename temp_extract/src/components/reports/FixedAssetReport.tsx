import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { FixedAsset, CompanySettings } from '../../types/accounting';
import { format } from 'date-fns';

interface FixedAssetReportProps {
  workingYear: number;
  filters: any;
}

export const FixedAssetReport: React.FC<FixedAssetReportProps> = ({ workingYear, filters }) => {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'fixed_assets'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FixedAsset)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'fixed_assets');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const totalOriginalCost = assets.reduce((sum, asset) => sum + asset.originalCost, 0);
  const totalAccumulatedDepreciation = assets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);
  const totalNetValue = totalOriginalCost - totalAccumulatedDepreciation;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 text-center relative">
        <div className="absolute top-8 right-8 text-right text-xs text-slate-400">
          <p className="font-bold">Mẫu số S21-DN</p>
          <p>(Ban hành theo Thông tư số 200/2014/TT-BTC)</p>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 uppercase">
          BÁO CÁO TỔNG HỢP TÀI SẢN CỐ ĐỊNH
        </h2>
        <p className="text-slate-500 mt-2">Năm: {workingYear}</p>
        <p className="text-xs text-slate-400 mt-1 italic">(Đơn vị tính: Đồng Việt Nam)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <th className="px-6 py-4 border border-slate-200">Mã TS</th>
              <th className="px-6 py-4 border border-slate-200">Tên tài sản cố định</th>
              <th className="px-6 py-4 border border-slate-200">Ngày mua</th>
              <th className="px-6 py-4 border border-slate-200 text-right">Nguyên giá</th>
              <th className="px-6 py-4 border border-slate-200 text-right">Hao mòn lũy kế</th>
              <th className="px-6 py-4 border border-slate-200 text-right">Giá trị còn lại</th>
              <th className="px-6 py-4 border border-slate-200">Bộ phận sử dụng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">Đang tải dữ liệu...</td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">Không có dữ liệu tài sản cố định.</td>
              </tr>
            ) : (
              <>
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-blue-600 border border-slate-100">{asset.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 border border-slate-100">{asset.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 border border-slate-100">
                      {asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(asset.originalCost)}</td>
                    <td className="px-6 py-4 text-sm text-right text-red-500 border border-slate-100">{formatCurrency(asset.accumulatedDepreciation)}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600 border border-slate-100">{formatCurrency(asset.originalCost - asset.accumulatedDepreciation)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 border border-slate-100">{asset.department}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="px-6 py-4 text-right text-slate-900 border border-slate-200">TỔNG CỘNG</td>
                  <td className="px-6 py-4 text-right text-blue-600 border border-slate-200">{formatCurrency(totalOriginalCost)}</td>
                  <td className="px-6 py-4 text-right text-red-600 border border-slate-200">{formatCurrency(totalAccumulatedDepreciation)}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 border border-slate-200">{formatCurrency(totalNetValue)}</td>
                  <td className="px-6 py-4 border border-slate-200"></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-100">
        <div>
          <p className="font-bold text-slate-900 uppercase">Người lập biểu</p>
          <p className="text-slate-400 text-xs italic mt-1">(Ký, họ tên)</p>
          <div className="h-24"></div>
        </div>
        <div>
          <p className="font-bold text-slate-900 uppercase">Kế toán trưởng</p>
          <p className="text-slate-400 text-xs italic mt-1">(Ký, họ tên)</p>
          <div className="h-24"></div>
        </div>
        <div>
          <p className="font-bold text-slate-900 uppercase">Giám đốc</p>
          <p className="text-slate-400 text-xs italic mt-1">(Ký, họ tên, đóng dấu)</p>
          <div className="h-24"></div>
        </div>
      </div>
    </div>
  );
};
