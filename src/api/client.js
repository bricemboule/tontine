import { createAdministrationPlateformeApi } from "../features/administration_plateforme/api";
import { createCotisationsApi } from "../features/cotisations/api";
import { createMembresApi } from "../features/membres/api";
import { createPaiementsApi } from "../features/paiements/api";
import { createPretsApi } from "../features/prets/api";
import { createRapportsApi } from "../features/rapports/api";
import { createReunionsApi } from "../features/reunions/api";
import { createSanctionsApi } from "../features/sanctions/api";
import { createToursApi } from "../features/tours/api";

export { MOCK, USE_MOCK } from "./mockData";

// ── Factory : crée un client API pour un composant ────────────
export function createApiClient(authFetch, authDownload) {
  const deps = { authFetch, authDownload };
  return {
    ...createRapportsApi(deps),
    ...createMembresApi(deps),
    ...createPretsApi(deps),
    ...createPaiementsApi(deps),
    ...createCotisationsApi(deps),
    ...createReunionsApi(deps),
    ...createSanctionsApi(deps),
    ...createToursApi(deps),
    ...createAdministrationPlateformeApi(deps),
  };
}
