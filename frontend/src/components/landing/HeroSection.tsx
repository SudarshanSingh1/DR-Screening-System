import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { id: 1, image: "/images/hero-slide-1.png" },
  { id: 2, image: "/images/hero-slide-2.png" },
  { id: 3, image: "/images/hero-slide-3.png" },
  { id: 4, image: "/images/hero-slide-4.png" }
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <div id="home" className="relative w-full overflow-hidden bg-white group flex items-center justify-center mt-6 mb-4">
      {/* 
        To perfectly adapt to the natural image height without any empty space or fixed aspect ratios,
        we render all slides in a grid overlapping each other, where the container takes the height of the largest. 
        Assuming all banners have identical aspect ratios, this keeps it perfectly responsive.
      */}
      <div className="relative w-full h-auto grid overflow-hidden">
        {slides.map((slide, index) => (
          <img 
            key={slide.id}
            src={slide.image} 
            alt={`Vision AI Banner Slide ${slide.id}`} 
            className={`w-full h-auto block col-start-1 row-start-1 transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100 z-10 relative' : 'opacity-0 z-0 absolute top-0 left-0'
            }`}
          />
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
        <button onClick={prevSlide} className="p-3 rounded-full bg-black/30 border border-white/20 text-white hover:bg-black/50 transition-colors pointer-events-auto backdrop-blur-sm shadow-md">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="p-3 rounded-full bg-black/30 border border-white/20 text-white hover:bg-black/50 transition-colors pointer-events-auto backdrop-blur-sm shadow-md">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all shadow-md ${idx === current ? 'w-10 bg-white' : 'w-3 bg-white/50 hover:bg-white/90'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
