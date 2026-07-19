import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createPretsApi({ authFetch }) {
  return {
    // ── Prêts ───────────────────────────────────────────────────
    async getLoans(status) {
      if (USE_MOCK) { await delay(); return status ? MOCK.loans.filter(l => l.status===status) : [...MOCK.loans]; }
      return authFetch(`/loans${status ? `?loan_status=${status}` : ""}`);
    },
    async calculateLoan(amount, rate, months) {
      if (USE_MOCK) { const i=Math.round(amount*(rate/100)*months),t=amount+i; return {total_interest:i,total_due:t,monthly_payment:Math.round(t/months)}; }
      return authFetch("/loans/calculate", { method:"POST", body: { amount, interest_rate:rate, months } });
    },
    async createLoan(data) {
      if (USE_MOCK) { await delay(700); const m = MOCK.members.find(x=>x.id===data.member_id); const l={id:Date.now(),mid:data.member_id,name:m?.name||"",amount:data.amount,rate:data.interest_rate,months:data.months,paid:0,status:"pending",start:new Date().toISOString().slice(0,10),purpose:data.purpose}; MOCK.loans.unshift(l); return l; }
      return authFetch("/loans", { method:"POST", body: data });
    },
    async getLoanById(id) {
      if (USE_MOCK) { await delay(200); return MOCK.loans.find(x=>x.id===id)||null; }
      return authFetch(`/loans/${id}`);
    },
    async getLoanSchedule(id) {
      if (USE_MOCK) {
        await delay(200);
        const l = MOCK.loans.find(x=>x.id===id);
        if (!l) return [];
        const total = Math.round(l.amount*(1+l.rate/100*l.months));
        const monthly = Math.round(total/l.months);
        return Array.from({length:l.months},(_,i)=>({
          num:i+1, amount:monthly, status: i*monthly < l.paid ? "paid":"pending"
        }));
      }
      return authFetch(`/loans/${id}/schedule`);
    },
    async rejectLoan(id) {
      if (USE_MOCK) { await delay(400); const l=MOCK.loans.find(x=>x.id===id); if(l) l.status="rejected"; return l; }
      return authFetch(`/loans/${id}/reject`, { method:"POST" });
    },
    async approveLoan(id) {
      if (USE_MOCK) { await delay(400); const l=MOCK.loans.find(x=>x.id===id); if(l) l.status="active"; return l; }
      return authFetch(`/loans/${id}/approve`, { method:"POST" });
    },
    async repayLoan(id, amount, payment_method = "especes") {
      if (USE_MOCK) { await delay(600); const l=MOCK.loans.find(x=>x.id===id); if(l){const d=Math.round((l.amount*(1+l.rate/100*l.months)));const np=Math.min(l.paid+amount,d);l.paid=np;if(np>=d)l.status="paid";} return { ...(l || {}), loan: l }; }
      const loan = await authFetch(`/loans/${id}/repay`, { method:"POST", body: { amount, payment_method } });
      return { ...loan, loan };
    },
  };
}
