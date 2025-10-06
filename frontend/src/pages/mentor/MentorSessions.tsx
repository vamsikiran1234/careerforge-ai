import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const MentorSessions: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Session Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your mentorship sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Upcoming Sessions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your upcoming mentorship sessions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
