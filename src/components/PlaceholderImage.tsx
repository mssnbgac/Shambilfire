'use client';

import { PhotoIcon } from '@heroicons/react/24/outline';

interface PlaceholderImageProps {
  width?: string;
  height?: string;
  text?: string;
  className?: string;
}

export default function PlaceholderImage({ 
  width = 'w-full', 
  height = 'h-32', 
  text = 'No Image',
  className = ''
}: PlaceholderImageProps) {
  return (
    <div className={`${width} ${height} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}