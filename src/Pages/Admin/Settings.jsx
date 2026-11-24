import { useCallback, useEffect, useMemo, useState } from 'react';
import { Settings as SettingsIcon, Plus, Pencil, Trash2, RefreshCw, Lock, Search } from 'lucide-react';
import { listSettings, createSetting, updateSetting, deleteSetting, initializeSettings } from '../../services/settingsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog,
} from '../../components/Ui/kit';

const DATA_TYPES = ['string', 'number', 'boolean', 'json'];
const KEY_PATTERN = /^[a-z0-9_.-]+$/i;
const emptySetting = () => ({ key: '', value: '', description: '', category: '', data_type: 'string', is_editable: true });

/** Returns an error message if `value` is not valid for `type`, otherwise null. */
function validateValue(value, type) {
  const v = String(value ?? '').trim();
  if (type === 'number') {
    if (v === '' || Number.isNaN(Number(v))) return 'Value must be a number';
  } else if (type === 'boolean') {
    if (!['true', 'false'].includes(v)) return 'Value must be true or false';
  } else if (type === 'json') {
    try {
      JSON.parse(v);
    } catch {
      return 'Value must be valid JSON';
    }
  }
  return null;
}

/** Input control that matches the setting's data type. */
const ValueInput = ({ type, value, onChange, id }) => {
  if (type === 'boolean') {
    return (
      <select id={id} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }
  if (type === 'json') {
    return <textarea id={id} className={`${textareaClass} font-mono`} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <input
      id={id}
      type={type === 'number' ? 'number' : 'text'}
      step="any"
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const Settings = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [initializing, setInitializing] = useState(false);

  const [createForm, setCreateForm] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSettings();
      setSettings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => Array.from(new Set(settings.map((s) => s.category || 'general'))).sort(), [settings]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return settings.filter(
      (s) =>
        (!category || (s.category || 'general') === category) &&
        (!q || [s.key, s.description, s.value].some((f) => String(f ?? '').toLowerCase().includes(q)))
    );
  }, [settings, category, search]);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const res = await initializeSettings();
      toast.success(res?.created ? `${res.created} default settings created` : 'Default settings already exist');
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to initialize settings');
    } finally {
      setInitializing(false);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    const key = createForm.key.trim();
    if (!key) return toast.error('Key is required');
    if (!KEY_PATTERN.test(key)) return toast.error('Key may only contain letters, numbers, "_", "-" and "."');
    if (settings.some((s) => s.key === key)) return toast.error(`A setting named "${key}" already exists`);
    const valueError = validateValue(createForm.value, createForm.data_type);
    if (valueError) return toast.error(valueError);
    setSaving(true);
    try {
      await createSetting({
        key,
        value: String(createForm.value).trim(),
        description: createForm.description.trim() || undefined,
        category: createForm.category.trim() || undefined,
        data_type: createForm.data_type,
        is_editable: createForm.is_editable,
      });
      toast.success('Setting created');
      setCreateForm(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to create setting');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (s) =>
    setEditForm({ key: s.key, data_type: s.data_type || 'string', value: s.value ?? '', description: s.description || '' });

  const submitEdit = async (e) => {
    e.preventDefault();
    const valueError = validateValue(editForm.value, editForm.data_type);
    if (valueError) return toast.error(valueError);
    setSaving(true);
    try {
      await updateSetting(editForm.key, { value: String(editForm.value).trim(), description: editForm.description.trim() });
      toast.success(`Saved "${editForm.key}"`);
      setEditForm(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    const ok = await confirm(`Delete setting "${s.key}"? Features that read it will fall back to their built-in default.`, {
      title: 'Delete setting',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await deleteSetting(s.key);
      toast.success('Setting deleted');
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete setting');
    }
  };

  const renderValue = (s) => {
    const v = s.value ?? '';
    if (v === '') return <span className="text-slate-400">(empty)</span>;
    if (s.data_type === 'boolean') return <Badge tone={v === 'true' ? 'brand' : 'slate'}>{v}</Badge>;
    return <span className="block max-w-xs truncate font-mono text-xs text-slate-800" title={v}>{v}</span>;
  };

  return (
    <Page>
      <PageHeader
        icon={SettingsIcon}
        title="System Settings"
        subtitle="Global configuration values used across the platform"
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
            <Button icon={Plus} onClick={() => setCreateForm(emptySetting())}>Add setting</Button>
          </>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search key, value or description…"
              aria-label="Search settings"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={`${inputClass} sm:w-48`} aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <Spinner label="Loading settings…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : settings.length === 0 ? (
          <EmptyState
            icon={SettingsIcon}
            title="No settings yet"
            description="Seed the default settings (service types, stock threshold, forecast confidence…) or add your own."
            action={<Button icon={RefreshCw} loading={initializing} onClick={handleInitialize}>Create default settings</Button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState icon={Search} title="No matching settings" description="Try a different search or category." />
        ) : (
          <Table head={['Key', 'Value', 'Type', 'Category', 'Description', 'Updated', '']}>
            {visible.map((s) => (
              <tr key={s.id || s.key} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">
                  <span className="inline-flex items-center gap-1.5">
                    {s.key}
                    {s.is_editable === false && <Lock className="h-3.5 w-3.5 text-slate-400" aria-label="Read-only" />}
                  </span>
                </Td>
                <Td>{renderValue(s)}</Td>
                <Td><Badge>{s.data_type || 'string'}</Badge></Td>
                <Td><Badge tone="brand">{s.category || 'general'}</Badge></Td>
                <Td className="max-w-sm truncate text-slate-500">{s.description || '—'}</Td>
                <Td className="text-slate-500">{s.updated_at ? new Date(s.updated_at).toLocaleString() : '—'}</Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Pencil}
                      aria-label={`Edit ${s.key}`}
                      disabled={s.is_editable === false}
                      title={s.is_editable === false ? 'Read-only setting' : 'Edit'}
                      onClick={() => openEdit(s)}
                    />
                    <Button variant="ghost" size="sm" icon={Trash2} aria-label={`Delete ${s.key}`} className="text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(s)} />
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {createForm && (
        <Dialog
          title="Add setting"
          onClose={() => !saving && setCreateForm(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setCreateForm(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="create-setting" loading={saving}>Create setting</Button>
            </>
          }
        >
          <form id="create-setting" onSubmit={submitCreate} className="space-y-4">
            <Field label="Key" required hint='Letters, numbers, "_", "-" and "." only, e.g. max_upload_mb'>
              <input className={inputClass} value={createForm.key} onChange={(e) => setCreateForm((f) => ({ ...f, key: e.target.value }))} autoFocus />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Data type">
                <select className={inputClass} value={createForm.data_type} onChange={(e) => setCreateForm((f) => ({ ...f, data_type: e.target.value, value: '' }))}>
                  {DATA_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <input className={inputClass} list="setting-categories" placeholder="general" value={createForm.category} onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))} />
                <datalist id="setting-categories">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
            </div>
            <Field label="Value" required>
              <ValueInput type={createForm.data_type} value={createForm.value} onChange={(v) => setCreateForm((f) => ({ ...f, value: v }))} />
            </Field>
            <Field label="Description">
              <textarea className={textareaClass} value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={createForm.is_editable} onChange={(e) => setCreateForm((f) => ({ ...f, is_editable: e.target.checked }))} />
              Editable later (untick to make it read-only)
            </label>
          </form>
        </Dialog>
      )}

      {editForm && (
        <Dialog
          title={`Edit ${editForm.key}`}
          subtitle={`Type: ${editForm.data_type}`}
          onClose={() => !saving && setEditForm(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditForm(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="edit-setting" loading={saving}>Save</Button>
            </>
          }
        >
          <form id="edit-setting" onSubmit={submitEdit} className="space-y-4">
            <Field label="Value" required>
              <ValueInput type={editForm.data_type} value={editForm.value} onChange={(v) => setEditForm((f) => ({ ...f, value: v }))} />
            </Field>
            <Field label="Description">
              <textarea className={textareaClass} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default Settings;
