import React,{useState,useEffect} from 'react';
import {toast} from 'react-toastify';
import API from '../../utils/api';
import Confetti from '../../components/Confetti';

const STATUS_BADGE={Pending:'badge-pending',Approved:'badge-approved',Rejected:'badge-rejected',Cancelled:'badge-cancelled'};

export default function AdminReservations(){
  const [reservations,setReservations]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState('All');
  const [actionLoading,setActionLoading]=useState(null);
  const [noteModal,setNoteModal]=useState(null);
  const [note,setNote]=useState('');
  const [happyConf,setHappyConf]=useState(false);
  const [sadConf,setSadConf]=useState(false);
  const [search,setSearch]=useState('');

  const fetchAll=()=>{setLoading(true);API.get('/reservations').then(r=>setReservations(r.data)).finally(()=>setLoading(false));};
  useEffect(fetchAll,[]);

  const handleAction=async(id,action,adminNote='')=>{
    setActionLoading(id+action);
    try{
      await API.put(`/reservations/${id}/${action}`,{adminNote});
      if(action==='approve'){setHappyConf(true);setTimeout(()=>setHappyConf(false),4000);toast.success('Reservation approved! 🎉');}
      else{setSadConf(true);setTimeout(()=>setSadConf(false),3500);toast.info(action==='reject'?'Reservation rejected':'Reservation cancelled 😔');}
      fetchAll();
    }catch(err){toast.error(err.response?.data?.message||'Action failed');}
    finally{setActionLoading(null);setNoteModal(null);setNote('');}
  };

  // Admin can cancel ANY status except already-cancelled/rejected
  const canCancel  = r => r.status!=='Cancelled'&&r.status!=='Rejected';
  const canApprove = r => r.status==='Pending';
  const canReject  = r => r.status==='Pending';

  const filtered=reservations.filter(r=>{
    const ms=filter==='All'||r.status===filter;
    const mq=!search||r.userId?.name?.toLowerCase().includes(search.toLowerCase())||r.libraryId?.libraryName?.toLowerCase().includes(search.toLowerCase())||r.seatId?.seatNumber?.toLowerCase().includes(search.toLowerCase());
    return ms&&mq;
  });
  const counts=reservations.reduce((a,r)=>({...a,[r.status]:(a[r.status]||0)+1}),{});

  const filterBtnStyle=(s)=>({
    padding:'7px 16px',borderRadius:999,fontSize:12,fontWeight:700,cursor:'pointer',border:'1.5px solid',
    fontFamily:'inherit',transition:'all 0.22s',
    background:filter===s?'var(--gold)':'transparent',
    color:filter===s?'var(--navy)':'var(--text-muted)',
    borderColor:filter===s?'var(--gold)':'var(--border-lt)',
  });

  return(
    <div className="page-wrapper">
      <Confetti active={happyConf}/>
      <Confetti active={sadConf} sad/>
      <div className="container">
        <div className="page-header animate-fadeIn">
          <h1>📋 Reservation Management</h1>
          <p>Approve, reject or cancel reservation requests — admin can act at any time</p>
        </div>

        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap',alignItems:'center'}} className="animate-fadeIn">
          <input className="form-control" style={{maxWidth:280}} placeholder="🔍 Search student or library…" value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {['All','Pending','Approved','Rejected','Cancelled'].map(s=>(
              <button key={s} style={filterBtnStyle(s)} onClick={()=>setFilter(s)}>
                {s} <span style={{marginLeft:4,padding:'1px 6px',borderRadius:999,fontSize:10,background:filter===s?'rgba(0,0,0,0.15)':'var(--surface2)',color:'inherit'}}>{s==='All'?reservations.length:(counts[s]||0)}</span>
              </button>
            ))}
          </div>
        </div>

        {loading?<div className="loading-screen mt-32"><div className="spinner"/></div>
        :filtered.length===0?<div className="empty-state mt-32"><div className="empty-icon">📭</div><h3>No reservations found</h3></div>
        :(
          <div className="card animate-fadeIn">
            <div className="table-wrapper"><table>
              <thead><tr><th>Student</th><th>Library</th><th>Seat</th><th>Date & Time</th><th>Status</th><th>Booked</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(r=>(
                <tr key={r._id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#E8C547,#B8960A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#080F20',fontSize:11,fontWeight:800,flexShrink:0}}>{r.userId?.name?.[0]?.toUpperCase()}</div>
                      <div><strong style={{display:'block',fontSize:13}}>{r.userId?.name}</strong><span style={{fontSize:11,color:'var(--text-muted)'}}>{r.userId?.email}</span></div>
                    </div>
                  </td>
                  <td><strong style={{fontSize:13}}>{r.libraryId?.libraryName}</strong><br/><span style={{fontSize:11,color:'var(--text-muted)'}}>📍{r.libraryId?.city}</span></td>
                  <td>💺 <strong>{r.seatId?.seatNumber}</strong><br/><span style={{fontSize:11,color:'var(--text-muted)'}}>{r.seatId?.seatType}</span></td>
                  <td><span style={{fontSize:12}}>📅 {new Date(r.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span><br/><span style={{fontSize:11,color:'var(--text-muted)'}}>🕐{r.startTime}–{r.endTime}</span></td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                    {r.adminNote&&<p style={{fontSize:11,color:'var(--text-muted)',marginTop:4,fontStyle:'italic',maxWidth:130}}>"{r.adminNote}"</p>}
                    {r.cancellationReason&&<p style={{fontSize:11,color:'var(--text-muted)',marginTop:4,maxWidth:130}}>{r.cancellationReason}</p>}
                  </td>
                  <td style={{fontSize:11,color:'var(--text-muted)'}}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap',minWidth:130}}>
                      {canApprove(r)&&<button className="btn btn-success btn-sm" disabled={!!actionLoading} onClick={()=>handleAction(r._id,'approve')}>✅ Approve</button>}
                      {canReject(r)&&<button className="btn btn-warning btn-sm" disabled={!!actionLoading} onClick={()=>{setNoteModal({id:r._id,action:'reject'});setNote('');}}>❌ Reject</button>}
                      {canCancel(r)&&<button className="btn btn-danger btn-sm" disabled={!!actionLoading} onClick={()=>{setNoteModal({id:r._id,action:'cancel'});setNote('');}}>🚫 Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}
      </div>

      {noteModal&&(
        <div className="overlay" onClick={()=>setNoteModal(null)}>
          <div className="modal animate-scaleIn" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{noteModal.action==='reject'?'❌ Reject Reservation':'🚫 Cancel Reservation'}</h3>
              <button className="btn btn-icon btn-secondary" onClick={()=>setNoteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{color:'var(--text-muted)',marginBottom:16,fontSize:14}}>Leave an optional note for the student:</p>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <textarea className="form-control" rows={3} placeholder={noteModal.action==='reject'?'Reason for rejection…':'Reason for cancellation…'} value={note} onChange={e=>setNote(e.target.value)}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setNoteModal(null)}>Back</button>
              <button className={`btn ${noteModal.action==='reject'?'btn-warning':'btn-danger'}`}
                disabled={actionLoading===noteModal.id+noteModal.action}
                onClick={()=>handleAction(noteModal.id,noteModal.action,note)}>
                {actionLoading?<span className="spinner" style={{width:18,height:18}}/>:noteModal.action==='reject'?'Confirm Reject':'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
