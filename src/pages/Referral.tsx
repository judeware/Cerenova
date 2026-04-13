import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Referral = () => {
  const [formData, setFormData] = useState({
    gpName: '',
    gpEmail: '',
    patientName: '',
    patientDOB: '',
    patientMobile: '',
    patientEmail: '',
  });

  const [files, setFiles] = useState<{
    referralLetter: File | null;
    mhcp: File | null;
  }>({
    referralLetter: null,
    mhcp: null,
  });

  const [fileNames, setFileNames] = useState<{
    referralLetter: string;
    mhcp: string;
  }>({
    referralLetter: '',
    mhcp: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('Please try again or contact support.');
  
  const [dragActive, setDragActive] = useState<{
    referralLetter: boolean;
    mhcp: boolean;
  }>({
    referralLetter: false,
    mhcp: false,
  });

  const referralInputRef = useRef<HTMLInputElement>(null);
  const mhcpInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, type: 'referralLetter' | 'mhcp') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>, type: 'referralLetter' | 'mhcp') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: 'referralLetter' | 'mhcp') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFiles(prev => ({ ...prev, [type]: file }));
      setFileNames(prev => ({ ...prev, [type]: file.name }));
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, type: 'referralLetter' | 'mhcp') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setFiles(prev => ({ ...prev, [type]: file }));
      setFileNames(prev => ({ ...prev, [type]: file.name }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setShowError(false);

    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value);
    });
    
    if (files.referralLetter) {
      submitFormData.append('referralLetter', files.referralLetter);
    }
    if (files.mhcp) {
      submitFormData.append('mhcp', files.mhcp);
    }

    try {
      const response = await fetch('/.netlify/functions/process-referral', {
        method: 'POST',
        body: submitFormData
      });

      if (response.ok) {
        setShowSuccess(true);
        window.scrollTo(0, 0);
      } else {
        const error = await response.json();
        setErrorText(error.message || 'Please try again or contact support.');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      gpName: '',
      gpEmail: '',
      patientName: '',
      patientDOB: '',
      patientMobile: '',
      patientEmail: '',
    });
    setFiles({
      referralLetter: null,
      mhcp: null,
    });
    setFileNames({
      referralLetter: '',
      mhcp: '',
    });
    setShowSuccess(false);
    if (referralInputRef.current) referralInputRef.current.value = '';
    if (mhcpInputRef.current) mhcpInputRef.current.value = '';
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="bg-sage-light rounded-2xl p-8 text-center">
              <svg className="mx-auto h-16 w-16 text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-2xl font-bold text-foreground mb-2">Referral Submitted Successfully</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for your referral. We'll contact the patient within 24 hours to arrange their first appointment.
              </p>
              <button
                onClick={resetForm}
                className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition"
              >
                Submit Another Referral
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-3xl">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              GP Referral Form
            </h1>
            <p className="text-lg text-muted-foreground">
              Refer your patients to Cerenova Psychology for professional mental health care
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft-md p-8 space-y-6">
            {/* GP Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">GP Information</h2>
              
              <div>
                <label htmlFor="gpName" className="block text-sm font-medium text-foreground mb-2">
                  GP Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="gpName"
                  name="gpName"
                  value={formData.gpName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Dr. Jane Smith"
                />
              </div>

              <div>
                <label htmlFor="gpEmail" className="block text-sm font-medium text-foreground mb-2">
                  GP Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="gpEmail"
                  name="gpEmail"
                  value={formData.gpEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="dr.smith@medicalpractice.com.au"
                />
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-foreground">Patient Information</h2>
              
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-foreground mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="patientDOB" className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="patientDOB"
                  name="patientDOB"
                  value={formData.patientDOB}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="patientMobile" className="block text-sm font-medium text-foreground mb-2">
                  Patient Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="patientMobile"
                  name="patientMobile"
                  value={formData.patientMobile}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="0412345678"
                />
              </div>

              <div>
                <label htmlFor="patientEmail" className="block text-sm font-medium text-foreground mb-2">
                  Patient Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="patientEmail"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="patient@email.com"
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-foreground">Documents</h2>
              
              {/* Referral Letter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Referral Letter <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => referralInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, 'referralLetter')}
                  onDragLeave={(e) => handleDragLeave(e, 'referralLetter')}
                  onDrop={(e) => handleDrop(e, 'referralLetter')}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition ${
                    dragActive.referralLetter ? 'bg-sage-light border-primary' : 'border-gray-300'
                  }`}
                >
                  <input
                    ref={referralInputRef}
                    type="file"
                    name="referralLetter"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                    onChange={(e) => handleFileSelect(e, 'referralLetter')}
                    className="hidden"
                  />
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG or PNG (max 10MB)</p>
                  {fileNames.referralLetter && (
                    <p className="mt-3 text-sm font-medium text-primary">{fileNames.referralLetter}</p>
                  )}
                </div>
              </div>

              {/* Mental Health Care Plan */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mental Health Care Plan (MHCP) <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => mhcpInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, 'mhcp')}
                  onDragLeave={(e) => handleDragLeave(e, 'mhcp')}
                  onDrop={(e) => handleDrop(e, 'mhcp')}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition ${
                    dragActive.mhcp ? 'bg-sage-light border-primary' : 'border-gray-300'
                  }`}
                >
                  <input
                    ref={mhcpInputRef}
                    type="file"
                    name="mhcp"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                    onChange={(e) => handleFileSelect(e, 'mhcp')}
                    className="hidden"
                  />
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG or PNG (max 10MB)</p>
                  {fileNames.mhcp && (
                    <p className="mt-3 text-sm font-medium text-primary">{fileNames.mhcp}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-dark transition duration-200 shadow-soft-md hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Referral'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {showError && (
            <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-soft-md">
              <p className="font-medium">Error submitting referral</p>
              <p className="text-sm mt-1">{errorText}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Referral;