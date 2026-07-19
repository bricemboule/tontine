import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createMembresApi({ authFetch }) {
  return {
    // ── Membres ─────────────────────────────────────────────────
    async getMembers() {
      if (USE_MOCK) { await delay(); return [...MOCK.members]; }
      return authFetch("/members");
    },
    async addMember(data) {
      if (USE_MOCK) {
        await delay(600);
        const m = {
          id: Date.now(),
          ...data,
          name: `${data.first_name} ${data.last_name}`.trim(),
          status:"pending",
          tour:null,
          joined: new Date().toISOString().slice(0,10),
          cp:0,
          ct:0,
        };
        MOCK.members.push(m);
        return m;
      }
      return authFetch("/members", { method:"POST", body: data });
    },
    async validateMember(id, action) {
      if (USE_MOCK) { await delay(400); const m = MOCK.members.find(x => x.id===id); if(m) m.status = action==="approve"?"active":"excluded"; return m; }
      return authFetch(`/members/${id}/validate?action=${action}`, { method:"POST" });
    },
    async suspendMember(id) {
      if (USE_MOCK) { await delay(400); const m = MOCK.members.find(x => x.id===id); if(m) m.status = "suspended"; return m; }
      return authFetch(`/members/${id}/suspend`, { method:"POST", body: { reason:"Décision du bureau" } });
    },
    async reactivateMember(id) {
      if (USE_MOCK) { await delay(400); const m = MOCK.members.find(x => x.id===id); if(m) m.status = "active"; return m; }
      return authFetch(`/members/${id}/validate?action=approve`, { method:"POST" });
    },
    async getMemberOutstanding(id) {
      if (USE_MOCK) { await delay(200); return { contributions: 0, penalties: 0, loans: 0, total: 0 }; }
      return authFetch(`/members/${id}/outstanding`);
    },
    async offboardMember(id, reason = "Départ du membre", force = false) {
      if (USE_MOCK) { await delay(400); const m = MOCK.members.find(x => x.id===id); if(m) m.status = "excluded"; return m; }
      return authFetch(`/members/${id}/offboard`, { method: "POST", body: { reason, force } });
    },
    async reinstateMember(id) {
      if (USE_MOCK) { await delay(400); const m = MOCK.members.find(x => x.id===id); if(m) m.status = "active"; return m; }
      return authFetch(`/members/${id}/reinstate`, { method: "POST" });
    },
    async getMemberById(id) {
      if (USE_MOCK) { await delay(200); return MOCK.members.find(x => x.id===id)||null; }
      return authFetch(`/members/${id}`);
    },
    async updateMember(id, data) {
      if (USE_MOCK) { await delay(500); const m = MOCK.members.find(x => x.id===id); if(m) Object.assign(m, data); return m; }
      return authFetch(`/members/${id}`, { method:"PUT", body: data });
    },
  };
}
