import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { setEntrySource } from '@/lib/attribution';

const ADS = [
  {
    id: 'ski',
    brand: 'Cardrona 卡德罗纳滑雪场',
    headline: '皇后镇雪季已开 · 中文教练雪票 7 折起',
    sub: '雪票 · 课程 · 租赁套餐，实时库存直接预订',
    image:
      'https://media.base44.com/images/public/6ae092d2ca9b9e52ea289869/3febb8614_generated_image.png',
    source: '广告投放',
    to: '/booking',
    cta: '立即预订',
    lane: '滑雪预订',
    likes: '2.4 万',
    comments: '1,203',
  },
  {
    id: 'shop',
    brand: 'Cardrona Alpine Store 山地商店',
    headline: '新雪季雪服到货 · 顺丰直邮中国大陆',
    sub: 'Burton / Icebreaker / The North Face 新品上架',
    image:
      'https://media.base44.com/images/public/6ae092d2ca9b9e52ea289869/5ca5a1680_generated_image.png',
    source: '朋友圈分享',
    to: '/shop',
    cta: '立即选购',
    lane: '山地商店',
    likes: '8,764',
    comments: '486',
  },
];

export default function AdEntry() {
  const navigate = useNavigate();

  const open = (ad) => {
    setEntrySource(ad.source);
    navigate(ad.to);
  };

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between border-b border-border/70 bg-[#1f2225] px-4 py-3 text-white">
        <span className="text-[15px] font-medium">朋友圈</span>
        <span className="rounded-full border border-white/25 px-2.5 py-[3px] text-[10px] text-white/70">
          广告预览
        </span>
      </div>

      <div className="bg-[#f7f7f7] px-3 py-3">
        <p className="mb-3 text-center text-[10.5px] text-muted-foreground">
          点击广告即直接打开小程序，无需复制链接或跳出微信
        </p>

        {ADS.map((ad) => (
          <div key={ad.id} className="mb-3 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
                卡
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium">{ad.brand}</p>
                <p className="text-[9.5px] text-muted-foreground">广告 · 落地页：{ad.lane}</p>
              </div>
              <span className="rounded border border-muted-foreground/30 px-1 py-[1px] text-[9px] text-muted-foreground">
                广告
              </span>
            </div>

            <ButtonlessCreative ad={ad} onOpen={() => open(ad)} />

            <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> {ad.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> {ad.comments}
                </span>
              </span>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-dashed border-border bg-white p-3 text-[10.5px] leading-relaxed text-muted-foreground">
          <p>演示说明：雪票广告落地「滑雪预订」，商品广告落地「山地商店」，渠道来源会自动带入订单报表。</p>
        </div>
      </div>
    </div>
  );
}

function ButtonlessCreative({ ad, onOpen }) {
  return (
    <button type="button" onClick={onOpen} className="block w-full text-left">
      <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
        <Image
          src={ad.image}
          alt={ad.headline}
          fittingType="fill"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12.5px] font-medium leading-snug">{ad.headline}</p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">{ad.sub}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-medium text-primary">
          {ad.cta}
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}