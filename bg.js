// Background pixel-art renderer: stars, distant planets, lunar surface, day/night tint
(function(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const W = 1280, H = 800;
  const PIXEL = 2; // pixel scale (so we draw 2x2 blocks for chunkier feel)

  // Generate stars with seeded RNG
  function rng(seed){
    let s = seed;
    return ()=>{ s = (s*9301+49297) % 233280; return s/233280; };
  }
  const rand = rng(42);

  const stars = [];
  for(let i=0; i<260; i++){
    stars.push({
      x: Math.floor(rand()*W/PIXEL)*PIXEL,
      y: Math.floor(rand()*H*0.7/PIXEL)*PIXEL,
      size: rand()<0.85 ? 2 : (rand()<0.7 ? 4 : 6),
      phase: rand()*Math.PI*2,
      speed: 0.5 + rand()*2,
      color: ['#ffffff','#ffe066','#66e0ff','#ff99cc','#ffffff','#ffffff'][Math.floor(rand()*6)]
    });
  }

  // Sparkle "+" stars (4-pointed)
  const sparkles = [];
  for(let i=0; i<14; i++){
    sparkles.push({
      x: Math.floor(rand()*W/PIXEL)*PIXEL,
      y: Math.floor(rand()*H*0.65/PIXEL)*PIXEL,
      size: 8 + Math.floor(rand()*8),
      phase: rand()*Math.PI*2,
      color: ['#ffe066','#66e0ff','#ff99cc','#ffffff'][Math.floor(rand()*4)]
    });
  }

  // Distant pixel planets
  const planets = [
    { x: 140, y: 130, r: 38, c1:'#7a3d2a', c2:'#c66b3d', c3:'#3a1f15', type:'mars' },
    { x: 1080, y: 180, r: 56, c1:'#1f4a8a', c2:'#3a7cff', c3:'#0e2a5a', type:'gas' },
    { x: 970, y: 80, r: 18, c1:'#aa3333', c2:'#ff5555', c3:'#661111', type:'small' },
    { x: 320, y: 70, r: 14, c1:'#aaaaaa', c2:'#dddddd', c3:'#666666', type:'small' },
  ];

  // Galaxy / nebula swirl on left
  function drawGalaxy(cx, cy, t){
    ctx.save();
    for(let r=4; r<70; r+=4){
      for(let a=0; a<Math.PI*2; a+=0.25){
        const swirl = a + r*0.04 + t*0.05;
        const x = cx + Math.cos(swirl)*r;
        const y = cy + Math.sin(swirl)*r*0.7;
        const px = Math.floor(x/PIXEL)*PIXEL;
        const py = Math.floor(y/PIXEL)*PIXEL;
        const intensity = 1 - r/70;
        const hue = 260 + Math.sin(a*2)*30;
        ctx.fillStyle = `hsla(${hue}, 70%, ${50 + intensity*20}%, ${intensity*0.6})`;
        ctx.fillRect(px, py, PIXEL, PIXEL);
      }
    }
    // bright center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(cx/PIXEL)*PIXEL, Math.floor(cy/PIXEL)*PIXEL, PIXEL*2, PIXEL*2);
    ctx.restore();
  }

  function drawPlanet(p, t){
    const cx = p.x, cy = p.y, r = p.r;
    for(let dy=-r; dy<=r; dy+=PIXEL){
      for(let dx=-r; dx<=r; dx+=PIXEL){
        const d2 = dx*dx + dy*dy;
        if(d2 > r*r) continue;
        const d = Math.sqrt(d2)/r;
        // shading: light from top-left
        const light = (-dx*0.6 - dy*0.6)/r;
        let col;
        if(d > 0.92) col = p.c3;
        else if(light > 0.3) col = p.c2;
        else if(light > -0.1) col = p.c1;
        else col = p.c3;
        // surface noise
        const nx = Math.floor((dx+cx)/4), ny = Math.floor((dy+cy)/4);
        const n = ((nx*73 + ny*149) % 17)/17;
        if(p.type === 'gas' && n > 0.6 && Math.abs(dy) < r*0.7){
          col = p.c1;
        } else if(p.type === 'mars' && n > 0.7){
          col = p.c3;
        }
        ctx.fillStyle = col;
        ctx.fillRect(Math.floor((cx+dx)/PIXEL)*PIXEL, Math.floor((cy+dy)/PIXEL)*PIXEL, PIXEL, PIXEL);
      }
    }
    // rim highlight
    if(p.type !== 'small'){
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for(let a=Math.PI*1.1; a<Math.PI*1.4; a+=0.05){
        ctx.fillRect(Math.floor((cx+Math.cos(a)*r*0.9)/PIXEL)*PIXEL, Math.floor((cy+Math.sin(a)*r*0.9)/PIXEL)*PIXEL, PIXEL, PIXEL);
      }
    }
  }

  // Lunar surface — generated terrain
  const surfaceY = 560;
  const terrain = [];
  for(let x=0; x<W; x+=PIXEL){
    const h = Math.sin(x*0.005)*14 + Math.sin(x*0.013)*8 + Math.sin(x*0.03)*4;
    terrain.push(surfaceY + h);
  }
  // craters
  const craters = [];
  for(let i=0; i<8; i++){
    craters.push({ x: 80 + i*150 + rand()*60, y: surfaceY + 40 + rand()*120, r: 18 + rand()*30 });
  }
  // rocks/platforms
  const platforms = [
    { x: 200, y: 680, w: 90, h: 14 },
    { x: 460, y: 720, w: 120, h: 16 },
    { x: 760, y: 700, w: 80, h: 12 },
    { x: 1000, y: 730, w: 100, h: 14 },
  ];

  function drawSurface(tint){
    // base moon ground
    for(let x=0; x<W; x+=PIXEL){
      const ty = Math.floor(terrain[x/PIXEL]/PIXEL)*PIXEL;
      for(let y=ty; y<H; y+=PIXEL){
        const depth = (y - ty)/(H - ty);
        // layered moon palette
        let col;
        if(depth < 0.05) col = '#8a8aa8';
        else if(depth < 0.25) col = '#5a5a82';
        else if(depth < 0.55) col = '#3a3a62';
        else col = '#1f1f4a';
        // grain
        const n = ((x*7 + y*13) % 23)/23;
        if(n > 0.85 && depth < 0.4) col = '#aaaad0';
        if(n < 0.1 && depth < 0.3) col = '#2a2a52';
        // apply tint (night = bluer, day = goldish)
        ctx.fillStyle = tintColor(col, tint);
        ctx.fillRect(x, y, PIXEL, PIXEL);
      }
    }
    // craters
    for(const c of craters){
      for(let dy=-c.r; dy<=c.r; dy+=PIXEL){
        for(let dx=-c.r; dx<=c.r; dx+=PIXEL){
          const d2 = dx*dx + dy*dy;
          if(d2 > c.r*c.r) continue;
          const d = Math.sqrt(d2)/c.r;
          let col;
          if(d > 0.85) col = '#9a9ac0';   // rim highlight
          else if(d > 0.7) col = '#2a2a4a';
          else col = '#16162e';
          ctx.fillStyle = tintColor(col, tint);
          ctx.fillRect(Math.floor((c.x+dx)/PIXEL)*PIXEL, Math.floor((c.y+dy)/PIXEL)*PIXEL, PIXEL, PIXEL);
        }
      }
    }
    // floating rock platforms
    for(const p of platforms){
      for(let y=0; y<p.h; y+=PIXEL){
        for(let x=0; x<p.w; x+=PIXEL){
          const edge = (x<4 || x>p.w-4 || y<2);
          let col = edge ? '#6a6a8a' : '#3a3a5a';
          if(y > p.h-4) col = '#1a1a3a';
          ctx.fillStyle = tintColor(col, tint);
          ctx.fillRect(p.x+x, p.y+y, PIXEL, PIXEL);
        }
      }
    }
  }

  function tintColor(hex, tint){
    // tint: 0 = night (cooler), 1 = day (warmer)
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    let nr, ng, nb;
    if(tint < 0.5){
      // night: shift to blue/purple
      nr = Math.floor(r*0.85);
      ng = Math.floor(g*0.85);
      nb = Math.min(255, Math.floor(b*1.1));
    } else {
      // day: warmer
      nr = Math.min(255, Math.floor(r*1.15));
      ng = Math.min(255, Math.floor(g*1.05));
      nb = Math.floor(b*0.95);
    }
    return `rgb(${nr},${ng},${nb})`;
  }

  // Dust storm overlay particles
  const dustParticles = [];
  for(let i=0; i<120; i++){
    dustParticles.push({
      x: rand()*W, y: 100 + rand()*(H-100),
      vx: 1 + rand()*2,
      size: 2 + Math.floor(rand()*3)*PIXEL
    });
  }

  let storm = 0; // 0..1
  let dayPhase = 0; // 0..1 (0=night, 1=day)

  window.__lunergyBg = {
    setStorm: (v)=>{ storm = v; },
    setDay: (v)=>{ dayPhase = v; }
  };

  let t = 0;
  function draw(){
    t += 1;
    // sky base (lerps with day)
    const skyTop = dayPhase > 0.5 ? '#1a1a4a' : '#05030f';
    const skyBot = dayPhase > 0.5 ? '#2a2a6a' : '#0e0a2a';
    const grad = ctx.createLinearGradient(0,0,0,surfaceY);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,surfaceY+30);

    // nebula clouds
    ctx.save();
    ctx.globalAlpha = 0.4;
    drawGalaxy(180, 380, t);
    ctx.globalAlpha = 0.25;
    drawGalaxy(1150, 480, -t*0.5);
    ctx.restore();

    // stars
    for(const s of stars){
      const tw = 0.4 + 0.6*Math.abs(Math.sin(t*0.03*s.speed + s.phase));
      ctx.fillStyle = s.color;
      ctx.globalAlpha = tw * (dayPhase > 0.7 ? 0.3 : 1);
      if(s.size === 2){
        ctx.fillRect(s.x, s.y, 2, 2);
      } else if(s.size === 4){
        ctx.fillRect(s.x, s.y, 2, 2);
        ctx.fillRect(s.x-2, s.y, 2, 2); ctx.fillRect(s.x+2, s.y, 2, 2);
        ctx.fillRect(s.x, s.y-2, 2, 2); ctx.fillRect(s.x, s.y+2, 2, 2);
      } else {
        // bigger sparkle
        ctx.fillRect(s.x, s.y, 2, 2);
        for(let k=2; k<=4; k+=2){
          ctx.fillRect(s.x-k, s.y, 2, 2); ctx.fillRect(s.x+k, s.y, 2, 2);
          ctx.fillRect(s.x, s.y-k, 2, 2); ctx.fillRect(s.x, s.y+k, 2, 2);
        }
      }
    }
    ctx.globalAlpha = 1;

    // sparkles (+ shaped)
    for(const s of sparkles){
      const tw = 0.5 + 0.5*Math.sin(t*0.05 + s.phase);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = tw * (dayPhase > 0.7 ? 0.3 : 1);
      const r = Math.floor(s.size * tw);
      // cross
      ctx.fillRect(s.x-r, s.y, r*2+2, 2);
      ctx.fillRect(s.x, s.y-r, 2, r*2+2);
      // diagonal small
      const d = Math.floor(r*0.5);
      ctx.fillRect(s.x-d, s.y-d, 2, 2);
      ctx.fillRect(s.x+d, s.y-d, 2, 2);
      ctx.fillRect(s.x-d, s.y+d, 2, 2);
      ctx.fillRect(s.x+d, s.y+d, 2, 2);
    }
    ctx.globalAlpha = 1;

    // planets
    for(const p of planets) drawPlanet(p, t);

    // sun if day
    if(dayPhase > 0.5){
      const sx = 1180, sy = 80;
      // glow rings
      for(let r=60; r>0; r-=4){
        ctx.fillStyle = `rgba(255,220,80,${0.04 * (60-r)/60})`;
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI*2); ctx.fill();
      }
      // core
      for(let dy=-22; dy<=22; dy+=PIXEL){
        for(let dx=-22; dx<=22; dx+=PIXEL){
          if(dx*dx+dy*dy>22*22) continue;
          ctx.fillStyle = (dx*dx+dy*dy < 14*14) ? '#fff8cc' : '#ffdd55';
          ctx.fillRect(Math.floor((sx+dx)/PIXEL)*PIXEL, Math.floor((sy+dy)/PIXEL)*PIXEL, PIXEL, PIXEL);
        }
      }
    }

    // lunar surface
    drawSurface(dayPhase);

    // dust storm
    if(storm > 0.01){
      ctx.save();
      ctx.globalAlpha = 0.55 * storm;
      ctx.fillStyle = '#8a7050';
      for(const p of dustParticles){
        p.x += p.vx * (1 + storm);
        if(p.x > W+10) p.x = -10;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }
      // brown haze
      ctx.globalAlpha = 0.15 * storm;
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(0,0,W,H);
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();
