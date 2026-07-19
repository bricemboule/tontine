import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createRapportsApi({ authFetch, authDownload }) {
  return {
    // ── Export de rapport (fichier Excel réel) ──────────────────
    async exportReport(format = "excel") {
      if (USE_MOCK) { await delay(500); return { ok: true, filename: "rapport-demo.xlsx" }; }
      const res = await authDownload("/reports/export", { method: "POST" });
      const blob = await res.blob();
      const disp = res.headers.get("Content-Disposition") || "";
      const match = disp.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `rapport.${format === "excel" ? "xlsx" : format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      return { ok: true, filename };
    },
    
    // ── Config / Cashflow ────────────────────────────────────────
    async getCashflow() {
      if (USE_MOCK) { await delay(200); return [...MOCK.cashflow]; }
      return authFetch("/reports/cashflow");
    },
    async getCashDashboard() {
      if (USE_MOCK) {
        await delay(200);
        return {
          totals: {
            total_contributions: 450000,
            total_penalties: 4000,
            total_loan_repayments: 50625,
            total_payouts: 300000,
            total_expenses: 0,
            balance: 204625,
          },
          movements: [
            { id: 1, type: "income", category: "contribution", amount: 50000, description: "Cotisation Avril", created_at: "2026-04-01" },
            { id: 2, type: "expense", category: "payout", amount: 300000, description: "Décaissement tour", created_at: "2026-04-15" },
          ],
        };
      }
      return authFetch("/cash");
    },
    async getReceipts() {
      if (USE_MOCK) { await delay(); return [...MOCK.receipts]; }
      return authFetch("/receipts");
    },
    async getCurrentTontine() {
      if (USE_MOCK) { await delay(); return { id: 1, name: "Tontine Bami", schema_name: "tontine_bami", organization_name: "Association Bami" }; }
      return authFetch("/tontines/current");
    },
    async getConfig() {
      if (USE_MOCK) { await delay(200); return { name:"Tontine Bami", type:"mixte", currency:"XAF", cotisation_amount:50000, loan_interest_rate:5, penalty_rate:5, grace_days:3, max_loan_multiplier:3, max_members:20, schema:"tontine_bami" }; }
      return authFetch("/config");
    },
    async getAuditLogs() {
      if (USE_MOCK) { await delay(); return [
        { id:1, action:"CREATE_LOAN",     user:"tresorier@tontine.cm", detail:"Prêt 200 000 XAF → Pierre Nkodo",        at:"2025-03-05 14:23", level:"info" },
        { id:2, action:"VALIDATE_PAYMENT",user:"tresorier@tontine.cm", detail:"Paiement TOS-A1B2C3 validé 50 000 XAF",  at:"2025-03-28 11:05", level:"info" },
        { id:3, action:"PROPOSE_SANCTION",user:"censeur@tontine.cm",   detail:"Sanction proposée → Jean Fouda",         at:"2025-03-10 09:42", level:"warn" },
        { id:4, action:"VALIDATE_MEMBER", user:"president@tontine.cm", detail:"Nouveau membre validé : Estelle Biya",   at:"2025-03-20 10:15", level:"info" },
      ]; }
      return authFetch("/reports/audit");
    },
    async getNotifications() {
      if (USE_MOCK) { await delay(200); return [
        { id:1, icon:"📅", title:"Réunion du 15 Avril", body:"Réunion mensuelle le 15/04 à 15h00 — Bastos.", date:"2025-04-01", read:false },
        { id:2, icon:"✅", title:"Paiement confirmé",    body:"Votre paiement de 50 000 XAF a été validé.",  date:"2025-03-28", read:true  },
        { id:3, icon:"⚠️", title:"Cotisation en retard", body:"Cotisation d'avril due. Pénalité après 3j.",  date:"2025-04-02", read:false },
        { id:4, icon:"💰", title:"Remboursement à venir",body:"Mensualité de 66 250 XAF due le 10/04.",      date:"2025-04-05", read:false },
      ]; }
      const data = await authFetch("/notifications");
      const rows = Array.isArray(data) ? data : (data.notifications || []);
      return rows.map(item => ({
        icon: item.icon || ({ meeting_scheduled: "📅", payment_confirmed: "✅", contribution_due: "💰", penalty_added: "⚠️", loan_approved: "◎" }[item.type] || "◈"),
        ...item,
        read: Boolean(item.read || item.is_read),
      }));
    },
  };
}
