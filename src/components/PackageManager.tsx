import React, { useState } from 'react';
import { CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import { Package } from '../types';

interface PackageManagerProps {
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  startInstallation: () => Promise<void>;
  isInstalling: boolean;
}

const PackageManager: React.FC<PackageManagerProps> = ({ 
  packages, 
  setPackages, 
  startInstallation,
  isInstalling 
}) => {
  const togglePackage = (packageName: string) => {
    setPackages(prev => 
      prev.map(pkg => 
        pkg.name === packageName && !pkg.required 
          ? { ...pkg, installed: !pkg.installed } 
          : pkg
      )
    );
  };

  const renderStatusBadge = (pkg: Package) => {
    if (pkg.installing) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          安装中
        </span>
      );
    }
    
    if (pkg.error) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          失败
        </span>
      );
    }
    
    if (pkg.installed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          已安装
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        未安装
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-gray-900">可用软件包</h2>
        <span className="text-sm text-gray-500">
          已选择 {packages.filter(pkg => pkg.installed).length} / {packages.length} 个
        </span>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {packages.map((pkg, index) => (
            <li key={index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={pkg.installed}
                    onChange={() => togglePackage(pkg.name)}
                    disabled={pkg.required || pkg.installing || isInstalling}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      {pkg.name}
                      {pkg.required && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          必需
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      版本: {pkg.version}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {pkg.description}
                    </p>
                    {pkg.error && (
                      <p className="mt-1 text-sm text-red-500">
                        {pkg.error}
                      </p>
                    )}
                  </div>
                </div>
                {renderStatusBadge(pkg)}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={startInstallation}
          disabled={isInstalling || packages.filter(pkg => pkg.installed && !pkg.installing).length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInstalling ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              安装中...
            </>
          ) : (
            <>
              <Download className="-ml-1 mr-2 h-4 w-4" />
              安装选定的软件包
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PackageManager;