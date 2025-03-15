import yaml from 'js-yaml';
import { Template } from '../types';

export const validateTemplate = (content: string, fileType: string = "yaml"): {
  valid: boolean;
  message: string;
  data: Template | null;
} => {
  try {
    if (fileType.toLowerCase() === "yaml") {
      const data = yaml.load(content) as any;
      
      // 基本验证
      const requiredFields = ["name", "description", "steps"];
      for (const field of requiredFields) {
        if (!(field in data)) {
          return { valid: false, message: `缺少必要字段: ${field}`, data: null };
        }
      }
      
      // 验证每个步骤
      for (let i = 0; i < data.steps.length; i++) {
        const step = data.steps[i];
        if (!("name" in step)) {
          return { valid: false, message: `步骤 ${i+1} 缺少名称字段`, data: null };
        }
        
        if (!("commands" in step)) {
          return { valid: false, message: `步骤 ${i+1} 缺少命令字段`, data: null };
        }
        
        // 验证每个命令
        for (let j = 0; j < step.commands.length; j++) {
          const cmd = step.commands[j];
          if (!("cmd" in cmd)) {
            return { valid: false, message: `步骤 ${i+1} 命令 ${j+1} 缺少cmd字段`, data: null };
          }
        }
      }
      
      return { valid: true, message: "✅ 验证成功", data: data as Template };
    } else {
      return { valid: false, message: "不支持的文件格式", data: null };
    }
  } catch (e) {
    return { valid: false, message: `❌ 解析错误: ${(e as Error).message}`, data: null };
  }
};

export const getDefaultTemplate = (): string => {
  return `# 示例模板
name: 示例安装计划
description: 这是一个包含多个步骤的示例安装模板
steps:
  - name: 创建项目结构
    description: 为项目设置基本目录
    enabled: true
    commands:
      - cmd: echo "正在创建项目结构..."
        name: 初始化设置
        description: 为安装准备环境
        required: true
      - cmd: |
          mkdir -p src/components
          mkdir -p src/utils
          mkdir -p src/assets
        name: 创建目录
        description: 为项目创建必要的目录
        required: true
  - name: 安装依赖
    description: 安装所需的npm包
    enabled: true
    commands:
      - cmd: npm install react react-dom
        name: 安装核心依赖
        description: 安装React和React DOM
        required: true
      - cmd: >
          npm install tailwindcss postcss autoprefixer
          --save-dev
        name: 安装Tailwind CSS
        description: 使用PostCSS设置Tailwind CSS
        required: false
`;
};