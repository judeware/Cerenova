import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Practitioners from "@/components/Practitioners";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <Practitioners />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
