import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recycle, Leaf, Lightbulb, ArrowRight } from "lucide-react";
import sustainabilityImg from "@/assets/sustainability.jpg";
import { useCopy } from "@/hooks/useCopy";
import { useContentStyle } from "@/hooks/useContentStyle";

const Innovation = () => {
  const { getString } = useCopy();
  const { getStyle } = useContentStyle();

  return (
    <section className="py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight" style={getStyle("innovation.header")}>
                {getString("innovation.header", "Innovation &")}{" "}
                <span className="bg-gradient-warm bg-clip-text text-transparent" style={getStyle("innovation.headerGradient")}>
                  {getString("innovation.headerGradient", "Sustainability")}
                </span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed" style={getStyle("innovation.subcopy")}>
                {getString("innovation.subcopy", "We prioritize eco-materials and circular design thinking. Our technology is built to be beautiful, empowering, and enduring—resisting obsolescence and waste.")}
              </p>
            </div>

            <div className="grid gap-6">
              <Card className="p-6 bg-gradient-glass border-border/50">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-vibe-warm/10 flex items-center justify-center">
                      <Recycle className="h-5 w-5 text-vibe-warm" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2" style={getStyle("innovation.circular.title")}>
                        {getString("innovation.circular.title", "Circular Design")}
                      </h3>
                      <p className="text-sm text-muted-foreground" style={getStyle("innovation.circular.description")}>
                        {getString("innovation.circular.description", "Every product is designed for longevity, repairability, and eventual renewal—minimizing waste and maximizing value.")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-glass border-border/50">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2" style={getStyle("innovation.ecoMaterials.title")}>
                        {getString("innovation.ecoMaterials.title", "Eco-Materials")}
                      </h3>
                      <p className="text-sm text-muted-foreground" style={getStyle("innovation.ecoMaterials.description")}>
                        {getString("innovation.ecoMaterials.description", "We choose materials and processes that respect our planet while delivering exceptional user experiences.")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-glass border-border/50">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-vibe-cool/10 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-vibe-cool" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2" style={getStyle("innovation.futureForward.title")}>
                        {getString("innovation.futureForward.title", "Future-Forward Thinking")}
                      </h3>
                      <p className="text-sm text-muted-foreground" style={getStyle("innovation.futureForward.description")}>
                        {getString("innovation.futureForward.description", "Innovation that anticipates tomorrow's needs while solving today's challenges with timeless design principles.")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button variant="vibe" className="group">
              {getString("innovation.learnImpact", "Learn About Our Impact")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-warm rounded-2xl transform rotate-3 opacity-20"></div>
            <img 
              src={sustainabilityImg} 
              alt="Sustainable innovation in education technology"
              className="relative rounded-2xl shadow-warm w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Innovation;