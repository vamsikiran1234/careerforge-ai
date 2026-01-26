import { useAuthStore } from '@/store/auth';
import { useRole } from '@/contexts/RoleContext';
import { isAdmin } from '@/utils/roleHelpers';

export const DebugRoles = () => {
  const { user } = useAuthStore();
  const { currentRole, availableRoles, isAdmin: isAdminFromContext } = useRole();

  const authStorage = localStorage.getItem('auth-storage');
  const parsedAuth = authStorage ? JSON.parse(authStorage) : null;

  return (
    <div className="p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-bold">🔍 Role Debug Information</h1>
      
      <div className="space-y-4">
        <section className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <h2 className="font-semibold text-lg mb-2">Auth Store User</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </section>

        <section className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
          <h2 className="font-semibold text-lg mb-2">LocalStorage Auth</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(parsedAuth?.state?.user, null, 2)}
          </pre>
        </section>

        <section className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
          <h2 className="font-semibold text-lg mb-2">Role Context</h2>
          <div className="space-y-2">
            <p><strong>Current Role:</strong> {currentRole}</p>
            <p><strong>Available Roles:</strong> {availableRoles.join(', ')}</p>
            <p><strong>Is Admin (Context):</strong> {isAdminFromContext ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Is Admin (Helper):</strong> {isAdmin(user) ? '✅ Yes' : '❌ No'}</p>
          </div>
        </section>

        <section className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
          <h2 className="font-semibold text-lg mb-2">User Roles Array</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user?.roles, null, 2)}
          </pre>
        </section>
      </div>

      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded">
        <h3 className="font-semibold mb-2">🔧 Fix Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>If roles don't show ADMIN, logout completely</li>
          <li>Clear browser cache (Ctrl + Shift + Delete)</li>
          <li>Login again with vamsikiran198@gmail.com</li>
          <li>Check if admin navigation appears in sidebar</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugRoles;
