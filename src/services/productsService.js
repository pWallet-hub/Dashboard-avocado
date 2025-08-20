import client from './airtableApi';

// Stable table ID for Products table
const TABLE = 'tblhFrENfLsrg7TCi';

// Helper to build list query params consistently
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
  if (Array.isArray(fields) && fields.length) params.fields = fields;
  if (typeof filterByFormula === 'string') params.filterByFormula = filterByFormula;
  if (typeof maxRecords === 'number') params.maxRecords = maxRecords;
  if (typeof pageSize === 'number') params.pageSize = pageSize;
  if (Array.isArray(sort) && sort.length) params.sort = sort;
  if (view) params.view = view;
  if (cellFormat) params.cellFormat = cellFormat;
  if (timeZone) params.timeZone = timeZone;
  if (userLocale) params.userLocale = userLocale;
  if (typeof returnFieldsByFieldId === 'boolean') params.returnFieldsByFieldId = returnFieldsByFieldId;
  if (Array.isArray(recordMetadata) && recordMetadata.length) params.recordMetadata = recordMetadata;
  if (offset) params.offset = offset;
  return params;
}

// List Products records
export async function listProducts(options = {}) {
  const params = buildParams(options);
  const res = await client.get(TABLE, { params });
  return res.data;
}

// Retrieve a single Product record by record ID
export async function getProduct(recordId, { returnFieldsByFieldId } = {}) {
  const params = {};
  if (typeof returnFieldsByFieldId === 'boolean') params.returnFieldsByFieldId = returnFieldsByFieldId;
  const res = await client.get(`${TABLE}/${recordId}`, { params });
  return res.data;
}

// Create Products (batch)
export async function createProducts(records, { typecast } = {}) {
  const payload = { records };
  if (typeof typecast === 'boolean') payload.typecast = typecast;
  const res = await client.post(TABLE, payload);
  return res.data;
}

// Create single Product
export async function createProduct(fields, { typecast } = {}) {
  return createProducts([{ fields }], { typecast });
}

// Update Products (PATCH batch, partial)
export async function updateProducts(records, { typecast } = {}) {
  const payload = { records };
  if (typeof typecast === 'boolean') payload.typecast = typecast;
  const res = await client.patch(TABLE, payload);
  return res.data;
}

// Update single Product (PATCH partial)
export async function updateProduct(recordId, fields, { typecast } = {}) {
  return updateProducts([{ id: recordId, fields }], { typecast });
}

// Upsert Products (PATCH with performUpsert)
export async function upsertProducts(records, fieldsToMergeOn, { typecast } = {}) {
  const payload = { records, performUpsert: { fieldsToMergeOn } };
  if (typeof typecast === 'boolean') payload.typecast = typecast;
  const res = await client.patch(TABLE, payload);
  return res.data;
}

// Replace Products (PUT destructive)
export async function replaceProducts(records, { typecast } = {}) {
  const payload = { records };
  if (typeof typecast === 'boolean') payload.typecast = typecast;
  const res = await client.put(TABLE, payload);
  return res.data;
}

// Replace single Product (PUT destructive)
export async function replaceProduct(recordId, fields, { typecast } = {}) {
  return replaceProducts([{ id: recordId, fields }], { typecast });
}

// Delete Products (batch)
export async function deleteProducts(recordIds) {
  const params = new URLSearchParams();
  recordIds.forEach((id) => params.append('records[]', id));
  const res = await client.delete(TABLE, { params });
  return res.data;
}

// Delete single Product
export async function deleteProduct(recordId) {
  const res = await client.delete(`${TABLE}/${recordId}`);
  return res.data;
}
