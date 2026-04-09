import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LibraryCard({ library }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const isClosed = library.status === 'Closed' || library.status === 'Maintenance';

  const statusMap = {
    Open:        { badge:'badge-open',         label:'Open' },
    Closed:      { badge:'badge-closed',       label:'Closed' },
    Maintenance: { badge:'badge-maintenance',  label:'Maintenance' },
  };
  const st = statusMap[library.status] || statusMap.Open;
  const closedIcon = library.status === 'Maintenance' ? '🔧' : '🔒';
  const popupMsg   = library.status === 'Maintenance'
    ? 'This library is temporarily closed for construction and maintenance work. It will reopen soon!'
    : 'This library is currently closed. We apologize for the inconvenience.';

  return (
    <>
      <style>{`
        .lib-card{cursor:pointer;transition:all 0.22s;border-radius:14px;overflow:hidden;background:#0D1B35;border:1px solid #1C2F55;position:relative;}
        .lib-card:hover:not(.lib-card--closed){transform:translateY(-6px);box-shadow:0 16px 48px rgba(0,0,0,0.6),0 0 0 1px #243668;border-color:#243668;}
        .lib-card--closed{opacity:0.55;filter:grayscale(0.7) brightness(0.8);cursor:pointer;}
        .lib-card--closed:hover{opacity:0.7;filter:grayscale(0.55) brightness(0.85);}
        .lib-card__img{position:relative;height:185px;overflow:hidden;background:#142444;}
        .lib-card__img img{width:100%;height:100%;object-fit:cover;transition:transform 0.45s ease;}
        .lib-card:hover:not(.lib-card--closed) .lib-card__img img{transform:scale(1.06);}
        .lib-card__placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:72px;background:#142444;}
        .lib-card__closed-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.72);backdrop-filter:blur(5px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:white;padding:20px;text-align:center;}
        .lib-card__closed-icon{font-size:48px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5));}
        .lib-card__closed-label{font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#E8C547;opacity:0.9;}
        .lib-card__body{padding:18px 20px;}
        .lib-card__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .lib-card__seats{font-size:12px;font-weight:600;color:#7A8BAD;}
        .lib-card__name{font-size:16px;font-weight:700;margin-bottom:5px;color:#E8E0D0;font-family:'Playfair Display',serif;line-height:1.3;}
        .lib-card__city{font-size:13px;font-weight:600;color:#E8C547;margin-bottom:3px;}
        .lib-card__address{color:#7A8BAD;margin-bottom:5px;font-size:12px;}
        .lib-card__hours{color:#7A8BAD;font-size:12px;}
        .lib-card__gold-accent{position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#E8C547,transparent);opacity:0;transition:opacity 0.22s;}
        .lib-card:hover:not(.lib-card--closed) .lib-card__gold-accent{opacity:1;}
      `}</style>

      <div
        className={`lib-card ${isClosed?'lib-card--closed':''}`}
        onClick={()=>{ if(isClosed){setShowPopup(true);}else{navigate(`/libraries/${library._id}`);} }}
      >
        <div className="lib-card__img">
          {library.image
            ? <img src={library.image} alt={library.libraryName}/>
            : <div className="lib-card__placeholder">📚</div>
          }
          {isClosed && (
            <div className="lib-card__closed-overlay">
              <span className="lib-card__closed-icon">{closedIcon}</span>
              <span className="lib-card__closed-label">{library.status}</span>
            </div>
          )}
        </div>
        <div className="lib-card__body">
          <div className="lib-card__top">
            <span className={`badge ${st.badge}`}>{st.label}</span>
            <span className="lib-card__seats">💺 {library.totalSeats} seats</span>
          </div>
          <h3 className="lib-card__name">{library.libraryName}</h3>
          <p className="lib-card__city">📍 {library.city}</p>
          <p className="lib-card__address">{library.address?.slice(0,50)}{library.address?.length>50?'…':''}</p>
          {library.openingHours && <p className="lib-card__hours">🕐 {library.openingHours}</p>}
        </div>
        <div className="lib-card__gold-accent"/>
      </div>

      {showPopup && (
        <div className="overlay" onClick={()=>setShowPopup(false)}>
          <div className="modal animate-popIn" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Library Unavailable</h3>
              <button className="btn btn-icon btn-secondary" onClick={()=>setShowPopup(false)}>✕</button>
            </div>
            <div className="modal-body text-center">
              <div style={{fontSize:72,marginBottom:16,animation:'float 3s ease-in-out infinite',display:'block'}}>{closedIcon}</div>
              <h3 className="display" style={{marginBottom:12,fontSize:22}}>{library.libraryName}</h3>
              <p style={{color:'var(--text-muted)',lineHeight:1.75,fontSize:14}}>{popupMsg}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={()=>setShowPopup(false)}>Understood ✓</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
