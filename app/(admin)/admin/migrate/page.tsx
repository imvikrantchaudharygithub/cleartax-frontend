'use client';

import { useState } from 'react';
import { Database, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { pushAllDummyDataToAPI } from '@/app/lib/admin/pushDummyDataToAPI';
import { serviceService } from '@/app/lib/api';
import { API_CONFIG } from '@/app/lib/api/config';
import toast from 'react-hot-toast';

export default function MigrateDataPage() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const apiUrl = API_CONFIG.BASE_URL;

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      await serviceService.getCategories();
      setConnectionStatus('success');
      toast.success('API connection successful!');
    } catch (error: any) {
      setConnectionStatus('error');
      toast.error(`API connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('This will push all dummy data to the API. Make sure your backend server is running and MongoDB is connected. Continue?')) {
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('idle');

    try {
      const results = await pushAllDummyDataToAPI();
      if (results.errors.length > 0 && results.categoriesCreated === 0 && results.servicesCreated === 0) {
        setMigrationStatus('error');
      } else if (results.errors.length > 0) {
        setMigrationStatus('success');
        toast.error(`Migration completed with ${results.errors.length} errors. Check console for details.`);
      } else {
        setMigrationStatus('success');
      }
    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      toast.error(`Migration failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Data Migration</h1>
        <p className="text-gray-400">Push all dummy service data to the API database</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-4 rounded-lg">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Migrate Dummy Data</h2>
              <p className="text-gray-400">
                This will push all dummy service data (GST, Income Tax, Registration, Trademarks, IPO, Legal, Banking & Finance) to your API database.
              </p>
            </div>
          </div>

          {/* API Configuration Info */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-300 mb-2">API Configuration</h3>
                <p className="text-xs text-blue-400 mb-2">
                  Current API URL: <code className="bg-blue-900/50 px-2 py-1 rounded">{apiUrl}</code>
                </p>
                <p className="text-xs text-gray-400">
                  To change the API URL, set the <code className="bg-gray-800 px-1 rounded">NEXT_PUBLIC_API_URL</code> environment variable in your <code className="bg-gray-800 px-1 rounded">.env.local</code> file.
                </p>
              </div>
            </div>
          </div>

          {/* Test Connection Button */}
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection || isMigrating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing connection...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Test API Connection
              </>
            )}
          </button>

          {connectionStatus === 'success' && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-sm text-green-400">API connection successful!</p>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">API connection failed. Please check your backend server and API URL.</p>
            </div>
          )}

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">What will be migrated:</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                All service categories (GST, Income Tax, Registration, Trademarks, IPO, Legal, Banking & Finance)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                All services within each category
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Service details (features, benefits, requirements, process, FAQs)
              </li>
            </ul>
          </div>

          {migrationStatus === 'success' && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-medium">Migration completed successfully!</p>
                <p className="text-gray-400 text-sm mt-1">All dummy data has been pushed to the API.</p>
              </div>
            </div>
          )}

          {migrationStatus === 'error' && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Migration failed</p>
                <p className="text-gray-400 text-sm mt-1">Check the console for detailed error messages.</p>
              </div>
            </div>
          )}

          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMigrating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Migrating data...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Start Migration
              </>
            )}
          </button>

          <div className="text-xs text-gray-500 text-center">
            <p>Note: This operation may take a few minutes depending on the amount of data.</p>
            <p className="mt-1">Duplicate entries will be skipped automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

