'use client';

import React, { useState, useRef } from 'react';
import {
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiLoader,
  FiImage,
  FiFileText,
} from 'react-icons/fi';
import { uploadFileToAzureBlob, StorageFolder } from '@/lib/storage';

interface MediaUploadFieldProps {
  label?: string;
  helperText?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: StorageFolder;
  accept?: string;
  maxSizeMB?: number;
  previewType?: 'image' | 'file';
  placeholder?: string;
  disabled?: boolean;
}

export default function MediaUploadField({
  label = 'Upload Media',
  helperText = 'PNG, JPG, WEBP, or SVG up to 10MB',
  value = '',
  onChange,
  folder = 'avatars',
  accept = 'image/*',
  maxSizeMB = 10,
  previewType = 'image',
  placeholder,
  disabled = false,
}: MediaUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const allowedTypes = accept
        ? accept
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined;

      const result = await uploadFileToAzureBlob(file, {
        folder,
        maxSizeBytes: maxSizeMB * 1024 * 1024,
        allowedTypes,
        onProgress: (pct) => setProgress(pct),
      });

      onChange(result.blobUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload asset to Azure Storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}

      {/* Upload Zone / Preview Card */}
      {value ? (
        <div className="relative group rounded-xl border border-slate-700 bg-slate-900/80 p-3 overflow-hidden transition-all duration-200 hover:border-indigo-500/50">
          <div className="flex items-center gap-3">
            {previewType === 'image' ? (
              <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-800 bg-black/40 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Uploaded media"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <FiFileText className="w-6 h-6" />
              </div>
            )}

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>Uploaded to Azure Blob</span>
              </div>
              <p className="text-xs text-slate-300 truncate font-mono mt-0.5" title={value}>
                {value}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Remove asset"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !isUploading) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
              : 'border-slate-700/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="py-2 space-y-3">
              <FiLoader className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
              <div className="text-xs font-medium text-slate-300">
                Uploading to Azure Storage... {progress}%
              </div>
              <div className="w-48 mx-auto bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-full bg-slate-800/80 text-slate-400 group-hover:text-indigo-400 transition-colors">
                <FiUploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {placeholder || 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-1">
          <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
