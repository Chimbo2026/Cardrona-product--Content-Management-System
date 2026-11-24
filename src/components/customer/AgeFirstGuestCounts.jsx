import { Minus, Plus } from 'lucide-react';

export default function AgeFirstGuestCounts({ options, counts, onChange, onContinue, continueLabel = 'Continue to options' }) {
  const total = options.reduce((sum, option) => sum + (counts[option.value] || 0), 0);

  return <section className="space-y-3">
    <div><h2 className="text-[17px] font-bold">Who are you buying for?</h2><p className="mt-1 text-[13px] text-[#777]">Choose a quantity for each age group.</p></div>
    {options.map((option) => {
      const count = counts[option.value] || 0;
      return <div key={option.value} className="flex items-center justify-between gap-3 rounded-xl border border-[#dce4ed] bg-white p-3">
        <span className="min-w-0"><b className="block text-[14px]">{option.label}</b>{option.description && <small className="text-[11px] text-[#777]">{option.description}</small>}</span>
        <div className="flex h-10 shrink-0 items-center overflow-hidden rounded-lg border border-[#dce4ed]">
          <button type="button" aria-label={`Remove one ${option.label}`} disabled={!count} onClick={() => onChange(option.value, count - 1)} className="h-full px-3 text-[#526982] disabled:opacity-35"><Minus className="h-4 w-4"/></button>
          <b className="min-w-8 text-center text-[14px]">{count}</b>
          <button type="button" aria-label={`Add one ${option.label}`} onClick={() => onChange(option.value, count + 1)} className="h-full px-3 text-[#526982]"><Plus className="h-4 w-4"/></button>
        </div>
      </div>;
    })}
    <button type="button" disabled={!total} onClick={onContinue} className="w-full rounded-xl bg-[#5b8199] px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-40">{continueLabel}</button>
  </section>;
}
