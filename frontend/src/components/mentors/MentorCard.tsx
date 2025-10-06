import React from 'react';
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
  Users
} from 'lucide-react';

interface MentorCardProps {
  mentor: MentorProfile;
  onClick: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onClick }) => {
  // Calculate availability status
  const isAvailable = mentor.activeConnections < 3;
  const availabilityColor = isAvailable ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400';
  const availabilityText = isAvailable 
    ? `${3 - mentor.activeConnections} spot${3 - mentor.activeConnections !== 1 ? 's' : ''} available` 
    : 'Fully booked';

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 dark:hover:border-blue-400">
      <CardContent className="p-6" onClick={onClick}>
        {/* Header with Avatar */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {mentor.user.avatar ? (
              <img
                src={mentor.user.avatar}
                alt={mentor.user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {mentor.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {mentor.user.name}
              </h3>
              {mentor.isVerified && (
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {mentor.jobTitle}
            </p>
          </div>
        </div>

        {/* Company & Experience */}
        <div className="space-y-2 mb-4">
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
                className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
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
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                +{areas.length - 3}
              </Badge>
            );
          })()}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          {/* Rating */}
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {mentor.averageRating?.toFixed(1) || 'New'}
            </span>
            {mentor.averageRating && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({mentor.totalSessions})
              </span>
            )}
          </div>

          {/* Sessions */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-1" />
            <span>{mentor.totalSessions} sessions</span>
          </div>
        </div>

        {/* Bio Preview */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {mentor.bio}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Availability */}
          <div className="flex items-center text-sm">
            <Clock className={`w-4 h-4 mr-1 ${availabilityColor}`} />
            <span className={availabilityColor}>
              {availabilityText}
            </span>
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
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-3">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{mentor.timezone}</span>
          <span className="mx-2">•</span>
          <span>{mentor.preferredMeetingType.toLowerCase()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
