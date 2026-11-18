import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CloudSnow, Mountain, Thermometer, Wind } from 'lucide-react';

const MOUNTAIN_PHOTOS = {
  Cardrona: 'https://images.ctfassets.net/2atbvuhykqrn/zqD6u143cOKQ9cE4ab6FK/b9a946a427d1b3ec31dde64e4e71cb8d/W24-Mountains_Imagery-Cardrona_Half_Page_Image.webp?w=1200&h=700&fit=fill&fm=webp&q=80',
  'Treble Cone': 'https://images.ctfassets.net/2atbvuhykqrn/21XEVqbsE99Ohb1AXWAZQu/2a8b0a5694e29c906caa75b7ebe232d1/W24-Mountains_Imagery-Treble_Cone_Half_Page_Image.webp?w=1200&h=700&fit=fill&fm=webp&q=80',
};
const OFFICIAL_REPORT = 'https://cardrona-treblecone.com/snow-report';

const ZH = {
  'Closed for the 2026 winter season': '2026 年冬季已结束',
  'Closed for the season': '本季已结束',
  'Summer operations and the Bike Park reopen 12 December.': '夏季运营和山地车公园将于 12 月 12 日重新开放。',
  'Thanks for joining us this season. See you next season.': '感谢您本季的到访，我们下个雪季再见。',
  'Snow report updated 18 Oct, 4:34 pm': '雪况报告更新于 10 月 18 日下午 4:34',
  'Snow report updated 7 Oct, 10:34 am': '雪况报告更新于 10 月 7 日上午 10:34',
  'Overnight': '夜间', '7 days': '近 7 天', 'Base · 1,800 m': '山脚 · 1,800 米', 'Snow base': '雪深',
  'TEMP': '气温', 'WIND': '风速', 'GUST': '阵风', 'BASE · 1,800 M': '山脚 · 1,800 米', 'SNOW BASE': '雪深',
  'Weather report updated 10:10 pm': '天气报告更新于晚上 10:10',
  '5-day outlook to prepare for on-mountain conditions.': '未来 5 天天气预报，帮助您了解山上情况。',
  'Official 5-day forecast for Treble Cone.': 'Treble Cone 官方 5 天天气预报。',
  'Closed': '关闭', 'Chain Free': '无需防滑链', 'No Public Access': '暂不对公众开放', 'Gate is locked': '入口闸门已关闭',
  'Access road closed. Active road hazard on access roads.': '进山道路已关闭。进山道路存在安全隐患。',
  'See website for summer access info. Active road hazard on access roads.': '夏季通行信息请查看官网。进山道路存在安全隐患。',
  'Lifts & terrain': '缆车与雪道', 'Car parks & park': '停车场与地形公园',
  'Conditions': '雪况', 'Weather': '天气', 'Road': '道路', 'On the mountain': '山上状况',
  'Official report': '官方报告', 'Read more': '了解更多',
  'Latest access information': '最新通行信息', 'View current conditions on the official resort site': '查看度假村官网当前山况',
  'Daily forecast details are not listed in the current report.': '当前报告未列出每日预报详情。',
  'Fri 13th': '周五 13 日', 'Sat 14th': '周六 14 日', 'Sun 15th': '周日 15 日', 'Mon 16th': '周一 16 日', 'Tue 17th': '周二 17 日',
  'LIFT': '缆车', 'CARPARK': '停车场',
};

function localize(value, lang) {
  if (lang !== 'zh') return value;
  return ZH[value] || value;
}

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
    statusCards: [['LIFT', '0 / 10', 'Lifts & terrain', 'text-emerald-600'], ['CARPARK', '0 / 6', 'Car parks & park', 'text-amber-600']],
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
    statusCards: [['LIFT', '0 / 10', 'Lifts & terrain', 'text-emerald-600'], ['CARPARK', '0 / 6', 'Car parks & park', 'text-amber-600']],
  },
};

export default function MountainReport({ mountain, lang = 'en', accent = '#5b8199' }) {
  const [tab, setTab] = useState('Conditions');
  const [expanded, setExpanded] = useState(false);
  const report = REPORTS[mountain] || REPORTS.Cardrona;
  const officialUrl = `${OFFICIAL_REPORT}${mountain === 'Treble Cone' ? '?mountainId=treblecone' : ''}`;

  return <section className="mx-4 mt-1" aria-label={lang === 'zh' ? `${mountain} 山况报告` : `${mountain} mountain report`}>
    <div className="relative h-[206px] overflow-hidden rounded-[18px] bg-[#24364d] text-white">
      <img src={MOUNTAIN_PHOTOS[mountain] || MOUNTAIN_PHOTOS.Cardrona} alt={`${mountain} mountain`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15" />
      <span className="absolute right-3 top-3 rounded-md bg-[#172334]/85 px-2.5 py-1.5 text-[8px]">{lang === 'zh' ? '2026 雪季结束' : '2026 SEASON CLOSED'}</span>
      <div className="absolute inset-x-4 bottom-4 top-[18px] flex flex-col items-start">
        <p className="text-[8px] font-bold tracking-[0.24em] text-white/90">{mountain.toUpperCase()}</p>
        <span className="mt-auto text-[8px] tracking-[0.18em] text-white/85">{lang === 'zh' ? '雪山资讯 · 历史数据' : 'SNOW REPORT · ARCHIVE'}</span>
        <h1 className="mt-1 font-serif text-[21px] font-bold leading-tight">{localize(report.summary, lang)}</h1>
        <p className="mt-1 text-[9px] leading-4 text-white/90">{localize(report.summaryDetail, lang)}</p>
        <a href={officialUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[8px] font-medium underline underline-offset-2">{lang === 'zh' ? '查看官网最新雪况' : 'View latest snow report'}<ArrowUpRight className="h-3 w-3"/></a>
      </div>
    </div>

    {!expanded && <button type="button" onClick={() => setExpanded(true)} className="mt-2.5 flex min-h-[52px] w-full items-center gap-2.5 rounded-[15px] border border-[#dce4ed] bg-white px-3 text-left shadow-sm">
      <Mountain className="h-4 w-4 shrink-0 text-[#15727a]"/>
      <span className="min-w-0 flex-1"><b className="block text-[10px] font-semibold text-[#233a49]">{lang === 'zh' ? '雪山实时信息入口' : 'Live mountain information'}</b><small className="mt-0.5 block truncate text-[8px] text-[#718096]">{localize(report.summaryUpdated, lang)} · {lang === 'zh' ? '演示快照' : 'Demo snapshot'}</small></span>
      <span className="flex items-center gap-1 text-[8px] font-semibold text-[#15727a]">{lang === 'zh' ? '详情' : 'Details'}<ArrowUpRight className="h-3 w-3"/></span>
    </button>}

    {expanded && <div className="mt-2.5 overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white shadow-sm">
      <div role="tablist" aria-label="Mountain information" className="grid h-[44px] grid-cols-3 border-b border-[#e2e7ee] bg-[#f0f3f4]">
        {['Conditions', 'Weather', 'Road'].map((name) => <button key={name} type="button" role="tab" id={`report-tab-${name}`} aria-selected={tab === name} aria-controls={`report-panel-${name}`} onClick={() => setTab(name)} className={`relative text-[11px] ${tab === name ? 'bg-white font-semibold text-[#243a49]' : 'text-[#70808c]'}`}>{localize(name, lang)}{tab === name && <span className="absolute bottom-0 left-0 h-0.5 w-full" style={{ backgroundColor: accent }}/>}</button>)}
      </div>
      <div role="tabpanel" id={`report-panel-${tab}`} aria-labelledby={`report-tab-${tab}`} className="min-h-[104px] px-4 py-3">
        {tab === 'Conditions' ? <>
          <div className="mb-2 border-b border-[#e5e9ef] pb-2"><h2 className="text-[10px] font-semibold text-[#344a64]">{localize('On the mountain', lang)}</h2></div>
          <div className="grid grid-cols-4 gap-2">
            {report.conditions.map(([value, label, Icon]) => <div key={label}><Icon aria-hidden="true" className="mb-1 h-3.5 w-3.5 text-[#8596aa]"/><b className="block text-[11px] leading-4 text-[#344a64]">{value}</b><span className="block text-[7px] tracking-[0.1em] text-[#718096]">{localize(label, lang)}</span></div>)}
          </div>
          <p className="mt-2 text-[8px] text-[#718096]">{localize(report.summaryUpdated, lang)} · <a href={officialUrl} target="_blank" rel="noreferrer" className="underline">{localize('Official report', lang)}</a></p>
        </> : tab === 'Weather' ? <>
          <div className="grid grid-cols-3 border-b border-[#e5e9ef] pb-2 text-[#344a64]">{report.weather.map(([value, label]) => <div key={label}><b className="text-[12px]">{value}</b><span className="ml-1 text-[7px] tracking-[0.12em] text-[#718096]">{label}</span></div>)}</div>
          {report.forecast.length > 0 ? <div className="mt-2 space-y-1 text-[8px] text-[#718096]">{report.forecast.map(([day, temp, wind, icon]) => <div key={day} className="flex justify-between pb-1"><span>{localize(day, lang)}</span><span className="flex gap-4"><b className="text-[#344a64]">{icon === 'wind' ? '≋ ' : icon === 'cloud' ? '☁ ' : icon === 'sun' ? '☼ ' : ''}{temp}</b><span>{wind}</span></span></div>)}</div> : <p className="mt-3 text-[8px] text-[#718096]">{localize('Daily forecast details are not listed in the current report.', lang)}</p>}
          <p className="mt-2 text-[8px] text-[#718096]">{localize(report.forecastNote, lang)} {localize(report.weatherUpdated, lang)} · <a href={officialUrl} target="_blank" rel="noreferrer" className="underline">{localize('Official report', lang)}</a></p>
        </> : <>
          <div className="flex items-start gap-2 text-[#8b421c]"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0"/><div><h2 className="text-[10px] font-bold">{localize(report.roadTitle, lang)}</h2><p className="mt-1 text-[8px] leading-4 text-[#718096]">{localize(report.roadDetail, lang)}</p><a href={`${OFFICIAL_REPORT}#road-hazard-advisory`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center text-[8px] font-semibold">{localize('Latest access information', lang)}<ArrowUpRight className="ml-0.5 h-3 w-3"/></a></div></div>
          <a href={officialUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-[8px] font-semibold text-[#15727a]">{localize('View current conditions on the official resort site', lang)}<ArrowUpRight className="ml-1 h-3 w-3"/></a>
        </>}
      </div>
      <button type="button" onClick={() => setExpanded(false)} className="w-full border-t border-[#e5e9ef] py-2 text-[8px] font-semibold text-[#15727a]">{lang === 'zh' ? '收起详情' : 'Hide details'}</button>
    </div>}

    {expanded && <div className="mt-2.5 grid grid-cols-2 gap-2.5">
      {report.statusCards.map(([label, value, action, color]) => <Link key={label} to={`/snow-report?mountainId=${mountain === 'Treble Cone' ? 'treblecone' : 'cardrona'}&view=${label === 'LIFT' ? 'lifts' : 'carparks'}`} className="rounded-[16px] bg-white px-4 py-3 shadow-sm"><span className="block text-[7px] tracking-[0.2em] text-[#718096]">{localize(label, lang)}</span><b className={`mt-1 block text-[22px] leading-7 ${color}`}>{value}</b><span className={`mt-1 flex items-center gap-1 text-[9px] ${color}`}>{localize(action, lang)}<ArrowUpRight className="h-3 w-3"/></span></Link>)}
    </div>}
  </section>;
}
