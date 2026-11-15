export default function BrandLogo({ size = 36, className = '', decorative = true }) {
  return (
    <img
      src="/babiesiq-cloud-logo.svg"
      width={size}
      height={size}
      alt={decorative ? '' : 'BabiesIQ Cloud logo'}
      aria-hidden={decorative ? 'true' : undefined}
      decoding="async"
      className={'inline-block shrink-0 object-contain ' + className}
    />
  );
}
