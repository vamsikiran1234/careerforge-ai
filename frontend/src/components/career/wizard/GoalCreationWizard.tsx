import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCareerStore } from '../../../store/career';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Loader2,
  Target,
  Briefcase,
  Calendar,
  FileText
} from 'lucide-react';
import AILoadingAnimation from '../AILoadingAnimation';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

const steps: WizardStep[] = [
  { id: 1, title: 'Current Position', description: 'Where you are now', icon: Briefcase },
  { id: 2, title: 'Target Position', description: 'Where you want to be', icon: Target },
  { id: 3, title: 'Timeline', description: 'When you want to achieve it', icon: Calendar },
  { id: 4, title: 'Review', description: 'Confirm your goal', icon: FileText }
];

const GoalCreationWizard = () => {
  const navigate = useNavigate();
  const { createGoal, generateTrajectory, isLoading, isAnalyzing, error } = useCareerStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [generateAI, setGenerateAI] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    currentRole: '',
    currentCompany: '',
    currentLevel: '',
    yearsExperience: '',
    targetRole: '',
    targetCompany: '',
    targetLevel: '',
    targetSalary: '',
    timeframeMonths: '12',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.currentRole.trim()) {
        newErrors.currentRole = 'Current role is required';
      }
    } else if (step === 2) {
      if (!formData.targetRole.trim()) {
        newErrors.targetRole = 'Target role is required';
      }
    } else if (step === 3) {
      const months = parseInt(formData.timeframeMonths);
      if (!months || months < 1 || months > 60) {
        newErrors.timeframeMonths = 'Please enter a valid timeframe (1-60 months)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      const goalData = {
        currentRole: formData.currentRole,
        currentCompany: formData.currentCompany || undefined,
        currentLevel: formData.currentLevel || undefined,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : undefined,
        targetRole: formData.targetRole,
        targetCompany: formData.targetCompany || undefined,
        targetLevel: formData.targetLevel || undefined,
        targetSalary: formData.targetSalary ? parseFloat(formData.targetSalary) : undefined,
        timeframeMonths: parseInt(formData.timeframeMonths),
        notes: formData.notes || undefined
      };

      const newGoal = await createGoal(goalData);

      // Generate AI trajectory if requested
      if (generateAI && newGoal?.id) {
        try {
          await generateTrajectory(newGoal.id);
        } catch (aiError) {
          console.error('AI generation failed, but goal created:', aiError);
          // Continue to goal page even if AI generation fails
        }
      }

      navigate(`/career/${newGoal.id}`);
    } catch (err: any) {
      console.error('Failed to create goal:', err);
      // Error is handled by the store and displayed in UI
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <>
      {/* AI Loading Animation Overlay */}
      {isAnalyzing && <AILoadingAnimation />}
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Career Goal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Define your career trajectory and let AI help you get there
            </p>
          </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/50'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 transition-all ${
                        currentStep > step.id
                          ? 'bg-emerald-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={{ marginTop: '-40px' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Current Position */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Role *
                </label>
                <input
                  type="text"
                  value={formData.currentRole}
                  onChange={(e) => updateFormData('currentRole', e.target.value)}
                  placeholder="e.g., Junior Developer, Product Manager"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.currentRole
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500'
                  } dark:bg-gray-700 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                />
                {errors.currentRole && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentRole}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Company (Optional)
                </label>
                <input
                  type="text"
                  value={formData.currentCompany}
                  onChange={(e) => updateFormData('currentCompany', e.target.value)}
                  placeholder="e.g., TechCorp Inc."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Level (Optional)
                  </label>
                  <select
                    value={formData.currentLevel}
                    onChange={(e) => updateFormData('currentLevel', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select level</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Principal">Principal</option>
                    <option value="Director">Director</option>
                    <option value="VP">VP</option>
                    <option value="C-Level">C-Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Years of Experience (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.yearsExperience}
                    onChange={(e) => updateFormData('yearsExperience', e.target.value)}
                    placeholder="e.g., 3"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target Position */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Role *
                </label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => updateFormData('targetRole', e.target.value)}
                  placeholder="e.g., Senior Full-Stack Engineer, Head of Product"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.targetRole
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500'
                  } dark:bg-gray-700 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                />
                {errors.targetRole && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.targetRole}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Company (Optional)
                </label>
                <input
                  type="text"
                  value={formData.targetCompany}
                  onChange={(e) => updateFormData('targetCompany', e.target.value)}
                  placeholder="e.g., FAANG, Startup, Dream Company"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Level (Optional)
                  </label>
                  <select
                    value={formData.targetLevel}
                    onChange={(e) => updateFormData('targetLevel', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Staff">Staff</option>
                    <option value="Principal">Principal</option>
                    <option value="Director">Director</option>
                    <option value="VP">VP</option>
                    <option value="C-Level">C-Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Salary (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.targetSalary}
                    onChange={(e) => updateFormData('targetSalary', e.target.value)}
                    placeholder="e.g., 120000"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeframe (Months) *
                </label>
                <input
                  type="number"
                  value={formData.timeframeMonths}
                  onChange={(e) => updateFormData('timeframeMonths', e.target.value)}
                  placeholder="e.g., 12"
                  min="1"
                  max="60"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.timeframeMonths
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500'
                  } dark:bg-gray-700 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                />
                {errors.timeframeMonths && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.timeframeMonths}</p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  How many months do you want to achieve this goal? (1-60 months)
                </p>
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[3, 6, 12, 24].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => updateFormData('timeframeMonths', months.toString())}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.timeframeMonths === months.toString()
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {months} {months === 1 ? 'month' : 'months'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Any additional context or motivation for this goal..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Career Transition
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">{formData.currentRole}</p>
                      {formData.currentCompany && (
                        <p className="text-xs text-gray-500">@ {formData.currentCompany}</p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">{formData.targetRole}</p>
                      {formData.targetCompany && (
                        <p className="text-xs text-gray-500">@ {formData.targetCompany}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Timeframe</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formData.timeframeMonths} months
                    </p>
                  </div>
                  {formData.yearsExperience && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formData.yearsExperience} years
                      </p>
                    </div>
                  )}
                  {formData.targetSalary && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Target Salary</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${parseFloat(formData.targetSalary).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {formData.notes && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formData.notes}</p>
                  </div>
                )}
              </div>

              {/* AI Generation Option */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      AI-Powered Trajectory Generation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Let AI analyze your career transition and automatically generate personalized milestones, 
                      skill recommendations, and learning resources tailored to your goal.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generateAI}
                        onChange={(e) => setGenerateAI(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Generate AI-powered trajectory (Recommended)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/career')}
              disabled={isLoading || isAnalyzing}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isLoading || isAnalyzing}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading || isAnalyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || isAnalyzing}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isLoading || isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isAnalyzing ? 'Generating AI Trajectory...' : 'Creating Goal...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Create Goal
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your goal will be private by default. You can change visibility settings later.
          </p>
        </div>
        </div>
      </div>
    </>
  );
};

export default GoalCreationWizard;
