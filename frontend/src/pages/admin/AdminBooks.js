import React,{useState,useEffect} from 'react';
import {toast} from 'react-toastify';
import API from '../../utils/api';
const EMPTY={title:'',author:'',libraryId:'',quantity:1,genre:'General',isbn:''};
const GENRES=['General','Fiction','Non-Fiction','Fantasy','Science','History','Biography','Self-Help','Classic','Sci-Fi','Dystopian','Finance','Romance','Mystery'];
export default function AdminBooks(){
  const [books,setBooks]=useState([]);const [libraries,setLibraries]=useState([]);const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);const [form,setForm]=useState(EMPTY);const [saving,setSaving]=useState(false);
  const [deleteConfirm,setDeleteConfirm]=useState(null);const [search,setSearch]=useState('');const [filterLib,setFilterLib]=useState('');
  const fetchAll=()=>{setLoading(true);Promise.all([API.get('/books'),API.get('/libraries')]).then(([b,l])=>{setBooks(b.data);setLibraries(l.data);}).finally(()=>setLoading(false));};
  useEffect(fetchAll,[]);
  const handleSave=async(e)=>{e.preventDefault();if(!form.title||!form.author||!form.libraryId){toast.error('Fill required fields');return;}setSaving(true);
    try{if(modal==='add'){await API.post('/books',form);toast.success('Book added! 📖');}else{await API.put(`/books/${form._id}`,form);toast.success('Book updated!');}setModal(null);fetchAll();}
    catch(err){toast.error(err.response?.data?.message||'Failed');}finally{setSaving(false);}};
  const handleDelete=async(id)=>{try{await API.delete(`/books/${id}`);toast.success('Deleted');setDeleteConfirm(null);fetchAll();}catch(err){toast.error('Failed');}};
  const filtered=books.filter(b=>{
    const ms=!search||b.title.toLowerCase().includes(search.toLowerCase())||b.author.toLowerCase().includes(search.toLowerCase());
    const ml=!filterLib||(b.libraryId?._id||b.libraryId)===filterLib;return ms&&ml;});
  return(
    <div className="page-wrapper"><div className="container">
      <div className="page-header flex-between animate-fadeIn">
        <div><h1>📖 Book Management</h1><p className="text-muted">Manage library book inventory</p></div>
        <button className="btn btn-primary" onClick={()=>{setForm({...EMPTY,libraryId:libraries[0]?._id||''});setModal('add');}}>+ Add Book</button>
      </div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}} className="animate-fadeIn">
        <input className="form-control" style={{maxWidth:300}} placeholder="🔍 Search books…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="form-control" style={{maxWidth:260}} value={filterLib} onChange={e=>setFilterLib(e.target.value)}>
          <option value="">All Libraries</option>{libraries.map(l=><option key={l._id} value={l._id}>{l.libraryName}</option>)}
        </select>
      </div>
      {loading?<div className="loading-screen mt-32"><div className="spinner"/></div>:(
        <div className="card animate-fadeIn"><div className="table-wrapper"><table>
          <thead><tr><th>Title</th><th>Author</th><th>Library</th><th>Genre</th><th>Qty</th><th>Actions</th></tr></thead>
          <tbody>{filtered.length===0?<tr><td colSpan="6" style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>No books found</td></tr>
          :filtered.map(b=>(
            <tr key={b._id}>
              <td><strong>{b.title}</strong></td><td>{b.author}</td>
              <td><span style={{fontSize:12}}>{b.libraryId?.libraryName}</span><br/><span style={{fontSize:11,color:'var(--text-muted)'}}>📍{b.libraryId?.city}</span></td>
              <td><span className="badge" style={{background:'rgba(122,139,173,0.1)',color:'var(--text-muted)',border:'1px solid var(--border-lt)'}}>{b.genre}</span></td>
              <td><span className={`badge ${b.quantity>0?'badge-approved':'badge-rejected'}`}>{b.quantity}</span></td>
              <td><div style={{display:'flex',gap:6}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>{setForm({...b,libraryId:b.libraryId?._id||b.libraryId});setModal('edit');}}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={()=>setDeleteConfirm(b._id)}>🗑️</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div></div>
      )}
    </div>
    {modal&&(<div className="overlay" onClick={()=>setModal(null)}><div className="modal modal--wide animate-scaleIn" onClick={e=>e.stopPropagation()}>
      <div className="modal-header"><h3>{modal==='add'?'+ Add Book':'✏️ Edit Book'}</h3><button className="btn btn-icon btn-secondary" onClick={()=>setModal(null)}>✕</button></div>
      <form onSubmit={handleSave}><div className="modal-body">
        <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Author *</label><input className="form-control" value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} required/></div>
          <div className="form-group"><label className="form-label">Library *</label><select className="form-control" value={form.libraryId} onChange={e=>setForm(f=>({...f,libraryId:e.target.value}))} required><option value="">Select library</option>{libraries.map(l=><option key={l._id} value={l._id}>{l.libraryName}</option>)}</select></div>
        </div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Genre</label><select className="form-control" value={form.genre} onChange={e=>setForm(f=>({...f,genre:e.target.value}))}>{GENRES.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-control" min={0} value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:parseInt(e.target.value)||0}))}/></div>
        </div>
        <div className="form-group"><label className="form-label">ISBN</label><input className="form-control" placeholder="Optional" value={form.isbn} onChange={e=>setForm(f=>({...f,isbn:e.target.value}))}/></div>
      </div>
      <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving?<><span className="spinner" style={{width:18,height:18,borderTopColor:'#080F20'}}/>Saving…</>:'💾 Save'}</button></div>
      </form>
    </div></div>)}
    {deleteConfirm&&(<div className="overlay" onClick={()=>setDeleteConfirm(null)}><div className="modal animate-scaleIn" onClick={e=>e.stopPropagation()}>
      <div className="modal-header"><h3>Delete Book?</h3></div>
      <div className="modal-body text-center"><div style={{fontSize:48,marginBottom:12}}>📕</div><p style={{color:'var(--text-muted)'}}>Remove this book from the library?</p></div>
      <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" onClick={()=>handleDelete(deleteConfirm)}>Delete</button></div>
    </div></div>)}
    </div>
  );
}
