import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
console.log(process.env.REACT_APP_API_URL);


export default function LoginPage() {
  const [isOn, setIsOn]             = useState(false);
  const [form, setForm]             = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [nodding, setNodding]       = useState(false);
  const canvasRef = useRef(null);
  const { login } = useAuth();
  const navigate  = useNavigate();

  /* ── Stars ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 260; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.75;
        const r = Math.random() * 1.6 + 0.2;
        const a = Math.random() * 0.9 + 0.1;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  /* ── Eye tracking ── */
  useEffect(() => {
    if (!isOn) return;
    const move = (e) => {
      document.querySelectorAll('.lp-pupil').forEach((pupil, i) => {
        const eye = document.querySelectorAll('.lp-eyeball')[i];
        if (!eye) return;
        const r = eye.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const px = (dx / Math.max(dist,1)) * Math.min(dist/22,1) * 4;
        const py = (dy / Math.max(dist,1)) * Math.min(dist/22,1) * 4;
        pupil.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
        pupil.style.transition = 'transform .07s ease';
      });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [isOn]);

  /* ── Blinking ── */
  useEffect(() => {
    if (!isOn) return;
    let t;
    const blink = () => {
      document.querySelectorAll('.lp-lid').forEach(l => {
        l.style.transition = 'height .08s ease'; l.style.height = '100%'; l.style.bottom = '0';
        setTimeout(() => { l.style.transition = 'height .13s ease'; l.style.height = '0%'; l.style.bottom = '100%'; }, 110);
      });
      t = setTimeout(blink, 2000 + Math.random() * 4500);
    };
    t = setTimeout(blink, 3200);
    return () => clearTimeout(t);
  }, [isOn]);

  /* ── Toggle ── */
  const toggleLamp = () => {
    setIsOn(p => !p);
    setNodding(true);
    setTimeout(() => setNodding(false), 600);
    const cord = document.querySelector('.lp-cord');
    if (cord) {
      cord.style.transition = 'transform .12s ease';
      cord.style.transform  = 'translateX(9px) rotate(14deg)';
      setTimeout(() => { cord.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)'; cord.style.transform = ''; }, 140);
    }
  };

  /* ── Hover peek ── */
  const onEnter = () => {
    if (isOn) return;
    document.querySelectorAll('.lp-lid').forEach(l => { l.style.transition = 'height .28s ease,bottom .28s ease'; l.style.height = '52%'; l.style.bottom = '48%'; });
  };
  const onLeave = () => {
    if (isOn) return;
    document.querySelectorAll('.lp-lid').forEach(l => { l.style.transition = 'height .3s ease,bottom .3s ease'; l.style.height = '100%'; l.style.bottom = '0'; });
  };

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      setShowSuccess(true);
      setTimeout(() => navigate(user.role === 'admin' ? '/admin' : '/dashboard'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const fill = (email, pw) => setForm({ email, password: pw });

  return (
    <div style={{ fontFamily:'Nunito,sans-serif', background: isOn ? 'radial-gradient(ellipse 90% 80% at 38% 85%,#2a1848 0%,#160e2e 45%,#0a0712 100%)' : '#0a0712', minHeight:'100vh', overflow:'hidden', position:'relative', transition:'background 1.1s ease' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@500;600;700&display=swap');
        @keyframes headIdle{0%,100%{transform:rotate(0deg)}30%{transform:rotate(-2.5deg)}70%{transform:rotate(1.5deg)}}
        @keyframes headNod{0%{transform:rotate(0deg) translateY(0)}40%{transform:rotate(-12deg) translateY(-6px)}70%{transform:rotate(4deg) translateY(0)}100%{transform:rotate(0deg) translateY(0)}}
        @keyframes icoBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-5px) rotate(5deg)}}
        @keyframes barMove{0%{background-position:0% 0%}100%{background-position:200% 0%}}
        @keyframes btnShine{0%{left:-100%}40%{left:160%}100%{left:160%}}
        @keyframes poolAnim{0%,100%{opacity:1}50%{opacity:.75}}
        @keyframes labPulse{0%,100%{opacity:.45}50%{opacity:1}}
        @keyframes moteMoveUp{0%{opacity:0;transform:translate(0,0)}18%{opacity:.7}82%{opacity:.3}100%{opacity:0;transform:translate(var(--mx,12px),var(--my,-110px))}}
        @keyframes bulbFlick{0%,100%{opacity:1}91%{opacity:1}92%{opacity:.7}93%{opacity:1}97%{opacity:.85}98%{opacity:1}}
        .lp-lamp-head{animation:headIdle 5s ease-in-out infinite;transform-origin:bottom center}
        .lp-lamp-head.nod{animation:headNod .5s cubic-bezier(.34,1.56,.64,1) forwards}
        .lp-card-icon{animation:icoBob 4s ease-in-out infinite}
        .lp-card-bar{animation:barMove 4s linear infinite;background:linear-gradient(90deg,#f59e0b,#d97706,#b45309,#d97706,#f59e0b);background-size:200% 100%}
        .lp-btn-shine::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:skewX(-20deg);animation:btnShine 3.5s ease-in-out infinite 2s}
        .lp-login-btn:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(180,83,9,.55)}
        .lp-hint{animation:labPulse 2.5s ease-in-out infinite}
        .lp-mote{animation:moteMoveUp var(--md,7s) ease-in-out infinite var(--mde,0s)}
        .lp-bulb-on{animation:bulbFlick 8s ease-in-out infinite 1.5s}
        .lp-pool-on{animation:poolAnim 5s ease-in-out infinite}
        input[type=email],input[type=password],input[type=text]{transition:border-color .2s,box-shadow .2s,background .2s}
        input:focus{border-color:#d97706 !important;background:#fffbeb !important;box-shadow:0 0 0 3.5px rgba(217,119,6,.16) !important;outline:none}
      `}</style>

      {/* Stars canvas */}
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity: isOn ? 0.22 : 1, transition:'opacity 1.2s' }} />

      {/* Wall glow */}
      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', background: isOn ? 'radial-gradient(ellipse 65% 60% at 28% 72%,rgba(255,185,50,.16) 0%,rgba(255,130,20,.06) 50%,transparent 100%)' : 'none', transition:'background 1.3s' }} />

      {/* Floor */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, height:'36vh', zIndex:2, pointerEvents:'none', background: isOn ? 'linear-gradient(180deg,#18102e,#0c0818)' : 'linear-gradient(180deg,#0d0a1c,#070510)', transition:'background 1.1s' }} />

      {/* Floor glow */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, height:'36vh', zIndex:3, pointerEvents:'none', background: isOn ? 'radial-gradient(ellipse 55% 45% at 28% 5%,rgba(255,185,50,.18) 0%,rgba(255,140,20,.06) 55%,transparent 100%)' : 'none', transition:'background 1.3s' }} />

      {/* Dust motes */}
      {isOn && [
        {w:3,b:'58%',l:'20%',d:'7s',de:'.2s',mx:'22px',my:'-115px'},
        {w:4,b:'54%',l:'25%',d:'9s',de:'1.4s',mx:'-18px',my:'-130px',c:'rgba(255,220,80,.6)'},
        {w:2,b:'60%',l:'18%',d:'6s',de:'.9s',mx:'32px',my:'-95px'},
        {w:3,b:'52%',l:'28%',d:'8s',de:'2.1s',mx:'-25px',my:'-120px',c:'rgba(255,180,50,.7)'},
      ].map((m,i) => (
        <div key={i} className="lp-mote" style={{ position:'fixed', borderRadius:'50%', pointerEvents:'none', zIndex:9, width:m.w, height:m.w, bottom:m.b, left:m.l, background:m.c||'rgba(255,200,70,.7)', '--md':m.d, '--mde':m.de, '--mx':m.mx, '--my':m.my }} />
      ))}

      {/* Desk */}
      <div style={{ position:'fixed', bottom:'calc(36vh - 20px)', left:'50%', transform:'translateX(-50%)', width:360, zIndex:10, pointerEvents:'none' }}>
        <div style={{ height:26, background:'linear-gradient(180deg,#3e2c12,#2a1e0a 55%,#1e1608)', borderRadius:'6px 6px 0 0', boxShadow: isOn ? '0 -3px 12px rgba(0,0,0,.5),inset 0 2px 0 rgba(255,200,80,.2),inset 0 -2px 0 rgba(0,0,0,.4),0 0 70px rgba(255,180,50,.14)' : '0 -3px 12px rgba(0,0,0,.65),inset 0 2px 0 rgba(255,200,80,.1),inset 0 -2px 0 rgba(0,0,0,.4)', transition:'box-shadow 1.1s', position:'relative', overflow:'hidden' }}>
          <div className={isOn ? 'lp-pool-on' : ''} style={{ position:'absolute', top:0, left:20, width:200, height:'100%', background: isOn ? 'radial-gradient(ellipse,rgba(255,200,60,.32) 0%,rgba(255,180,40,.1) 55%,transparent 100%)' : 'none', transition:'background 1.3s' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'0 24px' }}>
          {[0,1].map(i => <div key={i} style={{ width:14, height:68, background:'linear-gradient(180deg,#2a1e0a,#180e04)', borderRadius:'0 0 4px 4px', boxShadow:'1px 0 4px rgba(0,0,0,.4)' }} />)}
        </div>
      </div>

      {/* Light cone */}
      <svg style={{ position:'fixed', zIndex:8, pointerEvents:'none', opacity: isOn?1:0, transition:'opacity 1.2s ease', bottom:'calc(36vh + 20px)', left:'calc(50% - 258px)' }} width="300" height="280" viewBox="0 0 300 280">
        <defs>
          <radialGradient id="lcg" cx="17%" cy="0%" r="90%">
            <stop offset="0%"   stopColor="rgba(255,200,60,.24)" />
            <stop offset="55%"  stopColor="rgba(255,180,40,.06)" />
            <stop offset="100%" stopColor="rgba(255,160,20,0)" />
          </radialGradient>
        </defs>
        <polygon points="38,0 62,0 300,280 -80,280" fill="url(#lcg)" />
      </svg>

      {/* ══════ LAMP ══════ */}
      <div style={{ position:'fixed', bottom:'calc(36vh + 6px)', left:'calc(50% - 155px)', zIndex:30, display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', userSelect:'none' }}
        onClick={toggleLamp} onMouseEnter={onEnter} onMouseLeave={onLeave}>

        {/* Pull cord */}
        <div style={{ position:'absolute', right:-20, top:15, display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', zIndex:15 }}
          onClick={e => { e.stopPropagation(); toggleLamp(); }}>
          <div className="lp-cord" style={{ width:2.5, height:58, background:'linear-gradient(180deg,#9a7840,#6a5020)', borderRadius:2, transition:'transform .2s ease' }} />
          <div style={{ width:13, height:13, background:'radial-gradient(circle at 35% 35%,#d4a040,#7a5018)', borderRadius:'50%', marginTop:-2, boxShadow:'0 2px 6px rgba(0,0,0,.55)' }} />
          <div className={!isOn ? 'lp-hint' : ''} style={{ fontSize:9, fontFamily:'Quicksand,sans-serif', fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', color: isOn ? 'transparent' : 'rgba(255,200,100,.45)', marginTop:5, whiteSpace:'nowrap', transition:'color .4s' }}>pull</div>
        </div>

        {/* Lamp head */}
        <div className={`lp-lamp-head${nodding?' nod':''}`}>

          {/* Top ring */}
          <div style={{ width:52, height:14, background:'linear-gradient(180deg,#5a3c18,#7a5428)', borderRadius:'50%', boxShadow:'0 3px 8px rgba(0,0,0,.55),inset 0 2px 0 rgba(255,200,80,.22),inset 0 -2px 0 rgba(0,0,0,.4)', position:'relative', zIndex:4 }} />

          {/* Shade body */}
          <div style={{ position:'relative', marginTop:-4 }}>

            {/* Bulb */}
            <div className={isOn ? 'lp-bulb-on' : ''} style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', width:32, height:32, borderRadius:'50%', background:'radial-gradient(circle,#fffde0 0%,#ffe060 40%,#ffb830 70%,transparent 100%)', opacity: isOn?1:0, zIndex:6, pointerEvents:'none', boxShadow: isOn?'0 0 28px 14px rgba(255,200,50,.6),0 0 60px 30px rgba(255,160,20,.3)':'none', transition:'opacity .9s,box-shadow .9s' }} />

            {/* Shade SVG */}
            <svg width="120" height="85" viewBox="0 0 120 85" style={{ display:'block', overflow:'visible' }}>
              <defs>
                <linearGradient id="lsg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6a3e0e"/><stop offset="18%" stopColor="#c07820"/>
                  <stop offset="42%" stopColor="#e89830"/><stop offset="58%" stopColor="#d08025"/>
                  <stop offset="82%" stopColor="#9a5c12"/><stop offset="100%" stopColor="#4e3008"/>
                </linearGradient>
                <radialGradient id="lig" cx="50%" cy="25%" r="65%">
                  <stop offset="0%" stopColor="rgba(255,230,100,.38)"/>
                  <stop offset="100%" stopColor="rgba(255,200,50,0)"/>
                </radialGradient>
                <clipPath id="lsc"><polygon points="18,0 102,0 120,83 0,83"/></clipPath>
              </defs>
              <polygon points="18,0 102,0 120,83 0,83" fill="url(#lsg)"/>
              <g clipPath="url(#lsc)" opacity=".1">
                <line x1="10" y1="0" x2="-2" y2="83" stroke="#000" strokeWidth="9"/>
                <line x1="28" y1="0" x2="16" y2="83" stroke="#000" strokeWidth="7"/>
                <line x1="50" y1="0" x2="42" y2="83" stroke="#000" strokeWidth="6"/>
                <line x1="72" y1="0" x2="68" y2="83" stroke="#000" strokeWidth="6"/>
                <line x1="92" y1="0" x2="94" y2="83" stroke="#000" strokeWidth="7"/>
                <line x1="110" y1="0" x2="116" y2="83" stroke="#000" strokeWidth="8"/>
              </g>
              <polygon points="18,0 46,0 36,83 0,83" fill="rgba(255,220,100,.07)"/>
              <polygon points="18,0 102,0 120,83 0,83" fill="url(#lig)" style={{ opacity: isOn?1:0, transition:'opacity 1s ease' }}/>
            </svg>

            {/* Eyes */}
            <div style={{ position:'absolute', top:22, left:'50%', transform:'translateX(-50%)', display:'flex', gap:18, zIndex:10, pointerEvents:'none' }}>
              {['L','R'].map(side => (
                <div key={side} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  {/* Brow */}
                  <div style={{ width:22, height:4, background:'#5a3810', borderRadius:4, marginBottom:4, transition:'transform .4s ease', transform: isOn ? (side==='L'?'rotate(-16deg) translateY(-2px)':'rotate(16deg) translateY(-2px)') : (side==='L'?'rotate(-5deg)':'rotate(5deg)') }} />
                  {/* Eyeball */}
                  <div className="lp-eyeball" style={{ width:26, height:26, background:'#fef6d8', borderRadius:'50%', position:'relative', overflow:'hidden', border:'2.5px solid rgba(120,70,10,.35)', boxShadow:'inset 0 2px 6px rgba(0,0,0,.28),0 2px 5px rgba(0,0,0,.3)' }}>
                    {/* Lid */}
                    <div className="lp-lid" style={{ position:'absolute', left:0, right:0, bottom: isOn?'100%':'0', height: isOn?'0%':'100%', background:'linear-gradient(180deg,#6a4820,#3e2810)', borderRadius:'50%', zIndex:3, transition:'height .42s cubic-bezier(.4,0,.2,1),bottom .42s' }}>
                      <div style={{ position:'absolute', top:5, left:'50%', transform:'translateX(-50%)', width:16, height:2.5, background:'rgba(255,190,60,.45)', borderRadius:2, boxShadow:'0 5px 0 rgba(255,190,60,.25),0 10px 0 rgba(255,190,60,.12)' }} />
                    </div>
                    {/* Iris + pupil */}
                    <div style={{ position:'absolute', width:16, height:16, borderRadius:'50%', background:'radial-gradient(circle at 36% 30%,#93c5fd,#2563ab 55%,#1e3a8a)', top:'50%', left:'50%', transform: isOn?'translate(-50%,-50%) scale(1)':'translate(-50%,-50%) scale(0)', transition:'transform .5s cubic-bezier(.34,1.56,.64,1) .28s', boxShadow:'inset 0 1px 4px rgba(0,0,0,.45)', zIndex:2 }}>
                      <div className="lp-pupil" style={{ position:'absolute', width:7, height:7, borderRadius:'50%', background:'#06111f', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:3 }} />
                    </div>
                    {/* Shine */}
                    <div style={{ position:'absolute', width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,.92)', top:3, left:3, opacity:isOn?1:0, zIndex:4, transition:'opacity .4s .5s' }} />
                    <div style={{ position:'absolute', width:3, height:3, borderRadius:'50%', background:'rgba(255,255,255,.5)', bottom:3, right:3, opacity:isOn?1:0, zIndex:4, transition:'opacity .4s .55s' }} />
                    {/* Blush */}
                    <div style={{ position:'absolute', bottom:-1, left:-4, width:11, height:5, borderRadius:'50%', background:isOn?'rgba(255,110,110,.42)':'transparent', transition:'background .5s .38s' }} />
                    <div style={{ position:'absolute', bottom:-1, right:-4, width:11, height:5, borderRadius:'50%', background:isOn?'rgba(255,110,110,.42)':'transparent', transition:'background .5s .38s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Mouth */}
            <div style={{ position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)', zIndex:10, pointerEvents:'none' }}>
              <svg style={{ opacity:isOn?0:1, transition:'opacity .3s', display:'block' }} width="26" height="10" viewBox="0 0 26 10">
                <path d="M2 8 Q13 2 24 8" stroke="#8a5c18" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              </svg>
              <svg style={{ position:'absolute', top:0, left:0, opacity:isOn?1:0, transition:'opacity .4s .45s' }} width="30" height="14" viewBox="0 0 30 14">
                <path d="M3 3 Q15 13 27 3" stroke="#8a5c18" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <path d="M7 5 Q15 12 23 5 Q23 9 15 10.5 Q7 9 7 5Z" fill="rgba(255,248,220,.45)"/>
              </svg>
            </div>
          </div>

          {/* Shade rim */}
          <div style={{ width:120, height:14, background:'linear-gradient(180deg,#7a5020,#4e3010)', borderRadius:'0 0 12px 12px', marginTop:-5, zIndex:5, boxShadow:'0 5px 14px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,200,80,.18)' }} />
        </div>

        {/* Stick */}
        <div style={{ width:16, height:55, background:'linear-gradient(90deg,#2e1c08 0%,#7a5418 14%,#d4a040 32%,#f0c868 50%,#d4a040 68%,#7a5418 84%,#2e1c08 100%)', borderRadius:8, boxShadow:'2px 0 8px rgba(0,0,0,.5),-1px 0 4px rgba(0,0,0,.25)' }} />

        {/* Base */}
        <div style={{ width:90, height:20, background:'linear-gradient(180deg,#5a3e18,#3a2810 55%,#2a1c08)', borderRadius:12, boxShadow:'0 5px 16px rgba(0,0,0,.7),inset 0 2px 0 rgba(255,200,80,.2),inset 0 -2px 0 rgba(0,0,0,.5)' }} />
      </div>

      {/* Hint */}
      {!isOn && (
        <div style={{ position:'fixed', bottom:'calc(36vh + 120px)', left:'calc(50% - 155px)', zIndex:40, pointerEvents:'none', textAlign:'center' }}>
          <div className="lp-hint" style={{ fontSize:12, color:'rgba(255,200,100,.5)', fontFamily:'Quicksand,sans-serif', fontWeight:700, letterSpacing:'1px' }}>
            Click the lamp ✨
          </div>
        </div>
      )}

      {/* ══════ LOGIN CARD ══════ */}
      <div style={{ position:'fixed', top:'50%', right:'7vw', transform: isOn ? 'translateY(-50%) scale(1) translateX(0)' : 'translateY(-52%) scale(.88) translateX(30px)', opacity: isOn?1:0, pointerEvents: isOn?'all':'none', transition:'opacity .7s cubic-bezier(.4,0,.2,1) .32s,transform .7s cubic-bezier(.34,1.3,.64,1) .32s', zIndex:50, width:340 }}>

        <div style={{ background:'linear-gradient(148deg,#fffef7,#fff8e0)', borderRadius:22, padding:'30px 28px 26px', boxShadow:'0 0 0 1.5px rgba(220,170,60,.3),0 40px 90px rgba(0,0,0,.78),0 0 55px rgba(255,185,50,.18),inset 0 1px 0 rgba(255,255,255,.95)', position:'relative', overflow:'hidden' }}>

          {/* Animated bar */}
          <div className="lp-card-bar" style={{ position:'absolute', top:0, left:0, right:0, height:5, borderRadius:'22px 22px 0 0' }} />

          {/* Icon */}
          <div className="lp-card-icon" style={{ width:52, height:52, background:'linear-gradient(135deg,#fde68a,#f59e0b)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 13px', boxShadow:'0 6px 20px rgba(245,158,11,.45)' }}>🪔</div>

          <div style={{ fontFamily:'Quicksand,sans-serif', fontSize:23, fontWeight:700, color:'#1a0e00', textAlign:'center', marginBottom:3 }}>Welcome Back</div>
          <div style={{ fontSize:10.5, color:'#9a6830', textAlign:'center', letterSpacing:'1.3px', textTransform:'uppercase', fontWeight:700, marginBottom:18 }}>✦ sign in to continue ✦</div>

          {/* Demo */}
          <div style={{ background:'rgba(255,235,150,.35)', border:'1.5px dashed rgba(217,119,6,.35)', borderRadius:10, padding:'10px 12px', marginBottom:14 }}>
            <div style={{ fontSize:9.5, color:'#7a4c18', fontWeight:800, textTransform:'uppercase', letterSpacing:'.8px', marginBottom:8 }}>⚡ Quick Demo</div>
            <div style={{ display:'flex', gap:8 }}>
              {[['🛡️ Admin','admin@library.com','admin123'],['🎓 Student','arjun@student.com','student123']].map(([l,e,p]) => (
                <button key={l} onClick={() => fill(e,p)} style={{ flex:1, padding:'7px 6px', background:'rgba(255,248,210,.9)', border:'1.5px solid rgba(210,160,50,.5)', borderRadius:9, cursor:'pointer', fontSize:11.5, fontWeight:700, color:'#7a4c18', fontFamily:'Nunito,sans-serif' }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <div style={{ background:'rgba(239,68,68,.1)', border:'1.5px solid rgba(239,68,68,.28)', borderRadius:9, padding:'9px 12px', marginBottom:12, fontSize:12.5, color:'#b91c1c', fontWeight:600 }}>⚠️ {error}</div>}

          <form onSubmit={handleLogin}>
            {/* Email field */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:9.5, fontWeight:800, color:'#7a4c18', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:4 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required
                  style={{ width:'100%', padding:'10px 36px 10px 13px', background:'rgba(255,248,210,.75)', border:'1.5px solid rgba(210,160,50,.38)', borderRadius:11, fontSize:13, fontFamily:'Nunito,sans-serif', color:'#1a0e00' }} />
                <span style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', fontSize:15, opacity:.45, pointerEvents:'none' }}>✉️</span>
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:9.5, fontWeight:800, color:'#7a4c18', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:4 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPwd?'text':'password'} placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required
                  style={{ width:'100%', padding:'10px 36px 10px 13px', background:'rgba(255,248,210,.75)', border:'1.5px solid rgba(210,160,50,.38)', borderRadius:11, fontSize:13, fontFamily:'Nunito,sans-serif', color:'#1a0e00' }} />
                <span onClick={()=>setShowPwd(p=>!p)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', fontSize:15, opacity:.5, cursor:'pointer' }}>👁️</span>
              </div>
            </div>

            {/* Extras */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'6px 0 14px' }}>
              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:'#7a4c18', fontWeight:600, cursor:'pointer' }}>
                <input type="checkbox" style={{ width:14, height:14, accentColor:'#d97706', cursor:'pointer' }}/> Remember me
              </label>
              <a 
                href="/forgot-password" 
                style={{ fontSize:11.5, color:'#b45309', fontWeight:700, textDecoration:'none' }}
              >
                Forgot password?
              </a>
             </div>

            {/* Login button */}
            <button type="submit" disabled={loading} className="lp-login-btn lp-btn-shine"
              style={{ width:'100%', padding:13, background:'linear-gradient(135deg,#f59e0b,#d97706,#b45309)', border:'none', borderRadius:13, color:'#fff9e0', fontFamily:'Quicksand,sans-serif', fontSize:15, fontWeight:700, letterSpacing:'.3px', cursor:'pointer', boxShadow:'0 6px 25px rgba(180,83,9,.48)', position:'relative', overflow:'hidden', transition:'transform .2s,box-shadow .2s' }}>
              {loading ? '⏳ Signing in…' : 'Sign In ✦'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'14px 0 11px' }}>
            <div style={{ flex:1, height:1, background:'rgba(180,120,40,.22)' }}/>
            <span style={{ fontSize:11, color:'#9a7040', fontWeight:700, letterSpacing:'.5px' }}>or continue with</span>
            <div style={{ flex:1, height:1, background:'rgba(180,120,40,.22)' }}/>
          </div>

          <div style={{ display:'flex', justifyContent:'center', gap:5, fontSize:12, color:'#7a5020' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#b45309', fontWeight:700, textDecoration:'none' }}>Sign up</Link>
          </div>

          {/* Success overlay */}
          {showSuccess && (
            <div style={{ position:'absolute', inset:0, borderRadius:22, background:'linear-gradient(145deg,#d97706,#7c2d12)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:20, animation:'fadeIn .4s ease' }}>
              <div style={{ fontSize:52, marginBottom:10 }}>🌟</div>
              <div style={{ fontFamily:'Quicksand,sans-serif', fontSize:23, color:'#fff9e0', fontWeight:700 }}>Welcome!</div>
              <div style={{ fontSize:13, color:'rgba(255,248,220,.65)', marginTop:6 }}>Signed in successfully</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
