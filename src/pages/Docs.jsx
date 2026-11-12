import { Link } from 'react-router-dom';
import { SectionHead } from '@/components/cloud/CloudUI';
import ApperIcon from '@/components/ApperIcon';

export const route = { path: '/docs', layout: 'public', access: 'public' };

const blocks = [
  {icon:'Server',title:'Getting started',text:'Choose Linux image, region, RAM and CPU. Monthly pricing is compute-only and no disk size is selected.'},
  {icon:'TerminalSquare',title:'SSH and remote access',text:'Railway TCP Proxy generally provides an allocated hostname and external port. It is not equivalent to an independent public IPv4 on port 22. Use key-based authentication when enabled.'},
  {icon:'Globe2',title:'Connect a custom domain',text:'Customer creates a DNS CNAME pointing to a real Railway-assigned hostname only after the operator registers the domain through Railway. DNS records cannot direct traffic to arbitrary ports by themselves.'},
  {icon:'Database',title:'Persistent storage',text:'Only a specifically attached Railway volume is persistent. The apparent size reported for a container overlay filesystem must not be sold as dedicated or persistent disk.'},
  {icon:'ShieldCheck',title:'Isolation & security',text:'A container shares the host kernel. Root access inside a container is not a dedicated virtual machine. User isolation, quotas, abuse prevention and network controls require additional infrastructure.'},
  {icon:'Code2',title:'Provisioning API roadmap',text:'The planned Go API validates order quotes, manages service creation and domain operations through operator-owned credentials, and stores audit logs server-side.'},
];

export default function Docs() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-17">
      <SectionHead eyebrow="Knowledge base / Preview" title="BabiesIQ Cloud documentation" description="Learn how the planned hosting workflow will operate, including important provider constraints and safeguards."/>
      <div className="grid gap-5 md:grid-cols-2">
        {blocks.map(x=>(
          <div key={x.title} className="rounded-md border border-border bg-card p-7">
            <ApperIcon name={x.icon} size={22} className="text-primary"/>
            <h2 className="mt-5 font-heading text-base font-bold">{x.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{x.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-md border border-border bg-card p-7">
        <h2 className="font-heading text-lg font-bold">Typical custom-domain workflow</h2>
        <ol className="mt-5 list-inside list-decimal space-y-4 text-sm leading-7 text-muted-foreground">
          <li>The customer enters and proves control of the hostname.</li>
          <li>The operator backend registers the hostname against the correct Railway HTTP service.</li>
          <li>The backend returns the exact CNAME/TXT records provided by Railway.</li>
          <li>The customer adds the records at their DNS provider and requests a verification refresh.</li>
          <li>The backend checks Railway ownership verification and routing status before marking it verified.</li>
        </ol>
        <p className="mt-5 text-xs text-warning">This page illustrates a future workflow. The demo does not issue live DNS targets or make Railway API calls.</p>
      </div>
      <div className="mt-9 flex gap-5 text-sm"><Link to="/configure" className="font-semibold text-primary">Configure a demo server →</Link><Link to="/terms" className="font-semibold text-muted-foreground">Read service terms →</Link></div>
    </div>
  );
}
