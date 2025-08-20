import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HERO_COPY } from '@/constants/copy';

export interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title = HERO_COPY.title,
  subtitle = HERO_COPY.subtitle,
  ctaPrimaryText = HERO_COPY.ctaPrimary,
  ctaSecondaryText = HERO_COPY.ctaSecondary,
  onPrimaryClick,
  onSecondaryClick,
  className,
}) => {
  return (
    <section
      className={
        'relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 ' +
        (className || '')
      }
      aria-label="Hero section"
    >
      {/* Background effects */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50" />
      </div>

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Subcopy */}
          <p className="text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onPrimaryClick}
              aria-label={ctaPrimaryText}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {ctaPrimaryText}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSecondaryClick}
              aria-label={ctaSecondaryText}
              className="text-lg px-8 py-4 border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm transition-all duration-300"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {ctaSecondaryText}
            </Button>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div aria-hidden className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-12 text-white">
          <path fill="currentColor" d="M0,0 C720,120 720,120 1440,0 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
