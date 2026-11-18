import { useState } from 'react';
import { ArrowUpRight, Bus, CarFront, Check, ChevronDown, MapPin, Mountain, Sun } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { LocalizeCustomerTree } from '@/lib/customerLocale';

const TRANSPORT_URL = 'https://cardrona-treblecone.com/mountains/transport';
const SUMMER_BOOKING_URL = 'https://secure.cardrona-treblecone.com/s/summer';

const driveDetails = {
  Cardrona: {
    Wānaka: { distance: '35 km', time: '40–45 min', road: '14 km unsealed mountain road' },
    Queenstown: { distance: '59 km', time: '1–1.5 hrs', road: '14 km unsealed mountain road' },
  },
  'Treble Cone': {
    Wānaka: { distance: '30 km', time: '35–40 min', road: '7.5 km unsealed mountain road' },
    Queenstown: { distance: '97 km', time: '1.5–2 hrs', road: '7.5 km unsealed mountain road' },
  },
};

const skiBusDetails = {
  Cardrona: {
    Wānaka: 'Pickup times: 7:30–8:00am · Mountain return: 4:30pm',
    Queenstown: 'Pickup times: 7:30–8:10am · Mountain return: 4:15pm',
  },
  'Treble Cone': {
    Wānaka: 'Pickup times: 8:30–8:35am · Mountain return: 4:00pm',
    Queenstown: 'Pickup times: 7:00–7:40am · Mountain return: 4:00pm',
  },
};

const mountainShuttleTimes = {
  Cardrona: 'Up: 8:00–11:30am · Down: 1:30–4:15pm',
  'Treble Cone': 'Up: 8:00–10:00am · Down: 1:30–4:15pm',
};

function PlannerSelect({ label, value, onChange, children }) {
  return (
    <label className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#718096]">
      {label}
      <span className="relative mt-1.5 block">
        <select value={value} onChange={onChange} className="h-11 w-full appearance-none rounded-[13px] border border-[#dce4ed] bg-white px-3 pr-8 text-[12px] font-medium normal-case tracking-normal text-[#344a64] outline-none focus:border-[#5e839b]">
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#718096]" />
      </span>
    </label>
  );
}

function OptionCard({ icon: Icon, title, subtitle, price, priceNote, details, action, href, featured = false }) {
  return (
    <article className="rounded-[17px] border border-[#dce4ed] bg-white p-3.5 shadow-[0_3px_10px_rgba(35,52,75,0.06)]">
      <div className="flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf0f6] text-[#5e839b]"><Icon className="h-[18px] w-[18px]" /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold leading-5 text-[#2d435d]">{title}</h3>
          <p className="mt-0.5 text-[10px] leading-4 text-[#718096]">{subtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <strong className={`block text-[14px] ${price === 'FREE' ? 'text-[#47775d]' : 'text-[#5b8199]'}`}>{price}</strong>
          {priceNote && <small className="block text-[9px] text-[#718096]">{priceNote}</small>}
        </div>
      </div>
      <ul className="mt-3 space-y-1.5 border-t border-[#e8edf2] pt-2.5">
        {details.map((detail) => <li key={detail} className="flex items-start gap-1.5 text-[10px] leading-4 text-[#526981]"><Check className="mt-0.5 h-3 w-3 shrink-0 text-[#5e839b]" />{detail}</li>)}
      </ul>
      <a href={href} target="_blank" rel="noreferrer" className={`mt-3 inline-flex min-h-8 items-center gap-1 rounded-full px-3 text-[10px] font-semibold ${featured ? 'bg-[#5e839b] text-white' : 'bg-[#eaf0f6] text-[#4f6e87]'}`}>
        {action}<ArrowUpRight className="h-3 w-3" />
      </a>
    </article>
  );
}

export default function TransportPlanner() {
  const { lang } = useLang();
  const [season, setSeason] = useState('Winter');
  const [origin, setOrigin] = useState('Wānaka');
  const [destination, setDestination] = useState('Cardrona');
  const drive = driveDetails[destination][origin];
  const isSummer = season === 'Summer';

  return (
    <LocalizeCustomerTree lang={lang}><main className="space-y-4 px-4 pb-8 pt-5 sm:px-8">
      <section>
        <h2 className="font-serif text-[25px] font-bold text-[#2e435d]">Plan your trip</h2>
        <p className="mt-1 text-[11px] leading-5 text-[#687b92]">Choose where you’re starting and which mountain you’re visiting to compare travel options.</p>
      </section>

      <section className="rounded-[18px] border border-[#dce4ed] bg-white p-3.5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#718096]">Season</p>
        <div className="grid grid-cols-2 rounded-full bg-[#e7eef6] p-1">
          {['Winter', 'Summer'].map((option) => {
            const active = season === option;
            const Icon = option === 'Winter' ? Mountain : Sun;
            return <button key={option} type="button" aria-pressed={active} onClick={() => { setSeason(option); if (option === 'Summer') setDestination('Cardrona'); }} className={`flex h-9 items-center justify-center gap-1.5 rounded-full text-[12px] font-medium ${active ? 'bg-[#5b8199] text-white shadow-sm' : 'text-[#526981]'}`}><Icon className="h-3.5 w-3.5" />{option}</button>;
          })}
        </div>
        <div className="mt-3 flex items-end gap-2.5">
          <PlannerSelect label={isSummer ? 'Starting point' : 'Starting from'} value={isSummer ? 'Cardrona Valley Road' : origin} onChange={(event) => setOrigin(event.target.value)}>
            {isSummer ? <option>Cardrona Valley Road</option> : <><option>Wānaka</option><option>Queenstown</option></>}
          </PlannerSelect>
          <span className="pb-3 text-[13px] text-[#8796a7]">→</span>
          <PlannerSelect label="Mountain" value={destination} onChange={(event) => setDestination(event.target.value)}>
            {isSummer ? <option>Cardrona</option> : <><option>Cardrona</option><option>Treble Cone</option></>}
          </PlannerSelect>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-end justify-between gap-2">
          <h3 className="font-serif text-[18px] font-bold text-[#2e435d]">Travel options</h3>
          <span className="text-right text-[9px] text-[#718096]">{isSummer ? 'Cardrona Valley Road → Cardrona' : `${origin} → ${destination}`}</span>
        </div>
        <div className="space-y-2.5">
          {isSummer ? <>
            <OptionCard icon={Bus} title="Cardrona Summer Shuttle" subtitle="Cardrona Valley Road to the top of the mountain" price="NZ$20" priceNote="adult · one way" details={['Add a return shuttle for NZ$5', 'Mountain bike trailer included', 'Advance booking required; set shuttle times']} action="View summer options" href={SUMMER_BOOKING_URL} featured />
            <OptionCard icon={CarFront} title="Drive to Cardrona" subtitle={`${drive.distance} from ${origin} · ${drive.time}`} price="—" priceNote="drive time varies" details={[drive.road, 'Carry snow chains and check current road conditions before travelling.']} action="Driving details" href={TRANSPORT_URL} />
          </> : <>
            <OptionCard icon={Bus} title={`${origin} Ski Bus`} subtitle={`Return bus to ${destination} · multiple pickup points`} price="NZ$45" priceNote="per person · 2026 pricing" details={[skiBusDetails[destination][origin], 'Return travel included; all-season service', 'Pickup points and timetable on the official site']} action="View bus times & booking" href={TRANSPORT_URL} featured />
            {origin === 'Queenstown' && destination === 'Cardrona' && <OptionCard icon={Bus} title="Après later-departure bus" subtitle="Queenstown to Cardrona · seasonal service" price="NZ$45" priceNote="return · 2026 listed fare" details={['Later morning departure; selected Queenstown pickup points', 'Published 2026 dates have passed; check the official site for the next season’s dates and availability']} action="Check seasonal dates" href={TRANSPORT_URL} />}
            <OptionCard icon={MapPin} title="Free mountain road shuttle" subtitle={destination === 'Cardrona' ? 'From The Pines car park' : 'From the car park at the bottom of the access road'} price="FREE" details={[mountainShuttleTimes[destination], 'First come, first served; no booking required', 'Times can change with weather, road conditions or capacity']} action="Shuttle details" href={TRANSPORT_URL} />
            <OptionCard icon={CarFront} title={`Drive to ${destination}`} subtitle={`${drive.distance} from ${origin} · ${drive.time}`} price="—" priceNote="drive time varies" details={[drive.road, 'Snow chains are required in your vehicle; check road conditions before travelling.']} action="Driving details" href={TRANSPORT_URL} />
          </>}
        </div>
      </section>

      <p className="px-1 text-[9px] leading-4 text-[#718096]">Fares, schedules and road conditions may change. Confirm current information on the official Cardrona & Treble Cone site before you travel.</p>
      <a href={TRANSPORT_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 py-1 text-[10px] font-semibold text-[#5b8199]">Official transport information <ArrowUpRight className="h-3 w-3" /></a>
    </main></LocalizeCustomerTree>
  );
}
