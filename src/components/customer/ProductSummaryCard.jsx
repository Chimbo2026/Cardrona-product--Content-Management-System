export default function ProductSummaryCard({
  title = 'Your pass',
  dateLabel,
  selection,
  total,
  actionLabel = 'Add to cart',
  disabled = false,
  onAdd,
}) {
  return <section className="rounded-[22px] border border-[#d6e0ea] bg-white p-4 shadow-sm">
    <h2 className="text-[16px] font-bold text-[#20242b]">{title}</h2>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#cbd7e4] pb-3 text-[13px]">
      <span className="text-[#5c7086]">{dateLabel}</span>
      <strong className="text-right text-[#20242b]">{selection}</strong>
    </div>
    <div className="mt-3 flex items-center justify-between gap-3 text-[16px] font-bold text-[#20242b]">
      <span>Total</span><strong className="font-serif text-[24px] leading-none text-[#5b8199]">{total}</strong>
    </div>
    <button type="button" disabled={disabled} onClick={onAdd} className="mt-3 min-h-12 w-full rounded-2xl bg-[#5b8199] px-4 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c9c9c9]">{actionLabel}</button>
  </section>;
}
