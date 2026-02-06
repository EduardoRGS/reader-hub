"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { HeroSlider } from "@/components/home/HeroSlider";
import { FeaturedMangas } from "@/components/home/FeaturedMangas";
import { PopularMangas } from "@/components/home/PopularMangas";
import { useReaderStore } from "@/store/readerStore";

export default function HomePage() {
  const hasSliderMangas = useReaderStore((s) => s.sliderMangas.length > 0);

  return (
    <>
      {hasSliderMangas ? <HeroSlider /> : <HeroSection />}
      <FeaturedMangas />
      <PopularMangas />
    </>
  );
}
