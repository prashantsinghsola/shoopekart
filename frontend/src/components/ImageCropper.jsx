import React, { useState, useRef, useEffect } from 'react';

/**
 * ImageCropper Component
 * @param {string} imageSrc - The source image as base64 or object URL
 * @param {number} aspectRatio - Target ratio (width / height) e.g., 1 for square, 2.33 (21/9) for banners
 * @param {function} onCrop - Callback function returning cropped base64 image
 * @param {function} onClose - Close handler
 */
export default function ImageCropper({ imageSrc, aspectRatio = 1, onCrop, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      // Reset zoom and offset
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Handle Dragging Image
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Draw preview on active canvas
  useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !imgRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    // Set canvas dimensions equal to display dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Move to canvas center to apply transformations
    ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
    ctx.scale(zoom, zoom);

    // Calculate dimensions to fit inside the crop box by default
    let drawW = width;
    let drawH = height;
    
    const imgRatio = img.width / img.height;
    if (imgRatio > aspectRatio) {
      // Image is wider
      drawH = height;
      drawW = height * imgRatio;
    } else {
      // Image is taller
      drawW = width;
      drawH = width / imgRatio;
    }

    // Draw centered relative to the translations
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [imgLoaded, zoom, offset, aspectRatio]);

  const handleSaveCrop = () => {
    if (!imgRef.current) return;
    
    const sourceImg = imgRef.current;
    const cropCanvas = document.createElement('canvas');
    
    // Set standard resolutions: 600x600 for products, 1200x514 for hero banners
    const outputWidth = aspectRatio === 1 ? 600 : 1200;
    const outputHeight = outputWidth / aspectRatio;
    
    cropCanvas.width = outputWidth;
    cropCanvas.height = outputHeight;
    
    const ctx = cropCanvas.getContext('2d');
    
    ctx.save();
    // Match scaling factor to output dimensions
    // We scaled inside a preview canvas of e.g. 400x400
    const previewSize = aspectRatio === 1 ? 300 : 450;
    const scaleFactor = outputWidth / previewSize;
    
    ctx.translate(outputWidth / 2 + offset.x * scaleFactor, outputHeight / 2 + offset.y * scaleFactor);
    ctx.scale(zoom * scaleFactor, zoom * scaleFactor);

    let drawW = previewSize;
    let drawH = previewSize / aspectRatio;
    
    const imgRatio = sourceImg.width / sourceImg.height;
    if (imgRatio > aspectRatio) {
      drawH = previewSize / aspectRatio;
      drawW = drawH * imgRatio;
    } else {
      drawW = previewSize;
      drawH = previewSize / imgRatio;
    }

    ctx.drawImage(sourceImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
    
    const croppedDataUrl = cropCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedDataUrl);
  };

  // Determine crop container dimensions
  const previewWidth = aspectRatio === 1 ? 300 : 450;
  const previewHeight = previewWidth / aspectRatio;

  return (
    <div className="cropper-modal-overlay">
      <div className="cropper-modal animate-slideup">
        <div className="cropper-modal-header">
          <h3>Crop Image</h3>
          <button onClick={onClose} className="btn-icon" style={{ width: 30, height: 30 }}>&times;</button>
        </div>
        
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Drag the image to position it. Use the slider below to zoom.
        </p>

        <div className="cropper-viewport">
          <canvas
            ref={canvasRef}
            width={previewWidth}
            height={previewHeight}
            style={{
              width: previewWidth,
              height: previewHeight,
              cursor: isDragging ? 'grabbing' : 'grab',
              borderRadius: aspectRatio === 1 ? 'var(--radius-md)' : '0px',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className="cropper-controls">
          <label style={{ fontSize: 12, fontWeight: 600 }}>Zoom:</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="cropper-zoom-slider"
          />
          <span style={{ fontSize: 12, fontWeight: 500, width: 32 }}>{Math.round(zoom * 100)}%</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSaveCrop} className="btn btn-primary">Crop & Save</button>
        </div>
      </div>
    </div>
  );
}
