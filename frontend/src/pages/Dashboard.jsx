import { Children, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { categories, conditions } from '../utils/constants';
import { currency } from '../utils/date';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import CSVImporter from '../components/CSVImporter';

export default function Dashboard(){
  const { user } = useAuth();
  const [tools,setTools]=useState([]), [reservations,setReservations]=useState([]), [msg,setMsg]=useState(''), [confirm,setConfirm]=useState(null);
  const [activeTab, setActiveTab] = useState('manual');
  const { register, handleSubmit, reset }=useForm({defaultValues:{category:'Power Tools',condition:'Good'}});

  async function load(){ const [t,r]=await Promise.all([api.get('/tools'),api.get('/reservations')]); setTools(t.data.items); setReservations(r.data); }
  useEffect(()=>{load()},[]);
  async function addTool(data){ await api.post('/tools',{...data,daily_rate:Number(data.daily_rate),blackout_dates:(data.blackout_dates||'').split(',').map(s=>s.trim()).filter(Boolean)}); reset(); setMsg('Tool listed.'); load(); }
  async function act(id, action){ await api.put('/reservations/'+id+'/'+action); setMsg('Reservation updated.'); load(); }
  async function del(id){ await api.delete('/tools/'+id); setConfirm(null); setMsg('Tool deleted.'); load(); }
  async function review(id){ const rating = Number(prompt('Rating 1-5')); const comment = prompt('Review comment'); if(!rating || !comment) return; await api.post('/reviews',{reservation_id:id,rating,comment}); setMsg('Review submitted.'); load(); }
  
  const ownedTools=tools.filter(t=>t.owner_id===user?.id || user?.role==='admin');
  const incoming=reservations.filter(r=>r.status==='Pending' && (r.owner_id===user?.id || user?.role==='admin'));
  const current=reservations.filter(r=>['Pending','Confirmed','Overdue'].includes(r.status));
  const done=reservations.filter(r=>['Completed','Cancelled','Declined'].includes(r.status));
  const tabClass = (tab) => 'pb-2.5 px-4 font-bold text-sm border-b-2 transition ' + (activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-stone-500 hover:text-stone-700');
  
  return <div className="space-y-6">
    <h1 className="text-3xl font-black text-primary">Dashboard</h1>
    <section className="card p-5"><div className="mb-5 flex border-b border-stone-200"><button onClick={() => setActiveTab('manual')} className={tabClass('manual')}>Single Listing</button><button onClick={() => setActiveTab('csv')} className={tabClass('csv')}>Bulk Import (CSV)</button></div>{activeTab === 'manual' ? (<form onSubmit={handleSubmit(addTool)} className="grid gap-3 md:grid-cols-3"><input className="input" placeholder="Name" {...register('name',{required:true})}/><select className="input" {...register('category')}>{categories.map(c=><option key={c}>{c}</option>)}</select><select className="input" {...register('condition')}>{conditions.map(c=><option key={c}>{c}</option>)}</select><input className="input" type="number" step="0.01" placeholder="Daily rate" {...register('daily_rate',{required:true})}/><input className="input md:col-span-2" placeholder="Image URL" {...register('image_url',{required:true})}/><textarea className="input md:col-span-2" placeholder="Description" {...register('description',{required:true})}/><button type="button" onClick={() => setActiveTab('csv')} className="btn-secondary !py-2.5 flex items-center justify-center gap-2 font-bold">Bulk Import (CSV)</button><button className="btn-primary md:col-span-3">Create Tool</button></form>) : (<CSVImporter onImportComplete={(message) => { setMsg(message); load(); }} />)}</section><section className="grid gap-5 lg:grid-cols-2"><Panel title="My Tools">{ownedTools.map(t=><div key={t.id} className="flex items-center justify-between border-t py-3"><span><b>{t.name}</b><small className="block text-stone-500">{currency(t.daily_rate)} - {t.average_rating || 0}/5{!t.is_available ? ' - Not available for now' : ''}</small></span><button className="btn-secondary" onClick={()=>setConfirm(t)}>Delete</button></div>)}</Panel><Panel title="Incoming Requests">{incoming.map(r=><div key={r.id} className="border-t py-3"><b>{r.tool_name}</b><p className="text-sm text-stone-600">{r.borrower_name}: {r.start_date} to {r.end_date}</p><div className="mt-2 flex gap-2"><button className="btn-primary" onClick={()=>act(r.id,'approve')}>Approve</button><button className="btn-secondary" onClick={()=>act(r.id,'decline')}>Decline</button></div></div>)}</Panel><Panel title="Current Reservations">{current.map(r=><ReservationRow key={r.id} r={r}/>)}</Panel><Panel title="History and Reviews">{done.map(r=><div key={r.id}><ReservationRow r={r}/>{r.status==='Completed'&&<button className="btn-secondary mb-3" onClick={()=>review(r.id)}>Leave review</button>}</div>)}</Panel></section><ConfirmDialog open={!!confirm} title="Delete listing" text="This removes the tool listing." onClose={()=>setConfirm(null)} onConfirm={()=>del(confirm.id)} confirmLabel="Delete"/><Toast message={msg} onClose={()=>setMsg('')}/></div> }

function Panel({title,children}){ return <div className="card p-5"><h2 className="mb-3 text-xl font-bold text-primary">{title}</h2>{Children.count(children)?children:<p className="text-sm text-stone-600">Nothing here yet.</p>}</div> }
function ReservationRow({r}){ return <div className="border-t py-3"><b>{r.tool_name}</b><p className="text-sm text-stone-600">{r.start_date} to {r.end_date} - {r.status} - {currency(r.total_price)}</p></div> }
