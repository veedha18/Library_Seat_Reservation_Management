import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';
import Confetti from '../components/Confetti';

const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'];

export default function ReservationPage() {
  const { libraryId, seatId } = useParams();
  const navigate = useNavigate();
  const [library, setLibrary]       = useState(null);
  const [seat, setSeat]             = useState(null);
  const [form, setForm]             = useState({ date:'', startTime:'', endTime:'' });
  const [loading, setLoading]       = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti]     = useState(false);

  useEffect(() => {
    Promise.all([API.get(`/libraries/${libraryId}`), API.get(`/seats?libraryId=${libraryId}`)])
      .then(([l,s]) => { setLibrary(l.data); setSeat(s.data.find(x=>x._id===seatId)); })
      .finally(()=>setPageLoading(false));
  }, [libraryId, seatId]);

  const getTomorrow = () => { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date||!form.startTime||!form.endTime){toast.error('Fill in all fields');return;}
    if (form.startTime>=form.endTime){toast.error('End time must be after start time');return;}
    setLoading(true);
    try {
      await API.post('/reservations',{libraryId,seatId,date:form.date,startTime:form.startTime,endTime:form.endTime});
      setConfetti(true); setShowSuccess(true);
    } catch(err){ toast.error(err.response?.data?.message||'Reservation failed'); }
    finally{ setLoading(false); }
  };

  const slotStyle = (active) => ({
    padding:'8px 10px', borderRadius:8, fontSize:12, fontWeight:700,
    background:active?'var(--gold)':'var(--surface2)',
    border:`1.5px solid ${active?'var(--gold-dk)':'var(--border-lt)'}`,
    color:active?'var(--navy)':'var(--text-muted)',
    cursor:'pointer', transition:'all 0.22s', fontFamily:'inherit',
    boxShadow:active?'0 4px 12px rgba(232,197,71,0.3)':'none'
  });

  if (pageLoading) return <div className="loading-screen" style={{minHeight:'80vh'}}><div className="spinner"/></div>;

  if (showSuccess) return (
    <div className="page-wrapper">
      <Confetti active={confetti}/>
      <div className="container">
        <div className="animate-scaleIn" style={{maxWidth:500,margin:'40px auto',background:'var(--surface)',borderRadius:24,padding:'52px 44px',textAlign:'center',boxShadow:'var(--shadow-xl)',border:'1px solid var(--border-lt)'}}>
          <span style={{fontSize:88,marginBottom:20,display:'block',animation:'heartbeat 1.5s ease infinite'}}>🎊</span>
          <h1 className="display" style={{fontSize:32,marginBottom:12}}>Reservation Submitted!</h1>
          <p style={{color:'var(--text-muted)',fontSize:15,lineHeight:1.7,marginBottom:28}}>Your reservation is pending admin approval. You'll be notified once confirmed.</p>
          <div style={{background:'var(--surface2)',borderRadius:14,padding:20,marginBottom:28,textAlign:'left',border:'1px solid var(--border)'}}>
            {[{l:'🏛 Library',v:library?.libraryName},{l:'💺 Seat',v:`${seat?.seatNumber} (${seat?.seatType})`},{l:'📅 Date',v:new Date(form.date).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})},{l:'🕐 Time',v:`${form.startTime} – ${form.endTime}`}].map((r,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:i<3?'1px solid var(--border)':'none',fontSize:14}}>
                <span style={{color:'var(--text-muted)'}}>{r.l}</span>
                <strong>{r.v}</strong>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn btn-primary btn-lg" onClick={()=>navigate('/my-reservations')}>📋 View My Bookings</button>
            <button className="btn btn-secondary btn-lg" onClick={()=>navigate('/libraries')}>🏛 More Libraries</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <button className="btn btn-secondary" style={{marginBottom:24}} onClick={()=>navigate(-1)}>← Back</button>

        <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:32,alignItems:'start'}}>

          {/* Form */}
          <div className="card animate-fadeInLeft">
            <div className="card-header">
              <h2 style={{fontSize:20,fontFamily:'Playfair Display,serif'}}>📅 Reserve Your Seat</h2>
              <p style={{color:'var(--text-muted)',fontSize:13,marginTop:4}}>Choose your preferred date and time</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <input type="date" className="form-control" min={getTomorrow()} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} required/>
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:8}}>
                    {TIME_SLOTS.slice(0,-1).map(t=>(
                      <button type="button" key={t} style={slotStyle(form.startTime===t)} onClick={()=>setForm(f=>({...f,startTime:t,endTime:''}))}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {form.startTime && (
                  <div className="form-group animate-fadeIn">
                    <label className="form-label">End Time</label>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:8}}>
                      {TIME_SLOTS.filter(t=>t>form.startTime).map(t=>(
                        <button type="button" key={t} style={slotStyle(form.endTime===t)} onClick={()=>setForm(f=>({...f,endTime:t}))}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center',marginTop:8}} disabled={loading||!form.date||!form.startTime||!form.endTime}>
                  {loading?<><span className="spinner" style={{width:20,height:20,borderTopColor:'#080F20'}}/>Submitting…</>:'✦ Submit Reservation'}
                </button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="animate-fadeInRight" style={{position:'sticky',top:90}}>
            <div style={{background:'var(--surface)',borderRadius:'var(--r)',border:'1px solid var(--border)',overflow:'hidden',boxShadow:'var(--shadow)'}}>
              <h3 style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',fontSize:16,fontFamily:'Playfair Display,serif'}}>📋 Booking Summary</h3>
              <div style={{height:155,overflow:'hidden',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {library?.image?<img src={library.image} alt={library?.libraryName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:48}}>📚</span>}
              </div>
              <div style={{padding:'18px 22px'}}>
                {[{l:'🏛 Library',v:library?.libraryName},{l:'📍 City',v:library?.city},{l:'💺 Seat',v:seat?.seatNumber},{l:'🪑 Type',v:seat?.seatType},
                  ...(form.date?[{l:'📅 Date',v:new Date(form.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}]:[]),
                  ...(form.startTime&&form.endTime?[{l:'🕐 Time',v:`${form.startTime} – ${form.endTime}`}]:[])
                ].map((r,i,arr)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<arr.length-1?'1px solid var(--border)':'none',gap:12,fontSize:13}}>
                    <span style={{color:'var(--text-muted)',flexShrink:0}}>{r.l}</span>
                    <strong style={{textAlign:'right',textTransform:'capitalize'}}>{r.v}</strong>
                  </div>
                ))}
              </div>
              <div style={{margin:'0 22px 20px',padding:'12px 14px',background:'rgba(232,197,71,0.06)',borderRadius:8,borderLeft:'3px solid var(--gold)',display:'flex',gap:8,alignItems:'flex-start',fontSize:12}}>
                <span>⏳</span>
                <p style={{color:'var(--text-muted)',lineHeight:1.6}}>Reservations require admin approval. You'll receive a status update shortly.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
