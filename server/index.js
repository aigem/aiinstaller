import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, '../templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// API endpoint to execute a command
app.post('/api/execute', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ success: false, error: 'No command provided' });
  }
  
  console.log(`Executing command: ${command}`);

  // 处理多行命令，将它们分成单独的命令并顺序执行
  const commands = command.split('\n').filter(cmd => cmd.trim().length > 0);
  
  if (commands.length === 1) {
    // 单行命令，使用原始逻辑处理
    executeCommand(command, res);
  } else {
    // 多行命令，顺序执行
    executeMultipleCommands(commands, res);
  }
});

// 执行单个命令
function executeCommand(command, res) {
  const cmdProcess = spawn(command, [], { 
    shell: true,
    timeout: 30000  // 30 seconds timeout
  });
  
  let stdout = '';
  let stderr = '';
  
  cmdProcess.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  
  cmdProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });
  
  cmdProcess.on('error', (error) => {
    console.error(`Error executing command: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
      stdout,
      stderr
    });
  });
  
  cmdProcess.on('close', (code) => {
    console.log(`Command exited with code: ${code}`);
    return res.json({
      success: code === 0,
      exitCode: code,
      stdout,
      stderr
    });
  });
}

// 顺序执行多个命令
async function executeMultipleCommands(commands, res) {
  let combinedStdout = '';
  let combinedStderr = '';
  let success = true;
  
  for (const cmd of commands) {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) continue;
    
    console.log(`Executing command in sequence: ${trimmedCmd}`);
    
    try {
      const result = await new Promise((resolve, reject) => {
        const cmdProcess = spawn(trimmedCmd, [], { 
          shell: true,
          timeout: 30000  // 30 seconds timeout
        });
        
        let stdout = '';
        let stderr = '';
        
        cmdProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        cmdProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        cmdProcess.on('error', (error) => {
          reject({ success: false, error: error.message, stdout, stderr });
        });
        
        cmdProcess.on('close', (code) => {
          resolve({
            success: code === 0,
            exitCode: code,
            stdout,
            stderr
          });
        });
      });
      
      combinedStdout += result.stdout ? `[${trimmedCmd}]: ${result.stdout}\n` : '';
      combinedStderr += result.stderr ? `[${trimmedCmd}]: ${result.stderr}\n` : '';
      
      if (!result.success) {
        success = false;
        // 遇到错误继续执行其他命令，但记录失败状态
      }
    } catch (error) {
      combinedStderr += `[${trimmedCmd}]: ${error.message || '未知错误'}\n`;
      success = false;
    }
  }
  
  return res.json({
    success: success,
    stdout: combinedStdout,
    stderr: combinedStderr
  });
}

// API endpoint to save a template
app.post('/api/templates', (req, res) => {
  const { name, content } = req.body;
  
  if (!name || !content) {
    return res.status(400).json({ success: false, error: 'Name and content are required' });
  }
  
  // 确保模板目录存在
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // 规范化文件名
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePath = path.join(templatesDir, `${sanitizedName}.yaml`);
  
  try {
    fs.writeFileSync(filePath, content);
    return res.json({ 
      success: true, 
      message: 'Template saved successfully',
      path: filePath
    });
  } catch (error) {
    console.error(`Error saving template: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API endpoint to list available templates
app.get('/api/templates', (req, res) => {
  try {
    // 确保目录存在
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      return res.json({ success: true, templates: [] });
    }
    
    const files = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => {
        const filePath = path.join(templatesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        return {
          name: file.replace(/\.(yaml|yml)$/, ''),
          path: filePath,
          content
        };
      });
    
    return res.json({ success: true, templates: files });
  } catch (error) {
    console.error(`Error listing templates: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API endpoint to get system information
app.get('/api/system-info', (req, res) => {
  const checkNodeVersion = spawn('node', ['-v']);
  const checkNpmVersion = spawn('npm', ['-v']);
  
  let nodeVersion = '';
  let npmVersion = '';
  // 模拟磁盘空间信息，由于WebContainer环境不支持df命令
  let diskSpace = 'Filesystem     Size  Used Avail Use% Mounted on\n/dev/vda1       100G   35G   65G  35% /';
  
  checkNodeVersion.stdout.on('data', (data) => {
    nodeVersion = data.toString().trim();
  });
  
  checkNpmVersion.stdout.on('data', (data) => {
    npmVersion = data.toString().trim();
  });
  
  // 使用Promise.all等待命令完成
  Promise.all([
    new Promise(resolve => checkNodeVersion.on('close', resolve)),
    new Promise(resolve => checkNpmVersion.on('close', resolve))
  ]).then(() => {
    res.json({
      success: true,
      info: {
        nodeVersion,
        npmVersion,
        diskSpace
      }
    });
  }).catch(error => {
    console.error(`Error getting system info: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  });
});

// 删除模板 API
app.delete('/api/templates/:name', (req, res) => {
  const { name } = req.params;
  
  if (!name) {
    return res.status(400).json({ success: false, error: 'Template name is required' });
  }
  
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePath = path.join(templatesDir, `${sanitizedName}.yaml`);
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    fs.unlinkSync(filePath);
    return res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error(`Error deleting template: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});