import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GuestPageView from '@/components/site/GuestPageView';
import { useLang } from '@/lib/i18n';

export default function PreviewDialog({ open, onOpenChange, page }) {
  const { t } = useLang();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 p-0">
        <DialogHeader className="space-y-1 border-b border-border/70 px-5 py-4">
          <DialogTitle className="text-[14px]">{t('实时预览', 'Live preview')}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {t('确认无误后点击保存，页面即会更新。', 'Check the result, then save to update the live page.')}
          </p>
        </DialogHeader>
        <div className="thin-scroll max-h-[70vh] overflow-y-auto">
          <GuestPageView page={page} compact />
        </div>
      </DialogContent>
    </Dialog>
  );
}