import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { validatePhoto } from '../../utils/validation';
import { ExternalBlob } from '../../backend';

interface PhotoPickerProps {
  onPhotoChange: (blob: ExternalBlob | null) => void;
  disabled?: boolean;
}

export default function PhotoPicker({ onPhotoChange, disabled }: PhotoPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      handleRemove();
      return;
    }

    const validationError = validatePhoto(file);
    if (validationError) {
      setError(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to bytes for ExternalBlob
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      onPhotoChange(blob);
      setIsUploading(false);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      setIsUploading(false);
      console.error('Photo processing error:', err);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Photo (Optional)</Label>
      
      {!preview ? (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="w-full gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Accepted formats: JPEG, PNG, WebP (max 5MB)
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {isUploading && uploadProgress < 100 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">{uploadProgress}%</p>
                </div>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
