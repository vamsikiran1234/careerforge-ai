import React, { useState } from 'react';
import type { Mentor } from '@/store/mentors';
import { useMentorStore } from '@/store/mentors';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar, Clock, DollarSign, User } from 'lucide-react';

interface BookingModalProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  mentor,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { bookSession, loading } = useMentorStore();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    topic: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Please select a time';
    }

    if (!formData.topic) {
      newErrors.topic = 'Please provide a session topic';
    }

    if (formData.duration < 30 || formData.duration > 180) {
      newErrors.duration = 'Duration must be between 30 and 180 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await bookSession({
        mentorId: mentor.id,
        userId: 'current-user', // In a real app, this would come from auth state
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        status: 'scheduled',
        topic: formData.topic,
        notes: formData.notes,
      });

      addToast({
        type: 'success',
        title: 'Session Booked!',
        description: `Your session with ${mentor.name} has been scheduled for ${formData.date} at ${formData.time}`,
      });

      onSuccess();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Booking Failed',
        description: 'Unable to book session. Please try again.',
      });
    }
  };

  const getTotalCost = () => {
    return (mentor.hourlyRate * (formData.duration / 60)).toFixed(2);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Book a Session">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mentor Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Session with {mentor.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{mentor.name}</p>
                <p className="text-sm text-gray-600">{mentor.title}</p>
                <p className="text-sm text-gray-500">{mentor.company}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            min={getMinDate()}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
            leftIcon={<Calendar className="h-4 w-4" />}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              required
            >
              <option value="">Select time</option>
              {getTimeSlots().map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time}</p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes) <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
          )}
        </div>

        {/* Session Topic */}
        <Input
          label="Session Topic"
          placeholder="What would you like to discuss?"
          value={formData.topic}
          onChange={(e) => handleInputChange('topic', e.target.value)}
          error={errors.topic}
          required
        />

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any specific questions or topics you'd like to cover?"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          />
        </div>

        {/* Cost Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Total Cost</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${getTotalCost()}
                </p>
                <p className="text-sm text-gray-600">
                  ${mentor.hourlyRate}/hour × {formData.duration} minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            isLoading={loading}
            disabled={loading}
          >
            <Clock className="h-4 w-4 mr-2" />
            Book Session (${getTotalCost()})
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
