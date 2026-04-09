import React,{useState,useEffect} from 'react';
import {toast} from 'react-toastify';
import API from '../../utils/api';
const TYPES=['regular','window','quiet','computer'];
const ICONS={regular:'💺',window:'🪟',quiet:'🤫',computer:'💻'};
const SCOLOR={available:'#4ECDC4',reserved:'#FF6B8A',unavailable:'#7A8BAD'};

export default function AdminSeats(){
  const [seats,setSeats]=useState([]);const [libraries,setLibraries]=useState([]);const [loading,setLoading]=useState(true);
  const [filterLib,setFilterLib]=useState('');const [modal,setModal]=useState(false);const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({libraryId:'',seatNumber:'',seatType:'regular',status:'available'});
  const [deleteConfirm,setDeleteConfirm]=useState(null);
  const fetchAll=()=>{setLoading(true);Promise.all([API.get('/seats'),API.get('/libraries')]).then(([s,l])=>{setSeats(s.data);setLibraries(l.data);}).finally(()=>setLoading(false));};
  useEffect(fetchAll,[]);
  const handleAdd=async(e)=>{e.preventDefault();if(!form.libraryId||!form.seatNumber){toast.error('Fill required fields');return;}setSaving(true);
    try{await API.post('/seats',form);toast.success('Seat added! 💺');setModal(false);fetchAll();}catch(err){toast.error('Failed');}finally{setSaving(false);}};
  const handleToggle=async(seat)=>{const ns=seat.status==='available'?'unavailable':'available';
    try{await API.put(`/seats/${seat._id}`,{status:ns});toast.success(`Marked as ${ns}`);fetchAll();}catch{toast.error('Failed');}};
  const handleDelete=async(id)=>{try{await API.delete(`/seats/${id}`);toast.success('Removed');setDeleteConfirm(null);fetchAll();}catch(err){toast.error('Failed');}};
  const filtered=filterLib?seats.filter(s=>(s.libraryId?._id||s.libraryId)===filterLib):seats;
  const grouped=filtered.reduce((a,s)=>{const id=s.libraryId?._id||s.libraryId;const n=s.libraryId?.libraryName||'Unknown';if(!a[id])a[id]={name:n,seats:[]};a[id].seats.push(s);return a;},{});
  return(
    <div className="page-wrapper"><div className="container">
      <div className="page-header flex-between animate-fadeIn">
        <div><h1>💺 Seat Management</h1><p className="text-muted">Manage seats across all libraries</p></div>
        <button className="btn btn-primary" onClick={()=>{setForm({libraryId:libraries[0]?._id||'',seatNumber:'',seatType:'regular',status:'available'});setModal(true);}}>+ Add Seat</button>
      </div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}} className="animate-fadeIn">
        <select className="form-control" style={{maxWidth:300}} value={filterLib} onChange={e=>setFilterLib(e.target.value)}>
          <option value="">All Libraries ({seats.length} seats)</option>
          {libraries.map(l=><option key={l._id} value={l._id}>{l.libraryName} ({seats.filter(s=>(s.libraryId?._id||s.libraryId)===l._id).length})</option>)}
        </select>
      </div>
      {loading?<div className="loading-screen mt-32"><div className="spinner"/></div>:(
        Object.entries(grouped).map(([libId,{name,seats:ls}])=>(
          <div key={libId} className="card mb-24 animate-fadeIn">
            <div className="card-header flex-between">
              <div>
                <h3 style={{fontSize:16,fontFamily:'Playfair Display,serif'}}>🏛 {name}</h3>
                <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
                  {[{s:'available',c:'badge-approved',l:'Available'},{s:'reserved',c:'badge-rejected',l:'Reserved'},{s:'unavailable',c:'badge-cancelled',l:'Unavailable'}].map(x=>(
                    <span key={x.s} className={`badge ${x.c}`}>{ls.filter(s=>s.status===x.s).length} {x.l}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:10,padding:20}}>
              {ls.map(seat=>(
                <div key={seat._id} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'12px 8px',borderRadius:8,border:`1.5px solid ${SCOLOR[seat.status]}30`,background:`${SCOLOR[seat.status]}08`,textAlign:'center',gap:4,transition:'all 0.22s',opacity:seat.status==='unavailable'?0.6:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <span style={{fontSize:22}}>{ICONS[seat.seatType]||'💺'}</span>
                    <span className={`badge ${seat.status==='available'?'badge-approved':seat.status==='reserved'?'badge-rejected':'badge-cancelled'}`} style={{fontSize:9}}>{seat.status}</span>
                  </div>
                  <strong style={{fontSize:13}}>{seat.seatNumber}</strong>
                  <span style={{fontSize:10,color:'var(--text-muted)',textTransform:'capitalize'}}>{seat.seatType}</span>
                  <div style={{display:'flex',gap:5,marginTop:6}}>
                    <button className="btn btn-secondary btn-sm" style={{padding:'3px 8px',fontSize:11}} onClick={()=>handleToggle(seat)} disabled={seat.status==='reserved'}>{seat.status==='available'?'⛔':'✅'}</button>
                    <button className="btn btn-danger btn-sm" style={{padding:'3px 8px',fontSize:11}} onClick={()=>setDeleteConfirm(seat._id)} disabled={seat.status==='reserved'}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      {!loading&&Object.keys(grouped).length===0&&<div className="empty-state mt-32"><div className="empty-icon">💺</div><h3>No seats found</h3><p>Add seats to get started.</p></div>}
    </div>
    {modal&&(<div className="overlay" onClick={()=>setModal(false)}><div className="modal animate-scaleIn" onClick={e=>e.stopPropagation()}>
      <div className="modal-header"><h3>+ Add New Seat</h3><button className="btn btn-icon btn-secondary" onClick={()=>setModal(false)}>✕</button></div>
      <form onSubmit={handleAdd}><div className="modal-body">
        <div className="form-group"><label className="form-label">Library *</label><select className="form-control" value={form.libraryId} onChange={e=>setForm(f=>({...f,libraryId:e.target.value}))} required><option value="">Select library</option>{libraries.map(l=><option key={l._id} value={l._id}>{l.libraryName} – {l.city}</option>)}</select></div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Seat Number *</label><input className="form-control" placeholder="e.g. S21" value={form.seatNumber} onChange={e=>setForm(f=>({...f,seatNumber:e.target.value}))} required/></div>
          <div className="form-group"><label className="form-label">Type</label><select className="form-control" value={form.seatType} onChange={e=>setForm(f=>({...f,seatType:e.target.value}))}>{TYPES.map(t=><option key={t} value={t}>{ICONS[t]} {t}</option>)}</select></div>
        </div>
      </div>
      <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving?<span className="spinner" style={{width:18,height:18,borderTopColor:'#080F20'}}/>:'💾 Add Seat'}</button></div>
      </form>
    </div></div>)}
    {deleteConfirm&&(<div className="overlay" onClick={()=>setDeleteConfirm(null)}><div className="modal animate-scaleIn" onClick={e=>e.stopPropagation()}>
      <div className="modal-header"><h3>Remove Seat?</h3></div>
      <div className="modal-body text-center"><p style={{color:'var(--text-muted)'}}>Remove this seat permanently?</p></div>
      <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" onClick={()=>handleDelete(deleteConfirm)}>Remove</button></div>
    </div></div>)}
    </div>
  );
}
