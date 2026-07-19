import { MOCK, USE_MOCK, delay } from "@/api/mockData";

export function createAdministrationPlateformeApi({ authFetch }) {
  return {
    // ── Super Admin ──────────────────────────────────────────────
    async getTontines() {
      if (USE_MOCK) { await delay(); return [...MOCK.tontines]; }
      return authFetch("/superadmin/tontines");
    },
    async getOrganizations() {
      if (USE_MOCK) { await delay(); return [...MOCK.organizations]; }
      return authFetch("/superadmin/organizations");
    },
    async createOrganization(data) {
      if (USE_MOCK) {
        await delay(600);
        const organization = { id: Date.now(), ...data, slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "_"), status: "active", tontines_count: 0, members_count: 0, plan_name: "Gratuit", created_at: new Date().toISOString() };
        MOCK.organizations.unshift(organization);
        return organization;
      }
      return authFetch("/superadmin/organizations", { method: "POST", body: data });
    },
    async updateOrganizationStatus(id, status) {
      if (USE_MOCK) {
        await delay(300);
        const org = MOCK.organizations.find(item => item.id === id);
        if (org) org.status = status;
        return org;
      }
      return authFetch(`/superadmin/organizations/${id}/status`, { method: "PATCH", body: { status } });
    },
    async getSubscriptionPlans() {
      if (USE_MOCK) { await delay(); return [...MOCK.subscriptionPlans]; }
      return authFetch("/superadmin/subscription-plans");
    },
    async getSubscriptions() {
      if (USE_MOCK) { await delay(); return MOCK.organizations.map(org => ({ id: org.id, organization_name: org.name, plan_name: org.plan_name, status: "active", started_at: org.created_at })); }
      return authFetch("/superadmin/subscriptions");
    },
    async getPlatformStats() {
      if (USE_MOCK) { await delay(200); return { total_organizations:1, active_organizations:1, suspended_organizations:0, total_tontines:4, active_tontines:3, total_users:41, revenus_saas:15000 }; }
      return authFetch("/superadmin/stats");
    },
    async getAdminDashboard() {
      if (USE_MOCK) {
        await delay(200);
        return {
          members_count: MOCK.members.filter(member => member.status === "active").length,
          expected_contributions: MOCK.cotisations.reduce((sum, item) => sum + Number(item.amount || 0) * Number(item.total_inscrits || 0), 0),
          collected_contributions: MOCK.cotisations.reduce((sum, item) => sum + Number(item.montant_collecte || 0), 0),
          late_contributions: 2,
          cash_balance: 204625,
          unpaid_penalties: MOCK.sanctions.filter(item => item.status === "active").length,
          active_loans: MOCK.loans.filter(item => item.status === "active").length,
          upcoming_meetings: MOCK.meetings.filter(item => item.status === "upcoming").length,
          next_beneficiary: MOCK.tours.find(item => item.status === "pending") || null,
        };
      }
      return authFetch("/dashboard/admin");
    },
    async getMemberDashboard() {
      if (USE_MOCK) {
        await delay(200);
        return {
          total_contributed: 350000,
          remaining_contributions: 50000,
          penalties: 0,
          next_payment: "2026-07-30",
          payout_turn: 4,
          active_loans: 1,
          unread_notifications: 2,
        };
      }
      return authFetch("/dashboard/member");
    },
    async getAvailableAdmins() {
      if (USE_MOCK) {
        await delay(200);
        return MOCK.admins.filter(admin => admin.available);
      }
      return authFetch("/superadmin/admins");
    },
    async getAdmins() {
      if (USE_MOCK) {
        await delay(200);
        return [...MOCK.admins];
      }
      return authFetch("/superadmin/admins");
    },
    async createAdmin(data) {
      if (USE_MOCK) {
        await delay(700);
        if (MOCK.admins.some(admin => admin.email === data.email)) throw new Error("Cette adresse email existe déjà");
        if (MOCK.admins.some(admin => admin.phone === data.phone)) throw new Error("Ce numéro de téléphone existe déjà");
        const admin = {
          id: Date.now(),
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          phone: data.phone,
          role: "admin",
          available: true,
          assigned_tontine: null,
          temporary_password: "demo1234",
        };
        MOCK.admins.unshift(admin);
        return admin;
      }
      return authFetch("/superadmin/admins", { method:"POST", body: data });
    },
    async createTontine(data) {
      if (USE_MOCK) {
        await delay(1000);
        const slug = data.name.toLowerCase().replace(/\s+/g, "_");
        const admin = MOCK.admins.find(item => item.id === data.admin_user_id) || null;
        if (admin && !admin.available) throw new Error("Cet administrateur gère déjà une tontine");
        const tontine = {
          id: Date.now(),
          name: data.name,
          slug,
          schema_name: `tontine_${slug}`,
          admin,
          members_count: 0,
          status: "draft",
          created_at: new Date().toISOString(),
        };
        if (admin) {
          admin.available = false;
          admin.assigned_tontine = { id: tontine.id, name: tontine.name };
        }
        MOCK.tontines.unshift(tontine);
        return tontine;
      }
      return authFetch("/superadmin/tontines", { method:"POST", body: data });
    },
    async deleteTontine(id) {
      if (USE_MOCK) {
        await delay(500);
        const tontine = MOCK.tontines.find(item => item.id === id);
        if (tontine?.admin?.id) {
          const admin = MOCK.admins.find(item => item.id === tontine.admin.id);
          if (admin) {
            admin.available = true;
            admin.assigned_tontine = null;
          }
        }
        const i=MOCK.tontines.findIndex(x=>x.id===id);
        if(i>-1) MOCK.tontines.splice(i,1);
        return { ok:true };
      }
      return authFetch(`/superadmin/tontines/${id}`, { method:"DELETE" });
    },
    async getPlatformAudit() {
      if (USE_MOCK) { await delay(); return [
        { id:1, action:"CREATE_TONTINE",  user:"super@tontine.cm", detail:"Tontine 'Femmes Leaders' créée",         at:"2024-05-20 09:14", level:"info" },
        { id:2, action:"LOGIN",           user:"admin@tontine.cm", detail:"Connexion depuis 196.206.x.x",            at:"2025-04-01 08:00", level:"info" },
        { id:3, action:"DELETE_TONTINE",  user:"super@tontine.cm", detail:"ÉCHEC: tontine_test — solde non nul",     at:"2025-01-29 10:01", level:"error"},
      ]; }
      return authFetch("/superadmin/audit");
    },
  };
}
