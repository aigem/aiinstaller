import React, { useState } from 'react';
import { InstallConfig } from '../types';
import { getSystemInfo } from '../api/backendApi';
import { Loader2 } from 'lucide-react';

interface ConfigOptionsProps {
  config: InstallConfig;
  setConfig: React.Dispatch<React.SetStateAction<InstallConfig>>;
}

const ConfigOptions: React.FC<ConfigOptionsProps> = ({ config, setConfig }) => {
  const [isRefreshingSystemInfo, setIsRefreshingSystemInfo] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    os: "Linux (64位)",
    nodeVersion: "v18.16.0",
    npmVersion: "9.5.1",
    totalMemory: "8.0 GB",
    availableDisk: "45.3 GB"
  });

  const refreshSystemInfo = async () => {
    setIsRefreshingSystemInfo(true);
    try {
      const result = await getSystemInfo();
      if (result.success) {
        setSystemInfo({
          ...systemInfo,
          nodeVersion: result.nodeVersion || "未知",
          npmVersion: result.npmVersion || "未知",
          availableDisk: result.diskSpace ? result.diskSpace.split('\n')[1].split(/\s+/)[3] : "未知"
        });
      }
    } catch (error) {
      console.error('刷新系统信息失败:', error);
    } finally {
      setIsRefreshingSystemInfo(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">安装配置</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            {/* 安装开发依赖 */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="installDevDependencies"
                  type="checkbox"
                  checked={config.installDevDependencies}
                  onChange={() => setConfig({...config, installDevDependencies: !config.installDevDependencies})}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="installDevDependencies" className="font-medium text-gray-700">
                  安装开发依赖
                </label>
                <p className="text-gray-500">在安装过程中包含开发依赖项。</p>
              </div>
            </div>
            
            {/* 全局安装 */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="installGlobally"
                  type="checkbox"
                  checked={config.installGlobally}
                  onChange={() => setConfig({...config, installGlobally: !config.installGlobally})}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="installGlobally" className="font-medium text-gray-700">
                  全局安装
                </label>
                <p className="text-gray-500">全局安装软件包而不是本地安装到项目。</p>
              </div>
            </div>
            
            {/* 运行安装后脚本 */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="runPostInstallScripts"
                  type="checkbox"
                  checked={config.runPostInstallScripts}
                  onChange={() => setConfig({...config, runPostInstallScripts: !config.runPostInstallScripts})}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="runPostInstallScripts" className="font-medium text-gray-700">
                  运行安装后脚本
                </label>
                <p className="text-gray-500">安装后执行软件包脚本。</p>
              </div>
            </div>
            
            {/* 缓存软件包 */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="cachePackages"
                  type="checkbox"
                  checked={config.cachePackages}
                  onChange={() => setConfig({...config, cachePackages: !config.cachePackages})}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="cachePackages" className="font-medium text-gray-700">
                  缓存软件包
                </label>
                <p className="text-gray-500">将软件包存储在缓存中以便更快地进行未来安装。</p>
              </div>
            </div>
            
            {/* 最大并发安装数 */}
            <div className="sm:col-span-2">
              <label htmlFor="maxConcurrentInstalls" className="block text-sm font-medium text-gray-700">
                最大并发安装数
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="maxConcurrentInstalls"
                  id="maxConcurrentInstalls"
                  min="1"
                  max="10"
                  value={config.maxConcurrentInstalls}
                  onChange={(e) => setConfig({...config, maxConcurrentInstalls: Number(e.target.value)})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">同时安装的软件包最大数量。</p>
            </div>
            
            {/* 安装超时 */}
            <div className="sm:col-span-2">
              <label htmlFor="timeout" className="block text-sm font-medium text-gray-700">
                安装超时（秒）
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="timeout"
                  id="timeout"
                  min="10"
                  max="300"
                  value={config.timeout}
                  onChange={(e) => setConfig({...config, timeout: Number(e.target.value)})}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">每个软件包安装允许的最长时间。</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={() => {
              setConfig({
                installDevDependencies: true,
                installGlobally: false,
                runPostInstallScripts: true,
                cachePackages: true,
                maxConcurrentInstalls: 2,
                timeout: 60,
              });
            }}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
          >
            重置为默认值
          </button>
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            保存配置
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">系统信息</h3>
          <button
            onClick={refreshSystemInfo}
            disabled={isRefreshingSystemInfo}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isRefreshingSystemInfo ? (
              <>
                <Loader2 className="animate-spin h-3 w-3 mr-1" />
                刷新中...
              </>
            ) : (
              '刷新信息'
            )}
          </button>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">操作系统</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{systemInfo.os}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Node.js 版本</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{systemInfo.nodeVersion}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">NPM 版本</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{systemInfo.npmVersion}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">总内存</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{systemInfo.totalMemory}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">可用磁盘空间</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{systemInfo.availableDisk}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ConfigOptions;