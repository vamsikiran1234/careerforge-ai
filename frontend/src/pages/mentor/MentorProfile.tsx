import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const MentorProfile: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mentor Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your mentor profile and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Profile Management Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Edit your mentor profile, bio, expertise, and more
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
