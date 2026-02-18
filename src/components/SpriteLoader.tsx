import { useRef } from 'react';
import { loadImage } from '../utils/canvas';
import type { Sprite } from '../types';

interface SpriteLoaderProps {
  onSpriteLoad: (sprite: Sprite) => void;
}

export const SpriteLoader: React.FC<SpriteLoaderProps> = ({ onSpriteLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const image = await loadImage(file);
      
      // Center the sprite on a standard canvas
      const canvasWidth = 800;
      const canvasHeight = 600;
      
      // Scale sprite to fit canvas if too large
      let width = image.width;
      let height = image.height;
      const maxSize = 400;
      
      if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width *= scale;
        height *= scale;
      }
      
      const x = (canvasWidth - width) / 2;
      const y = (canvasHeight - height) / 2;
      
      onSpriteLoad({
        image,
        x,
        y,
        width,
        height
      });
    } catch (error) {
      console.error('Error loading sprite:', error);
      alert('Failed to load image. Please try another file.');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleButtonClick}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          width: '100%'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
      >
        📁 Load Sprite Image
      </button>
    </div>
  );
};
