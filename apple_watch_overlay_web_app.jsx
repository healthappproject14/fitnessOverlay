import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function App() {
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlaySize, setOverlaySize] = useState(200);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const base = new Image();
    const overlay = new Image();

    base.src = baseImage;
    overlay.src = overlayImage;

    base.onload = () => {
      canvas.width = base.width;
      canvas.height = base.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);

      overlay.onload = () => {
        const x = position.x;
        const y = position.y;
        const size = overlaySize;

        // Draw shadow
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Rounded corners clip
        const radius = 20;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + size - radius, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(overlay, x, y, size, size);
        ctx.restore();
      };
    };
  };

  useEffect(() => {
    if (baseImage && overlayImage) drawCanvas();
  }, [position, overlaySize, baseImage, overlayImage]);

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleDown = (e) => {
    const pos = getPointerPos(e);
    if (
      pos.x >= position.x &&
      pos.x <= position.x + overlaySize &&
      pos.y >= position.y &&
      pos.y <= position.y + overlaySize
    ) {
      setDragging(true);
    }
  };

  const handleMove = (e) => {
    if (!dragging) return;
    const pos = getPointerPos(e);
    setPosition({ x: pos.x - overlaySize / 2, y: pos.y - overlaySize / 2 });
  };

  const handleUp = () => setDragging(false);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "combined-image.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Apple Watch Overlay Tool</h1>

      <div className="space-y-2">
        <p>Upload Background Image:</p>
        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBaseImage)} />
      </div>

      <div className="space-y-2">
        <p>Upload Apple Watch Screenshot:</p>
        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setOverlayImage)} />
      </div>

      <div className="space-y-2">
        <p>Overlay Size:</p>
        <input
          type="range"
          min="50"
          max="500"
          value={overlaySize}
          onChange={(e) => setOverlaySize(Number(e.target.value))}
        />
      </div>

      <Button onClick={downloadImage}>Download</Button>

      <canvas
        ref={canvasRef}
        className="border mt-4 touch-none"
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
      />
    </div>
  );
}
