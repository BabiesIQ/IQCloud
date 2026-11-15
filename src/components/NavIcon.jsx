// Prevent the native mobile image callout; not a restriction on public SVG access.
const blockMediaMenu = event => event.preventDefault();
const names = new Set(["domains","home","dashboard","security","pricing","currency","preferences","documentation","networking","logout"]);

export default function NavIcon({ name, size = 28, className = '' }) {
  if (!names.has(name)) return null;
  return (
    <span
      className={'iq-protected-icon inline-flex shrink-0 items-center justify-center ' + className}
      style={{ width: size, height: size }}
      onContextMenu={blockMediaMenu}
      onDragStart={blockMediaMenu}
    >
      <img
        src={'/assets/nav/' + name + '.svg'}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="iq-nav-icon iq-protected-image block h-full w-full object-contain"
      />
    </span>
  );
}
