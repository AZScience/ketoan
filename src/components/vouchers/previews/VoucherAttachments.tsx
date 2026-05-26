import React from 'react';
import { Paperclip, Eye, FileText, FileImage, File } from 'lucide-react';

interface AttachmentFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

interface VoucherAttachmentsProps {
  files: AttachmentFile[];
}

export const VoucherAttachments: React.FC<VoucherAttachmentsProps> = ({ files }) => {
  if (!files || files.length === 0) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage size={14} className="text-blue-500" />;
    if (type === 'application/pdf') return <FileText size={14} className="text-red-500" />;
    return <File size={14} className="text-slate-500" />;
  };

  return (
    <div className="mt-6 pt-4 border-t border-slate-100 print:hidden">
      <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
        <Paperclip size={12} />
        File đính kèm ({files.length})
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {files.map((file, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
          >
            <div className="flex items-center gap-2 min-w-0">
              {getFileIcon(file.type)}
              <span className="text-[10px] font-medium text-slate-700 truncate max-w-[150px]">
                {file.name}
              </span>
            </div>
            <a 
              href={file.data} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-all"
            >
              <Eye size={12} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
