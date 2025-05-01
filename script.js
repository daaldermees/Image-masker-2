(() => {
    const imageInput = document.getElementById("imageInput");
    const uploadZone = document.getElementById("uploadZone");
    const uploadPreview = document.getElementById("uploadPreview");
    const maskGrid = document.getElementById("maskGrid");
    const bgOptions = document.getElementById("bgOptions");
    const colorBtns = document.querySelectorAll(".color-btn");
    const customColor = document.getElementById("customColor");
    const customColorBtn = document.getElementById("customColorBtn");
    const previewCanvas = document.getElementById("previewCanvas");
    const ctx = previewCanvas.getContext("2d");
    const positionControls = document.getElementById("positionControls");
    const resetBtn = document.getElementById("resetBtn");
    const flipHBtn = document.getElementById("flipH");
    const flipVBtn = document.getElementById("flipV");
    const centerBtn = document.getElementById("centerBtn");
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    const sizeDisplay = document.getElementById("sizeDisplay");
    const downloadPng = document.getElementById("downloadPng");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");
    const copyPng = document.getElementById("copyPng");
    const toast = document.getElementById("toast");
    const addBadge = document.getElementById("addBadge");
    const languageButtons = document.getElementById("languageButtons");
    const badgeOptions = document.getElementById("badgeOptions");
    const rotateBtn = document.getElementById("rotateBtn");

    // Badge image paths
    const badgeImages = {
      nl: "assets/ai-generated-badge-NL.svg",
      en: "assets/ai-generated-badge-EN.svg"
    };

    let image = null;
    let imageName = "image";
    let selectedMask = null;
    let offsetX = 0,
      offsetY = 0,
      zoom = 1,
      flipH = 1,
      flipV = 1,
      rotation = 0;
    let useBgColor = false;
    let bgColor = "#ffffff";
    let currentLanguage = "nl";

    const masks = [
      {
        label: "Small",
        path: "M0,136.01c0,6.24,5.1,11.57,11.33,11.85l362.86,16.36c6.23.28,11.33-4.59,11.33-10.83V11.34C385.51,5.1,380.41,0,374.17,0H11.34C5.1,0,0,5.1,0,11.34v124.67Z",
        w: 385.51,
        h: 164.23,
        tooltip: {
          text: "Used for:",
          uses: ["Offertes", "Product previews"]
        }
      },
      {
        label: "Large",
        path: "M0,186.01c0,6.24,5.1,11.57,11.33,11.85l362.86,16.36c6.23.28,11.33-4.59,11.33-10.83V11.34C385.51,5.1,380.41,0,374.17,0H11.34C5.1,0,0,5.1,0,11.34v174.67Z",
        w: 385.51,
        h: 214.23,
        tooltip: {
          text: "Used for:",
          uses: ["Offertes", "Website"]
        }
      },
      {
        label: "XL",
        path: "M45.12,0h368.34c14.65,0,18.72,4.07,18.72,18.72v489.8c0,14.65-4.07,18.72-18.72,18.72H18.69c-15.21,0-19.4-4.42-18.59-19.61L26.32,17.82C27.07,3.73,31.01,0,45.12,0Z",
        w: 432.18,
        h: 527.24,
        tooltip: {
          text: "Used for:",
          uses: ["Slides"]
        }
      }
    ];

    function addMaskThumbnails() {
      masks.forEach((mask, idx) => {
        const canvasEl = document.createElement("canvas");
        const ratio = mask.h / mask.w;
        canvasEl.width = 100;
        canvasEl.height = 100 * ratio;
        const c = canvasEl.getContext("2d");
        c.fillStyle = "#ccc";
        c.scale(canvasEl.width / mask.w, canvasEl.height / mask.h);
        c.fill(new Path2D(mask.path));
        canvasEl.className = "mask-option";
        canvasEl.addEventListener("click", () => {
          document
            .querySelectorAll(".mask-option")
            .forEach((el) => el.classList.remove("selected"));
          canvasEl.classList.add("selected");
          selectedMask = mask;
          offsetX = offsetY = 0;
          zoom = 1;
          flipH = flipV = 1;
          rotation = 0;
          step3.style.display = "block";
          previewCanvas.style.display = "block";
          positionControls.style.display = "flex";
          badgeOptions.style.display = "block";
          downloadPng.classList.remove("disabled");
          copyPng.classList.remove("disabled");
          render();
        });

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.className = "mask-option";
        wrapper.appendChild(canvasEl);

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "tooltip";

        const label = document.createElement("div");
        label.className = "mask-label";
        label.innerText = mask.label;
        labelWrapper.appendChild(label);

        const infoIcon = document.createElement("span");
        infoIcon.className = "info-icon";
        infoIcon.innerHTML = "ℹ️";
        labelWrapper.appendChild(infoIcon);

        const tooltip = document.createElement("div");
        tooltip.className = "tooltip-content";
        tooltip.innerHTML = `
          ${mask.tooltip.text}
          <ul>
            ${mask.tooltip.uses.map(use => `<li>${use}</li>`).join("")}
          </ul>
        `;
        labelWrapper.appendChild(tooltip);

        wrapper.appendChild(labelWrapper);
        maskGrid.appendChild(wrapper);
      });
    }

    function handleFile(file) {
      const reader = new FileReader();
      imageName = file.name.replace(/\.[^/.]+$/, "") + "-masked";

      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          image = img;
          uploadPreview.src = img.src;
          uploadPreview.style.display = "block";
          step2.style.display = "block";
          maskGrid.innerHTML = "";
          addMaskThumbnails();
          checkTransparency(img);
          if (selectedMask) {
            render();
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }

    function pixelHasTransparency(data) {
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) return true;
      }
      return false;
    }

    function checkTransparency(img) {
      const temp = document.createElement("canvas");
      temp.width = img.width;
      temp.height = img.height;
      const tmpCtx = temp.getContext("2d");
      tmpCtx.drawImage(img, 0, 0);
      const data = tmpCtx.getImageData(0, 0, temp.width, temp.height).data;
      const hasAlpha = pixelHasTransparency(data);
      if (hasAlpha) {
        bgOptions.style.display = "block";
        useBgColor = true;
      } else {
        bgOptions.style.display = "none";
        useBgColor = false;
      }
    }

    colorBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        colorBtns.forEach((b) => b.classList.remove("selected-color"));
        btn.classList.add("selected-color");
        bgColor = btn.dataset.color;
        render();
      });
    });

    customColorBtn.addEventListener("click", () => {
      customColor.click();
    });

    customColor.addEventListener("change", () => {
      colorBtns.forEach((b) => b.classList.remove("selected-color"));
      bgColor = customColor.value;
      render();
    });

    function createMaskedSVG(mask, imgSrc, width, height, forExport = false) {
      // Create a unique ID for each clipPath to avoid conflicts
      const clipId = `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const imgTag = `<image href="${imgSrc}" width="${width * zoom}" height="${
        height * zoom
      }" preserveAspectRatio="xMidYMid slice" transform="translate(${
        (width - width * zoom) / 2 + offsetX
      },${(height - height * zoom) / 2 + offsetY})" />`;

      const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${
        mask.w
      } ${mask.h}">
        <defs>
          <clipPath id="${clipId}">
            <path d="${mask.path}" transform="
              scale(${flipH === -1 ? -1 : 1}, ${flipV === -1 ? -1 : 1})
              rotate(${rotation})
              ${flipH === -1 ? `translate(-${mask.w},0)` : ""}
              ${flipV === -1 ? `translate(0,-${mask.h})` : ""}
            " />
          </clipPath>
        </defs>
        <g clip-path="url(#${clipId})">
          ${
            useBgColor && !forExport
              ? `<rect width="${mask.w}" height="${mask.h}" fill="${bgColor}" />`
              : ""
          }
          ${imgTag}
        </g>
      </svg>`;

      // Convert SVG string to base64 data URL
      const blob = new Blob([svg], { type: "image/svg+xml" });
      return URL.createObjectURL(blob);
    }

    function clampOffset() {
      if (!image || !selectedMask) return;
      
      // Calculate bounds based on rotation
      const isRotated = rotation % 180 !== 0;
      const maskW = isRotated ? selectedMask.h : selectedMask.w;
      const maskH = isRotated ? selectedMask.w : selectedMask.h;
      const imgW = image.width * zoom;
      const imgH = image.height * zoom;

      // Calculate the minimum offset needed to keep the image within bounds
      const minX = Math.min(0, maskW - imgW);
      const maxX = Math.max(0, imgW - maskW);
      const minY = Math.min(0, maskH - imgH);
      const maxY = Math.max(0, imgH - maskH);

      offsetX = Math.max(minX, Math.min(maxX, offsetX));
      offsetY = Math.max(minY, Math.min(maxY, offsetY));
    }

    function render() {
      if (!image || !selectedMask) return;

      const cw = 600;
      const ch = Math.round((cw * selectedMask.h) / selectedMask.w);
      previewCanvas.width = cw;
      previewCanvas.height = ch;

      clampOffset();

      const svgUrl = createMaskedSVG(
        selectedMask,
        image.src,
        selectedMask.w,
        selectedMask.h
      );

      const svgImg = new Image();
      svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0, cw, ch);

        // Revoke the URL after the image has loaded
        URL.revokeObjectURL(svgUrl);

        // Add badge if checked
        if (addBadge.checked) {
          const badgeImg = new Image();
          badgeImg.onload = () => {
            const badgeWidth = cw * 0.33;
            const badgeHeight = (badgeImg.height / badgeImg.width) * badgeWidth;
            const badgeX = cw - badgeWidth - (cw * 0.05);
            const badgeY = ch - badgeHeight + (ch * 0.02);
            ctx.drawImage(badgeImg, badgeX, badgeY, badgeWidth, badgeHeight);
            calculateExportSize();
          };
          badgeImg.src = badgeImages[currentLanguage];
        } else {
          calculateExportSize();
        }
      };
      svgImg.src = svgUrl;
    }

    function exportHighResPNG() {
      if (!image || !selectedMask) return;

      const tempCanvas = document.createElement("canvas");
      const maskAspect = selectedMask.w / selectedMask.h;
      const imgAspect = image.width / image.height;
      
      if (imgAspect > maskAspect) {
        tempCanvas.height = image.height;
        tempCanvas.width = Math.round(tempCanvas.height * maskAspect);
      } else {
        tempCanvas.width = image.width;
        tempCanvas.height = Math.round(tempCanvas.width / maskAspect);
      }

      const tempCtx = tempCanvas.getContext("2d");
      
      // Use the same transformation values as the preview
      const svgUrl = createMaskedSVG(
        selectedMask,
        image.src,
        tempCanvas.width,
        tempCanvas.height,
        true
      );

      const maskedImg = new Image();
      maskedImg.onload = () => {
        tempCtx.drawImage(maskedImg, 0, 0, tempCanvas.width, tempCanvas.height);
        URL.revokeObjectURL(svgUrl);

        if (addBadge.checked) {
          const badgeImg = new Image();
          badgeImg.crossOrigin = "anonymous"; // Add CORS for badge image
          badgeImg.onload = () => {
            const badgeWidth = tempCanvas.width * 0.33;
            const badgeHeight = (badgeImg.height / badgeImg.width) * badgeWidth;
            const badgeX = tempCanvas.width - badgeWidth - (tempCanvas.width * 0.05);
            const badgeY = tempCanvas.height - badgeHeight + (tempCanvas.height * 0.02);
            tempCtx.drawImage(badgeImg, badgeX, badgeY, badgeWidth, badgeHeight);
            finishExport(tempCanvas);
          };
          badgeImg.src = badgeImages[currentLanguage];
        } else {
          finishExport(tempCanvas);
        }
      };
      maskedImg.src = svgUrl;
    }

    function finishExport(canvas) {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = imageName + ".png";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    }

    function calculateExportSize() {
      const tempCanvas = document.createElement("canvas");
      const maskAspect = selectedMask.w / selectedMask.h;
      const imgAspect = image.width / image.height;
      
      if (imgAspect > maskAspect) {
        tempCanvas.height = image.height;
        tempCanvas.width = Math.round(tempCanvas.height * maskAspect);
      } else {
        tempCanvas.width = image.width;
        tempCanvas.height = Math.round(tempCanvas.width / maskAspect);
      }

      const tempCtx = tempCanvas.getContext("2d");
      const svgUrl = createMaskedSVG(
        selectedMask,
        image.src,
        tempCanvas.width,
        tempCanvas.height,
        true
      );

      const maskedImg = new Image();
      maskedImg.onload = () => {
        tempCtx.drawImage(maskedImg, 0, 0, tempCanvas.width, tempCanvas.height);
        URL.revokeObjectURL(svgUrl);

        if (addBadge.checked) {
          const badgeImg = new Image();
          badgeImg.crossOrigin = "anonymous"; // Add CORS for badge image
          badgeImg.onload = () => {
            const badgeWidth = tempCanvas.width * 0.33;
            const badgeHeight = (badgeImg.height / badgeImg.width) * badgeWidth;
            const badgeX = tempCanvas.width - badgeWidth - (tempCanvas.width * 0.05);
            const badgeY = tempCanvas.height - badgeHeight + (tempCanvas.height * 0.02);
            tempCtx.drawImage(badgeImg, badgeX, badgeY, badgeWidth, badgeHeight);
            updateSizeDisplay(tempCanvas);
          };
          badgeImg.src = badgeImages[currentLanguage];
        } else {
          updateSizeDisplay(tempCanvas);
        }
      };
      maskedImg.src = svgUrl;
    }

    function updateSizeDisplay(canvas) {
      canvas.toBlob((blob) => {
        const kb = (blob.size / 1024).toFixed(1);
        sizeDisplay.textContent = `Expected export size: ${kb} KB`;
      }, "image/png");
    }

    zoomInBtn.addEventListener("click", () => {
      zoom = Math.min(3, zoom + 0.1);
      render();
    });

    zoomOutBtn.addEventListener("click", () => {
      zoom = Math.max(1, zoom - 0.1);
      render();
    });

    resetBtn.addEventListener("click", () => {
      zoom = 1;
      offsetX = offsetY = 0;
      flipH = flipV = 1;
      rotation = 0;
      render();
    });

    flipHBtn.addEventListener("click", () => {
      flipH *= -1;
      render();
    });

    flipVBtn.addEventListener("click", () => {
      flipV *= -1;
      render();
    });

    centerBtn.addEventListener("click", () => {
      offsetX = offsetY = 0;
      render();
    });

    previewCanvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startOffsetX = offsetX;
      const startOffsetY = offsetY;

      function moveHandler(me) {
        offsetX = startOffsetX + (me.clientX - startX);
        offsetY = startOffsetY + (me.clientY - startY);
        render();
      }

      function upHandler() {
        window.removeEventListener("mousemove", moveHandler);
        window.removeEventListener("mouseup", upHandler);
      }

      window.addEventListener("mousemove", moveHandler);
      window.addEventListener("mouseup", upHandler);
    });

    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadZone.classList.add("dragover");
    });

    uploadZone.addEventListener("dragleave", () => {
      uploadZone.classList.remove("dragover");
    });

    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    uploadZone.addEventListener("click", () => imageInput.click());

    imageInput.addEventListener("change", () => {
      if (imageInput.files[0]) {
        handleFile(imageInput.files[0]);
      }
    });

    downloadPng.addEventListener("click", () => {
      if (downloadPng.classList.contains("disabled")) return;
      exportHighResPNG();
    });

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2000);
    }

    async function copyToClipboard() {
      if (!image || !selectedMask) return;
      
      try {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = selectedMask.w;
        tempCanvas.height = selectedMask.h;
        
        const svgUrl = createMaskedSVG(
          selectedMask,
          image.src,
          selectedMask.w,
          selectedMask.h,
          true
        );
        
        const svgImg = new Image();
        await new Promise((resolve) => {
          svgImg.onload = resolve;
          svgImg.src = svgUrl;
        });
        
        tempCtx.drawImage(svgImg, 0, 0, tempCanvas.width, tempCanvas.height);
        URL.revokeObjectURL(svgUrl);
        
        if (addBadge.checked) {
          const badgeImg = new Image();
          badgeImg.crossOrigin = "anonymous"; // Add CORS for badge image
          await new Promise((resolve) => {
            badgeImg.onload = resolve;
            badgeImg.src = badgeImages[currentLanguage];
          });
          
          const badgeWidth = tempCanvas.width * 0.33;
          const badgeHeight = (badgeImg.height / badgeImg.width) * badgeWidth;
          const badgeX = tempCanvas.width - badgeWidth - (tempCanvas.width * 0.05);
          const badgeY = tempCanvas.height - badgeHeight + (tempCanvas.height * 0.02);
          tempCtx.drawImage(badgeImg, badgeX, badgeY, badgeWidth, badgeHeight);
        }
        
        const blob = await new Promise(resolve => tempCanvas.toBlob(resolve));
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        showToast("Image copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy image:", err);
        showToast("Failed to copy image");
      }
    }

    copyPng.addEventListener("click", copyToClipboard);

    // Update language button handlers
    document.querySelectorAll(".language-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".language-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        currentLanguage = btn.dataset.lang;
        render();
      });
    });

    // Update badge checkbox handler
    addBadge.addEventListener("change", () => {
      languageButtons.style.display = addBadge.checked ? "flex" : "none";
      render();
    });

    // Add rotation button handler
    rotateBtn.addEventListener("click", () => {
      rotation = (rotation + 90) % 360;
      render();
    });
  })();