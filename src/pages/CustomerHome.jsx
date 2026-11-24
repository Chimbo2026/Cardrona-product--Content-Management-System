import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CloudSun,
  Ellipsis,
  GraduationCap,
  Headset,
  House,
  Map,
  Mountain,
  Package,
  Ticket,
  UserRound,
  Wind,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';

const quickLinks = [
  { label: ['缆车票', 'Passes'], icon: Ticket, to: '/passes' },
  { label: ['季票', 'Season'], icon: CalendarDays, to: '/passes' },
  { label: ['租赁', 'Rentals'], icon: Package, to: '/retail' },
  { label: ['课程', 'Lessons'], icon: GraduationCap, to: '/lessons' },
  { label: ['交通', 'Transport'], icon: Bus, to: '/transport' },
  { label: ['雪道地图', 'Trail map'], icon: Map, to: '/ski' },
  { label: ['更多', 'More'], icon: Ellipsis, to: '/site' },
];

const stayLinks = [
  { label: ['餐饮', 'Dining'], to: '/dining' },
  { label: ['住宿', 'Accommodation'], to: '/accommodation' },
  { label: ['活动', 'Activities'], to: '/events' },
];

function Bilingual({ value, lang }) {
  return value[lang === 'zh' ? 0 : 1];
}

function Shortcut({ item, lang }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className="group flex min-h-[116px] flex-col items-center justify-start gap-3 rounded-lg px-1 py-1 text-center transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
    >
      <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-[#f0f1f3] text-[#c8102e] transition-colors group-hover:bg-rose-100">
        <Icon className="h-8 w-8" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <span className="text-[14px] font-medium text-[#454951]"><Bilingual value={item.label} lang={lang} /></span>
    </Link>
  );
}

export default function CustomerHome() {
  const { lang, setLang, t } = useLang();
  const [mountain, setMountain] = useState('Cardrona');
  const [section, setSection] = useState('ski');

  return (
    <div className="min-h-screen bg-[#f7f5f3] px-0 py-0 text-[#20242b] sm:px-4 sm:py-4">
      <div className="relative mx-auto min-h-screen w-full max-w-[760px] overflow-hidden border border-[#d2d6db] bg-[#f9fafb] shadow-[0_5px_14px_rgba(24,32,43,0.12)] sm:min-h-[calc(100vh-32px)] sm:rounded-[26px]">
        <header className="flex h-[72px] items-center gap-4 border-b border-[#e3e5e8] bg-white px-5 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label={t('峰雪首页', 'Peak home')}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c8102e] text-white">
              <Mountain className="h-7 w-7" strokeWidth={2.2} />
            </span>
            <span className="font-heading text-[23px] font-semibold tracking-normal text-[#20242b]">Peak</span>
          </Link>
          <nav className="ml-auto flex items-center gap-3 text-[14px] text-[#68717f] sm:gap-7 sm:text-[17px]">
            <Link to="/passes" className="hover:text-[#c8102e]">{t('票券', 'Passes')}</Link>
            <Link to="/retail" className="hover:text-[#c8102e]">{t('租赁', 'Rentals')}</Link>
            <Link to="/lessons" className="hidden hover:text-[#c8102e] sm:inline">{t('课程', 'Lessons')}</Link>
            <Link to="/support" className="ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-[#e0e3e7] text-[#565c66] hover:bg-[#f0f1f3]" aria-label={t('账户', 'Account')}>
              <UserRound className="h-5 w-5" />
            </Link>
          </nav>
        </header>

        <main className="pb-[88px]">
          <section className="border-b border-[#e3e5e8] px-5 pb-5 pt-5 sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-heading text-[25px] font-semibold text-[#20242b] sm:text-[28px]">{mountain} - TC</h1>
              <div className="flex shrink-0 rounded-full border border-[#e0e3e7] bg-[#f6f6f7] p-[3px] text-[14px] font-bold sm:text-[16px]" role="group" aria-label={t('选择语言', 'Choose language')}>
                <button onClick={() => setLang('zh')} className={`rounded-full px-3 py-2 transition-colors sm:px-4 ${lang === 'zh' ? 'bg-[#c8102e] text-white' : 'text-[#68717f]'}`}>中文</button>
                <button onClick={() => setLang('en')} className={`rounded-full px-3 py-2 transition-colors sm:px-4 ${lang === 'en' ? 'bg-[#c8102e] text-white' : 'text-[#68717f]'}`}>EN</button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 rounded-full bg-[#f0f1f3] p-1.5" role="group" aria-label={t('选择雪场', 'Choose mountain')}>
              {['Cardrona', 'Treble Cone'].map((name) => (
                <button
                  key={name}
                  onClick={() => setMountain(name)}
                  aria-pressed={mountain === name}
                  className={`h-12 rounded-full px-3 text-[15px] font-semibold transition-colors sm:text-[17px] ${mountain === name ? 'bg-[#c8102e] text-white shadow-sm' : 'text-[#68717f] hover:text-[#20242b]'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          <div className="grid h-[68px] grid-cols-2 border-b border-[#e3e5e8] bg-white px-5 sm:px-8" role="tablist" aria-label={t('活动类别', 'Activity type')}>
            {[
              { id: 'ski', label: t('滑雪', 'Ski') },
              { id: 'shop', label: t('商店', 'Shop') },
            ].map((tab) => (
              <button key={tab.id} role="tab" aria-selected={section === tab.id} onClick={() => setSection(tab.id)} className={`relative text-[17px] transition-colors ${section === tab.id ? 'font-semibold text-[#20242b]' : 'text-[#68717f]'}`}>
                {tab.label}
                {section === tab.id && <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-t-full bg-[#c8102e]" />}
              </button>
            ))}
          </div>

          {section === 'ski' ? (
            <>
              <section className="mx-5 mt-5 rounded-[28px] border border-[#e0e3e7] bg-white p-5 shadow-[0_2px_4px_rgba(26,32,42,0.06)] sm:mx-8 sm:p-7" aria-label={t('山况与天气', 'Mountain weather')}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#e9fbf4] px-3.5 py-2 text-[13px] font-semibold text-[#00865f]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />{t('开放', 'Open')}
                    </span>
                    <p className="mt-3 font-heading text-[54px] leading-none text-[#20242b] sm:text-[62px]">-4°C</p>
                    <p className="mt-2 flex items-center gap-2 text-[14px] text-[#68717f] sm:text-[16px]">
                      <Wind className="h-4 w-4" />{t('山頂 -6°C', 'Summit -6°C')}<span>·</span>{t('風速 3', 'Wind 3')}
                    </p>
                  </div>
                  <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[24px] bg-[#f0f1f3] text-[#c8102e]">
                    <CloudSun className="h-9 w-9" strokeWidth={1.9} />
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 border-t border-dashed border-[#dce0e5] pt-4 text-center">
                  {[
                    [t('新增降雪', 'New snow'), '12cm'],
                    [t('开放雪道', 'Trails'), '68/78'],
                    [t('开放缆车', 'Lifts'), '5/8'],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-1.5">
                      <p className="text-[13px] text-[#68717f] sm:text-[15px]">{label}</p>
                      <p className="text-[17px] font-semibold text-[#20242b] sm:text-[19px]">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mx-5 mt-5 rounded-[28px] border border-[#e0e3e7] bg-white px-4 py-5 shadow-[0_2px_4px_rgba(26,32,42,0.06)] sm:mx-8 sm:px-7 sm:py-6" aria-label={t('快捷入口', 'Quick links')}>
                <div className="grid grid-cols-4 gap-x-1 gap-y-4">
                  {quickLinks.map((item) => <Shortcut key={item.label[1]} item={item} lang={lang} />)}
                </div>
              </section>
            </>
          ) : (
            <section className="mx-5 mt-5 rounded-[28px] border border-[#e0e3e7] bg-white p-6 shadow-[0_2px_4px_rgba(26,32,42,0.06)] sm:mx-8 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-[#c8102e]"><Package className="h-6 w-6" /></span>
                <div><h2 className="font-heading text-[22px] font-semibold">{t('山地商店', 'Mountain shop')}</h2><p className="text-[14px] text-[#68717f]">{t('探索雪場必備好物', 'Gear and essentials for the mountain')}</p></div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[[t('新品上架', 'New arrivals'), '/retail'], [t('租赁装备', 'Rental gear'), '/retail'], [t('雪票与季票', 'Passes'), '/passes'], [t('尺码与详情', 'Sizes & details'), '/retail']].map(([label, to]) => (
                  <Link key={label} to={to} className="flex min-h-20 items-center justify-between rounded-xl bg-[#f3f4f6] px-4 py-3 text-[14px] font-medium hover:bg-rose-50">
                    {label}<ChevronRight className="h-4 w-4 text-[#c8102e]" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="px-5 pb-5 pt-7 sm:px-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[20px] font-semibold text-[#20242b]">{t('吃住玩', 'Eat, stay & play')}</h2>
              <Link to="/site" className="inline-flex items-center gap-1 text-[14px] text-[#68717f] hover:text-[#c8102e]">{t('全部', 'All')}<ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {stayLinks.map((item) => (
                <Link key={item.label[1]} to={item.to} className="rounded-xl border border-[#e2e5e9] bg-white px-3 py-4 text-center text-[13px] text-[#565c66] hover:border-rose-200 hover:text-[#c8102e]">
                  <Bilingual value={item.label} lang={lang} />
                </Link>
              ))}
            </div>
          </section>
        </main>

        <Link to="/support" aria-label={t('联系客服', 'Contact support')} className="absolute bottom-[104px] right-6 z-10 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#c8102e] text-white shadow-[0_8px_22px_rgba(32,36,43,0.23)] transition-transform hover:scale-105">
          <Headset className="h-9 w-9" strokeWidth={1.8} />
        </Link>

        <nav className="absolute inset-x-0 bottom-0 z-20 grid h-[88px] grid-cols-4 border-t border-[#e1e4e8] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label={t('主导航', 'Main navigation')}>
          {[
            { label: t('首页', 'Home'), icon: House, to: '/', active: true },
            { label: t('预订', 'Book'), icon: Ticket, to: '/passes' },
            { label: t('订单', 'Orders'), icon: ClipboardList, to: '/booking-management' },
            { label: t('账户', 'Account'), icon: UserRound, to: '/support' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.to} className={`flex flex-col items-center justify-center gap-1 text-[13px] ${item.active ? 'font-semibold text-[#c8102e]' : 'text-[#68717f] hover:text-[#c8102e]'}`}>
                <Icon className="h-6 w-6" strokeWidth={item.active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
