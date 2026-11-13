const OPTIONS = [
  ['seed', 'Plant a Seed', 'Help regenerate native plants and offset carbon emissions.'],
  ['tamariki', 'Ride Tamariki', 'Help provide life changing mountain experiences for children and families.'],
  ['karearea', 'Kārearea Project', 'Help fund conservation of the threatened New Zealand falcon.'],
  ['all-in', 'All In', 'Support an inclusive mountain community.'],
];

export default function WinterDonationOptions({ foundation, onFoundationChange, selected, onToggle }) {
  return <section className="space-y-3 border-t border-[#cbd7e4] pt-4">
    <div>
      <h3 className="text-[14px] font-semibold text-[#344a64]">Would you like to support the Cardrona Foundation?</h3>
      <p className="mt-1 text-[12px] text-[#718096]">Help support conservation and our mountain communities.</p>
    </div>
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#cbd7e4] bg-white px-3 text-[12px] font-semibold text-[#344a64]">
      <input type="checkbox" checked={foundation} onChange={(event) => onFoundationChange(event.target.checked)} className="h-4 w-4 accent-[#5b8199]" />
      Yes, I’d like to make a donation
    </label>
    <div className="space-y-3">
      {OPTIONS.map(([id, title, description]) => <label key={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selected.includes(id) ? 'border-[#5b8199] bg-[#f5f8fb]' : 'border-[#dce4ed] bg-white'}`}>
        <input type="checkbox" checked={selected.includes(id)} onChange={() => onToggle(id)} className="mt-1 h-4 w-4 shrink-0 accent-[#5b8199]" />
        <span><b className="block text-[12px] text-[#344a64]">{title}</b><small className="mt-1 block text-[10px] leading-4 text-[#718096]">{description}</small><span className="mt-1.5 block text-[11px] text-[#344a64]">+ NZ$20.00</span></span>
      </label>)}
    </div>
  </section>;
}
