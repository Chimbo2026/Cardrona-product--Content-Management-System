export default function BrandMark({ compact = false }) {
  return (
    <span
      aria-label="Cardrona and Treble Cone"
      className={`flex shrink-0 items-center justify-center gap-[3px] rounded-[3px] bg-[#E31B2B] text-white shadow-sm ${compact ? 'h-8 w-9' : 'h-[34px] w-[68px]'}`}
    >
      <span className="flex flex-col font-heading text-[6px] font-black leading-[0.72] tracking-[-0.04em]">
        <span>CAR</span><span>DRO</span><span>NA</span>
      </span>
      <span className="flex h-[22px] flex-col items-center justify-center">
        <svg aria-hidden="true" viewBox="0 0 27 12" className="h-[11px] w-[26px]" fill="none">
          <path d="M1 10 10 2l5 5 5-5 6 7M3 10h21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        {!compact && <span className="font-heading text-[4px] font-bold leading-none tracking-[0.08em]">TREBLE CONE</span>}
      </span>
    </span>
  );
}
