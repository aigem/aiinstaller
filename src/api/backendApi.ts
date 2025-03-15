import axios from 'axios';
import { CommandResult, SystemCheckResult } from '../types';

// Determine the correct API URL based on the environment
const getApiBaseUrl = () => {
  // When using Vite's dev server, use the local dev server URL
  if (import.meta.env.DEV) {
    // Check if we're running in a cloud environment with port forwarding
    const currentHost = window.location.hostname;
    
    // If we're not on localhost, we need to use the same hostname but different port
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      // Use the same hostname but port 3001 for API calls
      return `${window.location.protocol}//${currentHost.replace('-5173', '-3001')}`;
    }
    
    // Default local development URL
    return 'http://localhost:3001';
  }
  
  // In production, API is likely on the same host
  return '';
};

const API_BASE_URL = getApiBaseUrl();

// Execute a command on the backend
export const executeCommand = async (command: string): Promise<CommandResult> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/execute`, { command });
    return {
      success: response.data.success,
      stdout: response.data.stdout || '',
      stderr: response.data.stderr || ''
    };
  } catch (error) {
    console.error('Error executing command:', error);
    return {
      success: false,
      stdout: '',
      stderr: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Save a template to the backend
export const saveTemplate = async (name: string, content: string): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/templates`, { name, content });
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error saving template:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Get all templates from the backend
export const getTemplates = async (): Promise<{ name: string, content: string }[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/templates`);
    return response.data.templates || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

// Get system information
export const getSystemInfo = async (): Promise<SystemCheckResult> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/system-info`);
    const info = response.data.info;
    
    return {
      success: true,
      nodeVersion: info.nodeVersion,
      npmVersion: info.npmVersion,
      diskSpace: info.diskSpace
    };
  } catch (error) {
    console.error('Error fetching system info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Delete a template
export const deleteTemplate = async (name: string): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/templates/${name}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error deleting template:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};