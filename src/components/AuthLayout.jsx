import React from "react";
import { Image } from "@/components/ui/image";
import { Mountain } from "lucide-react";
import { useLang } from "@/lib/i18n";

const HERO = "https://images.ctfassets.net/2atbvuhykqrn/301QwEuamQPZSjkivPTji3/8a541ec68d0a2505cc7a3e4c03b3efc9/W24-Mountains_Homepage_Hero_Desktop.webp?w=1600&fm=webp&q=75";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <Image src={HERO} alt="Alpine terrain at Cardrona" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950/95 via-forest-950/80 to-forest-900/40" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ice-500/15 text-ice-300 ring-1 ring-inset ring-ice-400/25">
              <Mountain className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <div>
              <p className="font-heading text-[13.5px] font-semibold leading-tight text-white">Cardrona Resort</p>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ice-300/80">{t('度假村管理系统', 'Management')}</p>
            </div>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white/70 ring-1 ring-inset ring-white/15">
              {t('演示', 'Demo')}
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="font-heading text-[30px] font-semibold leading-tight text-white">
              {t('一座山，一个管理视角——从首班缆车到末班接驳车。', 'One view of the mountain, from first lifts to last shuttle.')}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-forest-100/75">
              {t('预订、缆车票、滑雪学校、租赁、山地运营与报表——专为山地度假村运营团队打造。', 'Bookings, lift passes, Snow School, rentals, operations and reporting — built for resort teams coordinating a day on the mountain.')}
            </p>
          </div>

          <p className="text-[11px] leading-relaxed text-forest-200/60">
            {t('演示原型，数据均为虚构示例。并非 Cardrona Alpine Resort 官方系统，亦未连接任何实时度假村、天气或票务服务。', 'Demonstration prototype with fictional sample data. Not an official Cardrona Alpine Resort system and not connected to live resort, weather or ticketing services.')}
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-900 text-ice-300">
              <Mountain className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <div>
              <p className="font-heading text-[13.5px] font-semibold leading-tight text-forest-900">Cardrona Resort</p>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-forest-600">{t('度假村管理系统 · 演示', 'Management · Demo')}</p>
            </div>
          </div>

          <div className="mb-7">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-ice-300">
              {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-forest-950">{title}</h1>
            {subtitle && <p className="mt-1.5 text-[13px] text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_10px_40px_-24px_rgba(10,27,39,0.4)] sm:p-7">
            {children}
          </div>

          {footer && <div className="mt-5 text-center text-[12.5px] text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}