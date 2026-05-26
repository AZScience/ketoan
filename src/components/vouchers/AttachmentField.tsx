import React, { useRef } from 'react';
import { Paperclip, FileUp, X, Eye, FileText, FileImage, File } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AttachmentFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

interface AttachmentFieldProps {
  attachments: string;
  attachmentFiles: AttachmentFile[];
  onAttachmentsChange: (value: string) => void;
  onFilesChange: (files: AttachmentFile[]) => void;
  isViewOnly?: boolean;
  label?: string;
}

const AttachmentField: React.FC<AttachmentFieldProps> = ({
  attachments,
  attachmentFiles = [],
  onAttachmentsChange,
  onFilesChange,
  isViewOnly,
  label = "Số chứng từ gốc"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachmentFile[] = [...attachmentFiles];
    const filePromises = Array.from(files).map((file: File) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          newFiles.push({
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(() => {
      onFilesChange(newFiles);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const removeFile = (index: number) => {
    const newFiles = attachmentFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage size={16} className="text-blue-500" />;
    if (type === 'application/pdf') return <FileText size={16} className="text-red-500" />;
    return <File size={16} className="text-slate-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Paperclip size={16} className="text-slate-500" />
          {label}
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={attachments}
            onChange={(e) => onAttachmentsChange(e.target.value)}
            disabled={isViewOnly}
            placeholder="Số chứng từ gốc"
            className="flex-1 p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
          {!isViewOnly && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center gap-2 font-medium"
            >
              <FileUp size={18} />
              <span className="hidden sm:inline">Đính kèm file</span>
            </button>
          )}
          <input 
            ref={fileInputRef}
            type="file" 
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <AnimatePresence>
        {attachmentFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {attachmentFiles.map((file, index) => (
              <motion.div 
                key={index}
                layout
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <a 
                    href={file.data} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-all"
                  >
                    <Eye size={14} />
                  </a>
                  {!isViewOnly && (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-all"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentField;
