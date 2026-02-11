import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-calm.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-background via-background to-sage-light/30">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-sage/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <p className="text-sage-dark font-medium tracking-wide uppercase text-sm">
                Australian Online Psychology
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Mental wellbeing,{" "}
                <span className="text-primary">professional care.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Connect with experienced, registered psychologists from the comfort of your home. 
                Evidence-based therapy tailored to your unique needs, available Australia-wide.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/practitioners">
                <Button variant="cta" size="xl">
                  Book Your First Session
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative rounded-4xl overflow-hidden shadow-soft-lg">
              <img
                src={heroImage}
                alt="Calm natural landscape representing mental wellness"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-3xl shadow-soft-lg animate-float">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sage-light rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">AHPRA Registered</p>
                  <p className="text-sm text-muted-foreground">Verified Professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
