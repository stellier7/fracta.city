'use client';

import React, { useState, useRef } from 'react';
import { Globe, ArrowLeft, Camera, CheckCircle2, Loader2, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { KYCService, InternationalKYCData } from '@/lib/kyc';
import QRCode from '@/components/QRCode';
import Header from '@/components/Header';

type KYCStep = 'document-type' | 'document-front' | 'document-back' | 'face-scan' | 'mobile-setup' | 'complete';

export default function InternationalKYCPage() {
  const [currentStep, setCurrentStep] = useState<KYCStep>('document-type');
  const [documentType, setDocumentType] = useState<'passport' | 'drivers_license' | 'national_id'>('passport');
  const [capturedImages, setCapturedImages] = useState<{
    documentFront?: string;
    documentBack?: string;
    faceScan?: string;
  }>({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    countryOfResidence: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    addressCountry: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const steps = [
    { id: 'document-type', title: 'Document Type', description: 'Choose your ID document' },
    { id: 'mobile-setup', title: 'Mobile Verification', description: 'Optional: Continue on mobile' },
    { id: 'document-front', title: 'Front of Document', description: 'Capture the front of your document' },
    { id: 'document-back', title: 'Back of Document', description: 'Capture the back of your document' },
    { id: 'face-scan', title: 'Face Verification', description: 'Take a photo of your face' },
    { id: 'complete', title: 'Verification Complete', description: 'Review and submit' }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        
        if (currentStep === 'document-front') {
          setCapturedImages(prev => ({ ...prev, documentFront: imageData }));
        } else if (currentStep === 'document-back') {
          setCapturedImages(prev => ({ ...prev, documentBack: imageData }));
        } else if (currentStep === 'face-scan') {
          setCapturedImages(prev => ({ ...prev, faceScan: imageData }));
        }
        
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setIsCapturing(false);
      }
    }
  };

  const retakePhoto = () => {
    setIsCapturing(true);
    startCamera();
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as KYCStep);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as KYCStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // For now, we'll submit mock data since we don't have all the personal info fields
      // In a real implementation, you'd collect this data from the user
      const kycData: InternationalKYCData = {
        document_type: documentType,
        document_number: 'MOCK-DOC-123',
        document_country: 'United States',
        document_expiry: '2025-12-31',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        nationality: 'American',
        country_of_residence: 'United States',
        address_line1: '123 Main St',
        city: 'New York',
        postal_code: '10001',
        address_country: 'United States',
        documents: capturedImages
      };
      
      await KYCService.submitInternationalKYC(kycData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('KYC submission failed:', error);
      alert('KYC submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-card p-8 rounded-2xl border border-white/10">
              <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Verification Submitted!
              </h2>
              <p className="text-gray-300 mb-8">
                Your KYC verification has been submitted successfully. Our team will review your documents within 24-48 hours.
              </p>
              <Link 
                href="/marketplace"
                className="inline-flex items-center bg-gradient-secondary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg pt-16">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              href="/kyc"
              className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Verification Options
            </Link>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">International Verification</h1>
                <p className="text-gray-300">Complete KYC verification</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-gradient-secondary' : 
                      isActive ? 'bg-gradient-secondary border-2 border-white' : 
                      'bg-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-semibold">{index + 1}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 ${
                        isCompleted ? 'bg-gradient-secondary' : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gradient-card p-8 rounded-2xl border border-white/10">
            {/* Document Type Selection */}
            {currentStep === 'document-type' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Choose Your Document Type</h2>
                
                {/* Mobile Option */}
                <div className="mb-8">
                  <div className="bg-gradient-secondary/20 border-2 border-accent-secondary p-6 rounded-xl mb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mr-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-white">Continue on Mobile</h3>
                        <p className="text-gray-300">Use your phone's camera for better document capture</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <QRCode url={`${window.location.origin}/kyc/mobile`} size={128} />
                    </div>
                    <a
                      href="/kyc/mobile"
                      target="_blank"
                      className="inline-block bg-gradient-primary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                    >
                      Open Mobile KYC
                    </a>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { value: 'passport', label: 'Passport', icon: '🛂' },
                    { value: 'drivers_license', label: 'Driver\'s License', icon: '🚗' },
                    { value: 'national_id', label: 'National ID', icon: '🆔' }
                  ].map((doc) => (
                    <div
                      key={doc.value}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        documentType === doc.value
                          ? 'border-accent-secondary bg-gradient-secondary/20'
                          : 'border-white/10 hover:border-accent-secondary/50'
                      }`}
                      onClick={() => setDocumentType(doc.value as any)}
                    >
                      <div className="text-4xl mb-4">{doc.icon}</div>
                      <h3 className="text-lg font-semibold text-white">{doc.label}</h3>
                    </div>
                  ))}
                </div>
                <button
                  onClick={nextStep}
                  className="mt-8 bg-gradient-secondary hover:shadow-button text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                >
                  Continue on Desktop
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>
              </div>
            )}

            {/* Document Capture Steps */}
            {(currentStep === 'document-front' || currentStep === 'document-back' || currentStep === 'face-scan') && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentStep === 'document-front' && 'Capture Front of Document'}
                  {currentStep === 'document-back' && 'Capture Back of Document'}
                  {currentStep === 'face-scan' && 'Face Verification'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {currentStep === 'document-front' && 'Position your document clearly in the frame'}
                  {currentStep === 'document-back' && 'Flip your document and capture the back'}
                  {currentStep === 'face-scan' && 'Look directly at the camera and take a photo'}
                </p>

                {!isCapturing && !capturedImages[currentStep === 'document-front' ? 'documentFront' : currentStep === 'document-back' ? 'documentBack' : 'faceScan'] && (
                  <button
                    onClick={() => {
                      setIsCapturing(true);
                      startCamera();
                    }}
                    className="bg-gradient-secondary hover:shadow-button text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                  >
                    <Camera className="w-5 h-5 mr-2 inline" />
                    Start Camera
                  </button>
                )}

                {isCapturing && (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-md rounded-xl border-2 border-accent-secondary"
                      />
                      <div className="absolute inset-0 border-2 border-accent-secondary rounded-xl pointer-events-none">
                        <div className="absolute top-4 left-4 right-4 h-1 bg-accent-secondary rounded-full animate-pulse" />
                        <div className="absolute bottom-4 left-4 right-4 h-1 bg-accent-secondary rounded-full animate-pulse" />
                      </div>
                    </div>
                    <button
                      onClick={captureImage}
                      className="bg-gradient-secondary hover:shadow-button text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                    >
                      <Camera className="w-5 h-5 mr-2 inline" />
                      Capture Photo
                    </button>
                  </div>
                )}

                {capturedImages[currentStep === 'document-front' ? 'documentFront' : currentStep === 'document-back' ? 'documentBack' : 'faceScan'] && (
                  <div className="space-y-4">
                    <img
                      src={capturedImages[currentStep === 'document-front' ? 'documentFront' : currentStep === 'document-back' ? 'documentBack' : 'faceScan']}
                      alt="Captured"
                      className="w-full max-w-md rounded-xl border-2 border-accent-secondary mx-auto"
                    />
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={retakePhoto}
                        className="bg-black/20 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-2 inline" />
                        Retake
                      </button>
                      <button
                        onClick={nextStep}
                        className="bg-gradient-secondary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2 inline" />
                      </button>
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Mobile Setup */}
            {currentStep === 'mobile-setup' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Continue on Mobile</h2>
                <p className="text-gray-300 mb-8">
                  For a better experience, you can continue the verification process on your mobile device using the camera.
                </p>
                
                <div className="bg-gradient-card p-8 rounded-2xl border border-white/10 mb-8">
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Scan QR Code</h3>
                    <p className="text-gray-300">Use your phone's camera to scan this QR code</p>
                  </div>
                  
                  {/* QR Code */}
                  <div className="mb-6">
                    <QRCode url={`${window.location.origin}/kyc/mobile`} size={192} />
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={nextStep}
                      className="bg-gradient-secondary hover:shadow-button text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                    >
                      Continue on Desktop
                    </button>
                    <p className="text-gray-400 text-sm">
                      You can also continue here if you prefer
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Review */}
            {currentStep === 'complete' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Review Your Information</h2>
                <div className="space-y-6 text-left">
                  <div className="bg-black/20 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Document Information</h3>
                    <p className="text-gray-300">Document Type: {documentType.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-gray-300">Front: {capturedImages.documentFront ? '✅ Captured' : '❌ Missing'}</p>
                    <p className="text-gray-300">Back: {capturedImages.documentBack ? '✅ Captured' : '❌ Missing'}</p>
                    <p className="text-gray-300">Face Scan: {capturedImages.faceScan ? '✅ Captured' : '❌ Missing'}</p>
                  </div>
                  
                  <div className="bg-black/20 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                    <p className="text-gray-300">Name: {personalInfo.firstName} {personalInfo.lastName}</p>
                    <p className="text-gray-300">Date of Birth: {personalInfo.dateOfBirth}</p>
                    <p className="text-gray-300">Nationality: {personalInfo.nationality}</p>
                    <p className="text-gray-300">Residence: {personalInfo.countryOfResidence}</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-secondary hover:shadow-button text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-smooth transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Verification...
                      </div>
                    ) : (
                      'Submit Verification'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 