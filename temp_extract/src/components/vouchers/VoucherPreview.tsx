import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Voucher } from '../../types/accounting';
import { verifySignature, hashVoucher } from '../../utils/cryptoUtils';
import { PayrollPreview } from './previews/PayrollPreview';
import { OvertimePreview } from './previews/OvertimePreview';
import { OutsourcePreview } from './previews/OutsourcePreview';
import { ContractPreview } from './previews/ContractPreview';
import { ContractLiquidationPreview } from './previews/ContractLiquidationPreview';
import { PayrollDeductionPreview } from './previews/PayrollDeductionPreview';
import { PayrollAllocationPreview } from './previews/PayrollAllocationPreview';
import { FundInventoryPreview } from './previews/FundInventoryPreview';
import { PaymentListPreview } from './previews/PaymentListPreview';
import { ReceiptPreview } from './previews/ReceiptPreview';
import { PaymentPreview } from './previews/PaymentPreview';
import { MoneyReceiptPreview } from './previews/MoneyReceiptPreview';
import { ForeignCurrencyInventoryPreview } from './previews/ForeignCurrencyInventoryPreview';
import { BonusPreview } from './previews/BonusPreview';
import { GoodsDeliveredPreview } from './previews/GoodsDeliveredPreview';
import { InventoryInspectionPreview } from './previews/InventoryInspectionPreview';
import { InventorySummaryPreview } from './previews/InventorySummaryPreview';
import { AssetHandoverPreview } from './previews/AssetHandoverPreview';
import { AssetLiquidationPreview } from './previews/AssetLiquidationPreview';
import { AssetRepairPreview } from './previews/AssetRepairPreview';
import { AssetRevaluationPreview } from './previews/AssetRevaluationPreview';
import { AssetInventoryPreview } from './previews/AssetInventoryPreview';
import { AssetDepreciationPreview } from './previews/AssetDepreciationPreview';
import { AssetAllocationPreview } from './previews/AssetAllocationPreview';
import { GoodsReceivedPreview } from './previews/GoodsReceivedPreview';
import { GoodsIssuedPreview } from './previews/GoodsIssuedPreview';
import { MaterialInspectionPreview } from './previews/MaterialInspectionPreview';
import { MaterialReturnPreview } from './previews/MaterialReturnPreview';
import { RemainingInventoryPreview } from './previews/RemainingInventoryPreview';
import { CounterCardPreview } from './previews/CounterCardPreview';
import { InventoryInventoryPreview } from './previews/InventoryInventoryPreview';
import { SalesPreview } from './previews/SalesPreview';
import { AdvanceRequestPreview } from './previews/AdvanceRequestPreview';
import { AdvanceSettlementPreview } from './previews/AdvanceSettlementPreview';
import { PaymentRequestPreview } from './previews/PaymentRequestPreview';
import { GoldCurrencyListPreview } from './previews/GoldCurrencyListPreview';
import { PurchaseListPreview } from './previews/PurchaseListPreview';
import { MaterialAllocationPreview } from './previews/MaterialAllocationPreview';
import { PurchasePreview } from './previews/PurchasePreview';
import { AgencySettlementPreview } from './previews/AgencySettlementPreview';
import { GeneralPreview } from './previews/GeneralPreview';

interface VoucherPreviewProps {
  voucher: Partial<Voucher>;
  companySettings?: {
    name: string;
    address: string;
  };
}

const VoucherPreview: React.FC<VoucherPreviewProps> = ({ voucher, companySettings }) => {
  const { type, status } = voucher;
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');

  const handleVerify = async () => {
    if (!voucher.digitalSignature) return;
    setVerificationStatus('verifying');
    try {
      // 1. Re-calculate hash of current data
      const currentHash = await hashVoucher(voucher);
      
      // 2. Verify signature against the hash
      const isValid = await verifySignature(
        voucher.digitalSignature.signatureHash, 
        voucher.digitalSignature.signature, 
        voucher.digitalSignature.publicKey
      );

      // 3. Check if data has been tampered with (hash mismatch)
      const isDataIntact = currentHash === voucher.digitalSignature.signatureHash;

      if (isValid && isDataIntact) {
        setVerificationStatus('valid');
      } else {
        setVerificationStatus('invalid');
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationStatus('invalid');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PendingApproval': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Posted': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statusBadge = status && (
    <div className="flex justify-end mb-4 print:hidden">
      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
        {status === 'PendingApproval' ? 'Chờ duyệt' : 
         status === 'Approved' ? 'Đã duyệt' : 
         status === 'Rejected' ? 'Từ chối' : 
         status === 'Posted' ? 'Đã đăng sổ' : 'Nháp'}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'Payroll':
        return <PayrollPreview voucher={voucher} companySettings={companySettings} />;
      case 'Overtime':
        return <OvertimePreview voucher={voucher} companySettings={companySettings} />;
      case 'Outsource':
        return <OutsourcePreview voucher={voucher} companySettings={companySettings} />;
      case 'Contract':
        return <ContractPreview voucher={voucher} companySettings={companySettings} />;
      case 'ContractLiquidation':
        return <ContractLiquidationPreview voucher={voucher} companySettings={companySettings} />;
      case 'PayrollDeduction':
        return <PayrollDeductionPreview voucher={voucher} companySettings={companySettings} />;
      case 'PayrollAllocation':
        return <PayrollAllocationPreview voucher={voucher} companySettings={companySettings} />;
      case 'FundInventoryVND':
      case 'FundInventoryForeign':
        return <FundInventoryPreview voucher={voucher} companySettings={companySettings} />;
      case 'PaymentList':
        return <PaymentListPreview voucher={voucher} companySettings={companySettings} />;
      case 'Receipt':
        return <ReceiptPreview voucher={voucher} companySettings={companySettings} />;
      case 'Payment':
        return <PaymentPreview voucher={voucher} companySettings={companySettings} />;
      case 'MoneyReceipt':
        return <MoneyReceiptPreview voucher={voucher} companySettings={companySettings} />;
      case 'ForeignCurrencyInventory':
        return <ForeignCurrencyInventoryPreview voucher={voucher} companySettings={companySettings} />;
      case 'Bonus':
        return <BonusPreview voucher={voucher} companySettings={companySettings} />;
      case 'GoodsDelivered':
        return <GoodsDeliveredPreview voucher={voucher} companySettings={companySettings} />;
      case 'InventoryInspection':
        return <InventoryInspectionPreview voucher={voucher} companySettings={companySettings} />;
      case 'InventorySummary':
        return <InventorySummaryPreview voucher={voucher} companySettings={companySettings} />;
      case 'AssetHandover':
        return <AssetHandoverPreview voucher={voucher} companySettings={companySettings} />;
      case 'AssetLiquidation':
        return <AssetLiquidationPreview voucher={voucher} companySettings={companySettings} />;
      case 'AssetRepair':
        return <AssetRepairPreview voucher={voucher} companySettings={companySettings} />;
      case 'AssetRevaluation':
        return <AssetRevaluationPreview voucher={voucher} companySettings={companySettings} />;
      case 'AssetInventory':
        return <AssetInventoryPreview voucher={voucher} companySettings={companySettings} />;
      case 'AssetDepreciation':
        return <AssetDepreciationPreview voucher={voucher} companySettings={companySettings} />;
      case 'AssetAllocation':
        return <AssetAllocationPreview voucher={voucher} companySettings={companySettings} />;
      case 'GoodsReceived':
        return <GoodsReceivedPreview voucher={voucher} companySettings={companySettings} />;
      case 'GoodsIssued':
        return <GoodsIssuedPreview voucher={voucher} companySettings={companySettings} />;
      case 'MaterialInspection':
        return <MaterialInspectionPreview voucher={voucher} companySettings={companySettings} />;
      case 'MaterialReturn':
        return <MaterialReturnPreview voucher={voucher} companySettings={companySettings} />;
      case 'RemainingInventory':
        return <RemainingInventoryPreview voucher={voucher} companySettings={companySettings} />;
      case 'CounterCard':
        return <CounterCardPreview voucher={voucher} companySettings={companySettings} />;
      case 'InventoryInventory':
        return <InventoryInventoryPreview voucher={voucher} companySettings={companySettings} />;
      case 'Sales':
        return <SalesPreview voucher={voucher} companySettings={companySettings} />;
      case 'AdvanceRequest':
        return <AdvanceRequestPreview voucher={voucher} companySettings={companySettings} />;
      case 'AdvanceSettlement':
        return <AdvanceSettlementPreview voucher={voucher} companySettings={companySettings} />;
      case 'PaymentRequest':
        return <PaymentRequestPreview voucher={voucher} companySettings={companySettings} />;
      case 'GoldCurrencyList':
        return <GoldCurrencyListPreview voucher={voucher} companySettings={companySettings} />;
      case 'PurchaseList':
        return <PurchaseListPreview voucher={voucher} companySettings={companySettings} />;
      case 'MaterialAllocation':
        return <MaterialAllocationPreview voucher={voucher} companySettings={companySettings} />;
      case 'Purchase':
        return <PurchasePreview voucher={voucher} companySettings={companySettings} />;
      case 'AgencySettlement':
        return <AgencySettlementPreview voucher={voucher} companySettings={companySettings} />;
      case 'General':
        return <GeneralPreview voucher={voucher} companySettings={companySettings} />;
      default:
        return (
          <div className="p-8 bg-white border border-slate-200">
            <pre className="whitespace-pre-wrap font-mono text-xs">
              {JSON.stringify(voucher, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const signatureSection = (voucher.digitalSignature || voucher.approvedBy) && (
    <div className="mt-8 pt-6 border-t border-slate-200 print:mt-4 print:pt-4">
      <div className="flex items-center gap-2 text-emerald-600 mb-2">
        <ShieldCheck size={20} />
        <span className="font-bold text-sm uppercase tracking-wider">
          {voucher.digitalSignature ? 'Chứng thực chữ ký số' : 'Thông tin phê duyệt'}
        </span>
      </div>
      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        {voucher.digitalSignature ? (
          <>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Người ký</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                  {voucher.digitalSignature.signerName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{voucher.digitalSignature.signerName}</p>
                  <p className="text-[10px] text-slate-500">{voucher.digitalSignature.signerEmail}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian ký</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(voucher.digitalSignature.timestamp).toLocaleString('vi-VN')}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle size={12} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-600 font-medium">Chữ ký hợp lệ & Toàn vẹn dữ liệu</span>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mã băm (Hash)</p>
                <p className="text-[10px] font-mono text-slate-500 break-all bg-white p-2 rounded border border-emerald-100">
                  {voucher.digitalSignature.signatureHash}
                </p>
              </div>
              <div className="ml-4 no-print">
                {verificationStatus === 'idle' && (
                  <button 
                    onClick={handleVerify}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <ShieldCheck size={14} />
                    Kiểm tra tính hợp lệ
                  </button>
                )}
                {verificationStatus === 'verifying' && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <RefreshCw size={14} className="animate-spin" />
                    Đang kiểm tra...
                  </div>
                )}
                {verificationStatus === 'valid' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200">
                    <CheckCircle size={14} />
                    Xác thực thành công
                  </div>
                )}
                {verificationStatus === 'invalid' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200">
                    <AlertCircle size={14} />
                    Xác thực thất bại
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Người phê duyệt</p>
              <p className="text-sm font-bold text-slate-900">{voucher.approvedBy}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian phê duyệt</p>
              <p className="text-sm font-medium text-slate-700">
                {voucher.approvedAt ? 
                  (voucher.approvedAt.toDate ? voucher.approvedAt.toDate() : new Date(voucher.approvedAt)).toLocaleString('vi-VN') : 
                  '---'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {statusBadge}
      {renderContent()}
      {signatureSection}
    </>
  );
};

export default VoucherPreview;
