import NotificationIcon from "./NotificationIcon";
import UserMenu from "./UserMenu";

export default function Header({ userName }) {
  return (
    <header className="dash-header">
      <label className="dash-search">
        <span>⌕</span>
        <input placeholder="Rechercher..." />
      </label>
      <NotificationIcon />
      <UserMenu name={userName} />
    </header>
  );
}
