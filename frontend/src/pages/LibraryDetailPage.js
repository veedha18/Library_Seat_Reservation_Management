import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';

const SEAT_ICONS = { regular:'💺', window:'🪟', quiet:'🤫', computer:'💻' };

export default function LibraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [library, setLibrary]   = useState(null);
  const [seats, setSeats]       = useState([]);
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('seats');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([API.get(`/libraries/${id}`), API.get(`/seats?libraryId=${id}`), API.get(`/books?libraryId=${id}`)])
      .then(([l,s,b]) => { setLibrary(l.data); setSeats(s.data); setBooks(b.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen" style={{minHeight:'80vh'}}><div className="spinner"/></div>;
  if (!library) return <div className="container mt-32 text-center"><h3>Library not found</h3></div>;

  const isClosed   = library.status === 'Closed' || library.status === 'Maintenance';
  const available  = seats.filter(s => s.status === 'available').length;

  const seatBg  = (seat) => {
    if (seat._id === selected) return { bg:'var(--gold)', border:'var(--gold-dk)', color:'var(--navy)' };
    if (seat.status === 'available')   return { bg:'rgba(78,205,196,0.08)',  border:'#4ECDC4',  color:'var(--text)' };
    if (seat.status === 'reserved')    return { bg:'rgba(255,107,138,0.08)', border:'#FF6B8A',  color:'var(--text-muted)' };
    return { bg:'rgba(122,139,173,0.05)', border:'var(--border)', color:'var(--text-dim)' };
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <button className="btn btn-secondary mb-24" onClick={() => navigate(-1)} style={{marginBottom:24}}>← Back</button>

        {/* Hero */}
        <div className="animate-fadeIn" style={{
          display:'grid', gridTemplateColumns:'400px 1fr', gap:0,
          background:'var(--surface)', borderRadius:20, overflow:'hidden',
          border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)',
          marginBottom:32, opacity:isClosed?0.8:1, filter:isClosed?'grayscale(0.3)':'none'
        }}>
          {/* Image */}
          <div style={{position:'relative',minHeight:300,background:'var(--surface2)'}}>
            {library.image
              ? <img src={library.image} alt={library.libraryName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:80}}>📚</div>
            }
            {isClosed && (
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(5px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,color:'white',textAlign:'center',padding:24}}>
                <span style={{fontSize:52}}>{library.status==='Maintenance'?'🔧':'🔒'}</span>
                <strong style={{fontSize:14,letterSpacing:2,textTransform:'uppercase',color:'#E8C547'}}>{library.status}</strong>
                <p style={{fontSize:13,opacity:0.8}}>Temporarily unavailable</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{padding:'40px 44px'}}>
            <span className={`badge ${library.status==='Open'?'badge-open':library.status==='Maintenance'?'badge-maintenance':'badge-closed'}`}>{library.status}</span>
            <h1 className="display" style={{fontSize:28,marginTop:14,marginBottom:8}}>{library.libraryName}</h1>
            <p style={{color:'var(--gold)',fontWeight:600,fontSize:14,marginBottom:8}}>📍 {library.city} — {library.address}</p>
            {library.description && <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7,marginBottom:16}}>{library.description}</p>}

            <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:20}}>
              {[{icon:'🕐',text:library.openingHours},{icon:'💺',text:`${library.totalSeats} seats`},{icon:'✅',text:`${available} available`},{icon:'📖',text:`${books.length} books`}].map((m,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:500,color:'var(--text-muted)',padding:'7px 14px',background:'var(--surface2)',borderRadius:999,border:'1px solid var(--border)'}}>
                  {m.icon} {m.text}
                </div>
              ))}
            </div>

            {!isClosed && (
              <button className="btn btn-primary btn-lg" style={{marginTop:28}} onClick={()=>setTab('seats')}>
                📅 Reserve a Seat
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:28}}>
          {[{id:'seats',label:`💺 Seats (${seats.length})`},{id:'books',label:`📖 Books (${books.length})`}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'10px 22px',borderRadius:'8px 8px 0 0',fontSize:14,fontWeight:600,
              background:tab===t.id?'var(--surface)':'none',
              border:tab===t.id?'1px solid var(--border)':'none',
              borderBottom:tab===t.id?'1px solid var(--surface)':'none',
              color:tab===t.id?'var(--gold)':'var(--text-muted)',
              cursor:'pointer',fontFamily:'inherit',position:'relative',top:1,transition:'all 0.22s'
            }}>{t.label}</button>
          ))}
        </div>

        {/* SEATS TAB */}
        {tab==='seats' && (
          <div className="animate-fadeIn">
            {isClosed ? (
              <div className="empty-state"><div className="empty-icon">🔒</div><h3>Library Unavailable</h3><p>Seat reservations are not available while the library is {library.status.toLowerCase()}.</p></div>
            ) : (
              <>
                {/* Legend */}
                <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:20,padding:'12px 20px',background:'var(--surface)',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
                  {[{c:'rgba(78,205,196,0.15)',b:'#4ECDC4',l:'Available'},{c:'rgba(255,107,138,0.15)',b:'#FF6B8A',l:'Reserved'},{c:'var(--gold)',b:'var(--gold-dk)',l:'Selected'},{c:'rgba(122,139,173,0.08)',b:'var(--border)',l:'Unavailable'}].map((x,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:500,color:'var(--text-muted)'}}>
                      <span style={{width:18,height:18,borderRadius:4,background:x.c,border:`2px solid ${x.b}`,display:'inline-block'}}/>
                      {x.l}
                    </div>
                  ))}
                </div>

                {/* Seat grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(88px,1fr))',gap:12,padding:28,background:'var(--surface)',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
                  {seats.map(seat => {
                    const s = seatBg(seat);
                    return (
                      <button key={seat._id} onClick={()=>{if(seat.status!=='available')return;setSelected(seat._id===selected?null:seat._id);}}
                        style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:5,padding:'13px 8px',borderRadius:8,border:`2px solid ${s.border}`,background:s.bg,cursor:seat.status!=='available'?'not-allowed':'pointer',transition:'all 0.22s',fontFamily:'inherit',opacity:seat.status==='unavailable'?0.45:1,transform:seat._id===selected?'scale(1.1)':'scale(1)',boxShadow:seat._id===selected?'0 6px 20px rgba(232,197,71,0.4)':''}}
                        title={`${seat.seatNumber} (${seat.seatType}) — ${seat.status}`}>
                        <span style={{fontSize:22}}>{SEAT_ICONS[seat.seatType]||'💺'}</span>
                        <span style={{fontSize:11,fontWeight:700,color:s.color}}>{seat.seatNumber}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action bar */}
                {selected && (
                  <div className="animate-fadeIn" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:20,padding:'20px 28px',background:'rgba(232,197,71,0.06)',borderRadius:'var(--r)',border:'1px solid rgba(232,197,71,0.2)',flexWrap:'wrap',gap:16}}>
                    <p style={{fontWeight:600,color:'var(--gold)',fontSize:15}}>✅ Seat selected! Choose your date & time to continue.</p>
                    <button className="btn btn-primary btn-lg" onClick={()=>navigate(`/reserve/${id}/${selected}`)}>📅 Reserve This Seat</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* BOOKS TAB */}
        {tab==='books' && (
          <div className="animate-fadeIn">
            {books.length===0 ? (
              <div className="empty-state"><div className="empty-icon">📭</div><h3>No books listed</h3></div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
                {books.map(book=>(
                  <div key={book._id} style={{display:'flex',gap:14,padding:18,background:'var(--surface)',borderRadius:'var(--r)',border:'1px solid var(--border)',transition:'all 0.22s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-lt)';e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='';}}>
                    <div style={{width:56,height:72,borderRadius:8,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:32,border:'1px solid var(--border)'}}>
                      {book.coverImage?<img src={book.coverImage} alt={book.title} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}}/>:'📖'}
                    </div>
                    <div>
                      <h4 style={{fontSize:14,fontWeight:700,lineHeight:1.4,marginBottom:4,fontFamily:'Playfair Display,serif'}}>{book.title}</h4>
                      <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:8}}>{book.author}</p>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <span className="badge" style={{background:'rgba(122,139,173,0.1)',color:'var(--text-muted)',border:'1px solid var(--border-lt)'}}>{book.genre}</span>
                        <span className={`badge ${book.quantity>0?'badge-approved':'badge-rejected'}`}>Qty: {book.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
