import { useState, useEffect } from "react";
import {
  Badge, Av, Prg, Modal, Field, ToastContainer,
  Stat, SectionHeader, Empty, CashflowChart,
  fmtCFA, fmtDate, ini, avc, calcLoan,
  SHARED_CSS,
} from "@/components/ui/index";

// ── ToursPage ─────────────────────────────────────────────────
export function ToursPage({ api, toast, members=[], canManage }) {
  const [tours, setTours] = useState([]);
  useEffect(() => { api.getTours().then(setTours).catch(()=>{}); }, []);
  const nextP = [...tours].sort((a,b)=>a.pos-b.pos).find(t=>t.status==="pending");

  const doAuto = async shuffle => {
    const t = await api.autoAssignTours(shuffle);
    if (Array.isArray(t)) setTours(t);
    else {
      const active = [...members.filter(m=>m.status==="active")];
      if(shuffle) active.sort(()=>Math.random()-.5);
      const base=new Date("2025-01-01");
      setTours(active.map((m,i)=>{const d=new Date(base);d.setMonth(d.getMonth()+i);return{id:Date.now()+i,mid:m.id,name:m.name,pos:i+1,date:d.toISOString().slice(0,10),status:"pending",amount:0};}));
    }
    toast(shuffle?"Tirage au sort effectué ✓":"Tours assignés ✓");
  };

  return (
    <>
      <style>{SHARED_CSS}</style>
      <SectionHeader title="Tours de passage" sub={`${tours.filter(t=>t.status==="completed").length} réalisés`}>
        {canManage && (
          <>
            <button className="btn btn-p" onClick={()=>doAuto(true)}>🎲 Tirage au sort</button>
            <button className="btn btn-g" onClick={()=>doAuto(false)}>Ordre inscription</button>
          </>
        )}
      </SectionHeader>
      <div className="card">
        {tours.length===0 && <Empty icon="↻" msg="Aucun tour assigné"/>}
        {[...tours].sort((a,b)=>a.pos-b.pos).map(t=>{
          const isNext = nextP && t.id===nextP.id;
          return (
            <div className="row" key={t.id}>
              <div style={{ width:30,height:30,borderRadius:"50%",border:`1.5px solid ${t.status==="completed"?"#bbf7d0":isNext?"var(--blbd)":"var(--b2)"}`,background:t.status==="completed"?"#f0fdf4":isNext?"var(--blbg)":"var(--surf2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--fd)",fontWeight:800,color:t.status==="completed"?"#166534":isNext?"var(--blue)":"var(--t3)",fontSize:12,flexShrink:0 }}>
                {t.pos}
              </div>
              <Av name={t.name} id={t.mid}/>
              <div style={{ flex:1 }}>
                <div className="row-name">{t.name}</div>
                <div className="row-sub">Prévu : {fmtDate(t.date)}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                {t.status==="completed" && <div style={{ fontFamily:"var(--fd)",fontWeight:800,fontSize:14,marginBottom:4 }}>{fmtCFA(t.amount)}</div>}
                {isNext && t.status!=="completed" && <span className="badge b-bl" style={{ marginBottom:4 }}>Prochain</span>}
                <Badge status={t.status}/>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
