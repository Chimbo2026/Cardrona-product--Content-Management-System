import { Check } from 'lucide-react';

export default function BookingStepper({ steps, current }) {
  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-border/70 bg-background/95 px-3 backdrop-blur">
      <div className="flex items-stretch justify-between gap-1">
      {steps.map((label, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;
        return (
          <div key={label} className="relative flex min-w-0 flex-1 items-center justify-center gap-0.5 py-2.5">
            <span className={`truncate text-[9px] ${active ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
              {label}
            </span>
            {done && <Check className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />}
            {active && <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-primary" />}
          </div>
        );
      })}
      </div>
    </div>
  );
}
