import { Users, Calendar, Video } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Match",
    description:
      "Tell us about yourself and your needs. We'll match you with a psychologist who specialises in your area of concern.",
    step: "01",
  },
  {
    icon: Calendar,
    title: "Book",
    description:
      "Choose a time that works for you. Flexible scheduling with evening and weekend appointments available.",
    step: "02",
  },
  {
    icon: Video,
    title: "Connect",
    description:
      "Meet your psychologist via secure video call. Begin your journey to better mental health from anywhere in Australia.",
    step: "03",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-sage-light/50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sage-dark font-medium tracking-wide uppercase text-sm mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Start Your Journey in{" "}
            <span className="text-primary">Three Simple Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We've made accessing professional mental health support as simple and 
            stress-free as possible.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative bg-card rounded-3xl p-8 shadow-soft-sm hover:shadow-soft-lg transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step Number */}
              <span className="absolute top-6 right-6 text-6xl font-bold text-sage/30 group-hover:text-sage/50 transition-colors">
                {service.step}
              </span>

              {/* Icon */}
              <div className="w-16 h-16 bg-sage-light rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sage transition-colors">
                <service.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
