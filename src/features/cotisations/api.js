import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createCotisationsApi({ authFetch }) {
  return {
    // ── Cotisations ──────────────────────────────────────────────
    async getCotisations() {
      if (USE_MOCK) { await delay(); return [...MOCK.cotisations]; }
      return authFetch("/cotisations");
    },
    async createCotisation(data) {
      if (USE_MOCK) {
        await delay(600);
        const c = { id: Date.now(), ...data, status:"open", total_inscrits:0, total_paid:0, montant_collecte:0 };
        MOCK.cotisations.unshift(c);
        return c;
      }
      return authFetch("/cotisations", { method:"POST", body: data });
    },
    async getCotisation(id) {
      if (USE_MOCK) { await delay(); return MOCK.cotisations.find(c=>c.id===id)||null; }
      return authFetch(`/cotisations/${id}`);
    },
    async getCotisationById(id) {
      if (USE_MOCK) { await delay(); return MOCK.cotisations.find(c=>c.id===id)||null; }
      return authFetch(`/cotisations/${id}`);
    },
    async updateCotisation(id, data) {
      if (USE_MOCK) { await delay(500); const c=MOCK.cotisations.find(x=>x.id===id); if(c) Object.assign(c, data); return c; }
      return authFetch(`/cotisations/${id}`, { method:"PUT", body: data });
    },
    async closeCotisation(id) {
      if (USE_MOCK) { await delay(400); const c=MOCK.cotisations.find(x=>x.id===id); if(c) c.status="closed"; return c; }
      return authFetch(`/cotisations/${id}/close`, { method:"POST" });
    },
    async enrollMembers(cotisationId, memberIds) {
      if (USE_MOCK) { await delay(600); const c=MOCK.cotisations.find(x=>x.id===cotisationId); if(c) c.total_inscrits=(c.total_inscrits||0)+memberIds.length; return {enrolled:memberIds.length}; }
      return authFetch(`/cotisations/${cotisationId}/enroll`, { method:"POST", body: { member_ids: memberIds } });
    },
    async unenrollMember(cotisationId, memberId) {
      if (USE_MOCK) { await delay(400); const c=MOCK.cotisations.find(x=>x.id===cotisationId); if(c&&c.total_inscrits>0) c.total_inscrits--; return {ok:true}; }
      return authFetch(`/cotisations/${cotisationId}/members/${memberId}`, { method:"DELETE" });
    },
    async payCotisation(cotisationId, memberId, amount, method = "especes", idempotencyKey) {
      if (USE_MOCK) { await delay(500); const c=MOCK.cotisations.find(x=>x.id===cotisationId); if(c){c.total_paid=(c.total_paid||0)+1;c.montant_collecte=(c.montant_collecte||0)+amount;} return {ok:true}; }
      // idempotencyKey (optionnel) : protège du retry réseau ; le double-clic est déjà bloqué par l'état "loading" du formulaire.
      const headers = idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {};
      return authFetch(`/cotisations/${cotisationId}/pay`, { method:"POST", body: { member_id:memberId, amount, payment_method: method }, headers });
    },
  };
}
