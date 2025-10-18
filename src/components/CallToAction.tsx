import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Github, MessageCircle } from "lucide-react";
import { useCopy } from "@/hooks/useCopy";
import { useContentStyle } from "@/hooks/useContentStyle";

const CallToAction = () => {
  const { getString } = useCopy();
  const { getStyle } = useContentStyle();

  return (
    <section className="py-24 bg-gradient-warm relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-6xl font-light text-white tracking-tight" style={getStyle("cta.header")}>
            {getString("cta.header", "Join the Learning Revolution")}
          </h2>
          
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light" style={getStyle("cta.subcopy")}>
            {getString("cta.subcopy", "Be part of a community that values transparency, sustainability, and beautiful technology that empowers human potential.")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button variant="secondary" size="lg" className="group bg-white/90 hover:bg-white text-foreground">
              <Mail className="mr-2 h-4 w-4" />
              {getString("cta.joinCommunity", "Join Community")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button variant="ghost" size="lg" className="text-white border-white/30 hover:bg-white/10">
              <Github className="mr-2 h-4 w-4" />
              {getString("cta.exploreOpenSource", "Explore Open Source")}
            </Button>
          </div>

          <div className="pt-12 border-t border-white/20">
            <p className="text-white/60 text-sm mb-4" style={getStyle("cta.connectWithUs")}>{getString("cta.connectWithUs", "Connect with us")}</p>
            <div className="flex justify-center gap-6">
              {[
                { icon: MessageCircle, label: "Discord" },
                { icon: Github, label: "GitHub" },
                { icon: Mail, label: "Newsletter" }
              ].map((social) => (
                <a 
                  key={social.label}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors group"
                >
                  <social.icon className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;