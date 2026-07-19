import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createPaiementsApi({ authFetch }) {
  return {
    // ── Paiements ───────────────────────────────────────────────
    async getPayments(status) {
      if (USE_MOCK) { await delay(); return status ? MOCK.payments.filter(p=>p.status===status) : [...MOCK.payments]; }
      return authFetch(`/payments${status ? `?pay_status=${status}` : ""}`);
    },
    async initiatePayment(data, idempotencyKey) {
      if (USE_MOCK) { await delay(700); const m=MOCK.members.find(x=>x.id===data.member_id); const p={id:Date.now(),ref:`TOS-${Math.random().toString(36).slice(2,8).toUpperCase()}`,mid:data.member_id,name:m?.name||"",amount:data.amount,method:data.method,status:["especes","virement"].includes(data.method)?"pending":"processing",date:new Date().toISOString().slice(0,10),desc:data.description}; MOCK.payments.unshift(p); return p; }
      const headers = idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {};
      return authFetch("/payments/initiate", { method:"POST", body: data, headers });
    },
    async validatePayment(id) {
      if (USE_MOCK) { await delay(400); const p=MOCK.payments.find(x=>x.id===id); if(p) p.status="success"; return p; }
      return authFetch(`/payments/${id}/validate`, { method:"POST" });
    },
    async cancelPayment(id) {
      if (USE_MOCK) { await delay(400); const p=MOCK.payments.find(x=>x.id===id); if(p) p.status="cancelled"; return p; }
      return authFetch(`/payments/${id}/cancel`, { method:"POST" });
    },
    async reversePayment(id, reason = "Correction d'erreur") {
      if (USE_MOCK) { await delay(400); const p=MOCK.payments.find(x=>x.id===id); if(p) p.status="reversed"; return p; }
      return authFetch(`/payments/${id}/reverse`, { method:"POST", body: { reason } });
    },
  };
}
