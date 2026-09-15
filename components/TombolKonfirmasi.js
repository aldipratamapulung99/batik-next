'use client';

export default function TombolKonfirmasi({ pesanKonfirmasi, className, style, children }) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(e) => {
        if (!confirm(pesanKonfirmasi)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
