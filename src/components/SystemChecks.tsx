import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SystemCheck } from '../types';

interface SystemChecksProps {
  checks: SystemCheck[];
}

const SystemChecks: React.FC<SystemChecksProps> = ({ checks }) => {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">系统兼容性</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {checks.map((check, index) => (
            <li key={index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {check.status === 'pending' && <Loader2 className="w-5 h-5 text-gray-400 mr-3 animate-spin" />}
                  {check.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500 mr-3" />}
                  {check.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />}
                  {check.status === 'error' && <XCircle className="w-5 h-5 text-red-500 mr-3" />}
                  <p className="text-sm font-medium text-gray-900">{check.name}</p>
                </div>
                <p className="text-sm text-gray-500">{check.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SystemChecks;