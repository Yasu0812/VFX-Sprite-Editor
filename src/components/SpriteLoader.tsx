import { useRef } from 'react';
import type { SpriteAsset } from '../types';

interface SpriteLoaderProps {
  onLoad: (sprite: SpriteAsset) => void;
}

export const SpriteLoader = ({ onLoad }: SpriteLoaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    onLoad({
      image,
      name: file.name,
      width: image.width,
      height: image.height,
    });
  };

  return (
    <section className="panel">
      <h2>Sprite Loading</h2>
      <input
        ref={inputRef}
        className="hidden-input"
        type="file"
        accept="image/png"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
        }}
      />
      <button className="button" onClick={() => inputRef.current?.click()} type="button">
        Upload PNG Sprite Sheet
      </button>
      <p className="muted">Original image resolution is preserved for export and frame sampling.</p>
    </section>
  );
};
