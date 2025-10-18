import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import chalkboardBg from "@/assets/chalkboard-bg.jpg";
import vibeLearnHero from "@/assets/vibe-learn-hero.png";
import { useCopy } from "@/hooks/useCopy";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useContentStyle } from "@/hooks/useContentStyle";

const Hero = () => {
  const { getString } = useCopy();
  const { getStyle } = useContentStyle();
  const navigate = useNavigate();
  const [bgLoaded, setBgLoaded] = useState(false);
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
      {/* Background Image with Glass Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${chalkboardBg})` }}
      >
        <img 
          src={chalkboardBg} 
          alt="" 
          className="hidden"
          onLoad={() => setBgLoaded(true)}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-glass backdrop-blur-sm" />
      
      {/* Content */}
      <div className="container relative z-10 text-center px-4 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Logo with Lightning Animation */}
          <div className="flex justify-center mb-12 relative">
            <img 
              src={vibeLearnHero} 
              alt="VIBE LEARN" 
              className="w-auto object-contain opacity-100"
              style={{
                height: 'calc(16rem * 1.88)',
                animation: bgLoaded ? 'lightning-strike 3.5s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none',
                opacity: bgLoaded ? undefined : 0
              }}
            />
            {/* Sparking effects during impact */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                animation: 'spark-pulse 3.5s cubic-bezier(0.22, 1, 0.36, 1) forwards'
              }}
            >
              <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-vibe-warm/20 via-vibe-cool/10 to-transparent rounded-full blur-3xl" />
            </div>
          </div>
          
          {/* Headline */}
          <div className="space-y-8 mt-12">
            <div className="overflow-visible">
              <h1 className="text-5xl md:text-7xl font-light tracking-tight flex flex-wrap justify-center gap-x-6">
                <span 
                  className="bg-gradient-warm bg-clip-text text-transparent inline-block pb-6"
                  style={{
                    animation: bgLoaded ? 'fly-in-left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 3.5s both' : 'none',
                    opacity: bgLoaded ? undefined : 0,
                    ...getStyle('hero.headline')
                  }}
                >
                  {getString('hero.headline', 'Learning Reimagined').split(' ')[0]}
                </span>
                <span 
                  className="text-foreground inline-block pb-6"
                  style={{
                    animation: bgLoaded ? 'fly-in-right 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 4.3s both' : 'none',
                    opacity: bgLoaded ? undefined : 0,
                    ...getStyle('hero.headline')
                  }}
                >
                  {getString('hero.headline', 'Learning Reimagined').split(' ').slice(1).join(' ')}
                </span>
              </h1>
            </div>
            <div className="overflow-hidden mx-auto max-w-3xl">
              <p 
                className="text-xl md:text-2xl text-muted-foreground font-light"
                style={{
                  animation: bgLoaded ? 'typewriter 3.5s steps(80) 5.1s both' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  borderRight: '2px solid transparent',
                  display: 'inline-block',
                  width: '0',
                  opacity: bgLoaded ? undefined : 0,
                  ...getStyle('hero.subcopy')
                }}
              >
                Where transparency meets curiosity. Beautiful sustainable technology.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="vibe" 
              size="lg" 
              className="group"
              style={{
                animation: bgLoaded ? 'fly-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 9.1s both' : 'none',
                opacity: bgLoaded ? undefined : 0,
                ...getStyle('hero.exploreProducts')
              }}
            >
              {getString('hero.exploreProducts', 'Explore Products')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="glass" 
              size="lg" 
              className="group"
              onClick={() => navigate('/philosophy')}
              style={{
                animation: bgLoaded ? 'fly-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 9.3s both' : 'none',
                opacity: bgLoaded ? undefined : 0,
                ...getStyle('hero.vibeApproach')
              }}
            >
              <Play className="mr-2 h-4 w-4" />
              {getString('hero.vibeApproach', 'Vibe Learning Approach')}
            </Button>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;