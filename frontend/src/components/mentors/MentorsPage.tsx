import React, { useEffect, useState } from 'react';
import { useMentorStore } from '@/store/mentors';
import { MentorCard } from './MentorCard';
import { MentorFilters } from './MentorFilters';
import { MentorProfile } from './MentorProfile';
import { BookingModal } from './BookingModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Search, Filter, Users, Star, Clock, DollarSign } from 'lucide-react';

export const MentorsPage: React.FC = () => {
  const {
    mentors,
    selectedMentor,
    loading,
    error,
    filters,
    fetchMentors,
    selectMentor,
    updateFilters,
  } = useMentorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // Filter mentors based on search and filters
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesExpertise = 
      filters.expertise.length === 0 ||
      filters.expertise.some(skill => mentor.expertise.includes(skill));

    const matchesExperience = 
      !filters.experience ||
      (filters.experience === '0-3' && mentor.experience <= 3) ||
      (filters.experience === '4-7' && mentor.experience >= 4 && mentor.experience <= 7) ||
      (filters.experience === '8+' && mentor.experience >= 8);

    const matchesRating = mentor.rating >= filters.rating;

    const matchesPrice = 
      mentor.hourlyRate >= filters.priceRange[0] &&
      mentor.hourlyRate <= filters.priceRange[1];

    const matchesAvailability = 
      !filters.availability || mentor.availability === filters.availability;

    return matchesSearch && matchesExpertise && matchesExperience && 
           matchesRating && matchesPrice && matchesAvailability;
  });

  const handleMentorSelect = (mentor: typeof mentors[0]) => {
    selectMentor(mentor);
    setShowProfile(true);
  };

  const handleBookSession = () => {
    setShowProfile(false);
    setShowBooking(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchMentors}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Your Perfect Mentor
        </h1>
        <p className="text-gray-600">
          Connect with industry experts who can guide your career journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{mentors.length}</p>
                <p className="text-sm text-gray-600">Expert Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">&lt; 2h</p>
                <p className="text-sm text-gray-600">Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">$85</p>
                <p className="text-sm text-gray-600">Average Rate/hour</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, company, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4">
            <MentorFilters />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredMentors.length} of {mentors.length} mentors
        </p>
      </div>

      {/* Mentors Grid */}
      {filteredMentors.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No mentors found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onClick={() => handleMentorSelect(mentor)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showProfile && selectedMentor && (
        <MentorProfile
          mentor={selectedMentor}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onBook={handleBookSession}
        />
      )}

      {showBooking && selectedMentor && (
        <BookingModal
          mentor={selectedMentor}
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
          onSuccess={() => {
            setShowBooking(false);
            setShowProfile(false);
          }}
        />
      )}
    </div>
  );
};
