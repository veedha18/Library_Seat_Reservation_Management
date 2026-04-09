import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';
import Confetti from '../components/Confetti';

const ST = { Pending:{badge:'badge-pending',icon:'⏳'}, Approved:{badge:'badge-approved',icon:'✅'}, Rejected:{badge:'badge-rejected',icon:'❌'}, Cancelled:{badge:'badge-cancelled',icon:'🚫'} };

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('All');
  const [cancelling, setCancelling]     = useState(null);
  const [sadAnim, setSadAnim]           = useState(false);
  const [cancelModal, setCancelModal]   = useState(null);

  useEffect(()=>{ fetchAll(); },[]);
  const fetchAll = () => { setLoading(true); API.get('/reservations').then(r=>setReservations(r.data)).finally(()=>setLoading(false)); };

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await API.put(`/reservations/${id}/cancel`,{reason:'Cancelled by student'});
      setSadAnim(true); setTimeout(()=>setSadAnim(false),3500);
      toast.info('Reservation cancelled 😔'); fetchAll();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setCancelling(null); setCancelModal(null); }
  };

  const filtered = filter==='All' ? reservations : reservations.filter(r=>r.status===filter);
  const counts   = reservations.reduce((a,r)=>({...a,[r.status]:(a[r.status]||0)+1}),{});

  const btnStyle = (active) => ({
    display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:999,
    fontSize:13,fontWeight:700,cursor:'pointer',border:'1.5px solid',fontFamily:'inherit',transition:'all 0.22s',
    background:active?'var(--gold)':'transparent',
    color:active?'var(--navy)':'var(--text-muted)',
    borderColor:active?'var(--gold)':'var(--border-lt)',
  });

  return (
    <div className="page-wrapper">
      <Confetti active={sadAnim} sad/>
      <div className="container">
        <div className="animate-fadeIn" style={{marginBottom:32}}>
          <h1 className="display" style={{fontSize:30,marginBottom:6}}>🗓 My Reservations</h1>
          <p style={{color:'var(--text-muted)'}}>Track and manage all your seat bookings</p>
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}} className="animate-fadeIn">
          {['All','Pending','Approved','Rejected','Cancelled'].map(s=>(
            <button key={s} style={btnStyle(filter===s)} onClick={()=>setFilter(s)}>
              {s==='All'?'📋 All':`${ST[s]?.icon||''} ${s}`}
              <span style={{padding:'1px 6px',borderRadius:999,fontSize:10,background:filter===s?'rgba(0,0,0,0.15)':'var(--surface2)',color:'inherit'}}>{s==='All'?reservations.length:(counts[s]||0)}</span>
            </button>
          ))}
        </div>

        {loading ? <div className="loading-screen mt-32"><div className="spinner"/></div>
        : filtered.length===0 ? (
          <div className="empty-state mt-32"><div className="empty-icon">📭</div><h3>No reservations found</h3><p>{filter==='All'?"You haven't made any reservations yet.":`No ${filter.toLowerCase()} reservations.`}</p></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {filtered.map((r,i) => {
              const st = ST[r.status]||ST.Pending;
              const canCancel = r.status==='Pending'||r.status==='Approved';
              return (
                <div key={r._id} className="animate-fadeIn" style={{animationDelay:`${i*0.05}s`,
                  display:'grid',gridTemplateColumns:'110px 1fr auto',
                  background:'var(--surface)',borderRadius:'var(--r)',overflow:'hidden',
                  border:'1px solid var(--border)',boxShadow:'var(--shadow-sm)',transition:'all 0.22s',
                  opacity:r.status==='Cancelled'||r.status==='Rejected'?0.65:1,
                  filter:r.status==='Cancelled'||r.status==='Rejected'?'grayscale(0.4)':'none'
                }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shadow-lg)';e.currentTarget.style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='var(--shadow-sm)';e.currentTarget.style.transform='';}}>

                  {/* Image */}
                  <div style={{overflow:'hidden',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>
                    {r.libraryId?.image?<img src={r.libraryId.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'📚'}
                  </div>

                  {/* Info */}
                  <div style={{padding:'16px 20px'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:10}}>
                      <div>
                        <h3 style={{fontSize:15,fontFamily:'Playfair Display,serif',marginBottom:2}}>{r.libraryId?.libraryName}</h3>
                        <p style={{fontSize:12,color:'var(--text-muted)'}}>📍 {r.libraryId?.city}</p>
                      </div>
                      <span className={`badge ${st.badge}`}>{st.icon} {r.status}</span>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'10px 20px',fontSize:13,fontWeight:500}}>
                      <span>💺 {r.seatId?.seatNumber} <span style={{color:'var(--text-muted)'}}>({r.seatId?.seatType})</span></span>
                      <span>📅 {new Date(r.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
                      <span>🕐 {r.startTime} – {r.endTime}</span>
                      <span style={{color:'var(--text-muted)',fontSize:12}}>Booked {new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    {r.cancellationReason && <div style={{marginTop:10,padding:'8px 12px',background:'rgba(232,197,71,0.06)',borderRadius:6,borderLeft:'3px solid var(--gold)',fontSize:12,color:'var(--text-muted)',display:'flex',gap:8}}>📌 {r.cancellationReason}</div>}
                    {r.adminNote && <div style={{marginTop:8,padding:'8px 12px',background:'rgba(78,205,196,0.06)',borderRadius:6,borderLeft:'3px solid var(--teal)',fontSize:12,color:'var(--text-muted)',display:'flex',gap:8}}>👑 {r.adminNote}</div>}
                  </div>

                  {/* Action */}
                  <div style={{padding:'16px 14px',display:'flex',alignItems:'flex-start'}}>
                    {canCancel && <button className="btn btn-danger btn-sm" onClick={()=>setCancelModal(r._id)} disabled={cancelling===r._id}>{cancelling===r._id?<span className="spinner" style={{width:14,height:14}}/>:'🚫 Cancel'}</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cancelModal && (
        <div className="overlay" onClick={()=>setCancelModal(null)}>
          <div className="modal animate-scaleIn" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Cancel Reservation?</h3><button className="btn btn-icon btn-secondary" onClick={()=>setCancelModal(null)}>✕</button></div>
            <div className="modal-body text-center">
              <div style={{fontSize:64,marginBottom:16,display:'block',animation:'float 2s ease-in-out infinite'}}>😢</div>
              <p style={{color:'var(--text-muted)',lineHeight:1.8}}>Are you sure you want to cancel this reservation?<br/>This action <strong>cannot be undone</strong>.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setCancelModal(null)}>Keep it 🙏</button>
              <button className="btn btn-danger" onClick={()=>handleCancel(cancelModal)}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
