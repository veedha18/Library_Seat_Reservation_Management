import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

function StatCard({ icon, label, value, color, to, sub }) {
  return (
    <Link to={to} style={{
      display:'flex',alignItems:'center',gap:14,padding:'20px 22px',
      background:'var(--surface)',borderRadius:14,border:'1px solid var(--border)',
      boxShadow:'var(--shadow-sm)',textDecoration:'none',transition:'all 0.22s',
      borderLeft:`3px solid ${color}`,position:'relative',overflow:'hidden'
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
      <span style={{fontSize:36,flexShrink:0}}>{icon}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:28,fontWeight:800,color:'var(--text)',lineHeight:1,fontFamily:'Playfair Display,serif'}}>{value??'—'}</div>
        <div style={{fontSize:12,color:'var(--text-muted)',marginTop:3}}>{label}</div>
        {sub&&<div style={{fontSize:11,color,fontWeight:700,marginTop:2}}>{sub}</div>}
      </div>
      <span style={{color:'var(--text-dim)'}}>→</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats,setStats]=useState({});
  const [libraries,setLibraries]=useState([]);
  const [pending,setPending]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([API.get('/reservations/stats/overview'),API.get('/libraries'),API.get('/reservations?status=Pending')])
      .then(([s,l,r])=>{ setStats(s.data); setLibraries(l.data); setPending(r.data.slice(0,6)); })
      .finally(()=>setLoading(false));
  },[]);

  const totalSeats=libraries.reduce((a,l)=>a+(l.totalSeats||0),0);
  const openLibs=libraries.filter(l=>l.status==='Open').length;
  const sb=s=>{const m={Pending:'badge-pending',Approved:'badge-approved',Rejected:'badge-rejected',Cancelled:'badge-cancelled'};return<span className={`badge ${m[s]||''}`}>{s}</span>;};

  if(loading)return<div className="loading-screen" style={{minHeight:'80vh'}}><div className="spinner"/></div>;

  return(
    <div className="page-wrapper"><div className="container">

      {/* Hero */}
      <div className="animate-fadeIn" style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,flexWrap:'wrap',
        padding:'36px 44px',background:'linear-gradient(135deg,#080F20,#0D1B35 40%,#142444 70%,#1C2F55)',
        borderRadius:20,border:'1px solid #243668',
        boxShadow:'0 12px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(232,197,71,0.08)',
        position:'relative',overflow:'hidden',marginBottom:32
      }}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#E8C547,transparent)',opacity:0.5}}/>
        <div style={{position:'absolute',top:-80,right:-40,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(232,197,71,0.06),transparent)'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <h1 className="display" style={{fontSize:32,color:'var(--text)',marginBottom:6}}>Admin Dashboard ✦</h1>
          <p style={{color:'var(--text-muted)'}}>Manage libraries, seats, books and all reservations</p>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',position:'relative',zIndex:1}}>
          {[{t:`${libraries.length} Libraries`,c:'#4ECDC4',bg:'rgba(78,205,196,0.1)',b:'rgba(78,205,196,0.25)'},
            {t:`${totalSeats} Seats`,c:'#E8C547',bg:'rgba(232,197,71,0.1)',b:'rgba(232,197,71,0.25)'},
            {t:`${stats.pending||0} Pending`,c:'#FF6B8A',bg:'rgba(255,107,138,0.1)',b:'rgba(255,107,138,0.25)'}
          ].map((b,i)=>(
            <span key={i} style={{padding:'8px 16px',borderRadius:999,fontSize:12,fontWeight:700,background:b.bg,color:b.c,border:`1px solid ${b.b}`}}>{b.t}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-3 animate-fadeIn">
        <StatCard icon="🏛" label="Libraries"        value={libraries.length} color="#4ECDC4" to="/admin/libraries" sub={`${openLibs} open`}/>
        <StatCard icon="💺" label="Total Seats"      value={totalSeats}       color="#E8C547" to="/admin/seats"/>
        <StatCard icon="📋" label="All Reservations" value={stats.total}      color="#9B59B6" to="/admin/reservations"/>
        <StatCard icon="⏳" label="Pending"          value={stats.pending}    color="#FF6B8A" to="/admin/reservations" sub="Need action"/>
        <StatCard icon="✅" label="Approved"         value={stats.approved}   color="#4ECDC4" to="/admin/reservations"/>
        <StatCard icon="🚫" label="Cancelled"        value={stats.cancelled}  color="#7A8BAD" to="/admin/reservations"/>
      </div>

      {/* Quick Actions */}
      <div className="mt-32 animate-fadeIn">
        <h2 className="display mb-16" style={{fontSize:20}}>Quick Actions</h2>
        <div className="grid grid-4">
          {[{icon:'🏛',label:'Add Library',to:'/admin/libraries',c:'#4ECDC4'},
            {icon:'📖',label:'Add Book',to:'/admin/books',c:'#E8C547'},
            {icon:'💺',label:'Manage Seats',to:'/admin/seats',c:'#9B59B6'},
            {icon:'📈',label:'Reports',to:'/admin/reports',c:'#FF6B8A'}
          ].map(q=>(
            <Link key={q.to} to={q.to} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,padding:'24px 16px',background:'var(--surface)',borderRadius:14,border:'1px solid var(--border)',textDecoration:'none',transition:'all 0.22s',color:'var(--text-muted)',fontWeight:600,fontSize:13}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=q.c;e.currentTarget.style.color=q.c;e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)';e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
              <span style={{fontSize:36}}>{q.icon}</span>{q.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Pending */}
      <div className="card mt-32 animate-fadeIn">
        <div className="card-header flex-between">
          <div><h2 style={{fontSize:18,fontFamily:'Playfair Display,serif'}}>⏳ Pending Reservations</h2><p className="text-muted text-sm">Awaiting approval</p></div>
          <Link to="/admin/reservations" className="btn btn-secondary btn-sm">View All →</Link>
        </div>
        {pending.length===0?(
          <div className="empty-state"><div className="empty-icon">✅</div><h3>All caught up!</h3><p>No pending reservations.</p></div>
        ):(
          <div className="table-wrapper"><table>
            <thead><tr><th>Student</th><th>Library</th><th>Seat</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{pending.map(r=>(
              <tr key={r._id}>
                <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#E8C547,#B8960A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#080F20',fontSize:12,fontWeight:800,flexShrink:0}}>{r.userId?.name?.[0]?.toUpperCase()}</div>
                  <span style={{fontWeight:600}}>{r.userId?.name}</span>
                </div></td>
                <td>{r.libraryId?.libraryName}</td>
                <td>💺 {r.seatId?.seatNumber}</td>
                <td>{new Date(r.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</td>
                <td style={{fontSize:12}}>{r.startTime}–{r.endTime}</td>
                <td>{sb(r.status)}</td>
                <td><Link to="/admin/reservations" className="btn btn-primary btn-sm">Manage</Link></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      {/* Library grid */}
      <div className="card mt-32 animate-fadeIn">
        <div className="card-header flex-between">
          <h2 style={{fontSize:18,fontFamily:'Playfair Display,serif'}}>🏛 Library Status</h2>
          <Link to="/admin/libraries" className="btn btn-secondary btn-sm">Manage →</Link>
        </div>
        <div className="card-body">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
            {libraries.map(lib=>(
              <div key={lib._id} style={{display:'flex',gap:12,alignItems:'flex-start',padding:12,borderRadius:'var(--r-sm)',border:'1px solid var(--border)',transition:'all 0.22s',opacity:lib.status!=='Open'?0.55:1,filter:lib.status!=='Open'?'grayscale(0.6)':'none'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <div style={{width:42,height:42,borderRadius:8,overflow:'hidden',background:'var(--surface2)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                  {lib.image?<img src={lib.image} alt={lib.libraryName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'📚'}
                </div>
                <div style={{fontSize:12}}>
                  <strong style={{display:'block',marginBottom:2,fontSize:13}}>{lib.libraryName}</strong>
                  <span style={{color:'var(--text-muted)'}}>📍 {lib.city}</span>
                  <div style={{marginTop:5}}><span className={`badge ${lib.status==='Open'?'badge-open':lib.status==='Maintenance'?'badge-maintenance':'badge-closed'}`}>{lib.status}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div></div>
  );
}
