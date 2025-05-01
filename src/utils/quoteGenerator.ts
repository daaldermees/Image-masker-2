// Mask shape for the profile image
export const profileMask = {
  path: "M65.45,78.9H5c-3.91,0-5-1.09-5-5V5C0,1.09,1.09,0,5,0h66.75c4.13,0,5.27,1.23,4.94,5.35l-6.21,68.91c-.29,3.69-1.33,4.64-5.02,4.64Z",
  w: 76.74,
  h: 78.9
};

// Quote container shape with fixed corners
export const quoteContainer = {
  path: "M223.36,78.9H7.31c-6.05,0-7.71-1.79-7.23-7.82L5.93,6.79C6.35,1.4,7.87,0,13.28,0h210.08c5.73,0,7.32,1.59,7.32,7.32v64.27c0,5.73-1.59,7.32-7.32,7.32Z",
  w: 230.67,
  h: 78.9
};

export interface RenderQuoteParams {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  quote: string;
  author: string;
  quoteColor: string;
  containerColor: string;
  personBgColor: string;
  useBgColor: boolean;
  lineHeight?: number; // Optional line height parameter
  transparent?: boolean; // Whether to use transparency
}

export const createMaskedProfileSVG = (image: HTMLImageElement, bgColor: string, useBgColor: boolean): string => {
  const rectElement = useBgColor ? `<rect width="${profileMask.w}" height="${profileMask.h}" fill="${bgColor}" />` : '';
  const imageElement = `<image href="${image.src}" width="${profileMask.w}" height="${profileMask.h}" preserveAspectRatio="xMidYMid slice" />`;
  const clipPath = `<clipPath id="profile-clip"><path d="${profileMask.path}" /></clipPath>`;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${profileMask.w}" height="${profileMask.h}" viewBox="0 0 ${profileMask.w} ${profileMask.h}">
    <defs>${clipPath}</defs>
    <g clip-path="url(#profile-clip)">${rectElement}${imageElement}</g>
  </svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });
  return URL.createObjectURL(blob);
};

export const renderQuote = (params: RenderQuoteParams): void => {
  const { 
    canvas, 
    image, 
    quote, 
    author, 
    quoteColor, 
    containerColor, 
    personBgColor, 
    useBgColor,
    lineHeight = 1.2, // Default value if not provided
    transparent = false // Default to non-transparent
  } = params;
  
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Increase canvas height to show full logo
  const canvasWidth = 701;
  const canvasHeight = Math.round(canvasWidth * 0.32); // Increased from 0.24 to 0.32 (33% taller)
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Clear canvas with transparency or white background based on transparent param
  if (transparent) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  } else {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Calculate dimensions
  const profileWidth = Math.round(canvasWidth * 0.25); // 25% of width
  const quoteWidth = canvasWidth - profileWidth; // 75% of width
  
  // Draw masked profile image
  const svgUrl = createMaskedProfileSVG(image, personBgColor, useBgColor);
  const profileImg = new Image();
  
  profileImg.onload = () => {
    const profileHeight = canvasHeight;
    const profileX = 0;
    const profileY = 0;
    
    ctx.drawImage(profileImg, profileX, profileY, profileWidth, profileHeight);
    URL.revokeObjectURL(svgUrl);

    // Draw quote container if not transparent
    const quoteX = profileWidth;
    const quoteY = 0;

    // Draw quote background (only if not transparent)
    if (!transparent) {
      ctx.fillStyle = containerColor;
      ctx.beginPath();
      const quotePath = new Path2D(quoteContainer.path);
      // Adjust scale to maintain correct aspect ratio while filling the taller container
      const quoteScale = profileHeight / quoteContainer.h;
      ctx.save();
      ctx.translate(quoteX, quoteY);
      ctx.scale(quoteScale * (quoteWidth / quoteContainer.w), quoteScale);
      ctx.fill(quotePath);
      ctx.restore();
    }
    
    // Calculate text layout
    const lines = quote.split('\n');
    const fontSize = 32;
    ctx.font = fontSize + "px 'Barlow Semi Condensed'";
    
    // Calculate total text height with custom line height
    const actualLineHeight = fontSize * lineHeight;
    const totalTextHeight = (lines.length * actualLineHeight) + 
                          (author ? actualLineHeight * 0.5 : 0); // Reduced spacing
    
    // Calculate starting Y position to center text vertically
    let y = (canvasHeight - totalTextHeight) / 2 + fontSize;
    
    // Draw quote text with quotation marks
    ctx.fillStyle = "#333";
    lines.forEach((line, index) => {
      const text = line;
      ctx.fillText(text, quoteX + 60, y);
      y += actualLineHeight;
      
      // Add closing quote to last line
      if (index === lines.length - 1) {
        const metrics = ctx.measureText(text);
        ctx.fillStyle = quoteColor;
        ctx.font = "bold " + fontSize + "px 'Barlow Semi Condensed'"; // Make closing quote bold like opening quote
        ctx.fillText('"', quoteX + 60 + metrics.width + 5, y - actualLineHeight);
      }
    });
    
    // Draw opening quote mark
    ctx.fillStyle = quoteColor;
    ctx.font = "bold " + fontSize + "px 'Barlow Semi Condensed'";
    ctx.fillText('"', quoteX + 40, (canvasHeight - totalTextHeight) / 2 + fontSize);
    
    // Draw author
    if (author) {
      y += actualLineHeight * 0.05; // Further reduce spacing
      ctx.font = "20px 'Barlow'";
      ctx.fillStyle = "#666";
      ctx.fillText(author, quoteX + 60, y);
    }
  };

  profileImg.src = svgUrl;
}; 