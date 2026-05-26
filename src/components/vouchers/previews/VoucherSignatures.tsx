import React from 'react';
import { format } from 'date-fns';

interface SignatureRole {
  title?: string;
  subtitle?: string;
  isDate?: boolean;
  // Compatibility
  role?: string;
  subtext?: string;
}

interface VoucherSignaturesProps {
  roles?: SignatureRole[];
  date?: string | Date;
  gridCols?: number;
  // Compatibility
  signatures?: any[];
  columns?: number;
}

export const VoucherSignatures: React.FC<VoucherSignaturesProps> = ({
  roles,
  date,
  gridCols,
  signatures,
  columns,
}) => {
  const displayRoles = roles || signatures?.map(s => ({ title: s.role, subtitle: s.subtext })) || [];
  const displayGridCols = gridCols || columns || (displayRoles.length > 0 ? displayRoles.length : 4);
  
  // Use flexbox for better horizontal alignment across different screen sizes and print
  const containerStyle = {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    textAlign: 'center' as const,
    marginTop: '3rem',
    marginBottom: '5rem',
    width: '100%',
    gap: '10px'
  };
  
  return (
    <div style={containerStyle}>
      {displayRoles.map((role, index) => (
        <div key={index} style={{ flex: 1 }}>
          <div className="flex flex-col items-center">
            {role.isDate && (
              <p className="italic text-[10px] mb-1">
                Ngày {date ? format(new Date(date), 'dd') : '.....'} tháng {date ? format(new Date(date), 'MM') : '.....'} năm {date ? format(new Date(date), 'yyyy') : '.....'}
              </p>
            )}
            <p className="font-bold uppercase text-[11px] leading-tight">{role.title || role.role}</p>
            {(role.subtitle || role.subtext) && (
              <p className="italic text-[9px] text-slate-600">{role.subtitle || role.subtext}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
