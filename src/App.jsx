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

      // Draw base (fit)
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
