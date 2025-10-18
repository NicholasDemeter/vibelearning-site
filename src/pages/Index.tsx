import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import ProductRepository from "@/components/ProductRepository";
import Innovation from "@/components/Innovation";
import CallToAction from "@/components/CallToAction";
import chalkboardBg from "@/assets/chalkboard-bg.jpg";

const Index = () => {
  return (
    <main className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${chalkboardBg})` }}>
      <Hero />
      <section id="philosophy">
        <Philosophy />
      </section>
      <section id="products">
        <ProductRepository />
      </section>
      <section id="innovation">
        <Innovation />
      </section>
      <section id="community">
        <CallToAction />
      </section>
    </main>
  );
};

export default Index;
