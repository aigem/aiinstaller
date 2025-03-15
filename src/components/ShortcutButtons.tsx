import React, { useState, useEffect } from 'react';
import { ShortcutButton } from '../types';
import { Settings, Terminal, Loader2, RefreshCw, Save } from 'lucide-react';
import { executeCommand, getShortcuts, saveShortcuts } from '../api/backendApi';

interface ShortcutButtonsProps {
  shortcuts: ShortcutButton[];
  setShortcuts: React.Dispatch<React.SetStateAction<ShortcutButton[]>>;
}

const ShortcutButtons: React.FC<ShortcutButtonsProps> = ({ shortcuts, setShortcuts }) => {
  const [output, setOutput] = useState<string>('');
  const [jsonConfig, setJsonConfig] = useState<string>(
    JSON.stringify(shortcuts, null, 2)
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeCommand, setActiveCommand] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info',
    text: string
  } | null>(null);

  // 初始化时加载保存的快捷操作
  useEffect(() => {
    loadShortcuts();
  }, []);

  // 加载保存的快捷操作
  const loadShortcuts = async () => {
    setIsLoading(true);
    try {
      const result = await getShortcuts();
      if (result.success && result.shortcuts.length > 0) {
        setShortcuts(result.shortcuts);
        setJsonConfig(JSON.stringify(result.shortcuts, null, 2));
        showStatusMessage('info', '已加载保存的快捷操作');
      }
    } catch (error) {
      console.error('加载快捷操作失败:', error);
      showStatusMessage('error', '加载快捷操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const runCommand = async (command: string) => {
    setOutput(`执行命令: ${command}...\n\n`);
    setIsExecuting(true);
    setActiveCommand(command);
    
    try {
      // 使用后端API执行实际命令
      const result = await executeCommand(command);
      
      if (result.success) {
        setOutput(`命令执行成功:\n\n${result.stdout}`);
      } else {
        setOutput(`命令执行失败:\n\n${result.stderr || '未提供错误详情'}`);
      }
    } catch (error) {
      setOutput(`命令执行出错: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsExecuting(false);
      setActiveCommand('');
    }
  };

  const updateButtons = async () => {
    try {
      const parsed = JSON.parse(jsonConfig);
      // 验证数组格式
      if (!Array.isArray(parsed)) {
        throw new Error('配置必须是一个数组');
      }
      
      // 验证每个项目
      for (const item of parsed) {
        if (!item.name || !item.icon || !item.command) {
          throw new Error('每个快捷方式必须包含 name、icon 和 command 属性');
        }
      }
      
      // 保存到状态和后端
      await persistShortcuts(parsed);
      
      setEditMode(false);
      setJsonError('');
    } catch (e) {
      setJsonError(`JSON解析错误: ${(e as Error).message}`);
    }
  };

  // 持久化保存快捷操作到服务器
  const persistShortcuts = async (shortcutsToSave: ShortcutButton[]) => {
    setIsSaving(true);
    try {
      const result = await saveShortcuts(shortcutsToSave);
      if (result.success) {
        setShortcuts(shortcutsToSave);
        showStatusMessage('success', '快捷操作已保存');
      } else {
        showStatusMessage('error', `保存失败: ${result.message}`);
      }
    } catch (error) {
      console.error('保存快捷操作失败:', error);
      showStatusMessage('error', '保存快捷操作失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 显示状态消息，并在3秒后自动清除
  const showStatusMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 添加 ComfyUI 快捷按钮
  const addComfyUIButtons = () => {
    const updatedShortcuts = [
      ...shortcuts,
      {
        name: '启动ComfyUI',
        icon: '🚀',
        command: 'cd /workspace/ComfyUI && python main.py --use-cuda --gpu-only --listen 0.0.0.0 --port 8188 --force-fp16'
      },
      {
        name: '停止ComfyUI',
        icon: '🛑',
        command: 'pkill -f "python main.py"'
      }
    ];
    
    setShortcuts(updatedShortcuts);
    setJsonConfig(JSON.stringify(updatedShortcuts, null, 2));
  };

  return (
    <div className="space-y-6">
      {editMode ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">编辑快捷操作</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setEditMode(false);
                  setJsonError('');
                  // 重新加载原始数据
                  setJsonConfig(JSON.stringify(shortcuts, null, 2));
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={addComfyUIButtons}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                添加ComfyUI按钮
              </button>
              <button
                onClick={updateButtons}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存快捷操作
                  </>
                )}
              </button>
            </div>
          </div>
          
          {jsonError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{jsonError}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-2">每个快捷操作需要包含以下属性：</p>
            <ul className="list-disc pl-5 text-sm text-gray-500 mb-4">
              <li><code className="bg-gray-100 px-1">name</code> - 显示名称</li>
              <li><code className="bg-gray-100 px-1">icon</code> - Emoji图标</li>
              <li><code className="bg-gray-100 px-1">command</code> - 要执行的命令</li>
            </ul>
          </div>
          
          <textarea
            value={jsonConfig}
            onChange={(e) => setJsonConfig(e.target.value)}
            className="w-full h-64 p-4 font-mono text-sm border rounded-md"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">快捷操作</h2>
            <div className="flex space-x-2">
              <button
                onClick={loadShortcuts}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-1">刷新</span>
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                编辑快捷操作
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-md ${
              statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 
              statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : 
              'bg-blue-50 text-blue-700'
            }`}>
              {statusMessage.text}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                <span className="ml-2 text-gray-600">正在加载快捷操作...</span>
              </div>
            ) : shortcuts.length > 0 ? (
              shortcuts.map((shortcut, index) => (
                <button
                  key={index}
                  onClick={() => runCommand(shortcut.command)}
                  disabled={isExecuting}
                  className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {isExecuting && activeCommand === shortcut.command && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    </div>
                  )}
                  <div className="text-3xl mb-2">{shortcut.icon}</div>
                  <div className="text-sm font-medium text-gray-800">{shortcut.name}</div>
                  <div className="text-xs text-gray-500 mt-1 text-center break-all">
                    {shortcut.command.length > 25 
                      ? `${shortcut.command.substring(0, 25)}...` 
                      : shortcut.command}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                没有快捷操作。点击"编辑快捷操作"按钮添加。
              </div>
            )}
          </div>
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium text-gray-900">命令输出</h2>
          <button
            onClick={() => setOutput('')}
            disabled={!output || isExecuting}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:text-gray-400"
          >
            清除输出
          </button>
        </div>
        <div className="bg-gray-900 text-gray-100 rounded-md shadow-inner p-4 h-48 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
          {output ? (
            <div>{output}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>无输出。运行命令以在此处查看结果。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortcutButtons;