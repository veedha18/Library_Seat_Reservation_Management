import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = p => p === '/admin' ? location.pathname === '/admin' : location.pathname === p || location.pathname.startsWith(p+'/');

  const studentLinks = [
    {to:'/dashboard',label:'Home'},
    {to:'/libraries',label:'Libraries'},
    {to:'/books',label:'Books'},
    {to:'/my-reservations',label:'My Bookings'},
  ];
  const adminLinks = [
    {to:'/admin',label:'Dashboard'},
    {to:'/admin/libraries',label:'Libraries'},
    {to:'/admin/books',label:'Books'},
    {to:'/admin/seats',label:'Seats'},
    {to:'/admin/reservations',label:'Reservations'},
    {to:'/admin/reports',label:'Reports'},
  ];
  const links = user?.role==='admin' ? adminLinks : studentLinks;

  return (
    <>
      <style>{`
        .navbar{
          position:sticky;top:0;z-index:50;
          background:rgba(8,15,32,0.95);
          backdrop-filter:blur(20px);
          border-bottom:1px solid #1C2F55;
          height:70px;
        }
        .navbar-inner{display:flex;align-items:center;justify-content:space-between;height:100%;}
        .nav-brand{display:flex;align-items:center;gap:10px;font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#E8E0D0;white-space:nowrap;flex-shrink:0;}
        .nav-brand-icon{font-size:26px;}
        .nav-brand span{color:#E8C547;font-style:italic;}
        .nav-links{display:flex;align-items:center;gap:2px;flex:1;justify-content:center;}
        .nav-link{padding:7px 14px;border-radius:999px;font-size:13px;font-weight:500;color:#7A8BAD;transition:all 0.22s;white-space:nowrap;}
        .nav-link:hover{color:#E8C547;background:rgba(232,197,71,0.07);}
        .nav-link.active{color:#E8C547;background:rgba(232,197,71,0.1);font-weight:600;}
        .nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
        .nav-user{display:flex;align-items:center;gap:8px;padding:4px 12px 4px 4px;border-radius:999px;border:1px solid #243668;transition:all 0.22s;background:rgba(20,36,68,0.5);}
        .nav-user:hover{border-color:#E8C547;background:rgba(232,197,71,0.05);}
        .nav-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#E8C547,#B8960A);display:flex;align-items:center;justify-content:center;color:#0D1B35;font-size:13px;font-weight:800;overflow:hidden;flex-shrink:0;}
        .nav-avatar img{width:100%;height:100%;object-fit:cover;}
        .nav-uname{font-size:13px;font-weight:600;color:#E8E0D0;}
        .nav-role{font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;background:rgba(232,197,71,0.15);color:#E8C547;border:1px solid rgba(232,197,71,0.25);text-transform:uppercase;letter-spacing:0.5px;}
        .hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;padding:4px;cursor:pointer;}
        .hamburger span{display:block;width:20px;height:2px;background:#7A8BAD;border-radius:4px;transition:all 0.22s;}
        @media(max-width:900px){
          .nav-links{display:none;position:fixed;top:70px;left:0;right:0;background:#0D1B35;flex-direction:column;align-items:stretch;padding:12px;border-bottom:1px solid #1C2F55;box-shadow:0 20px 40px rgba(0,0,0,0.6);gap:4px;}
          .nav-links.open{display:flex;}
          .nav-link{padding:12px 16px;border-radius:8px;font-size:14px;}
          .hamburger{display:flex;}
        }
      `}</style>
      <nav className="navbar">
        <div className="navbar-inner container">
          <Link to={user?.role==='admin'?'/admin':'/dashboard'} className="nav-brand">
            <span className="nav-brand-icon">📚</span>
            Library<span>Nest</span>
          </Link>

          <div className={`nav-links ${open?'open':''}`}>
            {links.map(l=>(
              <Link key={l.to} to={l.to}
                className={`nav-link ${isActive(l.to)?'active':''}`}
                onClick={()=>setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="nav-right">
            <Link to="/profile" className="nav-user">
              <div className="nav-avatar">
                {user?.profileImage?<img src={user.profileImage} alt={user.name}/>:<span>{user?.name?.[0]?.toUpperCase()}</span>}
              </div>
              <span className="nav-uname hide-mobile">{user?.name?.split(' ')[0]}</span>
              {user?.role==='admin'&&<span className="nav-role">Admin</span>}
            </Link>
            <button className="btn btn-secondary btn-sm" onClick={()=>{logout();navigate('/login');}}>
              Sign out
            </button>
            <button className="hamburger" onClick={()=>setOpen(v=>!v)}>
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
