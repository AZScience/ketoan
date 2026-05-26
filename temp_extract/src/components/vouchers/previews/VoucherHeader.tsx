import React from 'react';

interface VoucherHeaderProps {
  companyName?: string;
  companyAddress?: string;
  templateCode?: string;
  templateSource?: string;
  templateDate?: string;
  // New props for compatibility
  companySettings?: any;
  templateName?: string;
  templateInfo?: string[];
}

export const VoucherHeader: React.FC<VoucherHeaderProps> = ({
  companyName,
  companyAddress,
  templateCode,
  templateSource,
  templateDate,
  companySettings,
  templateName,
  templateInfo,
}) => {
  const displayCompanyName = companyName || companySettings?.name || '................';
  const displayCompanyAddress = companyAddress || companySettings?.address || '................';
  const displayTemplateCode = templateCode || templateName;
  
  return (
    <div className="flex justify-between mb-6">
      <div className="space-y-1">
        <p className="font-bold uppercase">{displayCompanyName}</p>
        <p className="font-bold text-[10px]">Địa chỉ: <span className="font-normal">{displayCompanyAddress}</span></p>
      </div>
      {displayTemplateCode && (
        <div className="text-center space-y-0.5">
          <p className="font-bold text-xs">{displayTemplateCode}</p>
          {templateSource ? (
            <p className="italic text-[8px] leading-tight">(Ban hành kèm theo {templateSource}</p>
          ) : templateInfo?.[0] ? (
            <p className="italic text-[8px] leading-tight">{templateInfo[0]}</p>
          ) : null}
          {templateDate ? (
            <p className="italic text-[8px] leading-tight">{templateDate})</p>
          ) : templateInfo?.[1] ? (
            <p className="italic text-[8px] leading-tight">{templateInfo[1]}</p>
          ) : null}
        </div>
      )}
    </div>
  );
};
