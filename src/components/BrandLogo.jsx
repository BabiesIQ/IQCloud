// Cosmetic UI protection only: public assets remain available through the browser/network.
const blockMediaMenu = event => event.preventDefault();

export default function BrandLogo({ size = 36, className = '', decorative = true }) {
  return (
    <span
      className={'iq-protected-icon inline-flex shrink-0 items-center justify-center ' + className}
      style={{ width: size, height: size }}
      onContextMenu={blockMediaMenu}
      onDragStart={blockMediaMenu}
    >
      <img
        src="/babiesiq-cloud-logo.svg"
        width={size}
        height={size}
        alt={decorative ? '' : 'BabiesIQ Cloud logo'}
        aria-hidden={decorative ? 'true' : undefined}
        draggable={false}
        decoding="async"
        className="iq-protected-image block h-full w-full object-contain"
      />
    </span>
  );
}
