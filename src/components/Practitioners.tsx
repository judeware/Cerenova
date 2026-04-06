import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { loadPractitioners } from "@/lib/practitioners";

// Load practitioners from markdown files
const practitioners = loadPractitioners();

const Practitioners = () => {
  return (
    <section id="practitioners" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sage-dark font-medium tracking-wide uppercase text-sm mb-3">
            Our Team
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Our <span className="text-primary">Psychologists</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            All our practitioners are AHPRA registered, highly experienced, and 
            committed to providing compassionate, evidence-based care.
          </p>
        </div>

        {/* Practitioners Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {practitioners.map((practitioner, index) => (
            <div
              key={practitioner.name}
              className="group bg-card rounded-3xl p-6 shadow-soft-sm hover:shadow-soft-lg transition-all duration-500 hover:-translate-y-2 text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Avatar Placeholder */}
              <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-gradient-to-br from-sage-light to-sage overflow-hidden ring-4 ring-sage-light group-hover:ring-sage transition-colors">
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-primary/60"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>

              {/* Info */}
              <h3 className="text-lg font-bold text-foreground mb-1">
                {practitioner.name}
              </h3>
              <p className="text-primary font-medium text-sm mb-4">
                {practitioner.title}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {practitioner.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="text-xs bg-sage-light text-teal-dark px-3 py-1 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              {/* Book Button */}
              <a 
                href={practitioner.book_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button variant="cta" size="sm" className="w-full">
                  Book Appointment
                </Button>
              </a>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link to="/practitioners">
            <Button variant="outline" size="lg">
              View All Practitioners
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Practitioners;
