import { useState } from 'react';
import { Dialog, Button, Field, inputClass, textareaClass } from '../../../components/Ui/kit';

const today = () => new Date().toISOString().slice(0, 10);

const CONFIG = {
  approve: { title: 'Approve request', submit: 'Approve' },
  reject: { title: 'Reject request', submit: 'Reject', danger: true },
  assign: { title: 'Assign agent', submit: 'Assign agent' },
  start: { title: 'Start work', submit: 'Mark in progress' },
  complete: { title: 'Complete request', submit: 'Mark completed' },
  cancel: { title: 'Cancel request', submit: 'Cancel request', danger: true },
  reschedule: { title: 'Schedule farm visit', submit: 'Save visit' },
};

const initialValues = (type, req) => ({
  agent_id: type === 'assign' ? req.agent_id || '' : '',
  scheduled_date: req.scheduled_date ? String(req.scheduled_date).slice(0, 10) : '',
  cost_estimate: req.cost_estimate ?? '',
  notes: '',
  visit_date: '',
  visit_time: req.visit_details?.visit_time || '09:00',
});

/**
 * One dialog for every admin action on a request. Validates the fields each
 * backend endpoint requires and calls onSubmit(values); the parent performs the API call.
 */
export default function ActionDialog({ type, request, agents, onClose, onSubmit }) {
  const cfg = CONFIG[type];
  const [values, setValues] = useState(() => initialValues(type, request));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const hasVisit = Boolean(request.visit_details?.visit_date);

  const validate = () => {
    if (type === 'reject' && !values.notes.trim()) return 'Please give a reason for the rejection.';
    if (type === 'assign' && !values.agent_id) return 'Please choose an agent.';
    if (type === 'reschedule') {
      if (!values.visit_date) return 'Please choose a visit date.';
      if (!hasVisit && !values.visit_time) return 'Please choose a visit time.';
      if (hasVisit && !values.notes.trim()) return 'Please give a reason for rescheduling.';
    }
    if (values.cost_estimate !== '' && (Number.isNaN(Number(values.cost_estimate)) || Number(values.cost_estimate) < 0)) {
      return 'Cost estimate must be a positive number.';
    }
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const msg = validate();
    setError(msg);
    if (msg) return;
    setBusy(true);
    try {
      await onSubmit(values);
    } finally {
      setBusy(false);
    }
  };

  const agentSelect = (required) => (
    <Field label={required ? 'Agent' : 'Assign an agent (optional)'} required={required}>
      <select className={inputClass} value={values.agent_id} onChange={set('agent_id')}>
        <option value="">{required ? 'Select an agent…' : 'No agent yet'}</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>{a.full_name || a.email}{a.phone ? ` · ${a.phone}` : ''}</option>
        ))}
      </select>
      {agents.length === 0 && <span className="mt-1 block text-xs text-amber-700">No active agents found.</span>}
    </Field>
  );

  return (
    <Dialog
      title={type === 'reschedule' && hasVisit ? 'Reschedule farm visit' : cfg.title}
      subtitle={`${request.request_number || ''} · ${request.title || ''}`}
      onClose={busy ? undefined : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Close</Button>
          <Button type="submit" form="sr-action-form" variant={cfg.danger ? 'danger' : 'primary'} loading={busy}>{cfg.submit}</Button>
        </>
      }
    >
      <form id="sr-action-form" onSubmit={submit} className="space-y-4" noValidate>
        {type === 'approve' && (
          <>
            {agentSelect(false)}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Scheduled date">
                <input type="date" min={today()} className={inputClass} value={values.scheduled_date} onChange={set('scheduled_date')} />
              </Field>
              <Field label="Cost estimate (RWF)">
                <input type="number" min="0" step="1" className={inputClass} value={values.cost_estimate} onChange={set('cost_estimate')} />
              </Field>
            </div>
            <Field label="Notes for the farmer / agent">
              <textarea className={textareaClass} value={values.notes} onChange={set('notes')} maxLength={1000} />
            </Field>
          </>
        )}
        {type === 'assign' && (
          <>
            {agentSelect(true)}
            <Field label="Scheduled date">
              <input type="date" min={today()} className={inputClass} value={values.scheduled_date} onChange={set('scheduled_date')} />
            </Field>
            <p className="text-xs text-slate-500">The agent and the farmer are notified, and the request moves to “Assigned”.</p>
          </>
        )}
        {type === 'reject' && (
          <Field label="Reason (sent to the farmer)" required>
            <textarea className={textareaClass} value={values.notes} onChange={set('notes')} maxLength={1000} autoFocus />
          </Field>
        )}
        {(type === 'start' || type === 'complete' || type === 'cancel') && (
          <Field label={type === 'start' ? 'Start notes' : type === 'complete' ? 'Completion notes' : 'Reason (optional)'}>
            <textarea className={textareaClass} value={values.notes} onChange={set('notes')} maxLength={1000} autoFocus />
          </Field>
        )}
        {type === 'reschedule' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Visit date" required>
                <input type="date" min={today()} className={inputClass} value={values.visit_date} onChange={set('visit_date')} />
              </Field>
              <Field label="Visit time" required={!hasVisit}>
                <input type="time" className={inputClass} value={values.visit_time} onChange={set('visit_time')} />
              </Field>
            </div>
            <Field label={hasVisit ? 'Reason for rescheduling' : 'Instructions for the farmer'} required={hasVisit}>
              <textarea className={textareaClass} value={values.notes} onChange={set('notes')} maxLength={1000} />
            </Field>
            {hasVisit && <p className="text-xs text-slate-500">Currently scheduled for {request.visit_details.visit_date} {request.visit_details.visit_time || ''}.</p>}
          </>
        )}
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      </form>
    </Dialog>
  );
}
