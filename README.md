# 应用程序安装器

一个先进、用户友好的Web应用程序，用于在云IDE环境中安装和管理软件包。该应用程序提供了全面的界面，支持基于模板的安装、软件包管理、系统兼容性检查和命令快捷方式。

![应用程序安装器截图](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)

## 功能特点

- **基于模板的安装** - 创建、编辑、验证和保存YAML安装模板
- **软件包管理** - 选择和安装多个软件包，自动解决依赖关系
- **实时安装进度** - 监控安装进度，查看详细日志
- **系统兼容性检查** - 安装前验证系统要求
- **命令快捷方式** - 可配置的快捷按钮，执行常用命令
- **安装配置** - 自定义安装行为和参数

## 入门指南

### 前提条件

- Node.js (v14或更高版本)
- npm (v6或更高版本)

### 安装步骤

1. 克隆代码仓库:
```bash
git clone https://github.com/yourusername/application-installer.git
cd application-installer
```

2. 安装依赖:
```bash
npm install
```

3. 启动开发服务器:
```bash
npm run dev
```

这将启动:
- 前端Vite服务器，访问地址：http://localhost:5173
- 后端Express服务器，访问地址：http://localhost:3001

## 使用说明

### 模板标签页

模板标签页允许您创建和管理安装模板:

1. **创建模板**:
   - 在编辑器中编写或粘贴YAML模板
   - 点击"验证"检查模板语法
   - 保存模板以便将来使用

2. **模板格式**:
```yaml
name: 示例安装计划
description: 这是一个示例安装模板
steps:
  - name: 创建项目结构
    description: 设置基本目录
    enabled: true
    commands:
      - cmd: mkdir -p src/components
        name: 创建组件目录
        description: 为React组件创建目录
        required: true
  - name: 安装依赖
    description: 安装所需的npm包
    enabled: true
    commands:
      - cmd: npm install react react-dom
        name: 安装React
        description: 安装React核心库
        required: true
```

### 软件包标签页

管理和安装软件包:

1. 选择要安装的软件包
2. 查看系统兼容性检查
3. 启动安装过程

### 安装标签页

监控安装过程:

1. 查看实时安装进度
2. 检查详细的命令执行日志
3. 查看每个命令的成功或失败状态

### 快捷方式标签页

配置和使用命令快捷方式:

1. 编辑JSON配置以自定义快捷方式
2. 一键运行常用命令

### 配置标签页

自定义安装过程:

1. 配置安装选项
2. 设置并发安装参数
3. 查看系统信息

## API接口

后端提供以下API接口:

- `POST /api/execute` - 执行shell命令
- `POST /api/templates` - 保存模板
- `GET /api/templates` - 列出可用模板
- `GET /api/system-info` - 获取系统信息

## 项目结构

```
application-installer/
├── server/                  # 后端服务器代码
│   └── index.js             # Express服务器入口点
├── src/                     # 前端源代码
│   ├── api/                 # API集成
│   │   └── backendApi.ts    # 后端API客户端
│   ├── components/          # React组件
│   │   ├── ConfigOptions.tsx
│   │   ├── PackageManager.tsx
│   │   ├── ShortcutButtons.tsx
│   │   ├── SystemChecks.tsx
│   │   ├── TemplateEditor.tsx
│   │   └── TemplateInstaller.tsx
│   ├── utils/               # 实用函数
│   │   └── templateParser.ts
│   ├── App.tsx              # 主应用程序组件
│   ├── main.tsx             # 应用程序入口点
│   └── types.ts             # TypeScript类型定义
├── templates/               # 保存的安装模板
├── package.json             # 项目配置
└── README.md                # 项目文档
```

## 配置

您可以通过修改以下文件来自定义应用程序行为:

- `src/App.tsx` - 主应用程序配置
- `server/index.js` - 后端服务器配置

## 贡献

欢迎贡献！请随时提交Pull Request。

## 许可证

本项目采用MIT许可证 - 详情请参见LICENSE文件。

## 致谢

- [React](https://reactjs.org/) - 前端库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Vite](https://vitejs.dev/) - 前端构建工具
- [Express](https://expressjs.com/) - 后端服务器框架
- [Lucide](https://lucide.dev/) - 图标库