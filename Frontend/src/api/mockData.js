// ── Données mock (utilisées si USE_MOCK=true) ─────────────────
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// ── Mock data ─────────────────────────────────────────────────
export const MOCK = {
  members: [
    { id:1, name:"Marie Ngono",     phone:"+237 677 001 002", email:"marie@gmail.com",   role:"tresorier",  status:"active",    tour:3, joined:"2024-01-15", cp:8, ct:8 },
    { id:2, name:"Jean Fouda",      phone:"+237 699 123 456", email:"jean@gmail.com",    role:"membre",     status:"active",    tour:1, joined:"2024-01-15", cp:7, ct:8 },
    { id:3, name:"Solange Mbah",    phone:"+237 655 987 654", email:"solange@gmail.com", role:"secretaire", status:"active",    tour:4, joined:"2024-01-15", cp:8, ct:8 },
    { id:4, name:"Pierre Nkodo",    phone:"+237 677 543 210", email:"pierre@gmail.com",  role:"membre",     status:"active",    tour:2, joined:"2024-02-01", cp:6, ct:7 },
    { id:5, name:"Cécile Abena",    phone:"+237 690 111 222", email:"cecile@gmail.com",  role:"membre",     status:"active",    tour:5, joined:"2024-02-01", cp:7, ct:7 },
    { id:6, name:"Thomas Essomba",  phone:"+237 655 333 444", email:null,                role:"membre",     status:"suspended", tour:6, joined:"2024-03-10", cp:3, ct:6 },
    { id:7, name:"Estelle Biya",    phone:"+237 677 888 999", email:"estelle@gmail.com", role:"membre",     status:"pending",   tour:null, joined:"2025-03-20", cp:0, ct:0 },
    { id:8, name:"Rodrigue Mvondo", phone:"+237 699 555 666", email:"rod@gmail.com",     role:"censeur",    status:"active",    tour:7, joined:"2024-01-15", cp:8, ct:8 },
  ],
  loans: [
    { id:1, mid:2, name:"Jean Fouda",   amount:150000, rate:5, months:3, paid:105000, status:"active",  start:"2025-01-10", purpose:"Santé" },
    { id:2, mid:4, name:"Pierre Nkodo", amount:200000, rate:5, months:4, paid:0,      status:"pending", start:"2025-03-05", purpose:"Commerce" },
    { id:3, mid:5, name:"Cécile Abena", amount:75000,  rate:5, months:2, paid:78750,  status:"paid",    start:"2025-01-01", purpose:"Éducation" },
  ],
  payments: [
    { id:1, ref:"TOS-A1B2C3", mid:1, name:"Marie Ngono",  amount:50000, method:"orange_money", status:"success", date:"2025-03-28", desc:"Cotisation mars" },
    { id:2, ref:"TOS-E5F6G7", mid:3, name:"Solange Mbah", amount:50000, method:"mtn_momo",    status:"success", date:"2025-03-28", desc:"Cotisation mars" },
    { id:3, ref:"TOS-I9J0K1", mid:2, name:"Jean Fouda",   amount:25000, method:"especes",     status:"pending", date:"2025-04-02", desc:"Remboursement prêt" },
    { id:4, ref:"TOS-Q7R8S9", mid:5, name:"Cécile Abena", amount:50000, method:"orange_money",status:"failed",  date:"2025-04-01", desc:"Cotisation avril" },
  ],
  meetings: [
    { id:1, title:"Réunion Avril 2025",   date:"2025-04-15", time:"15:00", location:"Bastos, Yaoundé", status:"upcoming", beneficiary:"Jean Fouda",   collected:0,      attendees:0, total:8 },
    { id:2, title:"Réunion Mars 2025",    date:"2025-03-01", time:"15:00", location:"Dom. M. Fouda",   status:"done",     beneficiary:"Marie Ngono",  collected:550000, attendees:7, total:8 },
    { id:3, title:"Réunion Février 2025", date:"2025-02-01", time:"14:30", location:"Salle Centre",    status:"done",     beneficiary:"Pierre Nkodo", collected:600000, attendees:8, total:8 },
  ],
  sanctions: [
    { id:1, mid:2, name:"Jean Fouda",    type:"Retard paiement",  status:"active",           fine:2000, reason:"Cotisation de mars avec 5 jours de retard.", date:"2025-03-10" },
    { id:2, mid:6, name:"Thomas Essomba",type:"Suspension",        status:"active",           fine:0,    reason:"3 absences non justifiées consécutives.",    date:"2025-02-05" },
    { id:3, mid:4, name:"Pierre Nkodo",  type:"Absence réunion",  status:"pending_president",fine:5000, reason:"Absence non justifiée — 01/03/2025.",          date:"2025-03-05" },
  ],
  tours: [
    { id:1, mid:2, name:"Jean Fouda",     pos:1, date:"2025-01-10", status:"completed", amount:600000 },
    { id:2, mid:4, name:"Pierre Nkodo",   pos:2, date:"2025-02-01", status:"completed", amount:600000 },
    { id:3, mid:1, name:"Marie Ngono",    pos:3, date:"2025-03-01", status:"completed", amount:550000 },
    { id:4, mid:3, name:"Solange Mbah",   pos:4, date:"2025-04-15", status:"pending",   amount:0 },
    { id:5, mid:5, name:"Cécile Abena",   pos:5, date:"2025-05-01", status:"pending",   amount:0 },
  ],
  cashflow: [
    { m:"Oct", c:480000, l:150000 }, { m:"Nov", c:520000, l:75000 },
    { m:"Déc", c:500000, l:200000 }, { m:"Jan", c:550000, l:150000 },
    { m:"Fév", c:600000, l:0 },      { m:"Mar", c:550000, l:200000 },
  ],
  admins: [
    { id: 101, name: "Marie Ngono", email: "admin@tontine.cm", phone: "+237600000002", available: true, assigned_tontine: null },
    { id: 102, name: "Paul Mvondo", email: "paul@tontine.cm", phone: "+237699000100", available: true, assigned_tontine: null },
    { id: 103, name: "Céleste Ateba", email: "celeste@tontine.cm", phone: "+237699000101", available: true, assigned_tontine: null },
  ],
  cotisations: [
    { id:1, label:"Cotisation Avril 2025",  amount:50000, date_debut:"2025-04-01", date_fin:"2025-04-30", status:"open",   total_inscrits:8, total_paid:6, montant_collecte:300000 },
    { id:2, label:"Cotisation Mars 2025",   amount:50000, date_debut:"2025-03-01", date_fin:"2025-03-31", status:"closed", total_inscrits:8, total_paid:8, montant_collecte:400000 },
    { id:3, label:"Cotisation Février 2025",amount:50000, date_debut:"2025-02-01", date_fin:"2025-02-28", status:"closed", total_inscrits:8, total_paid:8, montant_collecte:400000 },
  ],
  tontines: [
    { id:1, name:"Tontine Bami",       slug:"bami",           schema:"tontine_bami",          admin:"Marie Ngono",    members:12, status:"active",  monthly:50000,  created:"2024-01-15" },
    { id:2, name:"Solidarité Yaoundé", slug:"solidarite_yde", schema:"tontine_solidarite_yde",admin:"Paul Mvondo",    members:8,  status:"active",  monthly:25000,  created:"2024-03-02" },
    { id:3, name:"Femmes Leaders",     slug:"femmes_leaders", schema:"tontine_femmes_leaders",admin:"Céleste Ateba",  members:15, status:"active",  monthly:100000, created:"2024-05-20" },
    { id:4, name:"Groupement Nord",    slug:"groupement_nord",schema:"tontine_groupement_nord",admin:"Ibrahim Djaoro",members:6,  status:"pending", monthly:30000,  created:"2024-06-10" },
  ],
  organizations: [
    { id: 1, name: "Association Bami", slug: "association_bami", phone: "+237600000000", email: "contact@tontine.cm", city: "Yaoundé", country: "Cameroun", status: "active", tontines_count: 1, members_count: 9, plan_name: "Standard", created_at: "2026-01-01" },
  ],
  subscriptionPlans: [
    { id: 1, code: "free", name: "Gratuit", price_monthly: 0, max_tontines: 1, max_members: 20, features: ["1 tontine", "20 membres", "Fonctions de base"], status: "active" },
    { id: 2, code: "standard", name: "Standard", price_monthly: 15000, max_tontines: 10, max_members: 100, features: ["Rapports PDF", "Pénalités", "Réunions"], status: "active" },
    { id: 3, code: "premium", name: "Premium", price_monthly: 45000, max_tontines: null, max_members: null, features: ["Prêts", "Statistiques avancées", "Notifications avancées"], status: "active" },
  ],
  receipts: [
    { id: 1, number: "REC-20260601-A1B2C3D4", type: "payment", member_name: "Bernard Ndi", amount: 50000, payment_method: "especes", payment_reference: "TOS-DEMO-AVR-1", created_at: "2026-06-01" },
  ],
};
