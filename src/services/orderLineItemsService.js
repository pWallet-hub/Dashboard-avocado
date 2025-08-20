import client from './airtableApi';

// Stable table ID for Order Line Items table
const TABLE = 'tblsLfAioYzMuyEIb';

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

// List Order Line Items records
export async function listOrderLineItems(options = {}) {
  const params = buildParams(options);
  const res = await client.get(TABLE, { params });
  return res.data;
}

// Retrieve a single Order Line Item by record ID
export async function getOrderLineItem(recordId, { returnFieldsByFieldId } = {}) {
  const params = {};
  if (typeof returnFieldsByFieldId === 'boolean') params.returnFieldsByFieldId = returnFieldsByFieldId;
  const res = await client.get(`${TABLE}/${recordId}`, { params });
  return res.data;
}

// Create Order Line Items (batch)
export async function createOrderLineItems(records, { typecast } = {}) {
  const payload = { records };
  if (typeof typecast === 'boolean') payload.typecast = typecast;
  const res = await client.post(TABLE, payload);
  return res.data;
}

// Create single Order Line Item
export async function createOrderLineItem(fields, { typecast } = {}) {
  return createOrderLineItems([{ fields }], { typecast });
}

// Update Order Line Items (PATCH batch, partial)
export async function updateOrderLineItems(records, { typecast } = {}) {
  const payload = { records };
  if (typeof typecast === 'boolean') payload.typecast = typecast;
  const res = await client.patch(TABLE, payload);
  return res.data;
}

// Update single Order Line Item (PATCH partial)
export async function updateOrderLineItem(recordId, fields, { typecast } = {}) {
  return updateOrderLineItems([{ id: recordId, fields }], { typecast });
}

// Upsert Order Line Items (PATCH with performUpsert)
export async function upsertOrderLineItems(records, fieldsToMergeOn, { typecast } = {}) {
  const payload = { records, performUpsert: { fieldsToMergeOn } };
  if (typeof typecast === 'boolean') payload.typecast = typecast;
  const res = await client.patch(TABLE, payload);
  return res.data;
}

// Replace Order Line Items (PUT destructive)
export async function replaceOrderLineItems(records, { typecast } = {}) {
  const payload = { records };
  if (typeof typecast === 'boolean') payload.typecast = typecast;
  const res = await client.put(TABLE, payload);
  return res.data;
}

// Replace single Order Line Item (PUT destructive)
export async function replaceOrderLineItem(recordId, fields, { typecast } = {}) {
  return replaceOrderLineItems([{ id: recordId, fields }], { typecast });
}

// Delete Order Line Items (batch)
export async function deleteOrderLineItems(recordIds) {
  const params = new URLSearchParams();
  recordIds.forEach((id) => params.append('records[]', id));
  const res = await client.delete(TABLE, { params });
  return res.data;
}

// Delete single Order Line Item
export async function deleteOrderLineItem(recordId) {
  const res = await client.delete(`${TABLE}/${recordId}`);
  return res.data;
}
