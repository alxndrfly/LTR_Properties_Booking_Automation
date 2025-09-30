import React, { useState, useRef, useEffect } from 'react';
import './ImageCarousel.css';

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [imageDimensions, setImageDimensions] = useState<Map<string, ImageDimensions>>(new Map());
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="carousel-placeholder">
        <span>No images available</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openFullscreen = () => {
    setIsFullscreenOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
    document.body.style.overflow = 'unset';
  };

  const calculateDynamicHeight = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const currentImageSrc = images[currentIndex];
    const currentImageDimensions = imageDimensions.get(currentImageSrc);

    if (!currentImageDimensions) {
      // Fallback to original calculation if dimensions not loaded yet
      const widthBasedMax = containerWidth * 0.9064;
      const viewportBasedMax = window.innerHeight * 0.7931;
      const maxHeight = Math.min(widthBasedMax, viewportBasedMax);
      setContainerHeight(maxHeight);
      return;
    }

    // Calculate height based on aspect ratio
    const idealHeight = containerWidth / currentImageDimensions.aspectRatio;

    // Set maximum height constraints
    const widthBasedMax = containerWidth * 0.9064;
    const viewportBasedMax = window.innerHeight * 0.7931;
    const maxHeight = Math.min(widthBasedMax, viewportBasedMax);

    // Use ideal height if it's within limits, otherwise use max height
    const finalHeight = Math.min(idealHeight, maxHeight);
    setContainerHeight(finalHeight);
  };

  // Load image dimensions when images change
  useEffect(() => {
    const loadImageDimensions = async () => {
      const dimensionsMap = new Map<string, ImageDimensions>();

      for (const imageSrc of images) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = imageSrc;
          });

          dimensionsMap.set(imageSrc, {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight
          });
        } catch (error) {
          console.error(`Failed to load image: ${imageSrc}`, error);
        }
      }

      setImageDimensions(dimensionsMap);
    };

    loadImageDimensions();
  }, [images]);

  // Recalculate height when current image changes or dimensions are loaded
  useEffect(() => {
    calculateDynamicHeight();
  }, [currentIndex, imageDimensions]);

  // Recalculate height on window resize
  useEffect(() => {
    const handleResize = () => {
      calculateDynamicHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, imageDimensions]);

  // Cleanup body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="carousel" style={{ height: containerHeight ? `${containerHeight}px` : 'auto' }}>
      <div className="carousel-container" ref={containerRef} style={{ height: containerHeight ? `${containerHeight}px` : 'auto' }}>
        <img
          ref={imgRef}
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="carousel-image"
        />
        {images.length > 1 && (
          <>
            {/* Full left side click area */}
            <div
              className="carousel-click-area carousel-click-area-left"
              onClick={goToPrevious}
              aria-label="Previous image"
            />
            {/* Full right side click area */}
            <div
              className="carousel-click-area carousel-click-area-right"
              onClick={goToNext}
              aria-label="Next image"
            />
            {/* Center click area for fullscreen */}
            <div
              className="carousel-click-area carousel-click-area-center"
              onClick={openFullscreen}
              aria-label="Open fullscreen view"
            />
            {/* Original arrow buttons */}
            <button
              className="carousel-button carousel-button-prev"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              &#8249;
            </button>
            <button
              className="carousel-button carousel-button-next"
              onClick={goToNext}
              aria-label="Next image"
            >
              &#8250;
            </button>
          </>
        )}
        {/* Single image center click for fullscreen */}
        {images.length === 1 && (
          <div
            className="carousel-click-area carousel-click-area-center"
            onClick={openFullscreen}
            aria-label="Open fullscreen view"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreenOpen && (
        <div className="fullscreen-modal" onClick={closeFullscreen}>
          <button className="fullscreen-close" onClick={closeFullscreen}>
            ✕
          </button>
          <div className="fullscreen-content">
            <div className="fullscreen-image-container" onClick={(e) => e.stopPropagation()}>
              <img
                src={images[currentIndex]}
                alt={`${alt} - Image ${currentIndex + 1}`}
                className="fullscreen-image"
              />
              {images.length > 1 && (
                <>
                  <div
                    className="fullscreen-nav fullscreen-nav-left"
                    onClick={goToPrevious}
                    aria-label="Previous image"
                  />
                  <div
                    className="fullscreen-nav fullscreen-nav-right"
                    onClick={goToNext}
                    aria-label="Next image"
                  />
                  <button
                    className="fullscreen-arrow fullscreen-arrow-left"
                    onClick={goToPrevious}
                    aria-label="Previous image"
                  >
                    &#8249;
                  </button>
                  <button
                    className="fullscreen-arrow fullscreen-arrow-right"
                    onClick={goToNext}
                    aria-label="Next image"
                  >
                    &#8250;
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;