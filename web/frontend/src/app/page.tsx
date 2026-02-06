"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedMangas } from "@/components/home/FeaturedMangas";
import { PopularMangas } from "@/components/home/PopularMangas";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedMangas />
      <PopularMangas />
    </>
  );
}
