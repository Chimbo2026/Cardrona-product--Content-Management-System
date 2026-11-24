import { useRef, useState } from 'react';
import { ImageOff, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import StayField from './StayField';

export default function StayPhotoPicker({ sampleUrl, value, onChange }) {
  const { bi } = useLanguage();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const src = value || sampleUrl;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <StayField label={bi('房间照片', 'Room photo')}>
      <div className="flex items-center gap-3 pt-0.5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
          {src ? (
            <Image src={src} alt={bi('房间照片', 'Room photo')} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {bi('上传图片', 'Upload image')}
          </Button>
          <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
            {bi(
              '上传前显示该房型的示例照片。',
              'A sample photo of the unit type is shown until you upload one.',
            )}
          </p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </StayField>
  );
}