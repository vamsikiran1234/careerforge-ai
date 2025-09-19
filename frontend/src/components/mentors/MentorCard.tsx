import React from 'react';
import type { Mentor } from '@/store/mentors';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  MessageCircle,
  CheckCircle,
  Circle,
  XCircle
} from 'lucide-react';

interface MentorCardProps {
  mentor: Mentor;
  onClick: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onClick }) => {
  const getAvailabilityIcon = () => {
    switch (mentor.availability) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy':
        return <Circle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAvailabilityText = () => {
    switch (mentor.availability) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getAvailabilityColor = () => {
    switch (mentor.availability) {
      case 'available':
        return 'text-green-600';
      case 'busy':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {mentor.name}
              </h3>
              <p className="text-sm text-gray-600">{mentor.title}</p>
              <p className="text-sm text-gray-500">{mentor.company}</p>
            </div>
          </div>
          <div className={`flex items-center text-xs ${getAvailabilityColor()}`}>
            {getAvailabilityIcon()}
            <span className="ml-1">{getAvailabilityText()}</span>
          </div>
        </div>

        {/* Rating and Experience */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="ml-1 text-sm font-medium">
              {mentor.rating.toFixed(1)}
            </span>
            <span className="ml-1 text-sm text-gray-500">
              ({mentor.totalReviews})
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {mentor.experience}+ years
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {mentor.expertise.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {mentor.expertise.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.expertise.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-xs text-gray-600">
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            ${mentor.hourlyRate}/hr
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {mentor.responseTime}
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-3 w-3 mr-1" />
            {mentor.sessions} sessions
          </div>
        </div>

        {/* Languages */}
        <div className="mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            {mentor.languages.join(', ')} • {mentor.timezone}
          </div>
        </div>

        {/* Bio Preview */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {mentor.bio}
        </p>

        {/* Action Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full"
          variant={mentor.availability === 'available' ? 'primary' : 'outline'}
        >
          {mentor.availability === 'available' ? 'View Profile' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );
};
