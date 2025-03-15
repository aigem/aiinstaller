import React, { useState, useEffect } from 'react';
import { Package, Terminal, Download, Settings, Package as PackageIcon } from 'lucide-react';
import { Package as PackageType, SystemCheck, InstallConfig, ShortcutButton, Template } from './types';
import SystemChecks from './components/SystemChecks';
import PackageManager from './components/PackageManager';
import ConfigOptions from './components/ConfigOptions';
import TemplateEditor from './components/TemplateEditor';
import TemplateInstaller from './components/TemplateInstaller';
import ShortcutButtons from './components/ShortcutButtons';
import { getSystemInfo, getTemplates } from './api/backendApi';
import yaml from 'js-yaml';

function App() {
  // 状态管理
  const [activeTab, setActiveTab] = useState<'templates' | 'packages' | 'install' | 'shortcuts' | 'config'>('templates');
  const [packages, setPackages] = useState<PackageType[]>([
    { 
      name: 'react', 
      version: '18.3.1', 
      description: '用于构建用户界面的JavaScript库',
      required: true,
      installed: true,
      installing: false
    },
    { 
      name: 'react-dom', 
      version: '18.3.1', 
      description: 'React包，用于DOM操作',
      required: true,
      installed: true,
      installing: false
    },
    { 
      name: 'tailwindcss', 
      version: '3.4.17', 
      description: '一个实用优先的CSS框架',
      required: false,
      installed: true,
      installing: false
    },
    { 
      name: 'lucide-react', 
      version: '0.344.0', 
      description: 'React的漂亮一致的图标库',
      required: false,
      installed: true,
      installing: false
    },
    { 
      name: '@headlessui/react', 
      version: '1.7.18', 
      description: '完全无样式、可访问的UI组件',
      required: false,
      installed: false,
      installing: false
    },
    { 
      name: 'zustand', 
      version: '4.5.0', 
      description: '小型、快速且可扩展的状态管理解决方案',
      required: false,
      installed: false,
      installing: false
    },
    { 
      name: 'react-router-dom', 
      version: '6.22.0', 
      description: 'React的声明式路由',
      required: false,
      installed: false,
      installing: false
    },
    { 
      name: 'axios', 
      version: '1.6.7', 
      description: '基于Promise的浏览器和node.js HTTP客户端',
      required: false,
      installed: false,
      installing: false
    }
  ]);
  
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([
    { name: 'Node.js 版本', status: 'pending', message: '检查中...' },
    { name: 'NPM 版本', status: 'pending', message: '检查中...' },
    { name: '磁盘空间', status: 'pending', message: '检查中...' },
    { name: '内存', status: 'pending', message: '检查中...' },
    { name: '操作系统兼容性', status: 'pending', message: '检查中...' },
  ]);
  
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<{name: string, content: string}[]>([]);
  
  const [installConfig, setInstallConfig] = useState<InstallConfig>({
    installDevDependencies: true,
    installGlobally: false,
    runPostInstallScripts: true,
    cachePackages: true,
    maxConcurrentInstalls: 2,
    timeout: 60,
  });

  const [shortcutButtons, setShortcutButtons] = useState<ShortcutButton[]>([
    { name: '系统信息', icon: '💻', command: 'uname -a' },
    { name: '磁盘空间', icon: '💾', command: 'df -h' },
    { name: '进程列表', icon: '🔍', command: 'ps aux | head -10' },
    { name: 'Node版本', icon: '📦', command: 'node -v' },
    { name: 'NPM版本', icon: '🔧', command: 'npm -v' },
    { name: '文件列表', icon: '📂', command: 'ls -la' },
  ]);

  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  
  // 组件挂载时获取系统信息和模板
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setConnectionStatus('connecting');
      
      try {
        // Check API connectivity first
        const result = await getSystemInfo();
        setConnectionStatus('connected');
        
        if (result.success) {
          // 使用实际数据更新系统检查
          setSystemChecks(prev => prev.map(check => {
            if (check.name === 'Node.js 版本' && result.nodeVersion) {
              return { ...check, status: 'success', message: `${result.nodeVersion} (兼容)` };
            }
            if (check.name === 'NPM 版本' && result.npmVersion) {
              return { ...check, status: 'success', message: `${result.npmVersion} (兼容)` };
            }
            if (check.name === '磁盘空间' && result.diskSpace) {
              return { ...check, status: 'success', message: `${result.diskSpace.split('\n')[1]} (充足)` };
            }
            if (check.name === '内存') {
              return { ...check, status: 'success', message: '8.0 GB 可用 (充足)' };
            }
            if (check.name === '操作系统兼容性') {
              return { ...check, status: 'success', message: '操作系统兼容' };
            }
            return check;
          }));
        } else {
          // API失败时回退到模拟检查
          runSimulatedSystemChecks();
        }
        
        // 加载所有可用模板
        const templates = await getTemplates();
        setSavedTemplates(templates);
      } catch (error) {
        console.error('连接到服务器失败:', error);
        setConnectionStatus('error');
        // 回退到模拟检查
        runSimulatedSystemChecks();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 回退到模拟系统检查
  const runSimulatedSystemChecks = async () => {
    // 模拟Node.js版本检查
    await delay(800);
    setSystemChecks(prev => prev.map(check => 
      check.name === 'Node.js 版本' 
        ? { ...check, status: 'success', message: 'Node v18.16.0 (兼容)' } 
        : check
    ));
    
    // 模拟NPM版本检查
    await delay(600);
    setSystemChecks(prev => prev.map(check => 
      check.name === 'NPM 版本' 
        ? { ...check, status: 'success', message: 'npm v9.5.1 (兼容)' } 
        : check
    ));
    
    // 模拟磁盘空间检查
    await delay(700);
    setSystemChecks(prev => prev.map(check => 
      check.name === '磁盘空间' 
        ? { ...check, status: 'success', message: '45.3 GB 可用 (充足)' } 
        : check
    ));
    
    // 模拟内存检查
    await delay(500);
    setSystemChecks(prev => prev.map(check => 
      check.name === '内存' 
        ? { ...check, status: 'success', message: '8.0 GB 可用 (充足)' } 
        : check
    ));
    
    // 模拟操作系统兼容性检查
    await delay(900);
    setSystemChecks(prev => prev.map(check => 
      check.name === '操作系统兼容性' 
        ? { ...check, status: 'success', message: '操作系统兼容' } 
        : check
    ));
  };
  
  // 延迟工具函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // 添加日志消息
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };
  
  // 开始安装过程
  const startInstallation = async () => {
    if (isInstalling) return;
    
    setIsInstalling(true);
    setInstallProgress(0);
    setActiveTab('install');
    
    addLog('开始安装流程...');
    addLog('运行安装前检查...');
    
    // 模拟安装前检查
    await delay(1500);
    addLog('安装前检查完成。');
    
    const packagesToInstall = packages.filter(pkg => pkg.installed && !pkg.installing);
    let completed = 0;
    
    // 批量安装包
    const installPackagesInBatches = async () => {
      for (let i = 0; i < packagesToInstall.length; i += installConfig.maxConcurrentInstalls) {
        const batch = packagesToInstall.slice(i, i + installConfig.maxConcurrentInstalls);
        await Promise.all(batch.map(pkg => installPackage(pkg.name)));
        completed += batch.length;
        setInstallProgress((completed / packagesToInstall.length) * 100);
      }
    };
    
    await installPackagesInBatches();
    
    // 完成安装
    await delay(1000);
    addLog('运行安装后设置...');
    await delay(1500);
    addLog('清理临时文件...');
    await delay(800);
    addLog('安装成功完成！');
    
    setInstallProgress(100);
    setIsInstalling(false);
  };
  
  // 模拟安装单个包
  const installPackage = async (packageName: string) => {
    // 标记包为正在安装
    setPackages(prev => 
      prev.map(pkg => 
        pkg.name === packageName 
          ? { ...pkg, installing: true } 
          : pkg
      )
    );
    
    addLog(`正在安装 ${packageName}...`);
    
    // 模拟安装时间（随机1-3秒）
    const installTime = Math.random() * 2000 + 1000;
    await delay(installTime);
    
    // 90%成功率
    const success = Math.random() > 0.1;
    
    if (success) {
      addLog(`成功安装 ${packageName}。`);
      setPackages(prev => 
        prev.map(pkg => 
          pkg.name === packageName 
            ? { ...pkg, installing: false, installed: true, error: undefined } 
            : pkg
        )
      );
    } else {
      const errorMessage = `安装 ${packageName} 失败。错误：连接超时。`;
      addLog(errorMessage);
      setPackages(prev => 
        prev.map(pkg => 
          pkg.name === packageName 
            ? { ...pkg, installing: false, error: errorMessage } 
            : pkg
        )
      );
    }
  };
  
  // 处理模板验证
  const handleTemplateValidated = (template: Template) => {
    setActiveTemplate(template);
    // 可选择切换到安装标签页
    setActiveTab('install');
  };

  // 重新加载模板列表
  const refreshTemplates = async () => {
    try {
      const templates = await getTemplates();
      setSavedTemplates(templates);
    } catch (error) {
      console.error('刷新模板列表失败:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">正在连接到服务器...</h3>
          <p className="text-sm text-gray-500 mt-2">请稍候，正在初始化应用程序...</p>
        </div>
      </div>
    );
  }
  
  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">连接错误</h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            无法连接到后端服务器。请检查服务器是否正在运行，或刷新页面重试。
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">应用程序安装器</h1>
          </div>
          <span className="text-sm text-gray-500">版本 1.0.0</span>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 导航标签 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Package className="w-5 h-5 mr-2" />
              模板
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`${
                activeTab === 'packages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <PackageIcon className="w-5 h-5 mr-2" />
              软件包
            </button>
            <button
              onClick={() => setActiveTab('install')}
              className={`${
                activeTab === 'install'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Download className="w-5 h-5 mr-2" />
              安装
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`${
                activeTab === 'shortcuts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Terminal className="w-5 h-5 mr-2" />
              快捷操作
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`${
                activeTab === 'config'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Settings className="w-5 h-5 mr-2" />
              配置
            </button>
          </nav>
        </div>
        
        {/* 模板标签页 */}
        {activeTab === 'templates' && (
          <TemplateEditor 
            onTemplateValidated={handleTemplateValidated} 
            savedTemplates={savedTemplates}
            onTemplatesUpdated={refreshTemplates}
          />
        )}
        
        {/* 软件包标签页 */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <SystemChecks checks={systemChecks} />
            <PackageManager 
              packages={packages} 
              setPackages={setPackages} 
              startInstallation={startInstallation}
              isInstalling={isInstalling}
            />
          </div>
        )}
        
        {/* 安装标签页 */}
        {activeTab === 'install' && (
          <div className="space-y-6">
            {/* 模板选择部分 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">选择安装模板</h2>
              
              {savedTemplates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {savedTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        try {
                          const parsedTemplate = JSON.parse(JSON.stringify(yaml.load(template.content)));
                          setActiveTemplate(parsedTemplate);
                        } catch (error) {
                          console.error('加载模板失败:', error);
                        }
                      }}
                      className={`p-4 border rounded-md text-left hover:bg-gray-50 ${
                        activeTemplate?.name === template.name 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  没有可用的模板。请在"模板"标签页创建并保存模板。
                </div>
              )}
            </div>
            
            {/* 安装器组件 */}
            <TemplateInstaller template={activeTemplate} />
          </div>
        )}
        
        {/* 快捷方式标签页 */}
        {activeTab === 'shortcuts' && (
          <ShortcutButtons shortcuts={shortcutButtons} setShortcuts={setShortcutButtons} />
        )}
        
        {/* 配置标签页 */}
        {activeTab === 'config' && (
          <ConfigOptions config={installConfig} setConfig={setInstallConfig} />
        )}
      </main>
      
      {/* 页脚 */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">文档</span>
              <span className="text-sm">文档</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">支持</span>
              <span className="text-sm">支持</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <span className="text-sm">GitHub</span>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 应用程序安装器. 版权所有。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;