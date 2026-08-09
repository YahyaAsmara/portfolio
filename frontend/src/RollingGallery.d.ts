import * as React from 'react';

export interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  images?: string[];
}

declare const RollingGallery: React.FC<RollingGalleryProps>;

export default RollingGallery;
