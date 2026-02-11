import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, Tag, X } from "lucide-react";

const practitioners = [
  {
    name: "Sean Guy",
    title: "Psychologist",
    specialties: ["Anxiety", "Depression", "Trauma"],
    bio: "Sean brings extensive experience in helping individuals navigate anxiety, depression, and trauma. He uses evidence-based approaches to support clients in their mental health journey.",
    availability: "Mon, Wed, Fri",
    bookingUrl: "https://www.halaxy.com/profile/mr-sean-guy/psychologist/1754171",
  },
  {
    name: "Liam Farrelly",
    title: "Psychologist",
    specialties: ["Couples Therapy", "Stress", "Life Transitions"],
    bio: "Liam specialises in relationship dynamics and life changes, helping couples and individuals build stronger connections and navigate major transitions with confidence.",
    availability: "Tue, Thu, Sat",
    bookingUrl: "https://www.halaxy.com/book/psychologist/liam-farrelly/1731515/1326843",
  },
];

const PractitionersPage = () => {
  const location = useLocation();
  const [showDiscountBanner, setShowDiscountBanner] = useState(false);
  const discountCode = location.state?.discountCode;
  const fromIntroOffer = location.state?.fromIntroOffer;

  useEffect(() => {
    if (fromIntroOffer && discountCode) {
      setShowDiscountBanner(true);
    }
  }, [fromIntroOffer, discountCode]);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        {/* Discount Banner */}
        {showDiscountBanner && discountCode && (
          <div className="bg-primary/10 border-b border-primary/20">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    Your discount code <span className="font-bold text-primary">{discountCode}</span> is ready! 
                    <span className="text-muted-foreground ml-2">Use it when booking with any of our psychologists.</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowDiscountBanner(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Hero Section */}
        <section className="py-16 bg-sage-light/30">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sage-dark font-medium tracking-wide uppercase text-sm mb-3">
                Our Team
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Meet Our <span className="text-primary">Psychologists</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                All our practitioners are AHPRA registered, highly experienced, and 
                committed to providing compassionate, evidence-based care. Find the 
                right match for your unique needs.
              </p>
            </div>
          </div>
        </section>

        {/* Practitioners Grid */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {practitioners.map((practitioner, index) => (
                <div
                  key={practitioner.name}
                  className="group bg-card rounded-3xl p-8 shadow-soft-sm hover:shadow-soft-lg transition-all duration-500 flex flex-col sm:flex-row gap-6"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto sm:mx-0 rounded-full bg-gradient-to-br from-sage-light to-sage overflow-hidden ring-4 ring-sage-light group-hover:ring-sage transition-colors">
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-14 h-14 sm:w-20 sm:h-20 text-primary/60"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {practitioner.name}
                    </h3>
                    <p className="text-primary font-medium text-sm mb-3">
                      {practitioner.title}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                      {practitioner.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="text-xs bg-sage-light text-teal-dark px-3 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    {/* Bio */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {practitioner.bio}
                    </p>

                    {/* Availability */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-sage-dark mb-5">
                      <Calendar className="w-4 h-4" />
                      <span>Available: {practitioner.availability}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a 
                        href={practitioner.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="cta" size="sm" className="w-full">
                          Book Appointment
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Not sure who to choose?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Our team can help match you with the right psychologist based on your 
              specific needs and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:info@cerenova.com.au">
                <Button variant="outline" size="lg" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Mail className="w-4 h-4" />
                  Email Us
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PractitionersPage;
