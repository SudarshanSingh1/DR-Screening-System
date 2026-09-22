import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface EvidenceImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const EvidenceImageViewer: React.FC<EvidenceImageViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title
}) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => setScale(s => s + 0.25)} className="p-2 text-white bg-white/10 hover:bg-white/20 rounded" title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={() => setScale(s => Math.max(0.25, s - 0.25))} className="p-2 text-white bg-white/10 hover:bg-white/20 rounded" title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={() => setScale(1)} className="p-2 text-white bg-white/10 hover:bg-white/20 rounded" title="Reset Zoom">
          <Maximize className="w-5 h-5" />
        </button>
        <button onClick={onClose} className="p-2 text-white bg-white/10 hover:bg-white/20 hover:bg-red-500/50 rounded ml-4" title="Close (ESC)">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-4 left-4">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
      </div>

      <div className="overflow-auto max-h-screen max-w-full flex items-center justify-center p-8">
        <img 
          src={imageUrl} 
          alt={title} 
          style={{ transform: `scale(${scale})`, transition: 'transform 0.2s' }}
          className="max-h-[85vh] max-w-[85vw] object-contain origin-center cursor-move"
          draggable={false}
        />
      </div>
    </div>
  );
};
