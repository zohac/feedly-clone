import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { OllamaSettings } from '../types';
import { DEFAULT_AI_PROMPT } from '../lib/ollama';

interface OllamaSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_MODELS = [
  'mistral',
  'llama3.1',
  'llama2',
  'codellama',
  'neural-chat',
  'starling-lm',
  'dolphin-phi',
];

export default function OllamaSettingsDialog({ isOpen, onClose }: OllamaSettingsDialogProps) {
  const { ollamaSettings, updateOllamaSettings } = useStore();
  const [settings, setSettings] = useState<OllamaSettings>(ollamaSettings);
  const [isSaving, setIsSaving] = useState(false);

  const resetPrompt = () => {
    setSettings(prev => ({
      ...prev,
      prompt: DEFAULT_AI_PROMPT
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateOllamaSettings(settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`absolute inset-y-0 right-0 w-[600px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Ollama Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Model
                </label>
                <select
                  id="model"
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {AI_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Select the Ollama model to use for article analysis
                </p>
              </div>

              <div>
                <label
                  htmlFor="temperature"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Temperature ({settings.temperature})
                </label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Controls randomness in responses (0 = deterministic, 1 = creative)
                </p>
              </div>

              <div>
                <label
                  htmlFor="maxTokens"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Tokens
                </label>
                <input
                  type="number"
                  id="maxTokens"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                  min="1"
                  max="4096"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of tokens to generate
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="prompt"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Analysis Prompt
                  </label>
                  <button
                    type="button"
                    onClick={resetPrompt}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Default
                  </button>
                </div>
                <textarea
                  id="prompt"
                  value={settings.prompt}
                  onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Customize the prompt used to analyze articles. The article title and content will be appended to this prompt.
                </p>
              </div>
            </div>
          </form>

          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}