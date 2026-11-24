import { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import { getServiceRequest } from '../../../services/serviceRequestsService';
import { Dialog, Badge, Spinner, ErrorState } from '../../../components/Ui/kit';
import { statusMeta, typeLabel, uiType, PRIORITY_TONES, formatDate, formatLocation, detailRows } from './helpers';

const Row = ({ label, children }) => (
  <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
    <dt className="w-44 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="min-w-0 break-words text-sm text-slate-800">{children ?? '—'}</dd>
  </div>
);

const Person = ({ title, person }) => (
  <div className="rounded-xl border border-slate-200 p-3">
    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
    {person ? (
      <div className="space-y-1 text-sm text-slate-700">
        <p className="flex items-center gap-2 font-medium text-slate-900"><User className="h-4 w-4 text-slate-400" />{person.full_name || '—'}</p>
        {person.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{person.phone}</p>}
        {person.email && <p className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 text-slate-400" />{person.email}</p>}
      </div>
    ) : (
      <p className="text-sm text-slate-500">Not assigned</p>
    )}
  </div>
);

/** Full request details; fetched by id so farmer/agent contact info is included. */
export default function RequestDetailDialog({ requestId, onClose, footer }) {
  const [state, setState] = useState({ loading: true, error: null, req: null });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, error: null, req: null });
    getServiceRequest(requestId)
      .then((req) => alive && setState({ loading: false, error: null, req }))
      .catch((e) => alive && setState({ loading: false, error: e.message, req: null }));
    return () => {
      alive = false;
    };
  }, [requestId]);

  const { req } = state;
  const status = statusMeta(req?.status);
  const extra = req ? detailRows(req).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== '— – —') : [];
  const feedback = req?.feedback;

  return (
    <Dialog
      title={req ? req.title || 'Service request' : 'Service request'}
      subtitle={req?.request_number}
      onClose={onClose}
      size="lg"
      footer={req ? footer?.(req) : null}
    >
      {state.loading && <Spinner />}
      {state.error && <ErrorState message={state.error} />}
      {req && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            <Badge>{typeLabel(uiType(req.service_type))}</Badge>
            {req.priority && <Badge tone={PRIORITY_TONES[req.priority]}>Priority: {req.priority}</Badge>}
            {req.is_escalated && <Badge tone="rose">Escalated</Badge>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Person title="Farmer" person={req.farmer} />
            <Person title="Assigned agent" person={req.agent} />
          </div>

          <dl className="divide-y divide-slate-100">
            {req.description && <Row label="Description">{req.description}</Row>}
            <Row label="Location">
              <span className="inline-flex items-start gap-1"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />{formatLocation(req.location)}</span>
            </Row>
            <Row label="Requested">{formatDate(req.requested_date || req.created_at)}</Row>
            {req.scheduled_date && <Row label="Scheduled">{formatDate(req.scheduled_date)}</Row>}
            {req.due_date && <Row label="Due (SLA)">{formatDate(req.due_date)}</Row>}
            {req.cost_estimate != null && <Row label="Cost estimate">{Number(req.cost_estimate).toLocaleString()} RWF</Row>}
            {extra.map(([label, value]) => (
              <Row key={label} label={label}>{String(value)}</Row>
            ))}
            {req.notes && <Row label="Notes">{req.notes}</Row>}
            {req.approved_at && <Row label="Approved">{formatDate(req.approved_at)}</Row>}
            {req.started_at && <Row label="Started">{formatDate(req.started_at)}{req.start_notes ? ` — ${req.start_notes}` : ''}</Row>}
            {req.completed_at && <Row label="Completed">{formatDate(req.completed_at)}</Row>}
            {req.completion_notes && <Row label="Completion notes">{req.completion_notes}</Row>}
            {req.rejection_reason && <Row label="Rejection reason">{req.rejection_reason}</Row>}
            {feedback && <Row label="Farmer feedback">{`${feedback.rating}/5${feedback.comment ? ` — ${feedback.comment}` : ''}`}</Row>}
          </dl>
        </div>
      )}
    </Dialog>
  );
}
