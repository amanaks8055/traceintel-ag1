const f = (name, label, type = 'text', options = {}) => ({
  name, label, type, optional: options.opt === 1, large: options.big === 1,
  min: options.min, max: options.max, pattern: options.pattern, options: options.o || []
})
const list = (url, title, options = {}) => ({ url, title, parameter: options.p, actions: options.acts || [], deleteUrl: options.del })
const form = (title, method, url, fields, confirm = false) => ({ title, method, url, fields, confirm })
const OPS = ['ADMIN', 'OPERATOR', 'SUPERVISOR']
const TRC = ['ADMIN', 'SUPERVISOR', 'QUALITY_ENGINEER', 'MANAGER']
const ADM = ['ADMIN']
const AUD = ['ADMIN', 'MANAGER']
export const ROLES = ['ADMIN', 'OPERATOR', 'SUPERVISOR', 'QUALITY_ENGINEER', 'MANAGER']
export const can = (page, role) => !page.roles || page.roles.includes(role)

const contact = [f('code', 'Code'), f('name', 'Name'), f('contactEmail', 'Email', 'email', { opt: 1 }), f('phone', 'Phone', 'text', { opt: 1 }), f('address', 'Address', 'text', { opt: 1 })]
const crud = (base, fields) => ({
  list: list(base, 'Records'),
  forms: [form('Create', 'post', base, fields), form('Update', 'put', `${base}/{id}`, [f('id', 'Record ID', 'number'), ...fields])],
})
const part = [
  f('partNumber', 'Part number (MTH-XX-000)', 'text', { pattern: '^MTH-[A-Z]{2}-\\d{3}$' }),
  f('name', 'Name'), f('description', 'Description', 'text', { opt: 1 }),
  f('costPerPart', 'Cost per part', 'number', { opt: 1 }), f('partsPerVehicle', 'Parts per vehicle', 'number', { opt: 1 }),
  f('scrapCost', 'Scrap cost', 'number', { opt: 1 }), f('reworkCost', 'Rework cost', 'number', { opt: 1 }),
]
const holdAction = (label, approved) => ({ label, method: 'put', url: (row) => `/api/holds/${row.id}/approve`, body: { approved }, notes: true, show: (row) => row.status === 'REQUESTED' })

export const PAGES = [
  { id: 'dashboard', path: '/dashboard', title: 'Dashboard', g: 'Operations', dash: true },
  { id: 'scan', path: '/scan', title: 'Scan Station', g: 'Operations', roles: OPS,
    list: list('/api/scan/events', 'Recent scan events', { acts: [{ label: 'View', method: 'get', url: (row) => `/api/scan/events/${row.id}`, view: true }] }),
    forms: [
      form('Validate a scan', 'post', '/api/scan/validate', [f('serialInput', 'Serial number', 'text', { big: 1 }), f('batchId', 'Batch ID', 'number'), f('station', 'Station', 'text', { opt: 1 }), f('manualEntry', 'Manual entry', 'checkbox'), f('approvedBy', 'Approved by (user ID)', 'number', { opt: 1 })]),
      form('Record material lot scan', 'post', '/api/scan/material-lot', [f('batchId', 'Batch ID', 'number'), f('lotId', 'Material lot ID', 'number')]),
    ] },
  { id: 'shipments', path: '/shipments', title: 'Shipments', g: 'Operations', roles: OPS,
    list: list('/api/shipments', 'Shipments', { acts: [{ label: 'View details', method: 'get', url: (row) => `/api/shipments/${row.id}`, view: true }] }),
    forms: [
      form('Create shipment', 'post', '/api/shipments', [f('shipmentNumber', 'Shipment number'), f('customerId', 'Customer ID', 'number'), f('shippedDate', 'Shipped date', 'date'), f('notes', 'Notes', 'text', { opt: 1 })], true),
      form('Update shipment', 'put', '/api/shipments/{id}', [f('id', 'Shipment ID', 'number'), f('shipmentNumber', 'Shipment number'), f('customerId', 'Customer ID', 'number'), f('shippedDate', 'Shipped date', 'date'), f('notes', 'Notes', 'text', { opt: 1 })], true),
      form('Add batch to shipment', 'post', '/api/shipments/{id}/items', [f('id', 'Shipment ID', 'number'), f('batchId', 'Batch ID', 'number'), f('quantity', 'Quantity', 'number')], true),
    ] },
  { id: 'forward', path: '/trace', title: 'Forward Trace', g: 'Traceability and Quality', roles: TRC,
    list: list('/api/trace/history', 'Past trace runs'),
    forms: [form('Trace a material lot forward', 'post', '/api/trace/forward', [f('lotId', 'Material lot ID', 'number')])] },
  { id: 'backward', path: '/trace/backward', title: 'Backward Trace', g: 'Traceability and Quality', roles: TRC,
    forms: [form('Trace a VIN or serial to its supplier', 'post', '/api/trace/backward', [f('input', 'VIN or serial number')])] },
  { id: 'holds', path: '/holds', title: 'Hold Management', g: 'Traceability and Quality', roles: TRC,
    note: 'Two-person rule: the requester cannot approve the same hold.',
    list: list('/api/holds', 'Quality holds', { acts: [holdAction('Approve', true), holdAction('Reject', false), { label: 'View', method: 'get', url: (row) => `/api/holds/${row.id}`, view: true }] }),
    forms: [form('Request a hold', 'post', '/api/holds/request', [f('lotId', 'Material lot ID', 'number'), f('reason', 'Reason', 'text', { min: 10, max: 500 })])],
  },
  { id: 'admin', path: '/admin', title: 'Admin Overview', g: 'Administration', roles: ADM, tiles: true },
  { id: 'parts', path: '/admin/parts', title: 'Parts', g: 'Administration', roles: ADM, ...crud('/api/admin/parts', part), deleteUrl: (row) => `/api/admin/parts/${row.id}` },
  { id: 'bom', path: '/admin/bom', title: 'Bill of Materials', g: 'Administration', roles: ADM,
    list: list('/api/admin/bom/{partId}', 'Components of a part', { p: 'partId', del: (row) => `/api/admin/bom/${row.id}` }),
    forms: [form('Add BOM item', 'post', '/api/admin/bom', [f('parentPartId', 'Parent part ID', 'number'), f('childPartId', 'Child part ID', 'number'), f('quantity', 'Quantity', 'number'), f('level', 'Level', 'number', { opt: 1 })])],
  },
  { id: 'suppliers', path: '/admin/suppliers', title: 'Suppliers', g: 'Administration', roles: ADM, ...crud('/api/admin/suppliers', contact) },
  { id: 'machines', path: '/admin/machines', title: 'Machines', g: 'Administration', roles: ADM, ...crud('/api/admin/machines', [f('code', 'Code'), f('name', 'Name'), f('station', 'Station', 'text', { opt: 1 }), f('location', 'Location', 'text', { opt: 1 }), f('active', 'Active', 'checkbox')]) },
  { id: 'customers', path: '/admin/customers', title: 'Customers', g: 'Administration', roles: ADM, ...crud('/api/admin/customers', contact) },
  { id: 'users', path: '/admin/users', title: 'Users', g: 'Administration', roles: ADM, list: list('/api/admin/users', 'Users'),
    forms: [form('Create user', 'post', '/api/admin/users', [f('username', 'Username', 'text', { min: 3, max: 50 }), f('password', 'Password', 'password', { min: 6, max: 100 }), f('fullName', 'Full name'), f('email', 'Email', 'email'), f('role', 'Role', 'select', { o: ROLES })])] },
  { id: 'vin', path: '/admin/vin-import', title: 'VIN Import', g: 'Administration', roles: ADM, list: list('/api/admin/vin/links', 'Imported VIN links'), note: 'CSV columns: vin,batch_number,serial,customer_code', forms: [form('Import a CSV file', 'post', '/api/admin/vin/import', [f('file', 'CSV file', 'file')])] },
  { id: 'qr', path: '/admin/qr', title: 'QR Code Generator', g: 'Administration', roles: ADM, qr: true },
  { id: 'audit', path: '/audit', title: 'Audit Log', g: 'Governance', roles: AUD, list: list('/api/audit/logs', 'Audit trail') },
]
