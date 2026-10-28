import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'

function PageIntro({ eyebrow, title, description, children }) {
  return <div className="page-content"><p className="eyebrow">{eyebrow}</p><h2 className="page-heading">{title}</h2><p className="muted">{description}</p>{children}</div>
}

function Feedback({ error, message }) {
  return <>{error && <p className="error-message">{error}</p>}{message && <p className="result-message">{message}</p>}</>
}

export function ScanPage() {
  const [form, setForm] = useState({ serialInput: '', batchId: '', station: 'Assembly-A1', manualEntry: false, approvedBy: '' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const response = await apiClient.post('/scan/validate', { ...form, batchId: Number(form.batchId), approvedBy: form.approvedBy ? Number(form.approvedBy) : null })
      setResult(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Scan validation failed.')
    }
  }
  return <PageIntro eyebrow="Production line" title="Scan station" description="Validate a serial before it moves to the next station.">
    <section className="glass-card"><form className="form-grid" onSubmit={submit}><div className="form-field"><label>Serial number</label><input required value={form.serialInput} onChange={(e) => setForm({ ...form, serialInput: e.target.value })} placeholder="MTH-DH-001-00042" /></div><div className="form-field"><label>Batch ID</label><input required type="number" value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} placeholder="3" /></div><div className="form-field"><label>Station</label><input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} /></div><button className="primary-button compact-button">Validate scan</button></form></section>
    <Feedback error={error} />
    {result && <section className="glass-card result-panel"><strong>{result.result}</strong><p>{result.message}</p><p className="muted">{result.partName || 'Unknown part'} · {result.batchNumber} · event {result.scanEventId}</p></section>}
  </PageIntro>
}

export function ForwardTracePage() {
  const [lotId, setLotId] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    try { setData((await apiClient.post('/trace/forward', { lotId: Number(lotId) })).data); setError('') } catch (requestError) { setError(requestError.response?.data?.message || 'Forward trace failed.') }
  }
  return <PageIntro eyebrow="Quality intelligence" title="Forward trace" description="Follow a material lot through batches, shipments, customers, and VINs."><section className="glass-card action-form"><form onSubmit={submit}><label>Material lot ID</label><div className="action-row"><input required type="number" value={lotId} onChange={(e) => setLotId(e.target.value)} placeholder="5" /><button className="primary-button compact-button">Run trace</button></div></form></section><Feedback error={error} />{data && <section className="glass-card result-panel"><strong>{data.lotNumber}</strong><p>{data.affectedParts} affected parts · {data.estimatedVehicles} estimated vehicles · {data.durationMs} ms</p><p>Shipments: {data.shipmentNumbers?.join(', ') || 'None'}</p><p>VINs: {data.vins?.join(', ') || 'None'}</p><p className="muted">Estimated loss: {data.estimatedLoss}</p></section>}</PageIntro>
}

export function BackwardTracePage() {
  const [input, setInput] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    try { setData((await apiClient.post('/trace/backward', { input })).data); setError('') } catch (requestError) { setError(requestError.response?.data?.message || 'Backward trace failed.') }
  }
  return <PageIntro eyebrow="Quality intelligence" title="Backward trace" description="Start from a VIN or serial and identify its batch, lot, and supplier."><section className="glass-card action-form"><form onSubmit={submit}><label>VIN or serial number</label><div className="action-row"><input required value={input} onChange={(e) => setInput(e.target.value)} placeholder="MA3FJEB1S00123456" /><button className="primary-button compact-button">Trace backward</button></div></form></section><Feedback error={error} />{data && <section className="glass-card result-panel"><strong>{data.input}</strong><p>{data.serial || data.vin} → {data.batchNumber} → {data.lotNumber}</p><p>Supplier: {data.supplier} · {data.durationMs} ms</p></section>}</PageIntro>
}

export function HoldsPage() {
  const [form, setForm] = useState({ lotId: '', reason: '' })
  const [holds, setHolds] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  function load() { apiClient.get('/holds').then((response) => setHolds(response.data)).catch(() => setError('Holds could not be loaded.')) }
  useEffect(load, [])
  async function request(event) {
    event.preventDefault()
    try { await apiClient.post('/holds/request', { lotId: Number(form.lotId), reason: form.reason }); setMessage('Hold requested.'); setForm({ lotId: '', reason: '' }); load() } catch (requestError) { setError(requestError.response?.data?.message || 'Hold request failed.') }
  }
  return <PageIntro eyebrow="Quality control" title="Hold management" description="Request and review quality holds using two-person authorization."><section className="glass-card"><form className="form-grid" onSubmit={request}><div className="form-field"><label>Lot ID</label><input required type="number" value={form.lotId} onChange={(e) => setForm({ ...form, lotId: e.target.value })} /></div><div className="form-field"><label>Reason</label><input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Dimension variance detected" /></div><button className="primary-button compact-button">Request hold</button></form></section><Feedback error={error} message={message} /><DataTable columns={['Lot', 'Status', 'Reason', 'Requested']} rows={holds.map((hold) => [hold.lotNumber, hold.status, hold.requestReason, hold.requestedAt])} /></PageIntro>
}

export function ShipmentsPage() {
  const [shipments, setShipments] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { apiClient.get('/shipments').then((response) => setShipments(response.data)).catch(() => setError('Shipments could not be loaded.')) }, [])
  return <PageIntro eyebrow="Outbound logistics" title="Shipments" description="Review customer shipments and production batches included in each dispatch."><Feedback error={error} /><DataTable columns={['Shipment', 'Customer', 'Date', 'Items']} rows={shipments.map((shipment) => [shipment.shipmentNumber, shipment.customerName, shipment.shippedDate, shipment.items?.length || 0])} /></PageIntro>
}

const adminEndpoints = {
  '/admin/parts': ['/admin/parts', ['Part number', 'Name', 'Cost'], (item) => [item.partNumber, item.name, item.costPerPart]],
  '/admin/suppliers': ['/admin/suppliers', ['Code', 'Supplier', 'Contact'], (item) => [item.code, item.name, item.contactEmail]],
  '/admin/machines': ['/admin/machines', ['Code', 'Machine', 'Station'], (item) => [item.code, item.name, item.station]],
  '/admin/customers': ['/admin/customers', ['Code', 'Customer', 'Contact'], (item) => [item.code, item.name, item.contactEmail]],
  '/admin/users': ['/admin/users', ['Username', 'Name', 'Role'], (item) => [item.username, item.fullName, item.role]],
}

export function AdminPage({ section = '/admin/parts' }) {
  const config = adminEndpoints[section] || adminEndpoints['/admin/parts']
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { apiClient.get(config[0]).then((response) => setRows(response.data)).catch(() => setError('Administration data could not be loaded.')) }, [config])
  return <PageIntro eyebrow="Administration" title={section.replace('/admin/', '').replace('-', ' ')} description="Live master data from the TraceIntel backend."><Feedback error={error} /><DataTable columns={config[1]} rows={rows.map(config[2])} /></PageIntro>
}

export function VinImportPage() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (!file) { setError('Choose a CSV file first.'); return }
    const body = new FormData()
    body.append('file', file)
    try { const response = await apiClient.post('/admin/vin/import', body, { headers: { 'Content-Type': 'multipart/form-data' } }); setMessage(`Imported ${response.data.imported}; rejected ${response.data.rejected}.`); setError('') } catch (requestError) { setError(requestError.response?.data?.message || 'VIN import failed.') }
  }
  return <PageIntro eyebrow="Administration" title="VIN import" description="Upload vehicle links from a CSV file."><section className="glass-card upload-card"><form onSubmit={submit}><label htmlFor="vin-file">VIN CSV file</label><input id="vin-file" type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files[0])} /><button className="primary-button compact-button">Import CSV</button></form></section><Feedback error={error} message={message} /></PageIntro>
}

export function AuditPage() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { apiClient.get('/audit/logs').then((response) => setRows(response.data)).catch(() => setError('Audit logs could not be loaded.')) }, [])
  return <PageIntro eyebrow="Governance" title="Audit log" description="Review who changed traceability data and when."><Feedback error={error} /><DataTable columns={['Time', 'User', 'Action', 'Entity']} rows={rows.map((item) => [item.timestamp || '—', item.username, item.action, `${item.entityType} ${item.entityId}`])} /></PageIntro>
}

function DataTable({ columns, rows }) {
  return <section className="glass-card table-card"><div className="data-table"><div className="table-row table-header">{columns.map((column) => <span key={column}>{column}</span>)}</div>{rows.map((row, index) => <div className="table-row" key={`${index}-${row.join('-')}`}>{row.map((cell, cellIndex) => <span key={`${index}-${cellIndex}`}>{cell ?? '—'}</span>)}</div>)}</div></section>
}
