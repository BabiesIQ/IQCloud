const names = new Set(["domains","home","dashboard","security","pricing","currency","preferences","documentation","networking","logout"]);
export default function NavIcon({name,size=28,className=''}) {
 if(!names.has(name))return null;
 return <img src={'/assets/nav/'+name+'.svg'} width={size} height={size} alt="" aria-hidden="true" draggable={false} decoding="async" className={'iq-nav-icon inline-block shrink-0 object-contain '+className}/>;
}
