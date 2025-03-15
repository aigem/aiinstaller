export type TemplateStep = {
  name: string;
  description?: string;
  enabled: boolean;
  commands: TemplateCommand[];
};

export type TemplateCommand = {
  cmd: string;
  name: string;
  description?: string;
  required: boolean;
};

export type Template = {
  name: string;
  description: string;
  steps: TemplateStep[];
};

export type Package = {
  name: string;
  version: string;
  description: string;
  required: boolean;
  installed: boolean;
  installing: boolean;
  error?: string;
};

export type SystemCheck = {
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
};

export type CommandResult = {
  success: boolean;
  stdout: string;
  stderr: string;
};

export type InstallConfig = {
  installDevDependencies: boolean;
  installGlobally: boolean;
  runPostInstallScripts: boolean;
  cachePackages: true;
  maxConcurrentInstalls: number;
  timeout: number;
};

export type ShortcutButton = {
  name: string;
  icon: string;
  command: string;
};

export type SystemCheckResult = {
  success: boolean;
  nodeVersion?: string;
  npmVersion?: string;
  diskSpace?: string;
  error?: string;
};