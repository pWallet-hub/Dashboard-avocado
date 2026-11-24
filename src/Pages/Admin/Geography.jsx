import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Globe2, RefreshCw, Search } from 'lucide-react';
import {
  getFullGeography,
  listProvinces,
  listDistricts,
  createProvince, updateProvince, deleteProvince,
  createDistrict, updateDistrict,
  createSector,
  createCell,
  createVillage,
} from '../../services/geographyService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { Page, PageHeader, Card, StatCard, Badge, Button, Field, inputClass, EmptyState, ErrorState, Spinner, Dialog } from '../../components/Ui/kit';

const LEVEL_LABELS = { province: 'Province', district: 'District', sector: 'Sector', cell: 'Cell', village: 'Village' };
const CHILD_LEVEL = { province: 'district', district: 'sector', sector: 'cell', cell: 'village' };
const CHILD_KEY = { province: 'districts', district: 'sectors', sector: 'cells', cell: 'villages' };

const childrenOf = (node, level) => (Array.isArray(node?.[CHILD_KEY[level]]) ? node[CHILD_KEY[level]] : []);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const iconBtn = 'rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

/** One row of the hierarchy tree, recursing into its children when expanded. */
const TreeNode = ({ node, level, depth, expanded, onToggle, onAdd, onEdit, onDelete, filter }) => {
  const childLevel = CHILD_LEVEL[level];
  const children = childLevel ? childrenOf(node, level) : [];
  const key = `${level}:${node.id}`;
  const isOpen = expanded.has(key) || Boolean(filter);
  const editable = level === 'province' || level === 'district';

  return (
    <li>
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50" style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}>
        {childLevel ? (
          <button
            type="button"
            onClick={() => onToggle(key)}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.name}`}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
            <span className={`truncate ${depth === 0 ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>{node.name}</span>
            {node.code && <span className="shrink-0 text-xs text-slate-400">({node.code})</span>}
            <Badge className="hidden shrink-0 sm:inline-flex">{plural(children.length, LEVEL_LABELS[childLevel].toLowerCase())}</Badge>
          </button>
        ) : (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-slate-300" />
            <span className="truncate text-slate-700">{node.name}</span>
          </span>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {childLevel && (
            <button type="button" className={iconBtn} onClick={() => onAdd(childLevel, node)} aria-label={`Add ${LEVEL_LABELS[childLevel].toLowerCase()} to ${node.name}`} title={`Add ${LEVEL_LABELS[childLevel].toLowerCase()}`}>
              <Plus className="h-4 w-4" />
            </button>
          )}
          {editable && (
            <button type="button" className={iconBtn} onClick={() => onEdit(level, node)} aria-label={`Edit ${node.name}`} title="Edit">
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {level === 'province' && (
            <button type="button" className={`${iconBtn} hover:text-rose-600`} onClick={() => onDelete(node)} aria-label={`Delete ${node.name}`} title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {isOpen && childLevel && (
        children.length === 0 ? (
          <p className="py-1 text-xs text-slate-400" style={{ paddingLeft: `${(depth + 1) * 1.25 + 1.75}rem` }}>
            No {LEVEL_LABELS[childLevel].toLowerCase()}s yet.
          </p>
        ) : (
          <ul>
            {children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={childLevel}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                filter={filter}
              />
            ))}
          </ul>
        )
      )}
    </li>
  );
};

// Keep only branches that contain a match for the search term (case-insensitive).
const filterTree = (nodes, level, term) => {
  if (!term) return nodes;
  return nodes.reduce((acc, node) => {
    if ((node.name || '').toLowerCase().includes(term)) {
      acc.push(node);
      return acc;
    }
    const childLevel = CHILD_LEVEL[level];
    if (!childLevel) return acc;
    const kids = filterTree(childrenOf(node, level), childLevel, term);
    if (kids.length) acc.push({ ...node, [CHILD_KEY[level]]: kids });
    return acc;
  }, []);
};

const AdminGeography = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());
  const [search, setSearch] = useState('');

  // modal: { level, mode: 'add'|'edit', parent: {id,name}|null, id?, name, code }
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The full tree has no codes, so merge province codes from the flat list.
      const [tree, flat] = await Promise.all([getFullGeography(), listProvinces().catch(() => [])]);
      const codes = Object.fromEntries(flat.map((p) => [p.id, p.code]));
      const list = Array.isArray(tree) ? tree : [];
      setProvinces(list.map((p) => ({ ...p, code: codes[p.id] || p.code || null })));
    } catch (err) {
      setError(err.message || 'Failed to load geography data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const t = { provinces: provinces.length, districts: 0, sectors: 0, cells: 0, villages: 0 };
    provinces.forEach((p) => childrenOf(p, 'province').forEach((d) => {
      t.districts += 1;
      childrenOf(d, 'district').forEach((s) => {
        t.sectors += 1;
        childrenOf(s, 'sector').forEach((c) => {
          t.cells += 1;
          t.villages += childrenOf(c, 'cell').length;
        });
      });
    }));
    return t;
  }, [provinces]);

  const term = search.trim().toLowerCase();
  const visible = useMemo(() => filterTree(provinces, 'province', term), [provinces, term]);

  const toggle = (key) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const openAdd = (level, parent = null) => setModal({ level, mode: 'add', parent, name: '', code: '' });

  const openEdit = async (level, node) => {
    setModal({ level, mode: 'edit', id: node.id, name: node.name || '', code: node.code || '', loadingCode: level === 'district' });
    if (level === 'district') {
      // District codes aren't in the tree; look them up from the province's district list.
      const province = provinces.find((p) => childrenOf(p, 'province').some((d) => d.id === node.id));
      try {
        const districts = province ? await listDistricts(province.id) : [];
        const match = districts.find((d) => d.id === node.id);
        setModal((m) => (m && m.id === node.id ? { ...m, code: match?.code || '', loadingCode: false } : m));
      } catch {
        setModal((m) => (m && m.id === node.id ? { ...m, loadingCode: false } : m));
      }
    }
  };

  const closeModal = () => !saving && setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!modal) return;
    const name = modal.name.trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }
    const code = modal.code.trim();
    setSaving(true);
    try {
      const { level, mode, parent, id } = modal;
      if (level === 'province') {
        if (mode === 'add') await createProvince({ name, ...(code ? { code } : {}) });
        else await updateProvince(id, { name, code });
      } else if (level === 'district') {
        if (mode === 'add') await createDistrict({ name, province_id: parent.id, ...(code ? { code } : {}) });
        else await updateDistrict(id, { name, code });
      } else if (level === 'sector') {
        await createSector({ name, district_id: parent.id });
      } else if (level === 'cell') {
        await createCell({ name, sector_id: parent.id });
      } else if (level === 'village') {
        await createVillage({ name, cell_id: parent.id });
      }
      if (parent) {
        const parentLevel = Object.keys(CHILD_LEVEL).find((k) => CHILD_LEVEL[k] === level);
        setExpanded((prev) => new Set(prev).add(`${parentLevel}:${parent.id}`));
      }
      toast.success(`${LEVEL_LABELS[level]} ${mode === 'add' ? 'created' : 'updated'}`);
      setModal(null);
      await load();
    } catch (err) {
      toast.error(err.message || `Failed to save ${LEVEL_LABELS[modal.level].toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvince = async (province) => {
    if (childrenOf(province, 'province').length > 0) {
      toast.error(`"${province.name}" still has districts. Only empty provinces can be deleted.`);
      return;
    }
    const ok = await confirm(`Delete province "${province.name}"? This cannot be undone.`, { title: 'Delete province', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteProvince(province.id);
      toast.success('Province deleted');
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete province');
    }
  };

  return (
    <Page>
      <PageHeader
        icon={Globe2}
        title="Geography"
        subtitle="Administrative hierarchy: Province → District → Sector → Cell → Village"
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
            <Button icon={Plus} onClick={() => openAdd('province')}>Add province</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Provinces" value={totals.provinces} />
        <StatCard label="Districts" value={totals.districts} />
        <StatCard label="Sectors" value={totals.sectors} />
        <StatCard label="Cells" value={totals.cells} />
        <StatCard label="Villages" value={totals.villages} />
      </div>

      <Card
        title="Location hierarchy"
        subtitle="Provinces and districts can be renamed; sectors, cells and villages can currently only be added (the API has no edit/delete for them)."
        padded={false}
      >
        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search any location…"
              aria-label="Search locations"
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>
        {loading && provinces.length === 0 ? (
          <Spinner label="Loading geography…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : visible.length === 0 ? (
          term ? (
            <EmptyState icon={Search} title="No matches" description={`Nothing matches "${search}".`} />
          ) : (
            <EmptyState icon={MapPin} title="No provinces yet" description="Start by adding a province." action={<Button icon={Plus} onClick={() => openAdd('province')}>Add province</Button>} />
          )
        ) : (
          <ul className="p-2 text-sm">
            {visible.map((p) => (
              <TreeNode
                key={p.id}
                node={p}
                level="province"
                depth={0}
                expanded={expanded}
                onToggle={toggle}
                onAdd={openAdd}
                onEdit={openEdit}
                onDelete={handleDeleteProvince}
                filter={term}
              />
            ))}
          </ul>
        )}
      </Card>

      {modal && (
        <Dialog
          title={`${modal.mode === 'add' ? 'Add' : 'Edit'} ${LEVEL_LABELS[modal.level].toLowerCase()}`}
          subtitle={modal.parent ? `In ${modal.parent.name}` : undefined}
          onClose={closeModal}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button type="submit" form="geo-form" loading={saving}>Save</Button>
            </>
          }
        >
          <form id="geo-form" onSubmit={handleSave} className="space-y-4">
            <Field label="Name" required>
              <input
                type="text"
                value={modal.name}
                onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                className={inputClass}
                placeholder={`${LEVEL_LABELS[modal.level]} name`}
                maxLength={100}
                autoFocus
                required
              />
            </Field>
            {(modal.level === 'province' || modal.level === 'district') && (
              <Field label="Code" hint={modal.loadingCode ? 'Loading current code…' : 'Optional short code'}>
                <input
                  type="text"
                  value={modal.code}
                  onChange={(e) => setModal((m) => ({ ...m, code: e.target.value }))}
                  className={inputClass}
                  maxLength={20}
                  disabled={modal.loadingCode}
                />
              </Field>
            )}
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default AdminGeography;
