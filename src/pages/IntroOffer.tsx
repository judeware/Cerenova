import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const IntroOffer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isEligible, setIsEligible] = useState(false);
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);

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

  // Fetch discount code when reaching step 3
  useEffect(() => {
    if (step === 3 && !discountCode) {
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

  const handleSubmitForm = async () => {
    if (!email || !isEligible) return;

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
        setStep(3);
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

  const handleBookNow = () => {
    // GTM will handle tracking via dataLayer events
    // Navigate to practitioners page with discount code
    navigate("/practitioners", { 
      state: { 
        discountCode: discountCode,
        fromIntroOffer: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex items-center ${i < 3 ? "flex-1" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        i <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < step ? <Check className="w-5 h-5" /> : i}
                    </div>
                    {i < 3 && (
                      <div
                        className={`h-1 flex-1 ml-3 transition-all ${
                          i < step ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Hero */}
            {step === 1 && (
              <div className="text-center space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <p className="text-sage-dark font-medium tracking-wide uppercase text-sm">
                    Australian Online Psychology
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                    Mental wellbeing,{" "}
                    <span className="text-primary">professional care.</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
                    Connect with experienced, registered psychologists from the comfort of your home. 
                    Evidence-based therapy tailored to your unique needs, available Australia-wide.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    variant="cta"
                    size="xl"
                    onClick={handleStartClick}
                    className="gap-2 text-lg px-8 py-6"
                  >
                    Yes – Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Professional psychology services with Medicare rebates available
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Eligibility & Email */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    Let's check your eligibility
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Please confirm you meet the Medicare requirements
                  </p>
                </div>

                <div className="bg-card rounded-3xl p-8 shadow-soft-md space-y-6">
                  <div className="flex items-start gap-3">
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
                      I have a valid Mental Health Care Plan from my GP
                      <span className="block text-sm text-muted-foreground mt-1">
                        This is required for Medicare rebates on psychology sessions
                      </span>
                    </label>
                  </div>

                  {isEligible && (
                    <div className="space-y-4 animate-slide-up">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Email Address
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
                        onClick={handleSubmitForm}
                        disabled={!email || isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Continue"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation & Discount */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    You're eligible for our introductory offer!
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Here's your exclusive offer
                  </p>
                </div>

                <div className="bg-card rounded-3xl p-8 shadow-soft-md space-y-6">
                  <div className="border-l-4 border-primary pl-4">
                    <p className="text-2xl font-bold text-foreground mb-1">
                      $220
                    </p>
                    <p className="text-lg text-muted-foreground">
                      100% Medicare rebate
                    </p>
                  </div>

                  {isLoadingDiscount ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </div>
                  ) : discountCode ? (
                    <div className="bg-sage-light/50 rounded-2xl p-4 text-center">
                      <p className="text-sm text-sage-dark mb-1">Your discount code:</p>
                      <p className="text-2xl font-bold text-primary">{discountCode}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter this code manually at checkout for your discount
                      </p>
                    </div>
                  ) : null}

                  <div className="pt-4">
                    <Button
                      variant="cta"
                      size="lg"
                      onClick={handleBookNow}
                      className="w-full text-lg py-6"
                    >
                      Choose Your Psychologist
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    You'll be redirected to our secure booking platform
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
