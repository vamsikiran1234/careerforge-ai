import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  GraduationCap, 
  Briefcase, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Mail,
  Clock,
  Video,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface MentorFormData {
  // Professional Info
  company: string;
  jobTitle: string;
  industry: string;
  yearsOfExperience: string;
  
  // Educational Background
  collegeName: string;
  degree: string;
  graduationYear: string;
  major: string;
  
  // Mentorship Details
  expertiseAreas: string[];
  bio: string;
  linkedinUrl: string;
  portfolioUrl: string;
  
  // Availability
  availableHoursPerWeek: string;
  preferredMeetingType: 'VIDEO' | 'CHAT' | 'BOTH';
  timezone: string;
}

const EXPERTISE_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'AI/Machine Learning',
  'Data Science',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'UI/UX Design',
  'Product Management',
  'Backend Development',
  'Frontend Development',
  'Full Stack Development',
  'Database Management',
  'Blockchain',
  'Game Development',
];

const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'E-commerce',
  'Consulting',
  'Media & Entertainment',
  'Telecommunications',
  'Manufacturing',
  'Other',
];

export const MentorRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<MentorFormData>({
    company: '',
    jobTitle: '',
    industry: '',
    yearsOfExperience: '',
    collegeName: '',
    degree: '',
    graduationYear: '',
    major: '',
    expertiseAreas: [],
    bio: '',
    linkedinUrl: '',
    portfolioUrl: '',
    availableHoursPerWeek: '5',
    preferredMeetingType: 'VIDEO',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof MentorFormData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof MentorFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(expertise)
        ? prev.expertiseAreas.filter(e => e !== expertise)
        : [...prev.expertiseAreas, expertise],
    }));
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof MentorFormData, string>> = {};

    if (!formData.company) newErrors.company = 'Company is required';
    if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Years of experience is required';
    } else if (parseInt(formData.yearsOfExperience) < 0) {
      newErrors.yearsOfExperience = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof MentorFormData, string>> = {};

    if (!formData.collegeName) newErrors.collegeName = 'College name is required';
    if (!formData.degree) newErrors.degree = 'Degree is required';
    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required';
    } else {
      const year = parseInt(formData.graduationYear);
      const currentYear = new Date().getFullYear();
      if (year < 1950 || year > currentYear + 6) {
        newErrors.graduationYear = 'Please enter a valid graduation year';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof MentorFormData, string>> = {};

    if (formData.expertiseAreas.length === 0) {
      newErrors.expertiseAreas = 'Please select at least one expertise area';
    }
    if (!formData.bio) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be under 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get token from both possible locations for compatibility
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token || token === 'null' || token === 'undefined') {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      console.log('🚀 Submitting mentor registration...');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/mentorship/register`,
        {
          ...formData,
          yearsOfExperience: parseInt(formData.yearsOfExperience),
          graduationYear: parseInt(formData.graduationYear),
          availableHoursPerWeek: parseInt(formData.availableHoursPerWeek),
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Mentor registration response:', response.data);

      if (response.data.success) {
        setCurrentStep(4); // Show success message
      } else {
        setError(response.data.message || 'Failed to register as mentor');
      }
    } catch (err: any) {
      console.error('❌ Mentor registration error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Failed to register as mentor';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Authentication failed. Please log in again.';
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid data submitted. Please check all fields.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  currentStep >= step
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                }`}
              >
                {currentStep > step ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : step === 1 ? (
                  <Briefcase className="w-5 h-5" />
                ) : step === 2 ? (
                  <GraduationCap className="w-5 h-5" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  currentStep >= step
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step === 1 ? 'Professional' : step === 2 ? 'Education' : 'Mentorship'}
              </span>
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-colors ${
                  currentStep > step
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Current Company *
        </label>
        <Input
          id="company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleInputChange}
          error={errors.company}
          placeholder="e.g., Google, Microsoft, Startup Inc."
        />
      </div>

      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Job Title *
        </label>
        <Input
          id="jobTitle"
          name="jobTitle"
          type="text"
          value={formData.jobTitle}
          onChange={handleInputChange}
          error={errors.jobTitle}
          placeholder="e.g., Senior Software Engineer"
        />
      </div>

      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Industry *
        </label>
        <select
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
            errors.industry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value="">Select industry</option>
          {INDUSTRY_OPTIONS.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry}</p>
        )}
      </div>

      <div>
        <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Years of Experience *
        </label>
        <Input
          id="yearsOfExperience"
          name="yearsOfExperience"
          type="number"
          min="0"
          value={formData.yearsOfExperience}
          onChange={handleInputChange}
          error={errors.yearsOfExperience}
          placeholder="e.g., 5"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          College/University *
        </label>
        <Input
          id="collegeName"
          name="collegeName"
          type="text"
          value={formData.collegeName}
          onChange={handleInputChange}
          error={errors.collegeName}
          placeholder="e.g., MIT, Stanford University"
        />
      </div>

      <div>
        <label htmlFor="degree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Degree *
        </label>
        <Input
          id="degree"
          name="degree"
          type="text"
          value={formData.degree}
          onChange={handleInputChange}
          error={errors.degree}
          placeholder="e.g., Bachelor of Science, Master of Engineering"
        />
      </div>

      <div>
        <label htmlFor="major" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Major/Field of Study
        </label>
        <Input
          id="major"
          name="major"
          type="text"
          value={formData.major}
          onChange={handleInputChange}
          placeholder="e.g., Computer Science, Business Administration"
        />
      </div>

      <div>
        <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Graduation Year *
        </label>
        <Input
          id="graduationYear"
          name="graduationYear"
          type="number"
          min="1950"
          max={new Date().getFullYear() + 6}
          value={formData.graduationYear}
          onChange={handleInputChange}
          error={errors.graduationYear}
          placeholder={`e.g., ${new Date().getFullYear()}`}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expertise Areas * <span className="text-xs text-gray-500">(Select at least one)</span>
        </label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
          {EXPERTISE_OPTIONS.map((expertise) => (
            <Badge
              key={expertise}
              variant={formData.expertiseAreas.includes(expertise) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
              onClick={() => toggleExpertise(expertise)}
            >
              {expertise}
              {formData.expertiseAreas.includes(expertise) && (
                <CheckCircle2 className="ml-1 w-3 h-3" />
              )}
            </Badge>
          ))}
        </div>
        {errors.expertiseAreas && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expertiseAreas}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio * <span className="text-xs text-gray-500">({formData.bio.length}/500 characters)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          maxLength={500}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
            errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Tell students about yourself, your experience, and what you can help them with..."
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
        )}
      </div>

      <div>
        <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          LinkedIn URL (Optional)
        </label>
        <Input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          value={formData.linkedinUrl}
          onChange={handleInputChange}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div>
        <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Portfolio URL (Optional)
        </label>
        <Input
          id="portfolioUrl"
          name="portfolioUrl"
          type="url"
          value={formData.portfolioUrl}
          onChange={handleInputChange}
          placeholder="https://yourportfolio.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="availableHoursPerWeek" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Clock className="w-4 h-4 inline mr-1" />
            Available Hours/Week
          </label>
          <Input
            id="availableHoursPerWeek"
            name="availableHoursPerWeek"
            type="number"
            min="1"
            max="40"
            value={formData.availableHoursPerWeek}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="preferredMeetingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Video className="w-4 h-4 inline mr-1" />
            Preferred Meeting Type
          </label>
          <select
            id="preferredMeetingType"
            name="preferredMeetingType"
            value={formData.preferredMeetingType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="VIDEO">Video Call</option>
            <option value="CHAT">Chat Only</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
        <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Registration Successful!
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        We've sent a verification email to <strong>{user?.email}</strong>
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Please check your inbox and click the verification link to activate your mentor profile.
      </p>
      <Button onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </Button>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to register as a mentor</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-primary-600">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Become a Mentor
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Share your knowledge and help students achieve their career goals
          </p>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 4
                ? 'Check Your Email'
                : `Step ${currentStep} of 3`}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Tell us about your professional background'}
              {currentStep === 2 && 'Share your educational background'}
              {currentStep === 3 && 'Set up your mentorship profile'}
              {currentStep === 4 && 'Verify your email to complete registration'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep < 4 && renderProgressBar()}

            {error && (
              <div className="mb-6 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                      Registration Error
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderSuccess()}

              {currentStep < 4 && (
                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  {currentStep < 3 ? (
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading} className="relative">
                      {isLoading ? (
                        <>
                          <span className="opacity-0">Complete Registration</span>
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="ml-2">Submitting...</span>
                          </span>
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {currentStep < 4 && (
          <div className="mt-4 text-center">
            <Link
              to="/dashboard"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              Cancel and go back
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
