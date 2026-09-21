"use client";

export default function ProfileMenu({onLinkCode,onDelete,onLogout,linkCode}:{onLinkCode:()=>void;onDelete:()=>void;onLogout:()=>void;linkCode?:string}) {
  const go = (path:string) => {
    window.location.assign(path);
  };

  return (
    <div className="ss-menu">
      <button className="ss-menu-button" onClick={() => go("/progress/")}>📊 <b>Performance & Activity</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={onLinkCode}>👨‍👩‍👧 <b>Parent / Teacher Link</b> <span>›</span></button>
      {linkCode && <div className="ss-link-code"><small>Share this 15-minute code</small><strong>{linkCode}</strong></div>}
      <button className="ss-menu-button" onClick={() => go("/compete/")}>🏆 <b>Competition History</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={() => go("/rewards/")}>🎁 <b>Rewards & Coins</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={() => go("/community/")}>💬 <b>Community</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={() => go("/profile/settings/")}>⚙️ <b>Settings</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={() => go("/profile/settings/#password")}>🔐 <b>Change / Reset Password</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={() => go("/privacy/")}>🔒 <b>Privacy Policy</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={() => go("/terms/")}>📄 <b>Terms of Use</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={onDelete}>🗑️ <b>Request Account Deletion</b> <span>›</span></button>
      <button className="ss-menu-button" onClick={() => go("/profile/settings/#help")}>❔ <b>Help & Support</b> <span>›</span></button>
      <button className="ss-logout" onClick={onLogout}>↪ Log Out</button>
    </div>
  );
}
