import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <article className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cerenova Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: March 2026</p>
            
            <p className="leading-relaxed mb-6">
              Cerenova is committed to protecting your privacy and handling personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
            </p>
            
            <p className="leading-relaxed mb-8">
              This Privacy Policy explains how we collect, use, store and disclose personal information.
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Who we are</h2>
              <p className="leading-relaxed mb-4">
                Cerenova provides psychology and mental health services to individuals across Australia.
              </p>
              <p className="leading-relaxed mb-2">
                If you have questions about this policy or your personal information, you can contact us at:
              </p>
              <div className="pl-4 mb-4">
                <p className="mb-1">Email: <a href="mailto:info@cerenova.com.au" className="text-primary hover:underline">info@cerenova.com.au</a></p>
                <p>Website: <a href="https://cerenova.com.au" className="text-primary hover:underline">https://cerenova.com.au</a></p>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. What personal information we collect</h2>
              <p className="leading-relaxed mb-4">
                We may collect personal information including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Information you provide when contacting us</li>
                <li>Information provided through appointment or referral forms</li>
                <li>Health or sensitive information relevant to psychological services</li>
              </ul>
              <p className="leading-relaxed">
                Sensitive information (including health information) is only collected where necessary to provide our services.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How we collect personal information</h2>
              <p className="leading-relaxed mb-4">
                We collect information when you:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Submit forms on our website</li>
                <li>Contact us by email or phone</li>
                <li>Book an appointment</li>
                <li>Submit a referral</li>
                <li>Complete online intake or assessment forms</li>
                <li>Interact with our advertising or marketing campaigns (including Meta/Facebook lead forms)</li>
              </ul>
              <p className="leading-relaxed">
                We may also collect limited information automatically through cookies or analytics tools.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. How we use personal information</h2>
              <p className="leading-relaxed mb-4">
                We use personal information to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide psychology and mental health services</li>
                <li>Respond to enquiries</li>
                <li>Manage appointments and referrals</li>
                <li>Communicate with clients and referrers</li>
                <li>Improve our services and website</li>
                <li>Comply with legal and professional obligations</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Disclosure of personal information</h2>
              <p className="leading-relaxed mb-4">
                We may disclose personal information to trusted service providers who help us operate our services, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Practice management software providers</li>
                <li>Telehealth platforms</li>
                <li>Secure data storage providers</li>
                <li>Marketing or analytics providers</li>
                <li>Professional advisers</li>
              </ul>
              <p className="leading-relaxed">
                These providers are required to handle information securely and in accordance with privacy laws.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data storage and security</h2>
              <p className="leading-relaxed mb-4">
                We take reasonable steps to protect personal information from misuse, loss, unauthorised access or disclosure.
              </p>
              <p className="leading-relaxed">
                Information may be stored securely using reputable technology providers and encrypted systems.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Access and correction</h2>
              <p className="leading-relaxed mb-4">
                You may request access to personal information we hold about you and request corrections if the information is inaccurate.
              </p>
              <p className="leading-relaxed">
                Requests can be made by contacting us via the details above.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and website analytics</h2>
              <p className="leading-relaxed mb-4">
                Our website may use cookies or analytics tools to understand how visitors use our site and improve user experience.
              </p>
              <p className="leading-relaxed">
                These tools do not typically identify individuals.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Complaints</h2>
              <p className="leading-relaxed mb-4">
                If you believe your privacy has been breached, please contact us first so we can investigate and respond.
              </p>
              <p className="leading-relaxed">
                If you are not satisfied with our response, you may contact the Office of the Australian Information Commissioner (OAIC).
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to this policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. The latest version will always be available on our website.
              </p>
            </section>
          </article>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;