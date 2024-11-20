import React from 'react';
import { Rss, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Rss className="h-8 w-8" />
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-baseline space-x-4">
                <div className="flex items-center">
                  <span className="text-xl font-bold">Advanced</span>
                  <span className="ml-2 text-blue-200 text-sm">RSS Reader</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm text-blue-200">
              Stay updated with your favorite content
            </span>
            <button
              onClick={onOpenSettings}
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-500 rounded-full transition-colors"
              title="Ollama Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}