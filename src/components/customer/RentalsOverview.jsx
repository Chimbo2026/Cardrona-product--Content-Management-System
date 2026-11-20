import { ArrowUpRight, Check, MapPin, PackageCheck } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { LocalizeCustomerTree } from '@/lib/customerLocale';

const RENTALS_URL = 'https://cardrona-treblecone.com/rentals';

const rentalOptions = [
  {
    name: 'Complete Rental Bundle',
    price: 'NZ$141',
    label: 'Adult · 1 day · 2026 pricing',
    badge: 'Clothing included',
    details: [
      'Skis or snowboard, boots and poles',
      'Jacket, pants, goggles and helmet',
      'Gear and clothing together in one booking',
      'Pick up in town or on the mountain',
    ],
  },
  {
    name: 'Core Rental Bundle',
    price: 'NZ$63',
    label: 'Adult · 1 day · 2026 pricing',
    details: [
      'Skis or snowboard, boots and poles',
      'Professionally fitted for comfort and control',
      'Town or mountain pickup',
      'Overnight storage for multi-day rentals',
    ],
  },
  {
    name: 'Premium Rental Bundle',
    price: 'NZ$99',
    label: 'Adult · 1 day · 2026 pricing',
    badge: 'Skip the queue',
    details: [
      'Performance gear fitted and ready when you arrive',
      'Options for park, powder and carving',
      'Equipment tuned for current conditions',
      'Pick up and return on the mountain',
    ],
  },
  {
    name: 'Clothing & Accessory Rentals',
    price: 'NZ$58',
    label: 'Adult · 1 day · 2026 pricing',
    details: [
      'Snow jacket and pants',
      'Add goggles and a helmet if needed',
      'Choose only the items you need',
      'Pick up in Queenstown, Wānaka or on the mountain',
    ],
    note: 'Gloves are not included.',
  },
  {
    name: 'Lift Pass & Rental Combo',
    price: 'NZ$247',
    label: 'Adult · 1 day · 2026 pricing',
    details: [
      'Single or multi-day lift pass',
      'Skis and boots or snowboard and boots',
      'Upgrade to the complete clothing bundle',
      'The more days you buy, the less you pay',
    ],
  },
];

export default function RentalsOverview() {
  const { lang } = useLang();
  return (
    <LocalizeCustomerTree lang={lang}><main className="space-y-4 px-4 pb-8 pt-5 sm:px-8">
      <section>
        <h2 className="font-serif text-[25px] font-bold text-[#2e435d]">Ski &amp; snowboard rentals</h2>
        <p className="mt-1 text-[11px] leading-5 text-[#687b92]">Choose your equipment, clothing and pickup location for your mountain day.</p>
        <span className="mt-3 inline-flex rounded-full bg-[#e1eaf4] px-3 py-1.5 text-[9px] font-semibold tracking-[0.06em] text-[#536f89]">WINTER RENTALS · 2026 PRICING</span>
      </section>

      {rentalOptions.map((option) => (
        <article key={option.name} className="rounded-[18px] border border-[#dce4ed] bg-white p-4 shadow-[0_3px_10px_rgba(35,52,75,0.06)]">
          {option.badge && <span className="mb-2 inline-flex rounded-full bg-[#eaf0f6] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.05em] text-[#536f89]">{option.badge}</span>}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-[16px] font-bold leading-5 text-[#20242b]">{option.name}</h3>
            <div className="shrink-0 text-right">
              <strong className="font-serif text-[21px] font-normal text-[#5b8199]">{option.price}</strong>
              <small className="mt-0.5 block text-[8px] text-[#8492a4]">{option.label}</small>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 border-t border-[#e6ecf2] pt-3">
            {option.details.map((detail) => (
              <li key={detail} className="flex gap-2 text-[10px] leading-4 text-[#435a75]">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#5e839b]" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
          {option.note && <p className="mt-2 text-[9px] text-[#718096]">{option.note}</p>}
        </article>
      ))}

      <section className="rounded-[16px] border border-[#dce4ed] bg-[#e7eef6] p-4">
        <div className="flex items-center gap-2 text-[#334a64]"><MapPin className="h-4 w-4" /><h3 className="text-[12px] font-semibold">Pickup &amp; fitting</h3></div>
        <p className="mt-2 text-[10px] leading-4 text-[#526981]">On-mountain pickup starts at 8:30am. Town collection is available the day before: from noon in Queenstown or 3pm in Wānaka. Premium rentals must be collected and returned on the mountain.</p>
        <p className="mt-2 flex items-start gap-1.5 text-[9px] leading-4 text-[#718096]"><PackageCheck className="mt-0.5 h-3 w-3 shrink-0" />Return equipment to the pickup location unless another arrangement is confirmed.</p>
      </section>

      <a href={RENTALS_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 py-1 text-[10px] font-semibold text-[#5b8199]">View all rental details on Cardrona’s website <ArrowUpRight className="h-3 w-3" /></a>
    </main></LocalizeCustomerTree>
  );
}
