'use client';

import { useState, useEffect } from 'react';
import { useReaderStoreHydrated } from '@/hooks/useHydration';
import { useTheme } from '@/providers/ThemeProvider';

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReaderSettings({ isOpen, onClose }: ReaderSettingsProps) {
  const {
    readingMode,
    setReadingMode,
    autoNextChapter,
    setAutoNextChapter,
    showPageNumber,
    setShowPageNumber,
    clearReadingHistory
  } = useReaderStoreHydrated();

  const { theme, setTheme } = useTheme();

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Fechar modal com Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (showConfirmClear) {
      clearReadingHistory();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
    }
  };

  const handleSettingChange = (action: () => void) => {
    action();
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurações do Leitor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mensagem de feedback */}
        {showSavedMessage && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
            ✓ Configuração salva com sucesso!
          </div>
        )}

        <div className="space-y-6">
          {/* Modo de Leitura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modo de Leitura</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSettingChange(() => setReadingMode('default'))}
                className={`py-2 px-4 rounded-md ${readingMode === 'default' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              >
                Padrão
              </button>
              <button
                onClick={() => handleSettingChange(() => setReadingMode('webtoon'))}
                className={`py-2 px-4 rounded-md ${readingMode === 'webtoon' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              >
                Webtoon
              </button>
            </div>
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSettingChange(() => setTheme('light'))}
                className={`py-2 px-4 rounded-md transition-colors ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Claro
              </button>
              <button
                onClick={() => handleSettingChange(() => setTheme('dark'))}
                className={`py-2 px-4 rounded-md transition-colors ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Escuro
              </button>
              <button
                onClick={() => handleSettingChange(() => setTheme('system'))}
                className={`py-2 px-4 rounded-md transition-colors ${theme === 'system' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Sistema
              </button>
            </div>
          </div>

          {/* Opções */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opções</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Avançar capítulo automaticamente</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoNextChapter}
                    onChange={() => setAutoNextChapter(!autoNextChapter)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Mostrar número da página</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPageNumber}
                    onChange={() => setShowPageNumber(!showPageNumber)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Histórico de Leitura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Histórico de Leitura</label>
            <button
              onClick={handleClearHistory}
              className={`w-full py-2 px-4 rounded-md ${showConfirmClear ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              {showConfirmClear ? 'Confirmar Limpeza' : 'Limpar Histórico de Leitura'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}