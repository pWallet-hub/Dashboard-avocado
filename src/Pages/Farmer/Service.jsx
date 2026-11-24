import { Link } from 'react-router-dom';
import { Bug, CalendarCheck, MapPin, ArrowRight, Sprout, ClipboardList } from 'lucide-react';
import { Page, PageHeader, Card } from '../../components/Ui/kit';

const SERVICES = [
  {
    title: 'Harvesting day',
    description: 'Book a harvesting team with the right tools on the dates your fruit is ready.',
    icon: CalendarCheck,
    to: '/dashboard/farmer/HarvestingDay',
    cta: 'Book harvesting day',
  },
  {
    title: 'Integrated pest management',
    description: 'Send photos of pests or diseases and get an agronomist visit with a treatment plan.',
    icon: Bug,
    to: '/dashboard/farmer/PestManagement',
    cta: 'Book IPM day',
  },
  {
    title: 'Property evaluation',
    description: 'Assess land, soil and water — and get a certified valuation accepted by banks and MFIs.',
    icon: MapPin,
    to: '/dashboard/farmer/PropertyEvaluation',
    cta: 'Book evaluation',
  },
];

/** Overview of the agronomic services a farmer can book (/dashboard/farmer/service). */
export default function Service() {
  return (
    <Page>
      <PageHeader
        icon={Sprout}
        title="Agronomic services"
        subtitle="Expert support from ASR agronomists for every stage of your avocado farm."
        actions={
          <Link to="/dashboard/farmer/my-service-requests" className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            <ClipboardList className="h-4 w-4" /> My requests
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {SERVICES.map(({ title, description, icon: Icon, to, cta }) => (
          <Card key={to} className="flex flex-col">
            <div className="flex h-full flex-col gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Icon className="h-6 w-6" /></span>
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
              <p className="flex-1 text-sm text-slate-500">{description}</p>
              <Link to={to} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
                {cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}
