import { useState } from 'react';

export default function ProductIntro({ title, season, image, imageAlt, imagePosition = 'center', description, details }) {
  const [expanded, setExpanded] = useState(false);

  return <section className="space-y-3">
    <img src={image} alt={imageAlt || title} style={{ objectPosition: imagePosition }} className="h-[190px] w-full rounded-[18px] border border-[#dce4ed] object-cover sm:h-[240px]" />
    <div className="space-y-2">
      <span className="inline-flex rounded-full bg-[#e3ebf4] px-3 py-1.5 text-[12px] font-semibold text-[#526d8b]">{season}</span>
      <h1 className="font-serif text-[25px] font-bold leading-tight text-[#20242b] sm:text-[30px]">{title}</h1>
      <p className="text-[14px] leading-6 text-[#687b92]">{description}</p>
      {expanded && details && <p className="text-[14px] leading-6 text-[#687b92]">{details}</p>}
      {details && <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="min-h-11 text-[13px] font-semibold text-[#344a64] underline">{expanded ? 'See less' : 'See more'}</button>}
    </div>
  </section>;
}
