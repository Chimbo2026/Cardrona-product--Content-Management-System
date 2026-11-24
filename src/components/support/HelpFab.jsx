import { useState } from 'react';
import { Headset, X } from 'lucide-react';
import HelpSheet from '@/components/support/HelpSheet';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function HelpFab() {
  const { bi } = useLanguage();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={bi('在线客服与常见问题', 'Help and FAQs')}
        className="absolute bottom-[112px] right-3.5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_-6px_rgba(0,0,0,0.5)] transition hover:scale-105 active:scale-95"
      >
        <Headset className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            aria-label={bi('关闭', 'Close')}
            onClick={close}
            className="absolute inset-0 bg-black/45"
          />
          <div className="relative max-h-[82%] overflow-y-auto rounded-t-3xl border-t border-border bg-background pb-6 scrollbar-none">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur">
              <span className="flex items-center gap-2 font-heading text-[15px] font-semibold">
                <Headset className="h-4 w-4 text-primary" /> {bi('帮助中心', 'Help centre')}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label={bi('关闭', 'Close')}
                className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 transition hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <HelpSheet />
          </div>
        </div>
      )}
    </>
  );
}