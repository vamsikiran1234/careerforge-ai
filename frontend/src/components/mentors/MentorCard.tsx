import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { MentorProfile } from '@/store/mentors';
import { 
  Briefcase, 
  GraduationCap, 
  Star, 
  MapPin, 
  Clock,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface MentorCardProps {
  mentor: MentorProfile;
  onClick: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onClick }) => {
  const [availableSlots, setAvailableSlots] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  // Calculate availability status
  const isAvailable = mentor.activeConnections < 3;
  const availabilityColor = isAvailable ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400';
  const availabilityText = isAvailable 
    ? `${3 - mentor.activeConnections} spot${3 - mentor.activeConnections !== 1 ? 's' : ''} available` 
    : 'Fully booked';
  
  useEffect(() => {
    fetchAvailability();
  }, [mentor.id]);
  
  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions/availability/${mentor.id}`);
      if (response.data.success) {
        const slots = response.data.data.availableSlots || [];
        setAvailableSlots(slots.length);
      }
    } catch (error) {
      console.debug('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="transition-all duration-300 border-2 cursor-pointer hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400">
      <CardContent className="p-6" onClick={onClick}>
        {/* Header with Avatar */}
        <div className="flex items-start mb-4 space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {mentor.user.avatar ? (
              <img
                src={mentor.user.avatar}
                alt={mentor.user.name}
                className="object-cover w-16 h-16 border-2 border-gray-200 rounded-full dark:border-gray-700"
              />
            ) : (
              <div className="flex items-center justify-center w-16 h-16 text-xl font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                {mentor.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 truncate dark:text-white">
                {mentor.user.name}
              </h3>
              {mentor.isVerified && (
                <CheckCircle className="flex-shrink-0 w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 truncate dark:text-gray-400">
              {mentor.jobTitle}
            </p>
          </div>
        </div>

        {/* Company & Experience */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <Briefcase className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="font-medium">{mentor.company}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              {mentor.yearsOfExperience}+ years
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <GraduationCap className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="truncate">{mentor.collegeName}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              '{mentor.graduationYear % 100}
            </span>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(() => {
            // Handle both array and JSON string for expertiseAreas
            const areas = Array.isArray(mentor.expertiseAreas)
              ? mentor.expertiseAreas
              : typeof mentor.expertiseAreas === 'string'
              ? JSON.parse(mentor.expertiseAreas)
              : [];
            
            return areas.slice(0, 3).map((skill: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs text-blue-700 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
              >
                {skill}
              </Badge>
            ));
          })()}
          {(() => {
            const areas = Array.isArray(mentor.expertiseAreas)
              ? mentor.expertiseAreas
              : typeof mentor.expertiseAreas === 'string'
              ? JSON.parse(mentor.expertiseAreas)
              : [];
            
            return areas.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
              >
                +{areas.length - 3}
              </Badge>
            );
          })()}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star className={`w-4 h-4 ${mentor.averageRating && mentor.averageRating > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} />
            <span className={`text-sm font-semibold ${mentor.averageRating && mentor.averageRating > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
              {mentor.averageRating && mentor.averageRating > 0 ? mentor.averageRating.toFixed(2) : '0.00'}
            </span>
            {mentor.averageRating && mentor.averageRating > 0 ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({mentor.totalSessions})
              </span>
            ) : (
              <span className="text-xs italic text-gray-400 dark:text-gray-500">
                No ratings yet
              </span>
            )}
          </div>

          {/* Sessions */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="whitespace-nowrap">{mentor.totalSessions} session{mentor.totalSessions !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Bio Preview */}
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {mentor.bio}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Availability Slots */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center text-sm">
              <Clock className={`w-4 h-4 mr-1 ${availabilityColor}`} />
              <span className={availabilityColor}>
                {availabilityText}
              </span>
            </div>
            {!loading && availableSlots > 0 && (
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{availableSlots} time slots available</span>
              </div>
            )}
            {!loading && availableSlots === 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-500">No slots set yet</span>
            )}
          </div>

          {/* View Profile Button */}
          <Button
            size="sm"
            variant="outline"
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Profile
          </Button>
        </div>

        {/* Timezone hint */}
        <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-500">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{mentor.timezone}</span>
          <span className="mx-2">•</span>
          <span>{mentor.preferredMeetingType.toLowerCase()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
