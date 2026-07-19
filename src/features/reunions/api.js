import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createReunionsApi({ authFetch }) {
  return {
    // ── Réunions ─────────────────────────────────────────────────
    async getMeetings() {
      if (USE_MOCK) { await delay(); return [...MOCK.meetings]; }
      return authFetch("/meetings");
    },
    async createMeeting(data) {
      if (USE_MOCK) { await delay(600); const m={id:Date.now(),...data,status:"upcoming",collected:0,attendees:0,total:MOCK.members.filter(x=>x.status==="active").length}; MOCK.meetings.unshift(m); return m; }
      return authFetch("/meetings", { method:"POST", body: data });
    },
    async closeMeeting(id, collected, attendees) {
      if (USE_MOCK) { await delay(400); const m=MOCK.meetings.find(x=>x.id===id); if(m){m.status="done";m.collected=collected;m.attendees=attendees;} return m; }
      return authFetch(`/meetings/${id}/close`, { method:"POST", body: { collected, attendees } });
    },
    async cancelMeeting(id) {
      if (USE_MOCK) { await delay(400); const m=MOCK.meetings.find(x=>x.id===id); if(m) m.status="cancelled"; return m; }
      return authFetch(`/meetings/${id}/cancel`, { method:"POST" });
    },
    async updateMeeting(id, data) {
      if (USE_MOCK) { await delay(500); const m=MOCK.meetings.find(x=>x.id===id); if(m) Object.assign(m, data); return m; }
      return authFetch(`/meetings/${id}`, { method:"PUT", body: data });
    },
  };
}
