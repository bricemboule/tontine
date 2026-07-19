import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createToursApi({ authFetch }) {
  return {
    // ── Tours ────────────────────────────────────────────────────
    async getTours() {
      if (USE_MOCK) { await delay(); return [...MOCK.tours]; }
      return authFetch("/tours");
    },
    async autoAssignTours(shuffle) {
      if (USE_MOCK) {
        await delay(800);
        const active = [...MOCK.members.filter(m=>m.status==="active")];
        if (shuffle) active.sort(() => Math.random() - .5);
        const base = new Date("2025-01-01");
        MOCK.tours.length = 0;
        active.forEach((m,i) => { const d=new Date(base); d.setMonth(d.getMonth()+i); MOCK.tours.push({id:Date.now()+i,mid:m.id,name:m.name,pos:i+1,date:d.toISOString().slice(0,10),status:"pending",amount:0}); });
        return [...MOCK.tours];
      }
      return authFetch(`/tours/auto-assign?shuffle=${shuffle}`, { method:"POST" });
    },
  };
}
