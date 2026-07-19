export const SHARED_CSS = `
.card{
  background:var(--surf);
  border:1px solid #dee2e6;
  border-radius:.375rem;
  box-shadow:0 0 1px rgba(0,0,0,.125),0 1px 3px rgba(0,0,0,.2);
  margin-bottom:18px;
  overflow:hidden;
}
.card-hd{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  padding:12px 16px;
  border-bottom:1px solid #dee2e6;
  background:linear-gradient(180deg,#fff,#f8f9fa);
}
.card-title{
  font-family:"Source Sans Pro","DM Sans",system-ui,sans-serif;
  font-size:1.1rem;
  font-weight:600;
}
.card-sub{font-size:11.5px;color:var(--t3)}
.sg{display:grid;gap:14px;margin-bottom:18px}
.sg2{grid-template-columns:repeat(2,minmax(0,1fr))}
.sg3{grid-template-columns:repeat(3,minmax(0,1fr))}
.sg4{grid-template-columns:repeat(4,minmax(0,1fr))}
.g2,.r2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  min-height:36px;
  padding:0 14px;
  border-radius:.375rem;
  border:1px solid transparent;
  background:var(--surf);
  color:var(--t);
  font-size:12px;
  font-weight:700;
  text-decoration:none;
  transition:all .2s ease-in-out;
}
.btn-sm{min-height:30px;padding:0 10px;font-size:11px}
.btn-p{background:#007bff;border-color:#007bff;color:#fff}
.btn-p:hover{background:#0069d9;border-color:#0062cc}
.btn-g{background:#f8f9fa;border-color:#ced4da}
.btn-g:hover{background:#e9ecef}
.btn-grn{background:var(--green);border-color:var(--green);color:#fff}
.btn-red{background:var(--red);border-color:var(--red);color:#fff}
.btn-amb{background:var(--amber);border-color:var(--amber);color:#fff}
.tabs{
  display:flex;
  gap:8px;
  padding:12px 16px;
  border-bottom:1px solid var(--b);
  flex-wrap:wrap;
}
.tab{
  display:inline-flex;
  align-items:center;
  gap:8px;
  min-height:34px;
  padding:0 12px;
  border:1px solid #dee2e6;
  border-radius:999px;
  background:#fff;
  font-size:12px;
  font-weight:700;
}
.tab.on{background:#e7f1ff;border-color:#b8daff;color:#007bff}
.tab-n{
  min-width:20px;
  padding:1px 6px;
  border-radius:999px;
  background:#f4f6f9;
  font-size:10px;
}
.row{
  display:flex;
  align-items:center;
  gap:12px;
  padding:14px 16px;
  border-bottom:1px solid var(--b);
}
.row:last-child{border-bottom:none}
.row-name{font-size:13px;font-weight:700}
.row-sub{font-size:11.5px;color:var(--t3)}
.section-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  margin-bottom:16px;
}
.section-head h2{
  font-family:"Source Sans Pro","DM Sans",system-ui,sans-serif;
  font-size:1.5rem;
  line-height:1.1;
  font-weight:600;
}
.section-head p{
  margin-top:6px;
  color:var(--t3);
  font-size:12px;
}
.section-actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  justify-content:flex-end;
}
.badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:22px;
  padding:0 8px;
  border-radius:999px;
  border:1px solid #d6d8db;
  background:#f8f9fa;
  color:var(--t2);
  font-size:10px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:.04em;
}
.b-gy{background:var(--surf2);color:var(--t2)}
.empty{
  padding:28px 20px;
  text-align:center;
  color:var(--t3);
}
.empty-ic{
  width:48px;
  height:48px;
  display:grid;
  place-items:center;
  margin:0 auto 10px;
  border-radius:16px;
  background:var(--surf2);
  color:var(--t2);
}
.modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,25,35,.5);
  display:grid;
  place-items:center;
  padding:20px;
  z-index:100;
}
.modal-card{
  width:min(680px,100%);
  background:#fff;
  border-radius:18px;
  box-shadow:0 24px 80px rgba(15,25,35,.25);
}
.modal-head,.modal-body,.modal-actions{
  padding:18px 20px;
}
.modal-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  border-bottom:1px solid var(--b);
}
.modal-body{display:grid;gap:14px}
.macts,.modal-actions{
  display:flex;
  gap:8px;
  justify-content:flex-end;
  border-top:1px solid var(--b);
}
.field{
  display:grid;
  gap:6px;
}
.field-label{
  font-size:11px;
  font-weight:700;
  color:var(--t2);
  text-transform:uppercase;
  letter-spacing:.08em;
}
.field-input{
  width:100%;
  min-height:42px;
  padding:10px 12px;
  border:1px solid #ced4da;
  border-radius:.375rem;
  background:#fff;
  color:var(--t);
  outline:none;
  transition:border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}
.field-input:focus{
  border-color:#80bdff;
  box-shadow:0 0 0 .2rem rgba(0,123,255,.15);
}
.notice{
  padding:12px 14px;
  border-radius:.375rem;
  border:1px solid #dee2e6;
  font-size:12px;
}
.n-bl{background:var(--blbg);border-color:var(--blbd);color:#27557a}
.n-am{background:var(--ambg);border-color:var(--ambd);color:#84520a}
.al-am{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  padding:12px 14px;
  margin-bottom:14px;
  border:1px solid var(--ambd);
  border-radius:14px;
  background:var(--ambg);
}
.toast-wrap{
  position:fixed;
  right:18px;
  bottom:18px;
  display:grid;
  gap:10px;
  z-index:120;
}
.toast{
  min-width:240px;
  padding:12px 14px;
  border-radius:12px;
  background:#1f2937;
  color:#fff;
  box-shadow:0 20px 50px rgba(15,25,35,.18);
}
.toast.error{background:#991b1b}
.toast.success{background:#166534}
.toast.warning{background:#92400e}
.list-card-head,.list-card-row{
  display:grid;
  gap:12px;
  align-items:center;
}
.list-card-head{
  padding:10px 16px;
  border-bottom:1px solid #dee2e6;
  background:#f8f9fa;
}
.list-card-row{
  padding:14px 16px;
  border-bottom:1px solid #dee2e6;
}
.list-card-row:last-child{border-bottom:none}
.cashflow{
  display:grid;
  gap:10px;
  padding:12px 16px 18px;
}
.cashflow-bar{
  display:grid;
  grid-template-columns:80px 1fr 70px;
  gap:12px;
  align-items:center;
}
.cashflow-track{
  height:10px;
  border-radius:999px;
  background:var(--surf3);
  overflow:hidden;
}
.cashflow-fill{
  height:100%;
  border-radius:999px;
  background:linear-gradient(90deg,var(--blue),#5ba8ff);
}
@media (max-width: 980px){
  .sg3,.sg4,.g2,.r2,.sg2{grid-template-columns:1fr}
  .section-head{flex-direction:column}
  .section-actions{justify-content:flex-start}
}
/* Tableaux à colonnes fixes : défilement horizontal propre sur mobile
   (au lieu d'un écrasement/rognage). Envelopper l'en-tête + les lignes. */
.tbl-scroll{width:100%}
@media (max-width: 820px){
  .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .tbl-scroll > *{min-width:660px}
}
`;
