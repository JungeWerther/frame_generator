import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'

import { handle } from 'frog/vercel'
import { createCanvas, CanvasRenderingContext2D } from 'canvas'
import { put } from "@vercel/blob";
import { v4 } from 'uuid'
import { colors } from '../lib/colors.js'


import dotenv from 'dotenv';
dotenv.config();

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }


function pickColor() {
  const paletteIndex = Math.floor(Math.random() * colors.length);
  return colors[paletteIndex];
}

function randomShapes(
  ctx: CanvasRenderingContext2D, 
  palette: string[], 
  width: number, 
  height: number) {
  
  for (let i = 0; i < 20; i++) {

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2); // Start from the center

    const shape = Math.floor(Math.random() * 3);
    const color = palette[Math.floor(Math.random() * 5)]
    
    ctx.fillStyle = color;
  
    switch (shape) {
      case 0: // Draw a rectangle
        const rx = Math.random() * width;
        const ry = Math.random() * height;
        const rw = Math.random() * width / 5;
        const rh = Math.random() * height / 5;
        ctx.fillRect(rx, ry, rw, rh);
        break;
      case 1: // Draw a circle
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        const r = Math.random() * width / 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
        ctx.fill();
        break;
      case 2: // Draw a line
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2); // Start from the center
        
        ctx.lineWidth = Math.random() * 5 + 1; // Random line width between 1 and 6

        const x = Math.random() * width;
        const y = Math.random() * height;
     
          const cp1x = (width / 2) + Math.random() * width;
          const cp1y = (height / 2) + Math.random() * height;
          const cp2x = (width / 2) + Math.random() * width;
          const cp2y = (height / 2) + Math.random() * height;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        
          ctx.stroke();

        ctx.lineWidth = 1;

        
        break;
    }
  }
}

async function create() {
  // pick a random color palette

  const palette = pickColor();



const width = 764;
const height = 400;

const canvas = createCanvas(width, height) 
const context = canvas.getContext("2d");
context.fillStyle = palette[4];
context.fillRect(0, 0, width, height);

randomShapes(context, palette, width, height);

const buffer = canvas.toBuffer("image/png");

const id = v4()
const { url } = await put('images/' + id + '.png', buffer, { 
  access: 'public',
});
return url
}


export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', async (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
  const url = await create()

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: `url(${url ? url : 'https://h5gag6g8fqym9yjl.public.blob.vercel-storage.com/images/0aec1648-73d4-4892-8177-5e41dd3e4d10-ixfQSFT3krgGxdvbwooXWmntDYUQsi.png'})`,
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'black',
            fontSize: 60,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            fontStyle: 'bold',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {status === 'response'
            ? `Thanks for clooonking 🎩` : ''}
        </div>
      </div>
    ),
    intents: [
      <Button value="bananas">clink clonk click me 🧙‍♂️</Button>,
    ],
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
