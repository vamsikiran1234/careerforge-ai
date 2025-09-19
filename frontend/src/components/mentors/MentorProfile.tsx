import React from 'react';
import type { Mentor } from '@/store/mentors';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  MessageCircle, 
  Calendar,
  Award,
  Globe,
  Users
} from 'lucide-react';

interface MentorProfileProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
  onBook: () => void;
}

export const MentorProfile: React.FC<MentorProfileProps> = ({
  mentor,
  isOpen,
  onClose,
  onBook,
}) => {
  const handleBookSession = () => {
    onBook();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Mentor Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start space-x-4">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
            <p className="text-lg text-gray-600">{mentor.title}</p>
            <p className="text-lg text-gray-500">{mentor.company}</p>
            
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="ml-1 font-medium">
                  {mentor.rating.toFixed(1)}
                </span>
                <span className="ml-1 text-gray-500">
                  ({mentor.totalReviews} reviews)
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {mentor.sessions} sessions
              </div>
              <div className="flex items-center text-gray-600">
                <Award className="h-4 w-4 mr-1" />
                {mentor.experience}+ years
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
          <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
        </div>

        {/* Expertise */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${mentor.hourlyRate}
                  </p>
                  <p className="text-sm text-gray-600">per hour</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {mentor.responseTime}
                  </p>
                  <p className="text-sm text-gray-600">response time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {mentor.sessions}
                  </p>
                  <p className="text-sm text-gray-600">total sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Languages and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Languages
            </h3>
            <div className="flex items-center text-gray-600">
              <Globe className="h-4 w-4 mr-2" />
              {mentor.languages.join(', ')}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Timezone
            </h3>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {mentor.timezone}
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Recent Reviews
          </h3>
          <div className="space-y-4">
            {/* Mock reviews */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">2 days ago</span>
              </div>
              <p className="text-gray-700 text-sm">
                "Excellent session! {mentor.name} provided great insights into career 
                progression and helped me understand the skills I need to develop. 
                Highly recommend!"
              </p>
              <p className="text-xs text-gray-500 mt-1">- Sarah M.</p>
            </div>

            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">1 week ago</span>
              </div>
              <p className="text-gray-700 text-sm">
                "Very knowledgeable and patient mentor. The session was well-structured 
                and I came away with actionable next steps."
              </p>
              <p className="text-xs text-gray-500 mt-1">- Mike D.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            onClick={handleBookSession}
            className="flex-1"
            disabled={mentor.availability !== 'available'}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {mentor.availability === 'available' ? 'Book Session' : 'Currently Unavailable'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
