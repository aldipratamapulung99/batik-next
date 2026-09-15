'use client';

export default function NavToggle() {
  function bukaTutupMenu() {
    const menu = document.querySelector('.nav-links');
    if (menu) menu.classList.toggle('terbuka');
  }

  return (
    <button className="nav-toggle" aria-label="Buka menu" onClick={bukaTutupMenu}>
      &#9776;
    </button>
  );
}
