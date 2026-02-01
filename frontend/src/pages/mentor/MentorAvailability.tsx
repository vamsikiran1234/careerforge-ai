import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export const MentorAvailability: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [timezone, setTimezone] = useState<string>('UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      const response = await axios.get(`${API_URL}/sessions/my-availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAvailability(response.data.data.availability || []);
        setTimezone(response.data.data.timezone || 'UTC');
      }
    } catch (err: any) {
      console.error('Fetch availability error:', err);
      if (err.response?.status === 403) {
        // Mentor profile not found - start with empty availability
        setAvailability([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load availability');
      }
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setAvailability([
      ...availability,
      {
        dayOfWeek: 1, // Monday by default
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    ]);
    setHasChanges(true);
  };

  const removeTimeSlot = (index: number) => {
    const newAvailability = availability.filter((_, i) => i !== index);
    setAvailability(newAvailability);
    setHasChanges(true);
  };

  const updateTimeSlot = (
    index: number,
    field: keyof AvailabilitySlot,
    value: any
  ) => {
    const newAvailability = [...availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value,
    };
    setAvailability(newAvailability);
    setHasChanges(true);
  };

  const validateAvailability = (): string | null => {
    if (availability.length === 0) {
      return 'Please add at least one availability slot';
    }

    for (let i = 0; i < availability.length; i++) {
      const slot = availability[i];

      if (!slot.startTime || !slot.endTime) {
        return `Slot ${i + 1}: Start time and end time are required`;
      }

      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return `Slot ${i + 1}: End time must be after start time`;
      }

      if (endMinutes - startMinutes < 30) {
        return `Slot ${i + 1}: Minimum slot duration is 30 minutes`;
      }
    }

    return null;
  };

  const saveAvailability = async () => {
    try {
      // Validate
      const validationError = validateAvailability();
      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true);
      setError('');
      setSuccess('');

      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      const response = await axios.post(
        `${API_URL}/sessions/availability`,
        {
          availability: availability.map(slot => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
          timezone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Availability saved successfully!');
        setHasChanges(false);
        // Refresh to get IDs
        fetchAvailability();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      console.error('Save availability error:', err);
      setError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const groupedAvailability = DAYS_OF_WEEK.map(day => ({
    ...day,
    slots: availability.filter(slot => slot.dayOfWeek === day.value),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Availability Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set your weekly schedule for mentorship sessions
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Timezone Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Timezone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select your timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => {
                setTimezone(e.target.value);
                setHasChanges(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Weekly Schedule</CardTitle>
          <Button onClick={addTimeSlot} size="sm" variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Availability Set
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add your available time slots to let students book sessions
              </p>
              <Button onClick={addTimeSlot} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Time Slot
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Weekly View */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {groupedAvailability.map((day) => (
                  <div
                    key={day.value}
                    className={`p-3 rounded-lg border ${
                      day.slots.length > 0
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                        {day.short}
                      </p>
                      {day.slots.length > 0 ? (
                        <div className="space-y-1">
                          {day.slots.map((slot, idx) => (
                            <p
                              key={idx}
                              className="text-xs text-purple-700 dark:text-purple-300"
                            >
                              {slot.startTime} - {slot.endTime}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Unavailable</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed List View */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Time Slot Details
                </h4>
                {availability.map((slot, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Day of Week
                      </label>
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) =>
                          updateTimeSlot(index, 'dayOfWeek', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateTimeSlot(index, 'startTime', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateTimeSlot(index, 'endTime', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => removeTimeSlot(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {availability.length > 0 && (
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => {
              fetchAvailability();
              setHasChanges(false);
            }}
            variant="outline"
            disabled={saving || !hasChanges}
          >
            Cancel
          </Button>
          <Button
            onClick={saveAvailability}
            variant="primary"
            disabled={saving || !hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      )}

      {/* Helper Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-gray-900 dark:text-white">Time Slots:</strong> Each
                slot represents a recurring weekly availability. Students can book 30-minute or
                60-minute sessions during these times.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-gray-900 dark:text-white">Note:</strong> Your
                availability will be displayed to students in their local timezone. Make sure to
                select your correct timezone above.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
