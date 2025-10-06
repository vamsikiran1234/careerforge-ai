import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentorStore } from '@/store/mentors';
import { useAuthStore } from '@/store/auth';
import { MentorCard } from './MentorCard';
import { MentorFilters } from './MentorFilters';
import { MentorProfile } from './MentorProfile';
import { BookingModal } from './BookingModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Filter, Users, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export const MentorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const {
    mentors,
    selectedMentor,
    loading,
    error,
    pagination,
    fetchMentors,
    selectMentor,
    setPage,
  } = useMentorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    // Check authentication before fetching mentors
    if (!isAuthenticated || !token) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    fetchMentors();
  }, [fetchMentors, isAuthenticated, token, navigate]);

  const filteredMentors = mentors.filter(mentor => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        mentor.user.name.toLowerCase().includes(query) ||
        mentor.jobTitle.toLowerCase().includes(query) ||
        mentor.company.toLowerCase().includes(query) ||
        mentor.expertiseAreas.some(skill => skill.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }
    
    // Rating filter
    if (minRating > 0) {
      if (!mentor.averageRating || mentor.averageRating < minRating) {
        return false;
      }
    }
    
    return true;
  });

  const handleMentorSelect = (mentor: typeof mentors[0]) => {
    selectMentor(mentor);
    setShowProfile(true);
  };

  const handleRequestConnection = () => {
    setShowProfile(false);
    setShowBooking(true);
  };

  const handleBookSession = (mentorId?: string) => {
    const id = mentorId || selectedMentor?.id;
    if (id) {
      setShowProfile(false);
      navigate(`/sessions/book/${id}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && mentors.length === 0) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Find Your Perfect Mentor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with industry experts who can guide your career journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expert Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">&lt; 2h</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          
          {/* Rating Filter Dropdown */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0}>All Ratings</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={1}>1+ Stars</option>
          </select>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        {showFilters && (
          <div className="mt-4">
            <MentorFilters />
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredMentors.length} of {pagination.total} mentors
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {filteredMentors.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No mentors found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or filters</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} onClick={() => handleMentorSelect(mentor)} />
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {showProfile && selectedMentor && (
        <MentorProfile
          mentor={selectedMentor}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onRequestConnection={handleRequestConnection}
          onBookSession={handleBookSession}
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
            // Optionally refresh mentors or navigate to connections
            navigate('/connections');
          }}
        />
      )}
    </div>
  );
};
