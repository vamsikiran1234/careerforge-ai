import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const MentorAvailability: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Availability Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set your available times for mentorship sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Availability Management Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set your weekly schedule and available time slots
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
