import React, { useEffect, useRef } from 'react';

const HAPPY = ['#E8C547','#4ECDC4','#FF6B8A','#F5DC7A','#2BA8A0','#9B59B6','#E8C547','#ffffff'];
const SAD   = ['😢','💧','😔','🥺','💦','😿'];

function rand(a,b){ return a + Math.random()*(b-a); }

export default function Confetti({ active, sad=false, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    const pieces = [];
    const count = sad ? 28 : 100;
    for (let i=0; i<count; i++) {
      const el = document.createElement('div');
      const delay = rand(0, 0.8);
      const dur   = sad ? rand(1.8,3.5) : rand(1.6,3.8);
      if (sad) {
        el.className = 'sad-piece';
        el.textContent = SAD[Math.floor(Math.random()*SAD.length)];
        el.style.cssText = `left:${rand(0,100)}vw;top:-50px;font-size:${rand(22,42)}px;animation-duration:${dur}s;animation-delay:${delay}s;`;
      } else {
        el.className = 'confetti-piece';
        const size = rand(7,15);
        const isCircle = Math.random()>0.45;
        el.style.cssText = `left:${rand(2,98)}vw;top:-20px;width:${size}px;height:${isCircle?size:rand(5,11)}px;background:${HAPPY[Math.floor(Math.random()*HAPPY.length)]};border-radius:${isCircle?'50%':'2px'};animation-duration:${dur}s;animation-delay:${delay}s;`;
      }
      container.appendChild(el);
      pieces.push(el);
    }
    const t = setTimeout(()=>{ pieces.forEach(p=>p.remove()); if(onDone) onDone(); }, 5000);
    return ()=>{ clearTimeout(t); pieces.forEach(p=>p.remove()); };
  }, [active, sad, onDone]);
  return <div ref={ref} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:9999}}/>;
}
