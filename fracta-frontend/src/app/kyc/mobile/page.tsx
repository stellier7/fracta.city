'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

type MobileKYCStep = 'welcome' | 'document-front' | 'document-back' | 'face-scan' | 'complete';

export default function MobileKYCPage() {
  const [currentStep, setCurrentStep] = useState<MobileKYCStep>('welcome');
  const [capturedImages, setCapturedImages] = useState<{
    documentFront?: string;
    documentBack?: string;
    faceScan?: string;
  }>({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Mobile KYC Verification' },
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
      setCurrentStep(steps[currentIndex + 1].id as MobileKYCStep);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // TODO: Call KYC API with captured images
      console.log('Submitting mobile KYC:', capturedImages);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setIsSubmitted(true);
    } catch (error) {
      console.error('Mobile KYC submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <div className="bg-gradient-card p-8 rounded-2xl border border-white/10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Verification Submitted!
          </h2>
          <p className="text-gray-300 mb-6">
            Your mobile KYC verification has been submitted successfully. You'll receive an update within 24-48 hours.
          </p>
          <button 
            onClick={() => window.close()}
            className="bg-gradient-secondary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Mobile KYC</h1>
            <p className="text-gray-300">Complete verification using your phone's camera</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-gradient-secondary' : 
                      isActive ? 'bg-gradient-secondary border-2 border-white' : 
                      'bg-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-1 mx-2 ${
                        isCompleted ? 'bg-gradient-secondary' : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            {/* Welcome Step */}
            {currentStep === 'welcome' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Mobile Verification</h2>
                <p className="text-gray-300 mb-6">
                  Use your phone's camera to capture your documents and face for verification.
                </p>
                <button
                  onClick={nextStep}
                  className="bg-gradient-secondary hover:shadow-button text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                >
                  Start Verification
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            )}

            {/* Document Capture Steps */}
            {(currentStep === 'document-front' || currentStep === 'document-back' || currentStep === 'face-scan') && (
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-4">
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
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-xl border-2 border-accent-secondary"
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
                      className="w-full rounded-xl border-2 border-accent-secondary"
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

            {/* Complete Review */}
            {currentStep === 'complete' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Review Your Images</h2>
                <div className="space-y-6 text-left">
                  <div className="bg-black/20 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Captured Images</h3>
                    <p className="text-gray-300">Front: {capturedImages.documentFront ? '✅ Captured' : '❌ Missing'}</p>
                    <p className="text-gray-300">Back: {capturedImages.documentBack ? '✅ Captured' : '❌ Missing'}</p>
                    <p className="text-gray-300">Face Scan: {capturedImages.faceScan ? '✅ Captured' : '❌ Missing'}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-secondary hover:shadow-button text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-smooth transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Verification'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 