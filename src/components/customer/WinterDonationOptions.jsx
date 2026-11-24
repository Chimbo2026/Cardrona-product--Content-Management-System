import { useLang } from '@/lib/i18n';
import { LocalizeCustomerTree } from '@/lib/customerLocale';

const OPTIONS = [
  ['seed', 'Plant A Seed', 'Help us plant natives to regenerate our environment and offset your carbon emissions*.'],
  ['tamariki', 'Ride Tamariki', 'Help us provide life changing experiences in the mountains for disadvantaged children/families.'],
  ['karearea', 'The Kārearea Project', 'Help fund our scientific conservation of the magnificent and threatened NZ Falcon.'],
  ['all-in', 'All In', 'Creating an inclusive environment for all by supporting and representing all communities of the mountain.'],
];

export default function WinterDonationOptions({ foundation, onFoundationChange, selected, onToggle }) {
  const { lang } = useLang();
  return <LocalizeCustomerTree lang={lang}><section className="space-y-3">
    <div>
      <h3 className="text-[14px] font-semibold text-[#344a64]">Would you like to support the Cardrona Foundation?</h3>
      <p className="mt-1 text-[15px] text-[#777]">Help us spread goodness, guardianship and conservation throughout our communities.</p>
    </div>
    <label className="flex min-h-[62px] cursor-pointer items-center justify-between rounded-xl border border-[#a0a0a0] bg-white px-4 text-[15px] font-semibold text-[#252525]">
      Yes, I'd like to make a donation
      <input type="checkbox" checked={foundation} onChange={(event) => onFoundationChange(event.target.checked)} className="h-5 w-5 accent-[#5b8199]" />
    </label>
    <div className="space-y-4">{OPTIONS.map(([id, title, description]) => <section key={id}>
      <h4 className="mb-2 text-[15px] font-bold text-[#252525]">{title}</h4>
      {selected.includes(id) || <p className="mb-2 text-[14px]">Select One (Optional)</p>}
      <label className={`flex min-h-[100px] cursor-pointer items-start gap-4 rounded-xl border p-4 ${selected.includes(id) ? 'border-[#252525]' : 'border-[#a0a0a0]'}`}>
        <span className="min-w-0 flex-1"><b className="block text-[15px] text-[#252525]">{title}</b><small className="mt-2 block text-[12px] leading-4 text-[#777]">{description}</small><span className="mt-2 block text-[15px] text-[#252525]">+ $20</span></span>
        <input type="checkbox" checked={selected.includes(id)} onChange={() => onToggle(id)} className="h-5 w-5 shrink-0 accent-[#5b8199]" />
      </label>
    </section>)}</div>
  </section></LocalizeCustomerTree>;
}
