import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, Phone, Users, ArrowLeft, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { format, addDays, startOfWeek, addMinutes, isBefore, isAfter } from 'date-fns';

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface MentorInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company: string;
  jobTitle: string;
  timezone: string;
  availableHoursPerWeek: number;
  preferredMeetingType: string;
}

interface BookedSlot {
  id: string;
  scheduledAt: string;
  duration: number;
}

interface AvailabilitySlot {
  start: string;
  end: string;
  dayOfWeek: number;
  displayTime: string;
}

interface WeeklySchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  timezone: string;
}

interface AvailabilityData {
  mentor: MentorInfo;
  bookedSlots: BookedSlot[];
  weeklySchedule: WeeklySchedule[];
  availableSlots: AvailabilitySlot[];
}

export default function SessionBooking() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();

  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sessionType, setSessionType] = useState('VIDEO');
  const [agendaNotes, setAgendaNotes] = useState('');

  useEffect(() => {
    console.log('🔍 SessionBooking mentorId from URL:', mentorId);
    console.log('🔍 mentorId type:', typeof mentorId);
    
    if (mentorId && typeof mentorId === 'string') {
      fetchAvailability();
    } else {
      console.error('❌ Invalid mentorId:', mentorId);
      setError('Invalid mentor ID. Please select a mentor from the list.');
      setLoading(false);
    }
  }, [mentorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_API_URL}/sessions/availability/${mentorId}`);

      if (response.data.success) {
        setAvailability(response.data.data);
      }
    } catch (err: any) {
      console.error('Fetch availability error:', err);
      setError(err.response?.data?.message || 'Failed to load mentor availability');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    if (!availability || !availability.availableSlots) {
      return [];
    }

    // Filter slots for the selected date
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const slotsForDate = availability.availableSlots.filter(slot => {
      const slotDate = format(new Date(slot.start), 'yyyy-MM-dd');
      return slotDate === selectedDateStr;
    });

    return slotsForDate;
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTime || !title) {
      alert('Please select a time slot and provide a session title');
      return;
    }

    try {
      setBooking(true);
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      // selectedTime is now the ISO string from availableSlots
      const scheduledAt = new Date(selectedTime);

      const response = await axios.post(
        `${VITE_API_URL}/sessions/book`,
        {
          mentorId,
          scheduledAt: scheduledAt.toISOString(),
          duration,
          title,
          description,
          sessionType,
          agendaNotes,
          timezone: availability?.mentor.timezone || 'UTC',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert('Session booked successfully! You will receive a meeting link.');
        navigate('/app/sessions');
      }
    } catch (err: any) {
      console.error('Book session error:', err);
      alert(err.response?.data?.message || 'Failed to book session');
    } finally {
      setBooking(false);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error || 'Failed to load availability'}</p>
          </div>
        </div>
      </div>
    );
  }

  const weekDays = getWeekDays();
  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Book a Session
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            with {availability.mentor.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar & Time Selection */}
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Select Date
              </h2>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const isPast = isBefore(day, new Date(new Date().setHours(0, 0, 0, 0)));

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      disabled={isPast}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isPast
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="text-lg font-semibold">{format(day, 'd')}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Previous Week
                </button>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Next Week
                </button>
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Available Time Slots
              </h2>

              {timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No available slots for this date
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Try selecting another date
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot.start;

                    return (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedTime(slot.start)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                        }`}
                      >
                        {slot.displayTime}
                      </button>
                    );
                  })}
                </div>
              )}

              {availability?.weeklySchedule && availability.weeklySchedule.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Mentor's Schedule:</strong> Shows available slots for the next 30 days based on weekly recurring availability
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Session Details
            </h2>

            <form onSubmit={handleBookSession} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Career Guidance Session"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what you'd like to discuss"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionType('VIDEO')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      sessionType === 'VIDEO'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Video className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Video</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionType('VOICE')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      sessionType === 'VOICE'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Phone className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Voice</div>
                  </button>
                </div>
              </div>

              {/* Agenda Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agenda / Topics to Discuss (Optional)
                </label>
                <textarea
                  value={agendaNotes}
                  onChange={(e) => setAgendaNotes(e.target.value)}
                  placeholder="Topics or questions you'd like to cover..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Summary */}
              {selectedTime && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Booking Summary
                  </h3>
                  <div className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                    <p>
                      <strong>Date:</strong> {format(new Date(selectedTime), 'PPPP')}
                    </p>
                    <p>
                      <strong>Time:</strong> {format(new Date(selectedTime), 'hh:mm a')}
                    </p>
                    <p>
                      <strong>Duration:</strong> {duration} minutes
                    </p>
                    <p>
                      <strong>Type:</strong> {sessionType}
                    </p>
                    <p>
                      <strong>Timezone:</strong> {availability?.mentor.timezone || 'UTC'}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Alert */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-400">
                  You will receive a video call link after booking. The meeting can be joined 15 minutes before
                  the scheduled time.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedTime || !title || booking}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {booking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Book Session
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
