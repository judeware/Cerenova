import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check, Loader2, Clock, Calendar, User, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import introOfferContent from "@/content/pages/intro-offer.json";
import { loadPractitioners } from "@/lib/practitioners";

const IntroOffer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isEligible, setIsEligible] = useState(false);
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<string | null>(null);
  const [practitioners, setPractitioners] = useState<any[]>([]);

  // Load practitioners from markdown files
  useEffect(() => {
    const loadedPractitioners = loadPractitioners();
    setPractitioners(loadedPractitioners);
  }, []);

  // Capture UTM parameters
  const utmParams = {
    utm_source: searchParams.get("utm_source") || "",
    utm_medium: searchParams.get("utm_medium") || "",
    utm_campaign: searchParams.get("utm_campaign") || "",
    utm_content: searchParams.get("utm_content") || "",
    utm_term: searchParams.get("utm_term") || "",
  };

  // Track page view and step changes
  useEffect(() => {
    // GTM will handle tracking via dataLayer events
  }, [step]);

  // Fetch discount code when reaching step 4
  useEffect(() => {
    if (step === 4 && !discountCode) {
      fetchDiscountCode();
    }
  }, [step]);

  const fetchDiscountCode = async () => {
    setIsLoadingDiscount(true);
    try {
      const response = await fetch("/.netlify/functions/get-discount-code");
      const data = await response.json();
      if (data.discountCode) {
        setDiscountCode(data.discountCode);
      }
    } catch (error) {
      console.error("Error fetching discount code:", error);
      toast({
        title: "Error",
        description: "Failed to load discount code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDiscount(false);
    }
  };

  const handleStartClick = () => {
    setStep(2);
    // GTM will handle tracking via dataLayer events
  };

  const handleEligibilityCheck = () => {
    if (!isEligible) {
      toast({
        title: "Eligibility Required",
        description: "Please confirm you have a Mental Health Care Plan to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep(3);
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/.netlify/functions/save-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          eligibility: isEligible,
          timestamp: new Date().toISOString(),
          ...utmParams,
        }),
      });

      if (response.ok) {
        setStep(4);
        // GTM will handle tracking via dataLayer events
      } else {
        throw new Error("Failed to save lead");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPsychologist = (practitionerId: string) => {
    setSelectedPsychologist(practitionerId);
    setStep(6);
  };

  const handleFinalBooking = () => {
    // Find the selected practitioner
    const selectedPractitioner = practitioners.find(p => p.id === selectedPsychologist);
    if (selectedPractitioner) {
      // Add discount parameter to the booking URL
      const bookingUrl = new URL(selectedPractitioner.book_link);
      bookingUrl.searchParams.set('discount', 'Cerenovafree');
      window.open(bookingUrl.toString(), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`flex items-center ${i < 6 ? "flex-1" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        i <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < step ? <Check className="w-4 h-4" /> : i}
                    </div>
                    {i < 6 && (
                      <div
                        className={`h-0.5 flex-1 ml-1 transition-all ${
                          i < step ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Landing Page Hero */}
            {step === 1 && (
              <div className="text-center space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <p className="text-sage-dark font-medium tracking-widest uppercase text-xs">
                    {introOfferContent.hero.badge}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                    {introOfferContent.hero.headline}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {introOfferContent.hero.subheadline}
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    variant="cta"
                    size="xl"
                    onClick={handleStartClick}
                    className="gap-2 text-lg px-8 py-6"
                  >
                    {introOfferContent.hero.cta_text}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    No commitment - just a quick eligibility check
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Eligibility Check */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-sage-light rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Let's quickly check your eligibility
                  </h2>
                </div>

                <div className="bg-card rounded-3xl p-8 shadow-soft-md space-y-6 relative">
                  <button
                    onClick={() => setStep(1)}
                    className="absolute top-4 left-4 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  
                  <div className="flex items-start gap-3 pt-8">
                    <Checkbox
                      id="eligibility"
                      checked={isEligible}
                      onCheckedChange={(checked) => setIsEligible(!!checked)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="eligibility"
                      className="text-foreground cursor-pointer leading-relaxed"
                    >
                      {introOfferContent.eligibility_text}
                      <span className="block text-sm text-muted-foreground mt-1">
                        {introOfferContent.eligibility_helper}
                      </span>
                    </label>
                  </div>

                  <Button
                    variant="cta"
                    size="lg"
                    onClick={handleEligibilityCheck}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Email Capture */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {introOfferContent.email_capture.heading}
                  </h2>
                </div>

                <div className="bg-card rounded-3xl p-8 shadow-soft-md space-y-6 relative">
                  <button
                    onClick={() => setStep(2)}
                    className="absolute top-4 left-4 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  
                  <div className="pt-8">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full"
                      required
                    />
                  </div>

                  <Button
                    variant="cta"
                    size="lg"
                    onClick={handleEmailSubmit}
                    disabled={!email || isSubmitting}
                    className="w-full gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {introOfferContent.email_capture.button_text}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: The Offer Page */}
            {step === 4 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {introOfferContent.offer.heading}
                  </h2>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold text-primary">
                      {introOfferContent.offer.value_text}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      {introOfferContent.offer.subtext}
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-3xl p-8 shadow-soft-md space-y-6 relative">
                  <button
                    onClick={() => setStep(3)}
                    className="absolute top-4 left-4 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  
                  {isLoadingDiscount ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </div>
                  ) : discountCode ? (
                    <div className="bg-primary/10 border-2 border-primary rounded-2xl p-6 text-center">
                      <p className="text-sm text-foreground mb-2">Your code:</p>
                      <p className="text-3xl font-bold text-primary">{discountCode}</p>
                    </div>
                  ) : null}

                  <Button
                    variant="cta"
                    size="lg"
                    onClick={() => setStep(5)}
                    className="w-full gap-2"
                  >
                    {introOfferContent.offer.button_text}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Psychologist Selection */}
            {step === 5 && (
              <div className="space-y-8 animate-fade-in">
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {introOfferContent.psychologist_selection.heading}
                  </h2>
                </div>

                <div className="space-y-4">
                  {practitioners.map((practitioner) => (
                    <Card 
                      key={practitioner.id}
                      className="p-6 hover:shadow-soft-lg transition-all cursor-pointer"
                      onClick={() => handleSelectPsychologist(practitioner.id)}
                    >
                      <CardContent className="p-0 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-sage-light rounded-full overflow-hidden flex items-center justify-center">
                                {practitioner.photo ? (
                                  <img 
                                    src={practitioner.photo} 
                                    alt={practitioner.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-sage-dark" />
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  {practitioner.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {practitioner.title}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {practitioner.bio}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {practitioner.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <Button variant="cta" className="w-full gap-2">
                          {introOfferContent.psychologist_selection.button_text}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Bridge to Booking */}
            {step === 6 && (
              <div className="space-y-8 animate-fade-in">
                <button
                  onClick={() => setStep(5)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {introOfferContent.booking_bridge.heading}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {introOfferContent.booking_bridge.subheading}
                  </p>
                </div>

                <div className="bg-card rounded-3xl p-8 shadow-soft-md space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">{introOfferContent.booking_bridge.instructions_title}</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">1.</span>
                        {introOfferContent.booking_bridge.step1}
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">2.</span>
                        {introOfferContent.booking_bridge.step2}
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">3.</span>
                        {introOfferContent.booking_bridge.step3} <span className="font-mono font-bold text-primary">{discountCode}</span>
                      </li>
                    </ul>
                    
                    <div className="bg-sage-light/30 rounded-xl p-4 mt-4">
                      <p className="text-sm text-foreground">
                        <strong>Important:</strong> {introOfferContent.booking_bridge.important_note}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="cta"
                    size="lg"
                    onClick={handleFinalBooking}
                    className="w-full gap-2"
                  >
                    {introOfferContent.booking_bridge.button_text}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {introOfferContent.booking_bridge.footer_note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IntroOffer;