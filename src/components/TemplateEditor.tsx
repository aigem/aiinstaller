import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Save, UploadCloud, X, Download, Loader2 } from 'lucide-react';
import { validateTemplate, getDefaultTemplate } from '../utils/templateParser';
import { Template } from '../types';
import { saveTemplate, getTemplates } from '../api/backendApi';

interface TemplateEditorProps {
  onTemplateValidated: (template: Template) => void;
  savedTemplates: { name: string; content: string }[];
  onTemplatesUpdated: () => Promise<void>;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  onTemplateValidated, 
  savedTemplates, 
  onTemplatesUpdated 
}) => {
  const [templateContent, setTemplateContent] = useState<string>(getDefaultTemplate());
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [validatedTemplate, setValidatedTemplate] = useState<Template | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');

  // 验证模板
  const handleValidate = () => {
    const result = validateTemplate(templateContent);
    setValidationMessage(result.message);
    setIsValid(result.valid);
    setValidatedTemplate(result.data);
    
    if (result.valid && result.data) {
      setTemplateName(result.data.name);
      onTemplateValidated(result.data);
    }
  };

  // 清除模板内容
  const handleClear = () => {
    setTemplateContent(getDefaultTemplate());
    setValidationMessage('');
    setIsValid(false);
    setValidatedTemplate(null);
    setTemplateName('');
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTemplateContent(content);
      setValidationMessage('');
      setIsValid(false);
      setValidatedTemplate(null);
    };
    reader.readAsText(file);
  };

  // 保存模板
  const handleSaveTemplate = async () => {
    if (!validatedTemplate) {
      setValidationMessage('❌ 请先验证模板再保存');
      setIsValid(false);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 确保使用当前的模板名称
      const nameToSave = templateName || validatedTemplate.name;
      
      const result = await saveTemplate(nameToSave, templateContent);
      
      if (result.success) {
        setValidationMessage(`✅ 模板保存成功: ${nameToSave}`);
        // 刷新模板列表
        await onTemplatesUpdated();
      } else {
        setValidationMessage(`❌ 保存模板出错: ${result.message}`);
        setIsValid(false);
      }
    } catch (error) {
      setValidationMessage(`❌ 保存模板出错: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsValid(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">模板编辑器</h2>
        <div className="flex space-x-2">
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <UploadCloud className="h-4 w-4 mr-2" />
            上传
            <input
              type="file"
              className="hidden"
              accept=".yaml,.yml"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={handleClear}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            清除
          </button>
          <button
            onClick={handleValidate}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            验证
          </button>
        </div>
      </div>

      {/* 已保存的模板部分 */}
      {savedTemplates.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            已保存的模板
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {savedTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  setTemplateContent(template.content);
                  setValidationMessage('');
                  setIsValid(false);
                  setValidatedTemplate(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {isValid && validatedTemplate && (
        <div className="mb-4">
          <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
            模板名称
          </label>
          <input
            type="text"
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
            placeholder="输入模板名称"
          />
          <p className="text-xs text-gray-500">保存前可以修改模板名称</p>
        </div>
      )}

      <div className="h-80 border rounded-md relative overflow-hidden">
        <textarea
          value={templateContent}
          onChange={(e) => setTemplateContent(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm resize-none outline-none"
          placeholder="在此处输入您的YAML模板..."
        />
      </div>

      {validationMessage && (
        <div className={`mt-2 p-3 rounded-md ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {isValid ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                {validationMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveTemplate}
          disabled={!isValid || isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              保存模板
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TemplateEditor;