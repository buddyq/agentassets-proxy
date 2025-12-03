import { useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { Upload, X, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL: string }> }) => void;
  buttonClassName?: string;
  children?: ReactNode;
  variant?: "button" | "dropzone";
}

export function ObjectUploader({
  maxNumberOfFiles = 10,
  maxFileSize = 10485760,
  allowedFileTypes,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  variant = "button",
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFileTypeAllowed = (file: File): boolean => {
    if (!allowedFileTypes || allowedFileTypes.length === 0) {
      return file.type.startsWith('image/');
    }
    return allowedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
  };

  const getFileTypeLabel = (): string => {
    if (!allowedFileTypes || allowedFileTypes.length === 0) {
      return 'image files';
    }
    const labels: string[] = [];
    if (allowedFileTypes.some(t => t.includes('image'))) labels.push('images');
    if (allowedFileTypes.some(t => t.includes('pdf'))) labels.push('PDFs');
    if (allowedFileTypes.some(t => t.includes('word') || t.includes('document'))) labels.push('documents');
    return labels.length > 0 ? labels.join(', ') : 'supported files';
  };

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        setError(`Some files exceed ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
        return false;
      }
      if (!isFileTypeAllowed(file)) {
        setError(`Only ${getFileTypeLabel()} are allowed`);
        return false;
      }
      return true;
    }).slice(0, maxNumberOfFiles);

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress({ current: 0, total: validFiles.length });

    const successfulUploads: Array<{ uploadURL: string }> = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const { url } = await onGetUploadParameters();
        
        const response = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        successfulUploads.push({ uploadURL: url });
        setUploadProgress({ current: i + 1, total: validFiles.length });
      } catch (err) {
        console.error('Upload error for file:', file.name, err);
      }
    }

    if (successfulUploads.length > 0) {
      onComplete?.({ successful: successfulUploads });
    }

    if (successfulUploads.length < validFiles.length) {
      setError(`${validFiles.length - successfulUploads.length} file(s) failed to upload`);
    }

    setIsUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      await uploadFiles(files);
    }
  }, [onGetUploadParameters, onComplete, maxFileSize, maxNumberOfFiles]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (variant === "dropzone") {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onClick={handleButtonClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragOver 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
            }
            ${isUploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
              <div>
                <p className="font-medium text-foreground">Uploading...</p>
                {uploadProgress && (
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress.current} of {uploadProgress.total} photos
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drag and drop photos here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload up to {maxNumberOfFiles} photos at once (max {Math.round(maxFileSize / 1024 / 1024)}MB each)
              </p>
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button 
        onClick={handleButtonClick} 
        variant="outline"
        className={buttonClassName}
        type="button"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {uploadProgress 
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` 
                : 'Uploading...'}
            </span>
          </>
        ) : (
          children
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
