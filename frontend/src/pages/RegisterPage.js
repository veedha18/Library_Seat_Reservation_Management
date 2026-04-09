import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({name:'',email:'',password:'',confirmPassword:'',role:'student'});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password!==form.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (form.password.length<6) { toast.error('Min. 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form.name,form.email,form.password,form.role);
      toast.success(`Welcome, ${user.name.split(' ')[0]}! 🎉`);
      navigate(user.role==='admin'?'/admin':'/dashboard');
    } catch(err){ toast.error(err.response?.data?.message||'Registration failed'); }
    finally{ setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes starDrift{0%,100%{transform:translateY(0) rotate(0deg);opacity:0.6}50%{transform:translateY(-20px) rotate(180deg);opacity:1}}
        @keyframes bgShimmer{0%,100%{opacity:0.4}50%{opacity:0.7}}
        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:24px;background:#080F20;}
        .auth-stars{position:fixed;inset:0;pointer-events:none;z-index:0;}
        .auth-star{position:absolute;color:#E8C547;animation:starDrift linear infinite;}
        .auth-nebula{position:fixed;inset:0;pointer-events:none;z-index:0;}
        .auth-nebula-blob{position:absolute;border-radius:50%;filter:blur(80px);}
        .auth-card{position:relative;z-index:1;background:rgba(13,27,53,0.93);backdrop-filter:blur(24px);border-radius:22px;padding:40px 44px;width:100%;max-width:460px;border:1px solid #1C2F55;box-shadow:0 24px 64px rgba(0,0,0,0.7);}
        .auth-logo{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:24px;}
        .auth-logo-icon{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#4ECDC4,#2BA8A0);display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:0 8px 28px rgba(78,205,196,0.35);animation:float 3.5s ease-in-out infinite;}
        .auth-logo-text{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#E8E0D0;}
        .auth-logo-text span{color:#E8C547;font-style:italic;}
        .auth-tagline{font-size:13px;color:#7A8BAD;text-align:center;margin-bottom:28px;}
        .auth-input-group{position:relative;margin-bottom:16px;}
        .auth-input-label{display:block;font-size:11px;font-weight:700;color:#7A8BAD;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;}
        .auth-input-icon{position:absolute;left:14px;top:36px;font-size:15px;pointer-events:none;}
        .auth-input{width:100%;padding:11px 16px 11px 42px;border-radius:8px;border:1.5px solid #1C2F55;background:#142444;font-size:14px;color:#E8E0D0;transition:all 0.22s;outline:none;font-family:'Plus Jakarta Sans',sans-serif;}
        .auth-input:focus{border-color:#E8C547;box-shadow:0 0 0 3px rgba(232,197,71,0.1);background:#1C2F55;}
        .auth-input::placeholder{color:#3D4F6E;}
        .auth-submit{width:100%;padding:13px;border-radius:999px;background:linear-gradient(135deg,#E8C547,#B8960A);color:#080F20;font-size:15px;font-weight:700;border:none;cursor:pointer;transition:all 0.22s;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;}
        .auth-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(232,197,71,0.4);}
        .auth-submit:disabled{opacity:0.5;cursor:not-allowed;}
        .auth-role-label{font-size:11px;font-weight:700;color:#7A8BAD;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;display:block;}
        .role-selector{display:flex;gap:10px;margin-bottom:18px;}
        .role-btn{flex:1;padding:10px 12px;border-radius:8px;font-size:13px;font-weight:600;background:#0D1B35;border:1.5px solid #1C2F55;color:#7A8BAD;cursor:pointer;transition:all 0.22s;font-family:'Plus Jakarta Sans',sans-serif;}
        .role-btn.active{background:rgba(232,197,71,0.08);border-color:#E8C547;color:#E8C547;}
        .auth-footer{text-align:center;margin-top:20px;color:#7A8BAD;font-size:13px;}
        .auth-link{color:#E8C547;font-weight:600;}
        .auth-link:hover{text-decoration:underline;}
      `}</style>

      <div className="auth-page">
        <div className="auth-stars">
          {['✦','✧','⋆','✦','★','✧','⋆','✦','✧','✦'].map((s,i)=>(
            <span key={i} className="auth-star" style={{left:`${8+i*9}%`,top:`${10+((i*17)%75)}%`,fontSize:`${9+((i*5)%12)}px`,opacity:0.35,animationDuration:`${3+i*0.9}s`,animationDelay:`${i*0.5}s`}}>{s}</span>
          ))}
        </div>
        <div className="auth-nebula">
          <div className="auth-nebula-blob" style={{width:450,height:450,background:'radial-gradient(circle,rgba(28,47,85,0.65),transparent)',top:-120,left:-120}}/>
          <div className="auth-nebula-blob" style={{width:350,height:350,background:'radial-gradient(circle,rgba(36,54,104,0.5),transparent)',bottom:-80,right:-80}}/>
        </div>

        <div className="auth-card animate-scaleIn">
          <div className="auth-logo">
            <div className="auth-logo-icon">🎓</div>
            <div className="auth-logo-text">Library<span>Nest</span></div>
          </div>
          <p className="auth-tagline">Join thousands of readers today ✦</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-input-label">Full Name</label>
              <span className="auth-input-icon">🌟</span>
              <input type="text" className="auth-input" placeholder="Your full name"
                value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            </div>
            <div className="auth-input-group">
              <label className="auth-input-label">Email Address</label>
              <span className="auth-input-icon">✉️</span>
              <input type="email" className="auth-input" placeholder="you@example.com"
                value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </div>
            <div className="auth-input-group">
              <label className="auth-input-label">Password</label>
              <span className="auth-input-icon">🔑</span>
              <input type="password" className="auth-input" placeholder="Min. 6 characters"
                value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
            </div>
            <div className="auth-input-group">
              <label className="auth-input-label">Confirm Password</label>
              <span className="auth-input-icon">🔐</span>
              <input type="password" className="auth-input" placeholder="Repeat password"
                value={form.confirmPassword} onChange={e=>setForm(f=>({...f,confirmPassword:e.target.value}))}/>
            </div>

            <label className="auth-role-label">Account Type</label>
            <div className="role-selector">
              {[['student','🎓 Student'],['admin','👑 Admin']].map(([val,label])=>(
                <button type="button" key={val}
                  className={`role-btn ${form.role===val?'active':''}`}
                  onClick={()=>setForm(f=>({...f,role:val}))}>{label}</button>
              ))}
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading?<><span className="spinner" style={{width:18,height:18,borderTopColor:'#080F20'}}/>Creating…</>:'✦ Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign in →</Link>
          </p>
        </div>
      </div>
    </>
  );
}
