import React, { useRef, useState, useEffect } from "react";

export default function App() {
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlaySize, setOverlaySize] = useState(200);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const canvasRef = useRef(null);

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = (mode = "original") => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const base = new Image();
    const overlay = new Image();

    base.src = baseImage;
    overlay.src = overlayImage;

    base.onload = () => {
      let width = base.width;
      let height = base.height;

      if (mode === "square") {
        const size = Math.min(width, height);
        width = size;
        height = size;
      }

      if (mode === "instagram") {
        width = 1080;
        height = 1350;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      ctx.drawImage(base, 0, 0, width, height);

      overlay.onload = () => {
        const x = position.x;
        const y = position.y;
        const size = overlaySize;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

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

  const downloadImage = (mode) => {
    drawCanvas(mode);
    setTimeout(() => {
      const canvas = canvasRef.current;
      const link = document.createElement("a");
      link.download = `image-${mode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }, 300);
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>Apple Watch Overlay Tool</h1>

      <input type="file" onChange={(e) => handleImageUpload(e, setBaseImage)} />
      <input type="file" onChange={(e) => handleImageUpload(e, setOverlayImage)} />

      <p>Size</p>
      <input
        type="range"
        min="50"
        max="500"
        value={overlaySize}
        onChange={(e) => setOverlaySize(Number(e.target.value))}
      />

      <p>X: {position.x}</p>
      <input
        type="range"
        min="0"
        max="800"
        value={position.x}
        onChange={(e) => setPosition({ ...position, x: Number(e.target.value) })}
      />

      <p>Y: {position.y}</p>
      <input
        type="range"
        min="0"
        max="800"
        value={position.y}
        onChange={(e) => setPosition({ ...position, y: Number(e.target.value) })}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={() => downloadImage("original")}>Original</button>
        <button onClick={() => downloadImage("square")}>Square</button>
        <button onClick={() => downloadImage("instagram")}>Instagram</button>
      </div>

      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", marginTop: 20, width: "100%" }}
      />
    </div>
  );
}
