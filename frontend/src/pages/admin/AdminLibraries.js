import React,{useState,useEffect} from 'react';
import {toast} from 'react-toastify';
import API from '../../utils/api';

const EMPTY={libraryName:'',city:'',address:'',image:'',status:'Open',description:'',openingHours:'9:00 AM – 9:00 PM'};

export default function AdminLibraries(){
  const [libraries,setLibraries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [deleteConfirm,setDeleteConfirm]=useState(null);

  const fetch=()=>{setLoading(true);API.get('/libraries').then(r=>setLibraries(r.data)).finally(()=>setLoading(false));};
  useEffect(fetch,[]);

  const handleSave=async(e)=>{
    e.preventDefault();
    if(!form.libraryName||!form.city||!form.address){toast.error('Fill in required fields');return;}
    setSaving(true);
    try{
      if(modal==='add'){await API.post('/libraries',form);toast.success('Library added! 🏛');}
      else{
        await API.put(`/libraries/${form._id}`,form);
        toast.success('Library updated! ✅');
        if(form.status!=='Open') toast.info('All active reservations cancelled due to status change.');
      }
      setModal(null);fetch();
    }catch(err){toast.error(err.response?.data?.message||'Failed to save');}
    finally{setSaving(false);}
  };

  const handleDelete=async(id)=>{
    try{await API.delete(`/libraries/${id}`);toast.success('Library deleted');setDeleteConfirm(null);fetch();}
    catch(err){toast.error(err.response?.data?.message||'Failed to delete');}
  };

  const sb=s=>{const m={Open:'badge-open',Closed:'badge-closed',Maintenance:'badge-maintenance'};return<span className={`badge ${m[s]}`}>{s}</span>;};

  return(
    <div className="page-wrapper"><div className="container">
      <div className="page-header flex-between animate-fadeIn">
        <div><h1>🏛 Library Management</h1><p className="text-muted">Add, edit and manage all libraries</p></div>
        <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setModal('add');}}>+ Add Library</button>
      </div>

      {loading?<div className="loading-screen mt-32"><div className="spinner"/></div>:(
        <div className="card animate-fadeIn">
          <div className="table-wrapper"><table>
            <thead><tr><th>Library</th><th>City</th><th>Status</th><th>Seats</th><th>Hours</th><th>Actions</th></tr></thead>
            <tbody>{libraries.map(lib=>(
              <tr key={lib._id}>
                <td>
                  <div style={{display:'flex',gap:12,alignItems:'center'}}>
                    <div style={{width:44,height:44,borderRadius:8,overflow:'hidden',background:'var(--surface2)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                      {lib.image?<img src={lib.image} alt={lib.libraryName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'📚'}
                    </div>
                    <div><strong style={{display:'block'}}>{lib.libraryName}</strong><span style={{fontSize:11,color:'var(--text-muted)'}}>{lib.address?.slice(0,40)}{lib.address?.length>40?'…':''}</span></div>
                  </div>
                </td>
                <td>{lib.city}</td>
                <td>{sb(lib.status)}</td>
                <td><strong>{lib.totalSeats}</strong></td>
                <td style={{fontSize:12,color:'var(--text-muted)'}}>{lib.openingHours}</td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>{setForm({...lib});setModal('edit');}}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>setDeleteConfirm(lib._id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      )}
    </div>

    {modal&&(
      <div className="overlay" onClick={()=>setModal(null)}>
        <div className="modal modal--wide animate-scaleIn" onClick={e=>e.stopPropagation()}>
          <div className="modal-header">
            <h3>{modal==='add'?'+ Add Library':'✏️ Edit Library'}</h3>
            <button className="btn btn-icon btn-secondary" onClick={()=>setModal(null)}>✕</button>
          </div>
          <form onSubmit={handleSave}>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Library Name *</label><input className="form-control" value={form.libraryName} onChange={e=>setForm(f=>({...f,libraryName:e.target.value}))} required/></div>
                <div className="form-group"><label className="form-label">City *</label><input className="form-control" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} required/></div>
              </div>
              <div className="form-group"><label className="form-label">Address *</label><input className="form-control" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} required/></div>
              <div className="form-group"><label className="form-label">Image URL</label><input className="form-control" placeholder="https://…" value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))}/></div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                    {['Open','Closed','Maintenance'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  {form.status!=='Open'&&<p style={{fontSize:12,color:'#E8C547',marginTop:6}}>⚠️ Changing status will cancel all active reservations.</p>}
                </div>
                <div className="form-group"><label className="form-label">Opening Hours</label><input className="form-control" value={form.openingHours} onChange={e=>setForm(f=>({...f,openingHours:e.target.value}))}/></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<><span className="spinner" style={{width:18,height:18,borderTopColor:'#080F20'}}/>Saving…</>:'💾 Save'}</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {deleteConfirm&&(
      <div className="overlay" onClick={()=>setDeleteConfirm(null)}>
        <div className="modal animate-scaleIn" onClick={e=>e.stopPropagation()}>
          <div className="modal-header"><h3>Delete Library?</h3></div>
          <div className="modal-body text-center"><div style={{fontSize:52,marginBottom:12}}>🗑️</div><p style={{color:'var(--text-muted)'}}>This will permanently delete the library. This cannot be undone.</p></div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={()=>setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={()=>handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
