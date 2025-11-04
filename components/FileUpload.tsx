import React, { useCallback, useState } from 'react';
import { UploadCloudIcon, FileIcon, XIcon } from './icons';

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, setFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, [setFile]);

  const removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFile(null);
  };

  if (file) {
    return (
      <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <FileIcon className="w-6 h-6 text-primary-400" />
          <div className="text-sm">
            <p className="font-semibold text-slate-200 truncate max-w-[200px]">{file.name}</p>
            <p className="text-slate-400">{ (file.size / 1024).toFixed(1) } KB</p>
          </div>
        </div>
        <button
          onClick={removeFile}
          title="Remover arquivo"
          className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative block w-full h-48 p-4 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800'}`}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <UploadCloudIcon className="w-10 h-10 text-slate-500 mb-3" />
        <p className="text-sm font-semibold text-slate-300">Arraste e solte seu currículo aqui, ou <span className="text-primary-400">clique para selecionar</span></p>
        <p className="text-xs text-slate-500 mt-1">PDF, DOCX até 5MB</p>
      </div>
      <input
        type="file"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".pdf,.doc,.docx"
      />
    </label>
  );
};

export default FileUpload;