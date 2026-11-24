import { cn } from '@/lib/utils';

export default function Field({ label, required, hint, error, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-[12px] font-medium text-forest-900">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}