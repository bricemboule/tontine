import { useState, useEffect } from "react";
import {
  Badge, Av, Prg, Modal, Field, ToastContainer,
  Stat, SectionHeader, Empty, CashflowChart,
  fmtCFA, fmtDate, ini, avc, calcLoan,
  SHARED_CSS,
} from "@/components/ui/index";

// ── PaymentsPage ──────────────────────────────────────────────
export function PaymentsPage({ api, toast, members=[], canInitiate, canValidate }) {
  const [pays,  setPays]  = useState([]);
  const [tab,   setTab]   = useState("all");
  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({ mid:"", amount:"", method:"orange_money", desc:"" });
  const ff = (k,v) => setForm(p=>({...p,[k]:v}));
  const METH = { orange_money:"Orange Money", mtn_momo:"MTN MoMo", virement:"Virement", especes:"Espèces" };
  const ICON = { orange_money:"🟠", mtn_momo:"🟡", virement:"🏦", especes:"💵" };

  useEffect(() => { api.getPayments().then(setPays).catch(()=>{}); }, []);

  const list = tab==="all" ? pays : pays.filter(p=>p.status===tab);

  const doInitiate = async () => {
    const p = await api.initiatePayment({ member_id:parseInt(form.mid), amount:parseFloat(form.amount), method:form.method, description:form.desc });
    setPays(prev => [p, ...prev]); setModal(false);
    toast("Paiement initié ✓");
  };

  const doValidate = async id => {
    await api.validatePayment(id);
    setPays(p=>p.map(x=>x.id===id?{...x,status:"success"}:x));
    toast("Paiement validé ✓");
  };

  return (
    <>
      <style>{SHARED_CSS}</style>
      <SectionHeader title={`Paiements (${pays.length})`}>
        {canInitiate && <button className="btn btn-p" onClick={()=>setModal(true)}>+ Initier</button>}
      </SectionHeader>

      <div className="card">
        <div className="tabs">
          {[["all","Tous",pays.length],["success","Validés",pays.filter(p=>p.status==="success").length],
            ["pending","En attente",pays.filter(p=>p.status==="pending").length],
            ["failed","Échoués",pays.filter(p=>p.status==="failed").length]].map(([id,l,ct])=>(
            <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{l}<span className="tab-n">{ct}</span></button>
          ))}
        </div>
        {list.length===0 && <Empty icon="◈" msg="Aucun paiement"/>}
        {list.map(p => (
          <div className="row" key={p.id}>
            <div style={{ width:32,height:32,borderRadius:"var(--rs)",background:"var(--surf2)",border:"1px solid var(--b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>
              {ICON[p.method]||"💵"}
            </div>
            <div style={{ flex:1 }}>
              <div className="row-name" style={{ fontSize:12.5 }}>{p.ref}</div>
              <div className="row-sub">{p.name} · {METH[p.method]} · {p.date}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"var(--fd)",fontWeight:800,fontSize:14,marginBottom:4 }}>{fmtCFA(p.amount)}</div>
              <Badge status={p.status}/>
            </div>
            {p.status==="pending" && canValidate && (
              <button className="btn btn-grn btn-sm" onClick={()=>doValidate(p.id)}>Valider</button>
            )}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Initier un paiement">
        <Field label="Membre" as="select" value={form.mid} onChange={e=>ff("mid",e.target.value)}>
          <option value="">— Choisir —</option>
          {members.filter(m=>m.status==="active").map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </Field>
        <div className="r2">
          <Field label="Montant (XAF)" type="number" value={form.amount} onChange={e=>ff("amount",e.target.value)} placeholder="50 000"/>
          <Field label="Mode" as="select" value={form.method} onChange={e=>ff("method",e.target.value)}>
            {Object.entries(METH).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </Field>
        </div>
        <Field label="Description" value={form.desc} onChange={e=>ff("desc",e.target.value)} placeholder="ex: Cotisation avril 2025"/>
        <div className="notice n-bl" style={{ marginTop:10 }}>
          {["orange_money","mtn_momo"].includes(form.method) ? "Confirmation automatique via webhook." : "Paiement manuel — à valider après réception."}
        </div>
        <div className="macts">
          <button className="btn btn-g" onClick={()=>setModal(false)}>Annuler</button>
          <button className="btn btn-p" disabled={!form.mid||!form.amount} onClick={doInitiate}>Initier</button>
        </div>
      </Modal>
    </>
  );
}
