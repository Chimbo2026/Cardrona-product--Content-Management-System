import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';

export default function ImageUploadField({ value, onChange }) {
  const { t } = useLang();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(file_url);
    } catch (err) {
      setError(err.message || t('上传失败，请重试。', 'Upload failed, please try again.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/30">
        {value ? (
          <Image src={value} alt="" fittingType="fill" className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
            <p className="text-[12px]">{t('尚未上传图片', 'No image uploaded yet')}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading
            ? t('上传中…', 'Uploading…')
            : value
              ? t('更换图片', 'Replace image')
              : t('上传图片', 'Upload image')}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={() => onChange('')}>
            <X className="h-3.5 w-3.5" />
            {t('移除', 'Remove')}
          </Button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />
      </div>

      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}