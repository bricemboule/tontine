import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/AdminLTE/Layout";

/* Coquille applicative — thème indigo unique pour tous les rôles.
   Le rôle est affiché en badge (voir Sidebar), plus en couleur globale. */

export default function AdminLayout(props) {
  const { user, logout } = useAuth();

  return (
    <Layout
      {...props}
      user={user}
      brand={props.tontineName || "Tontine"}
      onLogout={logout}
    />
  );
}
