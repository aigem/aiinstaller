import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Template, CommandResult } from '../types';
import { executeCommand } from '../api/backendApi';

interface TemplateInstallerProps {
  template: Template | null;
}

const TemplateInstaller: React.FC<TemplateInstallerProps> = ({ template }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // 当模板改变时重置进度
  useEffect(() => {
    if (template) {
      setProgress(0);
      setLogs([]);
    }
  }, [template]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const startInstallation = async () => {
    if (!template || isInstalling) return;
    
    setIsInstalling(true);
    setProgress(0);
    setLogs([]);
    
    addLog(`开始安装: ${template.name}`);
    addLog(template.description);
    
    const enabledSteps = template.steps.filter(step => step.enabled);
    const totalCommands = enabledSteps.reduce((total, step) => total + step.commands.length, 0);
    let completedCommands = 0;
    
    for (let stepIndex = 0; stepIndex < enabledSteps.length; stepIndex++) {
      const step = enabledSteps[stepIndex];
      setCurrentStep(step.name);
      
      addLog(`\n## 步骤 ${stepIndex + 1}: ${step.name}`);
      if (step.description) {
        addLog(`${step.description}`);
      }
      
      for (let cmdIndex = 0; cmdIndex < step.commands.length; cmdIndex++) {
        const command = step.commands[cmdIndex];
        
        addLog(`\n### ${command.name}`);
        if (command.description) {
          addLog(`${command.description}`);
        }
        
        addLog(`执行命令: ${command.cmd}`);
        
        try {
          // 通过后端API执行实际命令
          const result = await executeCommand(command.cmd);
          
          if (result.success) {
            addLog(`✅ 命令执行成功`);
            if (result.stdout) {
              addLog(`输出: ${result.stdout}`);
            }
          } else {
            addLog(`❌ 命令执行失败`);
            if (result.stderr) {
              addLog(`错误: ${result.stderr}`);
            }
            
            if (command.required) {
              addLog(`\n## ❌ 安装失败: 必需的命令失败`);
              setIsInstalling(false);
              setProgress(((completedCommands + 1) / totalCommands) * 100);
              return;
            }
          }
        } catch (error) {
          addLog(`❌ 执行命令时出错: ${error instanceof Error ? error.message : '未知错误'}`);
          if (command.required) {
            addLog(`\n## ❌ 安装失败: 执行必需命令时出错`);
            setIsInstalling(false);
            setProgress(((completedCommands + 1) / totalCommands) * 100);
            return;
          }
        }
        
        completedCommands++;
        setProgress((completedCommands / totalCommands) * 100);
      }
    }
    
    addLog(`\n## ✅ 安装成功完成`);
    setIsInstalling(false);
    setProgress(100);
  };

  if (!template) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              未选择模板。请从上方选择一个模板或在"模板"标签页创建并验证模板。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-lg font-medium text-gray-900">安装进度</h2>
            <p className="text-sm text-gray-500">当前模板: {template.name}</p>
          </div>
          <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {isInstalling && (
          <p className="mt-2 text-sm text-gray-500 flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            当前正在安装: {currentStep}
          </p>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium text-gray-900">安装日志</h2>
          <button
            onClick={() => setLogs([])}
            disabled={logs.length === 0 || isInstalling}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:text-gray-400"
          >
            清除日志
          </button>
        </div>
        <div className="bg-gray-900 text-gray-100 rounded-md shadow-inner p-4 h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>暂无日志。开始安装以查看日志。</p>
            </div>
          ) : (
            <div>
              {logs.map((log, index) => (
                <div key={index} className={`mb-1 ${log.startsWith('##') ? 'text-yellow-300 font-bold' : log.startsWith('###') ? 'text-green-300 font-semibold' : ''}`}>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setLogs([]);
            setProgress(0);
            setCurrentStep('');
          }}
          disabled={isInstalling || logs.length === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          重置
        </button>
        
        <button
          onClick={startInstallation}
          disabled={isInstalling || !template}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInstalling ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              安装中...
            </>
          ) : (
            <>
              开始安装
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TemplateInstaller;