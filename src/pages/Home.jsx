import { useState } from 'react';
import BrandHeader from '@/components/home/BrandHeader';
import WeatherCard from '@/components/home/WeatherCard';
import ServiceGrid from '@/components/home/ServiceGrid';
import ResortEntry from '@/components/home/ResortEntry';
import SeasonPassBanner from '@/components/home/SeasonPassBanner';
import LaneEntries from '@/components/home/LaneEntries';
import PromoCarousel from '@/components/home/PromoCarousel';

export default function Home() {
  const [mountain, setMountain] = useState('cardrona');

  return (
    <div className="pb-4">
      <BrandHeader mountain={mountain} onMountain={setMountain} />

      <WeatherCard mountain={mountain} />
      <ServiceGrid />
      <ResortEntry />
      <SeasonPassBanner />
      <LaneEntries />
      <PromoCarousel />
    </div>
  );
}