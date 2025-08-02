'use client';

import { useState } from 'react';

interface MangaDescriptionProps {
  description: string;
  maxLines?: number;
}

export function MangaDescription({ description, maxLines = 4 }: MangaDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) {
    return null;
  }

  const maxLength = 300;
  const isLongText = description.length > maxLength;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-3">Sinopse</h3>
      <div className="relative">
        <p 
          className={`text-gray-200 leading-relaxed transition-all duration-300 ${
            !isExpanded && isLongText ? `line-clamp-${maxLines}` : ''
          }`}
        >
          {description}
        </p>
        
        {isLongText && (
          <div className="mt-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  Ver menos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Ver mais
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}