(() => {
  // Wait for DOM to be fully loaded before initializing
  document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById("imageInput");
    const uploadZone = document.getElementById("uploadZone");
    const uploadPreview = document.getElementById("uploadPreview");
    const quoteInput = document.getElementById("quoteInput");
    const quoteText = document.getElementById("quoteText");
    const authorTitle = document.getElementById("authorTitle");
    const styleOptions = document.getElementById("styleOptions");
    const personBgSection = document.getElementById("personBgSection");
    const quoteMarksColor = document.getElementById("quoteMarksColor");
    const quoteContainerColor = document.getElementById("quoteContainerColor");
    const personBgColor = document.getElementById("personBgColor");
    const quoteMarksPreset = document.getElementById("quoteMarksPreset");
    const containerBgPreset = document.getElementById("containerBgPreset");
    const personBgPreset = document.getElementById("personBgPreset");
    const previewCanvas = document.getElementById("previewCanvas");
    const ctx = previewCanvas.getContext("2d");
    const downloadPng = document.getElementById("downloadPng");
    const copyPng = document.getElementById("copyPng");
    const toast = document.getElementById("toast");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");

    let image = null;
    let quoteColor = "#4493cf";
    let bgColor = "#ffffff";
    let containerBgColor = "#ededed";
    let useBgColor = false;
    let errorMessageElement = null;

    // Initialize with default values
    quoteText.value = "Dit is een quote.";
    authorTitle.value = "Game Tailors";

    // Mask shape for the profile image
    const profileMask = {
      path: "M65.45,78.9H5c-3.91,0-5-1.09-5-5V5C0,1.09,1.09,0,5,0h66.75c4.13,0,5.27,1.23,4.94,5.35l-6.21,68.91c-.29,3.69-1.33,4.64-5.02,4.64Z",
      w: 76.74,
      h: 78.9
    };

    // Quote container shape
    const quoteContainer = {
      path: "M223.36,78.9H7.31c-6.05,0-7.71-1.79-7.23-7.82L5.93,6.79C6.35,1.4,7.87,0,13.28,0h210.08c5.73,0,7.32,1.59,7.32,7.32v64.27c0,5.73-1.59,7.32-7.32,7.32Z",
      w: 230.67,
      h: 78.9
    };

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2000);
    }

    function handleFile(file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          image = img;
          uploadPreview.src = img.src;
          uploadPreview.style.display = "block";
          step2.style.display = "block";
          quoteInput.style.display = "block";
          quotePreview.style.display = "block";
          previewCanvas.style.display = "block";
          styleOptions.style.display = "block";
          step3.style.display = "block";
          checkTransparency(img);
          render();
          
          // Scroll to step 2
          step3.scrollIntoView({ behavior: 'smooth', block: "end" });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }

    function checkLineCount(text) {
      return text.split('\n').length;
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
        personBgSection.style.display = "block";
        useBgColor = true;
      } else {
        personBgSection.style.display = "none";
        useBgColor = false;
      }
    }

    function createMaskedProfileSVG() {
      if (!image) return null;

      const rectElement = useBgColor ? `<rect width="${profileMask.w}" height="${profileMask.h}" fill="${bgColor}" />` : '';
      const imageElement = `<image href="${image.src}" width="${profileMask.w}" height="${profileMask.h}" preserveAspectRatio="xMidYMid slice" />`;
      const clipPath = `<clipPath id="profile-clip"><path d="${profileMask.path}" /></clipPath>`;
      
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${profileMask.w}" height="${profileMask.h}" viewBox="0 0 ${profileMask.w} ${profileMask.h}">
        <defs>${clipPath}</defs>
        <g clip-path="url(#profile-clip)">${rectElement}${imageElement}</g>
      </svg>`;

      const blob = new Blob([svg], { type: "image/svg+xml" });
      return URL.createObjectURL(blob);
    }

    // Set up event listeners
    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.add("dragover");
    });

    uploadZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.remove("dragover");
    });

    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    uploadZone.addEventListener("click", () => {
      imageInput.click();
    });

    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    });

    // Set up color preset handlers
    [
      { preset: quoteMarksPreset, picker: quoteMarksColor },
      { preset: containerBgPreset, picker: quoteContainerColor },
      { preset: personBgPreset, picker: personBgColor }
    ].forEach(({ preset, picker }) => {
      preset.addEventListener('change', (e) => {
        if (e.target.value) {
          picker.value = e.target.value;
          picker.dispatchEvent(new Event('input'));
        }
      });
    });

    // Set up color picker handlers
    quoteMarksColor.addEventListener('input', (e) => {
      quoteColor = e.target.value;
      render();
    });

    quoteContainerColor.addEventListener('input', (e) => {
      containerBgColor = e.target.value;
      render();
    });

    personBgColor.addEventListener('input', (e) => {
      bgColor = e.target.value;
      render();
    });

    // Set up quote text handler
    quoteText.addEventListener('input', () => {
      const lineCount = checkLineCount(quoteText.value);
      if (lineCount > 3) {
        if (!errorMessageElement) {
          errorMessageElement = document.createElement('div');
          errorMessageElement.className = 'error-message';
          errorMessageElement.textContent = 'Maximum 3 lines allowed';
          quoteText.parentNode.insertBefore(errorMessageElement, quoteText.nextSibling);
        }
        quoteText.value = quoteText.value.split('\n').slice(0, 3).join('\n');
      } else if (errorMessageElement) {
        errorMessageElement.remove();
        errorMessageElement = null;
      }
      render();
    });

    function render() {
      if (!image) return;

      const canvasWidth = 701;
      const canvasHeight = Math.round(canvasWidth * 0.24); // Height is 24% of width
      previewCanvas.width = canvasWidth;
      previewCanvas.height = canvasHeight;
      previewCanvas.style.display = "block";

      // Clear canvas
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate dimensions
      const profileWidth = Math.round(canvasWidth * 0.25); // 33% of width
      const quoteWidth = canvasWidth - profileWidth; // 66% of width
      
      // Draw masked profile image
      const svgUrl = createMaskedProfileSVG();
      if (svgUrl) {
        const profileImg = new Image();
        profileImg.onload = () => {
          const profileHeight = canvasHeight;
          const profileX = 0;
          const profileY = 0;
          
          ctx.drawImage(profileImg, profileX, profileY, profileWidth, profileHeight);
          URL.revokeObjectURL(svgUrl);

          // Draw quote container
          const quoteX = profileWidth;
          const quoteY = 0;

          // Draw quote background
          ctx.fillStyle = containerBgColor;
          ctx.beginPath();
          const quotePath = new Path2D(quoteContainer.path);
          const quoteScale = profileHeight / quoteContainer.h;
          ctx.save();
          ctx.translate(quoteX, quoteY);
          ctx.scale(quoteScale * (quoteWidth / quoteContainer.w), quoteScale);
          ctx.fill(quotePath);
          ctx.restore();
          
          // Calculate text layout
          const lines = quoteText.value.split('\n');
          const fontSize = 32;
          ctx.font = fontSize + "px 'Barlow Semi Condensed'";
          
          // Calculate total text height
          const lineHeight = fontSize * 1.2;
          const totalTextHeight = (lines.length * lineHeight) + 
                                (authorTitle.value ? lineHeight * 1.5 : 0);
          
          // Calculate starting Y position to center text vertically
          let y = (canvasHeight - totalTextHeight) / 2 + fontSize;
          
          // Draw quote text with quotation marks
          ctx.fillStyle = "#333";
          lines.forEach((line, index) => {
            const text = index === 0 ? `"${line}` : line;
            ctx.fillText(text, quoteX + 60, y);
            y += lineHeight;
            
            // Add closing quote to last line
            if (index === lines.length - 1) {
              const metrics = ctx.measureText(text);
              ctx.fillStyle = quoteColor;
              ctx.fillText('"', quoteX + 60 + metrics.width + 5, y - lineHeight);
            }
          });
          
          // Draw opening quote mark
          ctx.fillStyle = quoteColor;
          ctx.font = "bold " + fontSize + "px 'Barlow Semi Condensed'";
          ctx.fillText('"', quoteX + 40, (canvasHeight - totalTextHeight) / 2 + fontSize);
          
          // Draw author
          if (authorTitle.value) {
            y += lineHeight * 0.5;
            ctx.font = "20px 'Barlow'";
            ctx.fillStyle = "#666";
            ctx.fillText(authorTitle.value, quoteX + 60, y);
          }

          // Enable export buttons
          downloadPng.classList.remove("disabled");
          copyPng.classList.remove("disabled");
        };
        profileImg.src = svgUrl;
      }
    }

    // Export handlers
    downloadPng.addEventListener("click", () => {
      if (downloadPng.classList.contains("disabled")) return;
      
      const a = document.createElement("a");
      a.href = previewCanvas.toDataURL("image/png");
      a.download = "quote.png";
      a.click();
    });

    copyPng.addEventListener("click", async () => {
      if (copyPng.classList.contains("disabled")) return;
      
      try {
        const blob = await new Promise(resolve => previewCanvas.toBlob(resolve));
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
    });
  });
})(); 