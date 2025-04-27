import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, PiggyBank, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import classNames from 'classnames';

const ONBOARDING_STEPS = [
  {
    title: 'Commitments',
    subtitle: 'Committing to your finances is the first step toward reaching your goals. He who is faithful with little will also be faithful with much.',
    icon: DollarSign,
    color: 'bg-primary-100',
    iconColor: 'text-primary-600'
  },
  {
    title: 'Set Your Goals',
    subtitle: 'Define clear financial goals and track your progress. Whether it\'s saving for a home or building an emergency fund, we\'ll help you get there.',
    icon: Target,
    color: 'bg-success-100',
    iconColor: 'text-success-600'
  },
  {
    title: 'Track Expenses',
    subtitle: 'Keep track of where your money goes. Understanding your spending habits is key to better financial management.',
    icon: PiggyBank,
    color: 'bg-warning-100',
    iconColor: 'text-warning-600'
  },
  {
    title: 'Prepare Your Plan',
    subtitle: 'Upload your financial spreadsheet to get started with your existing data, or skip this step to start fresh.',
    icon: FileSpreadsheet,
    color: 'bg-accent-100',
    iconColor: 'text-accent-600'
  }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (fileType === 'xlsx' || fileType === 'csv') {
        setSelectedFile(file);
        simulateUpload();
      } else {
        setUploadStatus('error');
      }
    }
  };

  const simulateUpload = () => {
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('success');
    }, 2000);
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  const renderUploadContent = () => {
    if (uploadStatus === 'success') {
      return (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-success-600" />
          </div>
          <div>
            <p className="font-medium text-success-700">File uploaded successfully!</p>
            <p className="text-sm text-gray-500 mt-1">{selectedFile?.name}</p>
          </div>
        </div>
      );
    }

    if (uploadStatus === 'error') {
      return (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-error-600" />
          </div>
          <div>
            <p className="font-medium text-error-700">Invalid file format</p>
            <p className="text-sm text-gray-500 mt-1">Please upload an .xlsx or .csv file</p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-4">
        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
        <div>
          <p className="font-medium text-gray-700">
            {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
          </p>
          <p className="text-sm text-gray-500 mt-1">or click to browse</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Dots */}
      <div className="fixed top-8 left-0 right-0 flex justify-center gap-2">
        {ONBOARDING_STEPS.map((_, index) => (
          <div
            key={index}
            className={classNames(
              'w-2 h-2 rounded-full transition-colors',
              index === currentStep ? 'bg-primary-600' : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
        <div className="w-full max-w-sm text-center space-y-8">
          {/* Icon */}
          <div className="mx-auto">
            <div className={classNames(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto',
              currentStepData.color
            )}>
              <currentStepData.icon className={classNames(
                'h-12 w-12',
                currentStepData.iconColor
              )} />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* File Upload Area (only on last step) */}
          {currentStep === 3 && (
            <div 
              className={classNames(
                'border-2 border-dashed rounded-xl p-8 transition-colors',
                dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400',
                uploadStatus === 'success' ? 'border-success-500 bg-success-50' : '',
                uploadStatus === 'error' ? 'border-error-500 bg-error-50' : ''
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
                />
                {renderUploadContent()}
              </label>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-600 font-medium mb-2">Your file should include:</p>
              <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                <li>Income</li>
                <li>Fixed Expenses</li>
                <li>Variable Expenses</li>
                <li>Investments</li>
                <li>Extras</li>
                <li>Additional</li>
                <li>Tax</li>
              </ul>
            </div>
          )}

          {/* Decorative Dots */}
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-200" />
            <div className="w-2 h-2 rounded-full bg-primary-300" />
            <div className="w-2 h-2 rounded-full bg-primary-400" />
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="p-6 space-y-4">
        <button
          onClick={handleNext}
          className="w-full bg-black text-white rounded-full py-4 font-semibold text-lg transition-colors hover:bg-gray-900"
        >
          {currentStep === ONBOARDING_STEPS.length - 1 ? 'Start Now' : 'Next Step'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          Skip This Step
        </button>
      </div>
    </div>
  );
}