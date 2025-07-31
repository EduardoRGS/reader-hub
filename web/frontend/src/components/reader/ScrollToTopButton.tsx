interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
}

export default function ScrollToTopButton({ show, onClick }: ScrollToTopButtonProps) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      show 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>
      <button
        onClick={onClick}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        title="Voltar ao topo (T)"
      >
        <svg 
          className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
      </button>
    </div>
  );
} 