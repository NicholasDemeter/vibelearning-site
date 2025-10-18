import { Card } from "@/components/ui/card";
import { Lightbulb, Heart, Target, Leaf, Clock } from "lucide-react";
import patternBg from "@/assets/pattern-bg.jpg";
import { useCopy } from "@/hooks/useCopy";
import { useContentStyle } from "@/hooks/useContentStyle";

const Philosophy = () => {
  const { getString } = useCopy();
  const { getStyle } = useContentStyle();
  
  const philosophyItems = [
    {
      icon: Lightbulb,
      title: getString("philosophy.transparency.title", "Transparency & Fun"),
      description: getString("philosophy.transparency.description", "Inspired by Nothing's playful transparency, we make learning tools open, joyful, and curiosity-sparking."),
      color: "vibe-cool"
    },
    {
      icon: Heart,
      title: getString("philosophy.simplicity.title", "Simplicity & Clarity"), 
      description: getString("philosophy.simplicity.description", "Rooted in Apple minimalism and Muji's embrace of space, our products are uncluttered, intuitive, and purposeful."),
      color: "accent"
    },
    {
      icon: Target,
      title: getString("philosophy.comfort.title", "Comfort & Nature"),
      description: getString("philosophy.comfort.description", "Scandinavian values of hygge and lagom bring warmth, balance, and human-centric calm into every design."),
      color: "vibe-warm"
    },
    {
      icon: Leaf,
      title: getString("philosophy.form.title", "Form Meets Function"),
      description: getString("philosophy.form.description", "Borrowing from Jony Ive and Jil Sander, design is elegant, tactile, and meaningful—every detail serving a purpose."),
      color: "vibe-neutral"
    },
    {
      icon: Clock,
      title: getString("philosophy.timeless.title", "Timeless Principles"),
      description: getString("philosophy.timeless.description", "Guided by Dieter Rams' good design ethos, we build innovative, honest, and lasting tools that resist trends."),
      color: "primary"
    }
  ];

  return (
    <section className="py-24 relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: `url(${patternBg})` }}
      />
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight" style={getStyle("philosophy.header")}>
            {getString("philosophy.header", "Design Philosophy")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" style={getStyle("philosophy.subcopy")}>
            {getString("philosophy.subcopy", "A fusion of iconic design traditions creating a unique identity for education technology")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {philosophyItems.map((item, index) => (
            <Card 
              key={item.title}
              className="p-8 bg-gradient-glass border-border/50 shadow-soft hover:shadow-glass transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-6 w-6 text-${item.color}`} />
                </div>
                <h3 className="text-xl font-medium text-foreground" style={getStyle(`philosophy.${item.color}.title`)}>
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed" style={getStyle(`philosophy.${item.color}.description`)}>
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Philosophy;