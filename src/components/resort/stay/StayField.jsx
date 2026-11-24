import { Label } from '@/components/ui/label';

export default function StayField({ label, required, className = '', children }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-[11px] font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}