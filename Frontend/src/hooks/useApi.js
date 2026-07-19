import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createApiClient } from "../api/client";

/**
 * useApi() — retourne le client API préconfiguré avec le token JWT.
 * Utilisation : const api = useApi();
 *               const members = await api.getMembers();
 */
export function useApi() {
  const { authFetch, authDownload } = useAuth();
  return useMemo(() => createApiClient(authFetch, authDownload), [authFetch, authDownload]);
}
