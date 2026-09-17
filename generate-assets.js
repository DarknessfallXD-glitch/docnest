const { createCanvas } = require('canvas');

// icon.png - 512x512
const iconCanvas = createCanvas(512, 512);
const iconCtx = iconCanvas.getContext('2d');
iconCtx.fillStyle = '#0EA5E9';
iconCtx.fillRect(0, 0, 512, 512);
iconCtx.fillStyle = '#FFFFFF';
iconCtx.font = 'bold 200px Arial';
iconCtx.textAlign = 'center';
iconCtx.textBaseline = 'middle';
iconCtx.fillText('📄', 256, 280);
require('fs').writeFileSync('assets/icon.png', iconCanvas.toBuffer('image/png'));

// adaptive-icon.png - 1024x1024
const adaptiveCanvas = createCanvas(1024, 1024);
const adaptiveCtx = adaptiveCanvas.getContext('2d');
adaptiveCtx.fillStyle = '#0EA5E9';
adaptiveCtx.fillRect(0, 0, 1024, 1024);
adaptiveCtx.fillStyle = '#FFFFFF';
adaptiveCtx.font = 'bold 400px Arial';
adaptiveCtx.textAlign = 'center';
adaptiveCtx.textBaseline = 'middle';
adaptiveCtx.fillText('📄', 512, 560);
require('fs').writeFileSync('assets/adaptive-icon.png', adaptiveCanvas.toBuffer('image/png'));

// splash.png - 1242x2436
const splashCanvas = createCanvas(1242, 2436);
const splashCtx = splashCanvas.getContext('2d');
splashCtx.fillStyle = '#FFFFFF';
splashCtx.fillRect(0, 0, 1242, 2436);
splashCtx.fillStyle = '#0EA5E9';
splashCtx.font = 'bold 120px Arial';
splashCtx.textAlign = 'center';
splashCtx.textBaseline = 'middle';
splashCtx.fillText('DocNest', 621, 1218);
require('fs').writeFileSync('assets/splash.png', splashCanvas.toBuffer('image/png'));

// favicon.png - 32x32
const favCanvas = createCanvas(32, 32);
const favCtx = favCanvas.getContext('2d');
favCtx.fillStyle = '#0EA5E9';
favCtx.fillRect(0, 0, 32, 32);
favCtx.fillStyle = '#FFFFFF';
favCtx.font = 'bold 16px Arial';
favCtx.textAlign = 'center';
favCtx.textBaseline = 'middle';
favCtx.fillText('📄', 16, 22);
require('fs').writeFileSync('assets/favicon.png', favCanvas.toBuffer('image/png'));

console.log('Assets generated successfully!');