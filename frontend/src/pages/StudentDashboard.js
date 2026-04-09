import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import API from '../utils/api';

const S={
  hero:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:32,background:'linear-gradient(135deg,#0D1B35 0%,#142444 40%,#1C2F55 100%)',borderRadius:20,padding:'52px 56px',border:'1px solid #243668',position:'relative',overflow:'hidden'},
  heroBefore:{content:'',position:'absolute',top:-80,right:-80,width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(232,197,71,0.06),transparent)'},
  greeting:{fontSize:13,fontWeight:600,color:'#E8C547',letterSpacing:1,marginBottom:6,textTransform:'uppercase'},
  h1:{fontSize:44,fontFamily:'Playfair Display,serif',color:'#E8E0D0',marginBottom:10,letterSpacing:-1},
  sub:{fontSize:15,color:'#7A8BAD',marginBottom:28},
  heroArt:{display:'flex',flexDirection:'column',alignItems:'center',gap:12,flexShrink:0},
  booksRow:{display:'flex',gap:10,alignItems:'flex-end'},
};

const statColors=['#E8C547','#4ECDC4','#FF6B8A','#9B59B6'];

export default function StudentDashboard(){
  const {user}=useAuth();
  const [res,setRes]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{API.get('/reservations').then(r=>setRes(r.data)).finally(()=>setLoading(false));},[]);
  const pending=res.filter(r=>r.status==='Pending').length;
  const approved=res.filter(r=>r.status==='Approved').length;
  const h=new Date().getHours();
  const greeting=h<12?'Good morning ☀️':h<17?'Good afternoon 🌤':'Good evening 🌙';
  const sb=s=>{const m={Pending:'badge-pending',Approved:'badge-approved',Rejected:'badge-rejected',Cancelled:'badge-cancelled'};return<span className={`badge ${m[s]||''}`}>{s}</span>;};
  return(
    <div className="page-wrapper"><div className="container">
      {/* HERO */}
      <div style={S.hero} className="animate-fadeIn">
        <div style={{position:'absolute',top:-80,right:-80,width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(232,197,71,0.06),transparent)'}}/>
        <div style={{position:'absolute',bottom:-60,left:'35%',width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle,rgba(78,205,196,0.04),transparent)'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <p style={S.greeting}>{greeting}</p>
          <h1 style={S.h1} className="display">{user?.name?.split(' ')[0]}!</h1>
          <p style={S.sub}>Find your perfect reading spot today</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <Link to="/libraries" className="btn btn-primary btn-lg">🏛 Browse Libraries</Link>
            <Link to="/books" className="btn btn-secondary btn-lg">🔍 Search Books</Link>
          </div>
        </div>
        <div style={S.heroArt}>
          <div style={S.booksRow}>
            {['📗','📕','📘','📙','📚'].map((b,i)=>(
              <span key={i} style={{fontSize:34,animation:`float ${3+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.2}s`,display:'block'}}>{b}</span>
            ))}
          </div>
          <span style={{fontSize:72,animation:'float 4s ease-in-out infinite 0.5s',display:'block',filter:'drop-shadow(0 4px 12px rgba(232,197,71,0.2))'}}>🦉</span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-4 mt-32">
        {[
          {icon:'📋',label:'Total Bookings',val:res.length,to:'/my-reservations'},
          {icon:'⏳',label:'Pending',val:pending,to:'/my-reservations'},
          {icon:'✅',label:'Approved',val:approved,to:'/my-reservations'},
          {icon:'🏛',label:'Libraries',val:'View →',to:'/libraries'},
        ].map((s,i)=>(
          <Link key={i} to={s.to} style={{display:'flex',alignItems:'center',gap:14,padding:'20px',background:'var(--surface)',borderRadius:14,border:'1px solid var(--border)',boxShadow:'var(--shadow-sm)',textDecoration:'none',transition:'all 0.22s',borderLeft:`3px solid ${statColors[i]}`}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
            <span style={{fontSize:36,flexShrink:0}}>{s.icon}</span>
            <div>
              <div style={{fontSize:28,fontWeight:800,color:'var(--text)',lineHeight:1,fontFamily:'Playfair Display,serif'}}>{s.val}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:3}}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* RECENT */}
      <div className="card mt-32 animate-fadeIn" style={{animationDelay:'0.15s'}}>
        <div className="card-header flex-between">
          <div>
            <h2 style={{fontSize:18,fontFamily:'Playfair Display,serif'}}>Recent Bookings</h2>
            <p className="text-muted text-sm">Your latest reservation activity</p>
          </div>
          <Link to="/my-reservations" className="btn btn-secondary btn-sm">View All →</Link>
        </div>
        {loading?<div className="loading-screen"><div className="spinner"/></div>
        :res.length===0?<div className="empty-state"><div className="empty-icon">📭</div><h3>No bookings yet</h3><p>Find a library and reserve your first seat!</p><Link to="/libraries" className="btn btn-primary mt-16">Browse Libraries</Link></div>
        :<div className="table-wrapper"><table><thead><tr><th>Library</th><th>Seat</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>{res.slice(0,5).map(r=>(
            <tr key={r._id}>
              <td><strong>{r.libraryId?.libraryName}</strong><br/><span className="text-muted text-sm">📍{r.libraryId?.city}</span></td>
              <td>💺 {r.seatId?.seatNumber}</td>
              <td>{new Date(r.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
              <td>{r.startTime}–{r.endTime}</td>
              <td>{sb(r.status)}</td>
            </tr>
          ))}</tbody>
        </table></div>}
      </div>

      {/* QUICK LINKS */}
      <div className="mt-32">
        <h2 className="display mb-16" style={{fontSize:22}}>Quick Actions</h2>
        <div className="grid grid-3">
          {[
            {e:'🏛',t:'Find a Library',d:'Browse all available libraries by city',to:'/libraries'},
            {e:'📖',t:'Search Books',d:'Find books and the libraries that carry them',to:'/books'},
            {e:'👤',t:'My Profile',d:'Update your personal info and password',to:'/profile'},
          ].map(q=>(
            <Link to={q.to} key={q.to} style={{display:'flex',alignItems:'center',gap:16,padding:22,background:'var(--surface)',borderRadius:14,border:'1px solid var(--border)',textDecoration:'none',transition:'all 0.22s',boxShadow:'var(--shadow-sm)'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='var(--border-lt)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
              <span style={{fontSize:40,flexShrink:0}}>{q.e}</span>
              <div><h4 style={{fontSize:15,marginBottom:4,color:'var(--text)',fontFamily:'Playfair Display,serif'}}>{q.t}</h4><p className="text-sm text-muted">{q.d}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </div></div>
  );
}
