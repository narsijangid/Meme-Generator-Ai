import React, { useEffect, useRef, useState } from 'react';
import './MemeMaker.css';

const MemeMaker = () => {
  const canvasRef = useRef(null);
  const [textTop, setTextTop] = useState("i don't always make a meme");
  const [textBottom, setTextBottom] = useState("but when i do, i use ninivert's generator");
  const [textSizeTop, setTextSizeTop] = useState(10);
  const [textSizeBottom, setTextSizeBottom] = useState(10);
  const [image, setImage] = useState(null);
  const [imgUrl, setImgUrl] = useState('https://imgflip.com/s/meme/The-Most-Interesting-Man-In-The-World.jpg');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const API_KEY = "AIzaSyDhDhiKFkaYAp-o0lGL4e4uJSYIJSh6paY";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  useEffect(() => {
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      setImage(img);
      drawMeme(img);
    };
  }, [imgUrl]);

  useEffect(() => {
    if (image) {
      drawMeme(image);
    }
  }, [textTop, textBottom, textSizeTop, textSizeBottom, image]);

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    return lines;
  };

  const drawMeme = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const padding = 20;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Text settings
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(3, canvas.width * 0.004);

    // Calculate text sizes
    const _textSizeTop = (textSizeTop / 100) * canvas.width;
    const _textSizeBottom = (textSizeBottom / 100) * canvas.width;

    // Draw top text
    ctx.font = `bold ${_textSizeTop}px Impact`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const topLines = wrapText(ctx, textTop.toUpperCase(), 0, 0, canvas.width - (padding * 2), _textSizeTop);
    const topTextHeight = topLines.length * _textSizeTop;

    topLines.forEach((line, i) => {
      const y = padding + (i * _textSizeTop);
      // Draw text shadow
      ctx.strokeText(line, canvas.width / 2, y);
      ctx.fillText(line, canvas.width / 2, y);
    });

    // Draw bottom text
    ctx.font = `bold ${_textSizeBottom}px Impact`;
    ctx.textBaseline = 'bottom';

    const bottomLines = wrapText(ctx, textBottom.toUpperCase(), 0, 0, canvas.width - (padding * 2), _textSizeBottom);
    const bottomTextHeight = bottomLines.length * _textSizeBottom;

    bottomLines.forEach((line, i) => {
      const y = canvas.height - padding - ((bottomLines.length - 1 - i) * _textSizeBottom);
      // Draw text shadow
      ctx.strokeText(line, canvas.width / 2, y);
      ctx.fillText(line, canvas.width / 2, y);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImgUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    const img = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'My Meme';
    link.href = img;
    link.click();
  };

  const generateAICaption = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a super funny meme caption for: "${aiPrompt}". 
              Requirements:
              1. Make it extremely funny and relatable
              2. Include relevant emojis
              3. Keep it short and punchy
              4. Use internet slang and meme language
              5. If it's a two-part joke, split with a line break
              6. Make it viral-worthy
              
              Example format:
              "When you finally fix the bug 🐛
              But create 10 new ones 😅"
              
              Now generate a funny meme caption for: "${aiPrompt}"`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const caption = data.candidates[0].content.parts[0].text.trim();
      
      // Split the caption into top and bottom text if it contains a line break
      const [top, bottom] = caption.split('\n');
      if (bottom) {
        setTextTop(top.trim());
        setTextBottom(bottom.trim());
      } else {
        setTextTop(caption);
        setTextBottom("");
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      alert(`Failed to generate caption: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="meme-maker">
      <h1>Meme Generator</h1>
      <div className="meme-container">
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} className="fullwidth" />
        </div>

        <div className="controls">
          <div className="control-section">
            <h3>Source Image</h3>
            <div className="input-group">
              <div>
                <p>From URL</p>
                <input
                  type="text"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="Link to image"
                />
              </div>
              <div>
                <p>From Local Disk</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="imgFile"
                />
                <label htmlFor="imgFile" className="upload-btn">
                  Upload Image
                </label>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>Meme Text</h3>
            <div className="input-group">
              <div>
                <p>Top Text</p>
                <input
                  type="text"
                  value={textTop}
                  onChange={(e) => setTextTop(e.target.value)}
                  placeholder="Top text"
                />
              </div>
              <div>
                <p>Bottom Text</p>
                <input
                  type="text"
                  value={textBottom}
                  onChange={(e) => setTextBottom(e.target.value)}
                  placeholder="Bottom text"
                />
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>AI Caption Generator</h3>
            <div className="input-group">
              <div>
                <p>Enter a prompt for AI</p>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., meme about cats"
                />
                <button 
                  onClick={generateAICaption} 
                  className="ai-generate-btn"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Caption'}
                </button>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>Text Size</h3>
            <div className="input-group">
              <div>
                <p>Top Text: {textSizeTop}</p>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={textSizeTop}
                  onChange={(e) => setTextSizeTop(parseInt(e.target.value))}
                />
              </div>
              <div>
                <p>Bottom Text: {textSizeBottom}</p>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={textSizeBottom}
                  onChange={(e) => setTextSizeBottom(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>Export</h3>
            <p>Click the button below to download your meme</p>
            <button onClick={handleExport} className="export-btn">
              Export!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeMaker; 