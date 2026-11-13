import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CloudSnow, Mountain, Thermometer, Wind } from 'lucide-react';

const mountainPhoto = 'https://assets.simpleviewinc.com/simpleview/image/upload/c_fill%2Cf_jpg%2Cg_xy_center%2Ch_852%2Cq_65%2Cw_640%2Cx_1530%2Cy_1210/v1/clients/queenstownnz/Do_not_use_before_Winter_2025_Family_Ski_Cardrona_93772c40-e340-4b4a-bcd2-7c72598f67a7.jpg';
const OFFICIAL_REPORT = 'https://cardrona-treblecone.com/snow-report';

const REPORTS = {
  Cardrona: {
    summary: 'Closed for the 2026 winter season',
    summaryDetail: 'Summer operations and the Bike Park reopen 12 December.',
    summaryUpdated: 'Snow report updated 18 Oct, 4:34 pm',
    snow: [['Overnight', '0 cm'], ['7 days', '24 cm'], ['Base · 1,800 m', '87 cm']],
    conditions: [['3°C', 'TEMP', Thermometer], ['21 km/h', 'WIND', Wind], ['40 km/h', 'GUST', CloudSnow], ['87 cm', 'BASE · 1,800 M', Mountain]],
    weather: [['3°C', 'TEMP'], ['21 km/h', 'WIND'], ['40 km/h', 'GUST']],
    weatherUpdated: 'Weather report updated 10:10 pm',
    forecast: [['Fri 13th', '5°C', '21 km/h', 'wind'], ['Sat 14th', '6°C', '13 km/h', 'sun'], ['Sun 15th', '5°C', '43 km/h', 'wind'], ['Mon 16th', '3°C', '32 km/h', 'cloud'], ['Tue 17th', '2°C', '24 km/h', 'wind']],
    forecastNote: '5-day outlook to prepare for on-mountain conditions.',
    roadStatus: 'Closed',
    roadTitle: 'No Public Access',
    roadDetail: 'Access road closed. Active road hazard on access roads.',
    statusCards: [['LIFTS', '0 / 10', 'Lifts open', 'text-emerald-600'], ['TERRAIN', '0 / 9', 'Terrain open', 'text-amber-600']],
  },
  'Treble Cone': {
    summary: 'Closed for the season',
    summaryDetail: 'Thanks for joining us this season. See you next season.',
    summaryUpdated: 'Snow report updated 7 Oct, 10:34 am',
    snow: [['Overnight', '—'], ['7 days', '—'], ['Snow base', '—']],
    conditions: [['4°C', 'TEMP', Thermometer], ['14 km/h', 'WIND', Wind], ['26 km/h', 'GUST', CloudSnow], ['—', 'SNOW BASE', Mountain]],
    weather: [['4°C', 'TEMP'], ['14 km/h', 'WIND'], ['26 km/h', 'GUST']],
    weatherUpdated: 'Weather report updated 10:10 pm',
    forecast: [['Fri 13th', '6°C', '16 km/h'], ['Sat 14th', '7°C', '10 km/h'], ['Sun 15th', '5°C', '37 km/h'], ['Mon 16th', '4°C', '27 km/h'], ['Tue 17th', '2°C', '19 km/h']],
    forecastNote: 'Official 5-day forecast for Treble Cone.',
    roadStatus: 'Chain Free',
    roadTitle: 'Gate is locked',
    roadDetail: 'See website for summer access info. Active road hazard on access roads.',
    statusCards: [['LIFTS', '0 / 3', 'Lifts open', 'text-emerald-600'], ['CARPARKS', '0 / 5', 'Carparks open', 'text-amber-600']],
  },
};

export default function MountainReport({ mountain }) {
  const [tab, setTab] = useState('Conditions');
  const report = REPORTS[mountain] || REPORTS.Cardrona;
  const officialUrl = `${OFFICIAL_REPORT}${mountain === 'Treble Cone' ? '?mountainId=treblecone' : ''}`;

  return <section className="mx-4 mt-1" aria-label={`${mountain} mountain report`}>
    <div className="relative h-[227px] overflow-hidden rounded-[18px] bg-[#24364d] text-white">
      <img src={mountainPhoto} alt={`Snow-covered ${mountain} mountain`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15" />
      <span className="absolute right-3 top-2 rounded-full bg-[#172334]/85 px-3 py-1 text-[9px]">CLOSED</span>
      <div className="absolute inset-x-4 bottom-3 top-[48px] flex flex-col">
        <p className="text-[8px] tracking-[0.26em] text-white/80">{mountain.toUpperCase()} · SNOW REPORT</p>
        <h1 className="mt-2 font-serif text-[22px] font-bold leading-tight">{report.summary}</h1>
        <p className="mt-1 text-[9px] leading-4 text-white/85">{report.summaryDetail}</p>
        <dl className="mt-auto grid grid-cols-3 border-t border-white/20 pt-3">
          {report.snow.map(([label, value]) => <div key={label}><dt className="text-[7px] uppercase tracking-[0.16em] text-white/65">{label}</dt><dd className="mt-1 text-[12px] font-semibold">{value}</dd></div>)}
        </dl>
      </div>
    </div>

    <div className="mt-2.5 overflow-hidden rounded-[18px] bg-white shadow-sm">
      <div role="tablist" aria-label="Mountain information" className="grid h-[44px] grid-cols-3 border-b border-[#e2e7ee]">
        {['Conditions', 'Weather', 'Road'].map((name) => <button key={name} type="button" role="tab" id={`report-tab-${name}`} aria-selected={tab === name} aria-controls={`report-panel-${name}`} onClick={() => setTab(name)} className={`relative text-[11px] ${tab === name ? 'font-semibold text-[#344a64]' : 'text-[#60738d]'}`}>{name}{tab === name && <span className="absolute bottom-0 left-1/2 h-0.5 w-11 -translate-x-1/2 bg-[#c8102e]"/>}</button>)}
      </div>
      <div role="tabpanel" id={`report-panel-${tab}`} aria-labelledby={`report-tab-${tab}`} className="min-h-[104px] px-4 py-3">
        {tab === 'Conditions' ? <>
          <div className="mb-2 border-b border-[#e5e9ef] pb-2"><h2 className="text-[10px] font-semibold text-[#344a64]">On the mountain</h2></div>
          <div className="grid grid-cols-4 gap-2">
            {report.conditions.map(([value, label, Icon]) => <div key={label}><Icon aria-hidden="true" className="mb-1 h-3.5 w-3.5 text-[#8596aa]"/><b className="block text-[11px] leading-4 text-[#344a64]">{value}</b><span className="block text-[7px] tracking-[0.1em] text-[#718096]">{label}</span></div>)}
          </div>
          <p className="mt-2 text-[8px] text-[#718096]">{report.summaryUpdated} · <a href={officialUrl} target="_blank" rel="noreferrer" className="underline">Official report</a></p>
        </> : tab === 'Weather' ? <>
          <div className="grid grid-cols-3 border-b border-[#e5e9ef] pb-2 text-[#344a64]">{report.weather.map(([value, label]) => <div key={label}><b className="text-[12px]">{value}</b><span className="ml-1 text-[7px] tracking-[0.12em] text-[#718096]">{label}</span></div>)}</div>
          {report.forecast.length > 0 ? <div className="mt-2 space-y-1 text-[8px] text-[#718096]">{report.forecast.map(([day, temp, wind, icon]) => <div key={day} className="flex justify-between pb-1"><span>{day}</span><span className="flex gap-4"><b className="text-[#344a64]">{icon === 'wind' ? '≋ ' : icon === 'cloud' ? '☁ ' : icon === 'sun' ? '☼ ' : ''}{temp}</b><span>{wind}</span></span></div>)}</div> : <p className="mt-3 text-[8px] text-[#718096]">Daily forecast details are not listed in the current report.</p>}
          <p className="mt-2 text-[8px] text-[#718096]">{report.forecastNote} {report.weatherUpdated} · <a href={officialUrl} target="_blank" rel="noreferrer" className="underline">Official report</a></p>
        </> : <>
          <span className="inline-block rounded-full bg-[#d82717] px-2.5 py-1 text-[8px] font-semibold text-white">{report.roadStatus}</span>
          <h2 className="mt-2 border-b border-[#e5e9ef] pb-1 text-[10px] font-semibold text-[#344a64]">{report.roadTitle}</h2>
          <p className="mt-2 flex items-start gap-1 text-[8px] text-[#60738d]"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-600"/>{report.roadDetail} <a href={`${OFFICIAL_REPORT}#road-hazard-advisory`} target="_blank" rel="noreferrer" className="shrink-0 underline">Read more</a></p>
        </>}
      </div>
    </div>

    <div className="mt-2.5 grid grid-cols-2 gap-2.5">
      {report.statusCards.map(([label, value, action, color]) => <Link key={label} to="/ski" className="rounded-[16px] bg-white px-4 py-3 shadow-sm"><span className="block text-[7px] tracking-[0.2em] text-[#718096]">{label}</span><b className={`mt-1 block text-[22px] leading-7 ${color}`}>{value}</b><span className={`mt-1 flex items-center gap-1 text-[9px] ${color}`}>{action}<ArrowUpRight className="h-3 w-3"/></span></Link>)}
    </div>
  </section>;
}
