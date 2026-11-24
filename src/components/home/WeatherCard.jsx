import { AlertTriangle, CloudSun } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const WEATHER = {
  cardrona: { temp: '-4°C', snow: 18, trails: '68/78', lifts: '5/8' },
  treble: { temp: '-2°C', snow: 8, trails: '42/47', lifts: '3/4' },
};

export default function WeatherCard({ mountain }) {
  const { bi } = useLanguage();
  const [tab, setTab] = useState('conditions');
  const data = WEATHER[mountain] || WEATHER.cardrona;
  const tabs = [
    { key: 'conditions', zh: '雪场情况', en: 'Conditions' },
    { key: 'weather', zh: '天气', en: 'Weather' },
    { key: 'road', zh: '道路', en: 'Road' },
  ];

  return (
    <section className="px-4 pt-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div
          className="relative min-h-[158px] bg-cover bg-center px-4 py-3 text-white"
          style={{ backgroundImage: "linear-gradient(180deg, rgba(17,26,46,.24), rgba(17,26,46,.88)), url('https://images.ctfassets.net/2atbvuhykqrn/6AIbbKO7mZVfgnAwadXVj9/3112d54a2da2b54112397131770bf093/W24-events_Imagery-Home_Page_Hero_Image_-_Desktop.webp?w=900&q=75')" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-semibold tracking-[0.24em] text-white/75">SNOW REPORT</span>
            <span className="rounded-full bg-[#111a2e]/70 px-2.5 py-1 text-[9px]">● 7:00 pm</span>
          </div>
          <p className="mt-3 font-heading text-[23px] leading-tight">{data.snow} cm overnight</p>
          <p className="font-heading text-[12px] italic text-white/80">Fresh powder</p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/30 pt-2.5">
            {[
              { label: bi('山脚', 'Base'), value: '145 cm' },
              { label: bi('近 7 天', '7 days'), value: '44 cm' },
              { label: bi('本季', 'Season'), value: '312 cm' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[7px] uppercase tracking-[0.2em] text-white/65">{item.label}</p>
                <p className="mt-0.5 text-[11px] font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-border">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`relative py-2 text-[10px] ${tab === item.key ? 'font-semibold text-accent-foreground' : 'text-muted-foreground'}`}
            >
              {bi(item.zh, item.en)}
              {tab === item.key && <span className="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        <div className="min-h-[86px] p-3.5">
          {tab === 'conditions' && (
            <>
              <div className="inline-flex rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-semibold text-white">{bi('道路关闭', 'Closed')}</div>
              <p className="mt-1 text-[11px] font-semibold text-accent-foreground">{bi('暂无公共通行', 'No Public Access')}</p>
              <p className="mt-1 flex items-center gap-1.5 border-t border-border pt-1.5 text-[9px] text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-amber-600" /> {bi('进山道路有风险提示。', 'Active road hazard on access road.')}
              </p>
            </>
          )}
          {tab === 'weather' && (
            <div>
              <div className="flex items-end gap-3 text-accent-foreground">
                <span className="font-heading text-[20px]">{data.temp}</span>
                <span className="text-[11px]">24 km/h <small className="block text-[7px] tracking-wide text-muted-foreground">WIND</small></span>
                <span className="text-[11px]">45 km/h <small className="block text-[7px] tracking-wide text-muted-foreground">GUST</small></span>
                <CloudSun className="ml-auto h-5 w-5 text-primary" />
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-[9px] text-muted-foreground">
                <span>Tue · 5°C</span><span>Wed · 4°C</span><span>Thu · 5°C</span><span>Fri · 4°C</span><span>Sat · 6°C</span>
              </div>
            </div>
          )}
          {tab === 'road' && (
            <>
              <div className="inline-flex rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-semibold text-white">{bi('关闭', 'Closed')}</div>
              <p className="mt-1 text-[11px] font-semibold text-accent-foreground">{bi('暂无公共通行', 'No Public Access')}</p>
              <p className="mt-1 flex items-center gap-1.5 border-t border-border pt-1.5 text-[9px] text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-amber-600" /> {bi('进山道路有风险提示。查看详情', 'Active road hazard on access road. Read more')}
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 px-3.5 pb-3.5">
          <div className="rounded-xl border border-border bg-card p-2.5">
            <p className="text-[7px] uppercase tracking-[0.16em] text-muted-foreground">{bi('缆车开放', 'Lifts open')}</p>
            <p className="mt-0.5 font-heading text-[18px] text-emerald-600">6 / 7</p>
            <p className="text-[9px] text-emerald-700">{bi('查看状态 →', 'View status →')}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5">
            <p className="text-[7px] uppercase tracking-[0.16em] text-muted-foreground">{bi('雪道开放', 'Trails open')}</p>
            <p className="mt-0.5 font-heading text-[18px] text-orange-600">32 / 46</p>
            <p className="text-[9px] text-orange-600">{bi('查看状态 →', 'View status →')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
