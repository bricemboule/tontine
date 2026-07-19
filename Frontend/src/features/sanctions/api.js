import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createSanctionsApi({ authFetch }) {
  return {
    // ── Sanctions ────────────────────────────────────────────────
    async getSanctions(status) {
      if (USE_MOCK) { await delay(); return status ? MOCK.sanctions.filter(s=>s.status===status) : [...MOCK.sanctions]; }
      return authFetch(`/sanctions${status ? `?sanc_status=${status}` : ""}`);
    },
    async getPenalties(status) {
      if (USE_MOCK) { await delay(); return MOCK.sanctions.map(s => ({ ...s, amount: s.fine, paid_amount: 0, due_date: s.date, status: s.status === "active" ? "unpaid" : s.status })); }
      return authFetch(`/penalties${status ? `?penalty_status=${status}` : ""}`);
    },
    async payPenalty(id, amount, payment_method = "especes") {
      if (USE_MOCK) { await delay(400); return { penalty_id: id, status: "paid", amount }; }
      return authFetch(`/penalties/${id}/pay`, { method: "POST", body: { amount, payment_method } });
    },
    async proposeSanction(data) {
      if (USE_MOCK) { await delay(600); const m=MOCK.members.find(x=>x.id===data.member_id); const s={id:Date.now(),mid:data.member_id,name:m?.name||"",type:data.type,status:"pending_president",fine:data.fine,reason:data.reason,date:data.start_date}; MOCK.sanctions.push(s); return s; }
      return authFetch("/sanctions", { method:"POST", body: data });
    },
    async validateSanction(id, action) {
      if (USE_MOCK) { await delay(400); const s=MOCK.sanctions.find(x=>x.id===id); if(s) s.status=action==="approve"?"active":"rejected"; return s; }
      return authFetch(`/sanctions/${id}/validate`, { method:"POST", body: { action } });
    },
    async liftSanction(id) {
      if (USE_MOCK) { await delay(400); const s=MOCK.sanctions.find(x=>x.id===id); if(s) s.status="lifted"; return s; }
      return authFetch(`/sanctions/${id}/lift?reason=Levée par le bureau`, { method:"POST" });
    },
  };
}
