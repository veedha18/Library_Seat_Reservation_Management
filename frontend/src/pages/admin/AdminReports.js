import React,{useState,useEffect} from 'react';
import API from '../../utils/api';

const REPORTS=[
  {id:'all',     icon:'📋',label:'All',       color:'#9B59B6'},
  {id:'Approved',icon:'✅',label:'Approved',  color:'#4ECDC4'},
  {id:'Pending', icon:'⏳',label:'Pending',   color:'#E8C547'},
  {id:'Rejected',icon:'❌',label:'Rejected',  color:'#FF6B8A'},
  {id:'Cancelled',icon:'🚫',label:'Cancelled',color:'#7A8BAD'},
];

export default function AdminReports(){
  const [reservations,setReservations]=useState([]);
  const [libraries,setLibraries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [active,setActive]=useState('all');
  const [filterLib,setFilterLib]=useState('');
  const [search,setSearch]=useState('');

  useEffect(()=>{
    Promise.all([API.get('/reservations'),API.get('/libraries')])
      .then(([r,l])=>{setReservations(r.data);setLibraries(l.data);})
      .finally(()=>setLoading(false));
  },[]);

  const filtered=reservations.filter(r=>{
    const ms=active==='all'||r.status===active;
    const ml=!filterLib||(r.libraryId?._id||r.libraryId)===filterLib;
    const mq=!search||r.userId?.name?.toLowerCase().includes(search.toLowerCase())||r.libraryId?.libraryName?.toLowerCase().includes(search.toLowerCase())||r.seatId?.seatNumber?.toLowerCase().includes(search.toLowerCase());
    return ms&&ml&&mq;
  });

  const counts=reservations.reduce((a,r)=>({...a,[r.status]:(a[r.status]||0)+1}),{});

  const seatUsage=libraries.map(lib=>{
    const lr=reservations.filter(r=>(r.libraryId?._id||r.libraryId)===lib._id);
    return{library:lib,total:lr.length,approved:lr.filter(r=>r.status==='Approved').length,pending:lr.filter(r=>r.status==='Pending').length,cancelled:lr.filter(r=>r.status==='Cancelled').length};
  });

  const sb=s=>{const m={Pending:'badge-pending',Approved:'badge-approved',Rejected:'badge-rejected',Cancelled:'badge-cancelled'};return<span className={`badge ${m[s]||''}`}>{s}</span>;};

  const tabStyle=r=>({
    display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:999,fontSize:12,fontWeight:700,
    cursor:'pointer',border:'1.5px solid',fontFamily:'inherit',transition:'all 0.22s',
    background:active===r.id?r.color:'transparent',
    color:active===r.id?'#080F20':r.color,
    borderColor:active===r.id?r.color:`${r.color}50`,
  });

  return(
    <div className="page-wrapper"><div className="container">
      <div className="page-header animate-fadeIn">
        <h1>📈 Reports & Analytics</h1>
        <p>Detailed insights on all reservations and seat usage</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-4 animate-fadeIn mb-32">
        {REPORTS.map(r=>(
          <div key={r.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'24px 16px',background:'var(--surface)',borderRadius:14,border:`1px solid var(--border)`,borderTop:`3px solid ${r.color}`,transition:'all 0.22s',cursor:'pointer'}}
            onClick={()=>setActive(r.id)}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
            <span style={{fontSize:30}}>{r.icon}</span>
            <span style={{fontSize:30,fontWeight:800,color:'var(--text)',lineHeight:1,fontFamily:'Playfair Display,serif'}}>{r.id==='all'?reservations.length:(counts[r.id]||0)}</span>
            <span style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.7}}>{r.label}</span>
          </div>
        ))}
      </div>

      {/* Seat usage */}
      <div className="card mb-32 animate-fadeIn">
        <div className="card-header"><h2 style={{fontSize:17,fontFamily:'Playfair Display,serif'}}>📊 Seat Usage by Library</h2></div>
        <div className="table-wrapper"><table>
          <thead><tr><th>Library</th><th>City</th><th>Total Bookings</th><th>Approved</th><th>Pending</th><th>Cancelled</th><th>Approval Rate</th></tr></thead>
          <tbody>{seatUsage.map(({library,total,approved,pending,cancelled})=>(
            <tr key={library._id}>
              <td><strong>{library.libraryName}</strong></td>
              <td>📍{library.city}</td>
              <td><strong>{total}</strong></td>
              <td><span className="badge badge-approved">{approved}</span></td>
              <td><span className="badge badge-pending">{pending}</span></td>
              <td><span className="badge badge-cancelled">{cancelled}</span></td>
              <td>
                <div style={{display:'flex',alignItems:'center',gap:8,minWidth:120}}>
                  <div style={{flex:1,height:6,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${total>0?Math.min((approved/total)*100,100):0}%`,background:'linear-gradient(90deg,#4ECDC4,#E8C547)',borderRadius:99,transition:'width 0.5s ease'}}/>
                  </div>
                  <span style={{fontSize:11,color:'var(--text-muted)',flexShrink:0}}>{total>0?Math.round((approved/total)*100):0}%</span>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>

      {/* Detailed table */}
      <div className="card animate-fadeIn">
        <div className="card-header">
          <div className="flex-between" style={{flexWrap:'wrap',gap:12}}>
            <h2 style={{fontSize:17,fontFamily:'Playfair Display,serif'}}>📋 Detailed Reservations</h2>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
              <input className="form-control" style={{width:200}} placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
              <select className="form-control" style={{width:200}} value={filterLib} onChange={e=>setFilterLib(e.target.value)}>
                <option value="">All Libraries</option>
                {libraries.map(l=><option key={l._id} value={l._id}>{l.libraryName}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
            {REPORTS.map(r=>(
              <button key={r.id} style={tabStyle(r)} onClick={()=>setActive(r.id)}>
                {r.icon} {r.label}
                <span style={{padding:'1px 6px',borderRadius:999,fontSize:10,background:'rgba(255,255,255,0.2)'}}>{r.id==='all'?reservations.length:(counts[r.id]||0)}</span>
              </button>
            ))}
          </div>
        </div>

        {loading?<div className="loading-screen"><div className="spinner"/></div>
        :filtered.length===0?<div className="empty-state"><div className="empty-icon">📭</div><h3>No records found</h3></div>
        :(
          <div className="table-wrapper"><table>
            <thead><tr><th>#</th><th>Student</th><th>Library</th><th>Seat</th><th>Date</th><th>Time</th><th>Status</th><th>Booked On</th></tr></thead>
            <tbody>{filtered.map((r,i)=>(
              <tr key={r._id}>
                <td style={{color:'var(--text-dim)',fontSize:11}}>{i+1}</td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#E8C547,#B8960A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#080F20',fontSize:11,fontWeight:800,flexShrink:0}}>{r.userId?.name?.[0]?.toUpperCase()}</div>
                    <div><strong style={{fontSize:13}}>{r.userId?.name}</strong><br/><span style={{fontSize:11,color:'var(--text-muted)'}}>{r.userId?.email}</span></div>
                  </div>
                </td>
                <td><strong style={{fontSize:13}}>{r.libraryId?.libraryName}</strong><br/><span style={{fontSize:11,color:'var(--text-muted)'}}>{r.libraryId?.city}</span></td>
                <td>💺{r.seatId?.seatNumber}</td>
                <td style={{fontSize:12}}>{new Date(r.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                <td style={{fontSize:12}}>{r.startTime}–{r.endTime}</td>
                <td>{sb(r.status)}</td>
                <td style={{fontSize:11,color:'var(--text-muted)'}}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)'}}>
          <span style={{fontSize:12,color:'var(--text-muted)'}}>Showing {filtered.length} of {reservations.length} records</span>
        </div>
      </div>

    </div></div>
  );
}
