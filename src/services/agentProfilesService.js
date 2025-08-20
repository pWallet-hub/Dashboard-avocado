import client from './airtableApi';

// Prefer stable table id to avoid breakage on name changes
const TABLE = 'tblb29mUicMjTIiER'; // Agent Profiles

function buildParams({
  fields,
  filterByFormula,
  maxRecords,
  pageSize,
  sort,
  view,
  cellFormat,
  timeZone,
  userLocale,
  returnFieldsByFieldId,
  recordMetadata,
  offset,
} = {}) {
  const params = {};
  if (Array.isArray(fields) && fields.length) {
    fields.forEach((f, i) => {
      params[`fields[${i}]`] = f;
    });
  }
  if (filterByFormula) params.filterByFormula = filterByFormula;
  if (maxRecords) params.maxRecords = maxRecords;
  if (pageSize) params.pageSize = pageSize;
  if (Array.isArray(sort) && sort.length) {
    sort.forEach((s, i) => {
      if (s?.field) params[`sort[${i}][field]`] = s.field;
      if (s?.direction) params[`sort[${i}][direction]`] = s.direction;
    });
  }
  if (view) params.view = view;
  if (cellFormat) params.cellFormat = cellFormat;
  if (timeZone) params.timeZone = timeZone;
  if (userLocale) params.userLocale = userLocale;
  if (returnFieldsByFieldId !== undefined) params.returnFieldsByFieldId = returnFieldsByFieldId;
  if (Array.isArray(recordMetadata) && recordMetadata.length) {
    recordMetadata.forEach((m, i) => {
      params[`recordMetadata[${i}]`] = m;
    });
  }
  if (offset) params.offset = offset;
  return params;
}

export async function listAgentProfiles(options = {}) {
  const params = buildParams(options);
  const res = await client.get(TABLE, { params });
  return res.data; // { records: [...], offset? }
}

export async function getAgentProfile(recordId) {
  const res = await client.get(`${TABLE}/${recordId}`);
  return res.data; // { id, fields, createdTime }
}

export async function createAgentProfiles(records, { typecast } = {}) {
  // records: [{ fields: { ... } }, ...]
  const res = await client.post(TABLE, { records, typecast });
  return res.data; // { records: [...] }
}

export async function createAgentProfile(fields, { typecast } = {}) {
  return createAgentProfiles([{ fields }], { typecast });
}

export async function updateAgentProfiles(records, { typecast } = {}) {
  // PATCH for partial updates. records: [{ id, fields }]
  const res = await client.patch(TABLE, { records, typecast });
  return res.data;
}

export async function updateAgentProfile(recordId, fields, { typecast } = {}) {
  return updateAgentProfiles([{ id: recordId, fields }], { typecast });
}

export async function upsertAgentProfiles(records, fieldsToMergeOn, { typecast } = {}) {
  const res = await client.patch(TABLE, {
    records,
    typecast,
    performUpsert: {
      fieldsToMergeOn,
    },
  });
  return res.data;
}

export async function deleteAgentProfiles(recordIds) {
  const params = {};
  recordIds.forEach((id, i) => {
    params[`records[${i}]`] = id;
  });
  const res = await client.delete(TABLE, { params });
  return res.data; // { records: [{ id, deleted: true } ...] }
}

export async function deleteAgentProfile(recordId) {
  const res = await client.delete(`${TABLE}/${recordId}`);
  return res.data; // { id, deleted }
}
