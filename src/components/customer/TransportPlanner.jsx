import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bus, CarFront, Check, ChevronDown, MapPin, Mountain, Sun } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { LocalizeCustomerTree } from '@/lib/customerLocale';
import { cardronaImage } from '@/lib/cardronaImages';

const TRANSPORT_URL = 'https://cardrona-treblecone.com/mountains/transport';

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

function OptionCard({ icon: Icon, title, subtitle, price, priceNote, details, action, href, to, featured = false }) {
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
      {action && (to ? <Link to={to} className={`mt-3 inline-flex min-h-8 items-center gap-1 rounded-full px-3 text-[10px] font-semibold ${featured ? 'bg-[#5e839b] text-white' : 'bg-[#eaf0f6] text-[#4f6e87]'}`}>{action}<ArrowUpRight className="h-3 w-3" /></Link> : <a href={href} target="_blank" rel="noreferrer" className={`mt-3 inline-flex min-h-8 items-center gap-1 rounded-full px-3 text-[10px] font-semibold ${featured ? 'bg-[#5e839b] text-white' : 'bg-[#eaf0f6] text-[#4f6e87]'}`}>{action}<ArrowUpRight className="h-3 w-3" /></a>)}
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
        <p className="mt-1 text-[14px] leading-6 text-[#687b92]">Choose a mountain and see shuttle times and booking options.</p>
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
            <article className="overflow-hidden rounded-[20px] border border-[#dce4ed] bg-white shadow-sm">
              <div className="relative h-36 sm:h-44">
                <img src={cardronaImage('summer-peak-to-pub.webp')} alt="Summer mountain biking at Cardrona" className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#526d8b]">Summer package</span>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-[21px] font-bold text-[#20242b]">Peak to Pub</h3>
                <p className="mt-1 text-[13px] leading-5 text-[#60738d]">Chondola uplift, downhill ride and return shuttle.</p>
              </div>
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between gap-3"><span><b className="font-serif text-[22px] font-bold text-[#5b8199]">NZ$49</b><small className="mt-1 block text-[12px] text-[#687b92]">per adult · package</small></span><Link to="/configure-pass?product=peak-to-pub" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#5b8199] px-4 text-[13px] font-semibold text-white">Book package <ArrowUpRight className="h-4 w-4"/></Link></div>
              </div>
            </article>
            <article className="overflow-hidden rounded-[20px] border border-[#dce4ed] bg-white shadow-sm">
              <img src={cardronaImage('mountain-biking.webp')} alt="Mountain biking on Cardrona's alpine trails" className="h-36 w-full object-cover sm:h-44" />
              <div className="p-4">
              <div className="flex items-start justify-between gap-3"><div><span className="inline-flex rounded-full bg-[#e3ebf4] px-3 py-1 text-[11px] font-semibold text-[#526d8b]">Summer transport</span><h3 className="mt-2 font-serif text-[20px] font-bold text-[#202b3a]">Cardrona Valley Shuttle</h3><p className="mt-1 text-[13px] leading-5 text-[#60738d]">From Cardrona Valley Road to the mountain.</p></div><Bus className="mt-1 h-6 w-6 shrink-0 text-[#5b8199]"/></div>
              <p className="mt-4 text-[13px] font-semibold text-[#263345]">Departures up</p>
              <div className="mt-2 grid grid-cols-2 gap-2">{[['9:00 am', 'Daily'], ['11:00 am', 'Daily'], ['1:00 pm', 'Daily'], ['5:00 pm', 'Fridays only']].map(([time, note]) => <div key={time} className="rounded-xl bg-[#f1f5f8] px-3 py-2.5"><b className="block text-[15px] text-[#263345]">{time}</b><span className="text-[11px] text-[#60738d]">{note}</span></div>)}</div>
              <div className="mt-3 rounded-xl border border-[#dce4ed] px-3 py-2.5"><p className="text-[12px] font-semibold text-[#263345]">Return shuttles down</p><p className="mt-1 text-[13px] text-[#60738d]">12:30 pm · 4:15 pm · 8:15 pm Fridays</p></div>
              <div className="mt-4 flex items-center justify-between gap-3"><span><b className="font-serif text-[21px] font-bold text-[#5b8199]">NZ$20</b><small className="mt-1 block text-[11px] text-[#687b92]">one way · return +NZ$5</small></span><Link to="/summer-shuttle" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#5b8199] px-4 text-[13px] font-semibold text-white">Choose a bus <ArrowUpRight className="h-4 w-4"/></Link></div>
              </div>
            </article>
          </> : <>
            <OptionCard icon={Bus} title={`${origin} Ski Bus`} subtitle={`Return bus to ${destination} · multiple pickup points`} price="NZ$45" priceNote="per person · 2026 pricing" details={[skiBusDetails[destination][origin], 'Return travel included; all-season service', 'Pickup points and timetable on the official site']} featured />
            {origin === 'Queenstown' && destination === 'Cardrona' && <OptionCard icon={Bus} title="Après later-departure bus" subtitle="Queenstown to Cardrona · seasonal service" price="NZ$45" priceNote="return · 2026 listed fare" details={['Later morning departure; selected Queenstown pickup points', 'Published 2026 dates have passed; check the official site for the next season’s dates and availability']} action="Check seasonal dates" href={TRANSPORT_URL} />}
            <OptionCard icon={MapPin} title="Free mountain road shuttle" subtitle={destination === 'Cardrona' ? 'From The Pines car park' : 'From the car park at the bottom of the access road'} price="FREE" details={[mountainShuttleTimes[destination], 'First come, first served; no booking required', 'Times can change with weather, road conditions or capacity']} />
            <OptionCard icon={CarFront} title={`Drive to ${destination}`} subtitle={`${drive.distance} from ${origin} · ${drive.time}`} price="—" priceNote="drive time varies" details={[drive.road, 'Snow chains are required in your vehicle; check road conditions before travelling.']} />
          </>}
        </div>
      </section>

      <p className="px-1 text-[9px] leading-4 text-[#718096]">Fares, schedules and road conditions may change. Confirm current information on the official Cardrona & Treble Cone site before you travel.</p>
      <a href={TRANSPORT_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 py-1 text-[10px] font-semibold text-[#5b8199]">Official transport information <ArrowUpRight className="h-3 w-3" /></a>
    </main></LocalizeCustomerTree>
  );
}
