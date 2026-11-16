import { useState } from 'react';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';

const MAPS = {
  Summer: {
    image: 'https://images.ctfassets.net/2atbvuhykqrn/xULRZM2h5T79PL3fasgcb/891150381e819f6304636e551b48663b/S26-Map-12Jan.webp',
    description: 'Summer trails, lifts, facilities, toilets and food and beverage options.',
    alt: 'Official Cardrona summer mountain bike trail map',
  },
  Winter: {
    image: 'https://images.ctfassets.net/2atbvuhykqrn/3Qt5U84xf6cWPwC4TfoCX8/bdba29ff63d6df2660609a5c5aa64893/W26-Cardrona-NewTrailMap-Artwork.webp',
    description: 'Winter ski trails, lifts and mountain facilities at Cardrona.',
    alt: 'Official Cardrona winter ski area trail map',
  },
};

export default function TrailMapExplorer() {
  const [season, setSeason] = useState('Summer');
  const [zoom, setZoom] = useState(1);
  const map = MAPS[season];

  return <main className="space-y-3 px-4 pb-6 pt-4 sm:px-8">
    <section>
      <h2 className="font-serif text-[19px] font-bold text-[#344a64]">Trail map</h2>
      <p className="mt-1 text-[10px] leading-4 text-[#718096]">{map.description}</p>
    </section>
    <div className="grid grid-cols-2 overflow-hidden rounded-[13px] border border-[#d31328] bg-white" role="group" aria-label="Choose trail map season">
      {Object.keys(MAPS).map((item) => <button key={item} type="button" aria-pressed={season === item} onClick={() => { setSeason(item); setZoom(1); }} className={`h-10 text-[12px] font-semibold transition-colors ${season === item ? 'bg-[#d31328] text-white' : 'text-[#c8102e]'}`}>{item} {season === item ? '✓' : ''}</button>)}
    </div>
    <section className="overflow-hidden rounded-[16px] border border-[#dce4ed] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e6edf4] px-3 py-2"><div><b className="text-[11px] text-[#344a64]">Cardrona · {season}</b><p className="mt-0.5 text-[9px] text-[#718096]">Pinch to zoom or use the controls</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => setZoom((value) => Math.max(1, +(value - 0.25).toFixed(2)))} disabled={zoom <= 1} aria-label="Zoom out" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dce4ed] text-[#526d8b] disabled:opacity-40"><Minus className="h-4 w-4"/></button><button type="button" onClick={() => setZoom((value) => Math.min(2, +(value + 0.25).toFixed(2)))} disabled={zoom >= 2} aria-label="Zoom in" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dce4ed] text-[#526d8b] disabled:opacity-40"><Plus className="h-4 w-4"/></button></div></div>
      <div className="max-h-[58dvh] overflow-auto bg-[#e9eef3] p-1.5" aria-label={`${season} trail map image`}><img key={season} src={map.image} alt={map.alt} className="mx-auto h-auto max-w-none origin-top-left transition-[width] duration-200" style={{ width: `${100 * zoom}%` }} loading="lazy"/></div>
    </section>
    <a href="https://cardrona-treblecone.com/mountains/maps" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#c8102e]">Official trail maps and mountain details <ArrowUpRight className="h-3 w-3"/></a>
    <p className="text-[9px] leading-4 text-[#718096]">Map artwork is supplied by Cardrona & Treble Cone. Check the official mountain information for current trail and lift status.</p>
  </main>;
}
