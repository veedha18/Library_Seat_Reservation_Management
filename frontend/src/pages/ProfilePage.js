import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile]   = useState({ name:user?.name||'', email:user?.email||'', profileImage:user?.profileImage||'' });
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [saving, setSaving]     = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [tab, setTab]           = useState('profile');

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const {data}=await API.put('/users/profile',profile); updateUser(data); toast.success('Profile updated! ✅'); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword!==passwords.confirmPassword){toast.error("Passwords don't match");return;}
    if (passwords.newPassword.length<6){toast.error('Min. 6 characters');return;}
    setChangingPw(true);
    try { await API.put('/users/password',{currentPassword:passwords.currentPassword,newPassword:passwords.newPassword}); toast.success('Password changed! 🔐'); setPasswords({currentPassword:'',newPassword:'',confirmPassword:''}); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setChangingPw(false); }
  };

  const avatarColors=['#E8C547','#4ECDC4','#FF6B8A','#9B59B6','#52B788'];
  const avatarColor = avatarColors[(user?.name?.charCodeAt(0)||0) % avatarColors.length];

  const navBtnStyle = (active) => ({
  display:'flex',
  alignItems:'center',
  gap:10,
  width:'100%',
  padding:'13px 24px',
  fontSize:14,
  fontWeight:600,
  border:'none',
  color:active?'var(--gold)':'var(--text-muted)',
  cursor:'pointer',
  textAlign:'left',
  fontFamily:'inherit',
  transition:'all 0.22s',
  borderRight:active?'3px solid var(--gold)':'3px solid transparent',
  background: active ? 'rgba(232,197,71,0.06)' : 'none', // ✅ only one background
});

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:32,alignItems:'start'}}>

          {/* Sidebar */}
          <div className="animate-fadeInLeft" style={{background:'var(--surface)',borderRadius:'var(--r)',border:'1px solid var(--border)',overflow:'hidden',position:'sticky',top:90}}>
            {/* Avatar section */}
            <div style={{padding:'32px 24px',textAlign:'center',background:'linear-gradient(135deg,#080F20,#0D1B35,#142444)',borderBottom:'1px solid var(--border)',position:'relative'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,var(--gold),transparent)',opacity:0.4}}/>
              <div style={{width:88,height:88,borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor},${avatarColor}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,fontWeight:800,color:'var(--navy)',margin:'0 auto 16px',boxShadow:`0 8px 28px ${avatarColor}40`,overflow:'hidden',border:'3px solid rgba(255,255,255,0.1)'}}>
                {user?.profileImage?<img src={user.profileImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span>{user?.name?.[0]?.toUpperCase()}</span>}
              </div>
              <h2 style={{fontSize:17,marginBottom:4,color:'var(--text)'}}>{user?.name}</h2>
              <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:10}}>{user?.email}</p>
              <span className={`badge ${user?.role==='admin'?'badge-pending':'badge-approved'}`}>{user?.role==='admin'?'👑 Admin':'🎓 Student'}</span>
            </div>

            {/* Nav */}
            <div style={{padding:'10px 0'}}>
              {[{id:'profile',icon:'👤',label:'Edit Profile'},{id:'password',icon:'🔐',label:'Change Password'}].map(n=>(
                <button key={n.id} style={navBtnStyle(tab===n.id)} onClick={()=>setTab(n.id)}
                  onMouseEnter={e=>{if(tab!==n.id){e.currentTarget.style.background='rgba(255,255,255,0.02)';e.currentTarget.style.color='var(--text)';}}}
                  onMouseLeave={e=>{if(tab!==n.id){e.currentTarget.style.background='none';e.currentTarget.style.color='var(--text-muted)';}}}
                >{n.icon} {n.label}</button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="animate-fadeInRight">
            {tab==='profile' && (
              <div className="card">
                <div className="card-header">
                  <h2 style={{fontSize:20,fontFamily:'Playfair Display,serif'}}>👤 Edit Profile</h2>
                  <p style={{color:'var(--text-muted)',fontSize:13,marginTop:4}}>Update your personal information</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSaveProfile}>
                    <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-control" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/></div>
                    <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-control" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))}/></div>
                    <div className="form-group">
                      <label className="form-label">Profile Image URL</label>
                      <input type="url" className="form-control" placeholder="https://example.com/photo.jpg" value={profile.profileImage} onChange={e=>setProfile(p=>({...p,profileImage:e.target.value}))}/>
                      {profile.profileImage && (
                        <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
                          <img src={profile.profileImage} alt="Preview" style={{width:52,height:52,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--border)'}} onError={e=>e.target.style.display='none'}/>
                          <span style={{fontSize:12,color:'var(--text-muted)'}}>Preview</span>
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<><span className="spinner" style={{width:18,height:18,borderTopColor:'#080F20'}}/>Saving…</>:'💾 Save Changes'}</button>
                  </form>
                </div>
              </div>
            )}

            {tab==='password' && (
              <div className="card">
                <div className="card-header">
                  <h2 style={{fontSize:20,fontFamily:'Playfair Display,serif'}}>🔐 Change Password</h2>
                  <p style={{color:'var(--text-muted)',fontSize:13,marginTop:4}}>Keep your account secure</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleChangePassword}>
                    <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-control" placeholder="Your current password" value={passwords.currentPassword} onChange={e=>setPasswords(p=>({...p,currentPassword:e.target.value}))}/></div>
                    <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-control" placeholder="Min. 6 characters" value={passwords.newPassword} onChange={e=>setPasswords(p=>({...p,newPassword:e.target.value}))}/></div>
                    <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-control" placeholder="Repeat new password" value={passwords.confirmPassword} onChange={e=>setPasswords(p=>({...p,confirmPassword:e.target.value}))}/></div>
                    <button type="submit" className="btn btn-primary" disabled={changingPw}>{changingPw?<><span className="spinner" style={{width:18,height:18,borderTopColor:'#080F20'}}/>Updating…</>:'🔐 Update Password'}</button>
                  </form>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
