// D:\stylescapes\frontend\src\components\Product\ProductMedia.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/ProductMedia.css'; 

const ProductMedia = ({ productImages }) => {
    
    const [mainImageSrc, setMainImageSrc] = useState(
        productImages[0]?.src || "https://placehold.co/500?text=No+Image"
    );
    const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);

    const mainImageRef = useRef(null);
    const productViewerRef = useRef(null);
    const zoomLensRef = useRef(null);
    const magnifiedViewRef = useRef(null);
    const magnifiedImgRef = useRef(null);

    // Hardcoded configuration (matches CSS variables in the blueprint)
    const ZOOM_FACTOR = 2.5;
    const LENS_SIZE = 150;
    const FADE_DURATION = 300; // ms for image transition

    // --- Image Switching Logic ---
    const handleThumbnailClick = useCallback((newSrc, index) => {
        if (mainImageRef.current.src === newSrc) return;

        mainImageRef.current.style.opacity = '0';
        setActiveThumbnailIndex(index);
        
        setTimeout(() => {
            setMainImageSrc(newSrc);
            mainImageRef.current.style.opacity = '1';
            
            if (magnifiedImgRef.current) {
                 magnifiedImgRef.current.src = newSrc;
            }
        }, FADE_DURATION);
    }, []);
    
    // --- Zoom Lens Logic (Desktop Only) ---
    useEffect(() => {
        const productViewer = productViewerRef.current;
        const zoomLens = zoomLensRef.current;
        const magnifiedView = magnifiedViewRef.current;
        const magnifiedImg = magnifiedImgRef.current;

        if (!productViewer || !zoomLens || !magnifiedView || !magnifiedImg || window.innerWidth < 1024) {
            if (magnifiedView) magnifiedView.style.display = 'none';
            return;
        }

        let isZoomActive = false;

        const handleMouseEnter = () => {
            isZoomActive = true;
            zoomLens.style.display = 'block';
            magnifiedView.style.display = 'block';
        };

        const handleMouseLeave = () => {
            isZoomActive = false;
            zoomLens.style.display = 'none';
            magnifiedView.style.display = 'none';
        };

        const handleMouseMove = (e) => {
            if (!isZoomActive) return;

            const rect = productViewer.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            const viewerWidth = rect.width;
            const viewerHeight = rect.height;

            // 1. Center the lens and clamp it within boundaries
            let lensX = offsetX - LENS_SIZE / 2;
            let lensY = offsetY - LENS_SIZE / 2;

            lensX = Math.max(0, Math.min(viewerWidth - LENS_SIZE, lensX));
            lensY = Math.max(0, Math.min(viewerHeight - LENS_SIZE, lensY));

            zoomLens.style.left = `${lensX}px`;
            zoomLens.style.top = `${lensY}px`;

            // 2. Calculate transform position for the magnified image
            const ratioX = lensX / (viewerWidth - LENS_SIZE);
            const ratioY = lensY / (viewerHeight - LENS_SIZE);

            const maxMovementX = magnifiedImg.offsetWidth - magnifiedView.offsetWidth;
            const maxMovementY = magnifiedImg.offsetHeight - magnifiedView.offsetHeight;
            
            const bgX = (maxMovementX * ratioX) * -1;
            const bgY = (maxMovementY * ratioY) * -1;
            
            magnifiedImg.style.transform = `translate(${bgX}px, ${bgY}px)`;
        };

        productViewer.addEventListener('mouseenter', handleMouseEnter);
        productViewer.addEventListener('mouseleave', handleMouseLeave);
        productViewer.addEventListener('mousemove', handleMouseMove);

        return () => {
            productViewer.removeEventListener('mouseenter', handleMouseEnter);
            productViewer.removeEventListener('mouseleave', handleMouseLeave);
            productViewer.removeEventListener('mousemove', handleMouseMove);
        };
    }, [productImages, mainImageSrc]); 

    useEffect(() => {
        if (productImages.length > 0) {
            setMainImageSrc(productImages[0].src);
        }
    }, [productImages]);

    return (
        <div className="product-media-wrapper">
            
            <div className="product-media-main">
                {/* Main Image Viewer */}
                <div className="product-image-viewer" ref={productViewerRef}>
                    <img 
                        src={mainImageSrc} 
                        alt="Main Product View" 
                        className="main-product-image" 
                        ref={mainImageRef} 
                    />
                    <div className="zoom-lens" ref={zoomLensRef}></div>
                </div>
                
                {/* Thumbnails */}
                <div className="product-thumbnails">
                    {productImages.map((image, index) => (
                        <div 
                            key={index} 
                            className={`thumbnail ${activeThumbnailIndex === index ? 'active' : ''}`}
                            onClick={() => handleThumbnailClick(image.src, index)}
                        >
                            <img src={image.src} alt={`Thumbnail ${index + 1}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Magnified View Container (Fixed Position/Absolute to avoid siding) */}
            <div className="magnified-view" ref={magnifiedViewRef}>
                <img 
                    src={mainImageSrc} 
                    alt="Magnified Product View" 
                    className="magnified-img" 
                    ref={magnifiedImgRef}
                />
            </div>
        </div>
    );
};

export default ProductMedia;