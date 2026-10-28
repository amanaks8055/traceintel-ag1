import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errMsg } from './api'
import { PAGES } from './config'

const humanize = (value) => String(value).replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase())
const GOOD = ['ACCEPTED', 'APPROVED', 'OK', 'ACTIVE', 'TRUE']
const BAD = ['BLOCKED', 'REJECTED', 'ON_HOLD', 'FALSE']
const WARN = ['REQUESTED', 'PENDING']
export function Badge({ value }) {
  const text = String(value).toUpperCase()
  const type = GOOD.includes(text) ? 'good' : BAD.includes(text) ? 'bad' : WARN.includes(text) ? 'warn' : ''
  return type ? <span className={`badge ${type}`}>{text}</span> : <>{String(value)}</>
}
const label = (value) => value.name || value.code || value.username || value.lotNumber || value.batchNumber || value.shipmentNumber || value.partNumber || value.id
function Table({ rows, actions = [], del, reload, setMessage }) {
  const columns = useMemo(() => [...new Set(rows.slice(0, 20).flatMap((row) => Object.keys(row)))], [rows])
  async function run(action, row) {
    try {
      let body = action.body
      if (action.notes) { const notes = window.prompt(`${action.label}: add a note`); if (notes === null) return; body = { ...body, notes } }
      else if (!window.confirm(`${action.label} this record?`)) return
      const response = await api[action.method](typeof action.url === 'function' ? action.url(row) : action.url, body)
      if (action.view) setMessage?.({ ok: true, text: JSON.stringify(response.data, null, 2) })
      else { setMessage?.({ ok: true, text: `${action.label} completed.` }); reload?.() }
    } catch (error) { setMessage?.({ text: errMsg(error) }) }
  }
  const allActions = [...actions, ...(del ? [{ label: 'Delete', method: 'delete', url: del }] : [])]
  return <div className="scroll"><table><thead><tr>{columns.map((column) => <th key={column}>{humanize(column)}</th>)}{allActions.length > 0 && <th>Actions</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? index}>{columns.map((column) => <td key={column}>{Array.isArray(row[column]) ? `${row[column].length} items` : row[column] && typeof row[column] === 'object' ? String(label(row[column])) : row[column] == null ? '-' : <Badge value={row[column]} />}</td>)}{allActions.length > 0 && <td className="acts">{allActions.filter((action) => !action.show || action.show(row)).map((action) => <button key={action.label} className="btn sm" onClick={() => run(action, row)}>{action.label}</button>)}</td>}</tr>)}</tbody></table></div>
}
function ListBlock({ config, deleteUrl, tick, setMessage }) {
  const [rows, setRows] = useState(null); const [error, setError] = useState(''); const [query, setQuery] = useState(''); const [parameter, setParameter] = useState(''); const [refresh, setRefresh] = useState(0); const [refreshed, setRefreshed] = useState(null)
  const url = config.parameter ? config.url.replace(`{${config.parameter}}`, parameter) : config.url
  const load = useCallback(async () => { if (config.parameter && !parameter) return; setError(''); setRows(null); try { const response = await api.get(url); const data = response.data; setRows(Array.isArray(data) ? data : data.content || data.items || data.records || []); setRefreshed(new Date()) } catch (requestError) { setError(errMsg(requestError)) } }, [url, parameter, config.parameter])
  useEffect(() => { load() }, [load, refresh, tick])
  const shown = rows ? rows.filter((row) => !query || JSON.stringify(row).toLowerCase().includes(query.toLowerCase())) : []
  return <section className="card"><div className="row"><h2>{config.title}</h2>{config.parameter && <label className="inline">{humanize(config.parameter)}<input type="number" value={parameter} onChange={(event) => setParameter(event.target.value)} /></label>}<input className="search" type="search" aria-label="Search rows" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} /><button className="btn sm" onClick={() => setRefresh(refresh + 1)}>Refresh</button></div>{refreshed && <p className="mute">Last refreshed {refreshed.toLocaleTimeString()}</p>}{config.parameter && !parameter && <p className="mute">Enter a {humanize(config.parameter)} to load this list.</p>}{error && <div className="alert bad" role="alert">{error} <button className="btn sm" onClick={() => setRefresh(refresh + 1)}>Retry</button></div>}{!error && rows === null && !(config.parameter && !parameter) && <div className="skel" aria-busy="true" />}{rows && !shown.length && <p className="empty">No records found.</p>}{rows?.length > 0 && <Table rows={shown} actions={config.actions} del={deleteUrl || config.deleteUrl} reload={() => setRefresh(refresh + 1)} setMessage={setMessage} />}</section>
}
function FormBlock({ config, done }) {
  const [values, setValues] = useState({}); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(null); const [result, setResult] = useState(null)
  const set = (name, value) => setValues((current) => ({ ...current, [name]: value }))
  async function submit(event) {
    event.preventDefault(); setMessage(null); setResult(null); if (config.confirm && !window.confirm(`${config.title}?`)) return
    let body = {}; config.fields.forEach((field) => { const value = values[field.name]; if (field.type === 'checkbox') body[field.name] = Boolean(value); else if (value !== undefined && value !== '') body[field.name] = field.type === 'number' ? Number(value) : value })
    const url = config.url.replace(/\{(\w+)\}/g, (_, key) => { const value = body[key]; delete body[key]; return value })
    if (config.fields.some((field) => field.type === 'file')) { const formData = new FormData(); formData.append('file', values.file); body = formData }
    setBusy(true)
    try { const response = await api[config.method](url, body); setResult(response.data); setMessage({ ok: true, text: 'Saved.' }); done?.() } catch (error) { setMessage({ text: errMsg(error) }) } finally { setBusy(false) }
  }
  return <section className="card"><h2>{config.title}</h2><form onSubmit={submit} className="form">{config.fields.map((field) => <label key={field.name} className={field.type === 'checkbox' ? 'chk' : ''}>{field.label}{field.type === 'select' ? <select required value={values[field.name] || ''} onChange={(event) => set(field.name, event.target.value)}><option value="">Select</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : field.type === 'file' ? <input type="file" accept=".csv" required onChange={(event) => set('file', event.target.files[0])} /> : field.type === 'checkbox' ? <input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => set(field.name, event.target.checked)} /> : <input className={field.large ? 'big-in' : ''} type={field.type} step="any" required={!field.optional} minLength={field.min} maxLength={field.max} pattern={field.pattern} value={values[field.name] ?? ''} onChange={(event) => set(field.name, event.target.value)} />}</label>)}<button className="btn pri" disabled={busy}>{busy ? 'Working...' : config.title}</button></form>{message && <div className={`alert ${message.ok ? 'good' : 'bad'}`} role="alert">{message.text}</div>}{result && <div className="result">{result.result && <div className={`verdict ${result.result === 'ACCEPTED' ? 'good' : 'bad'}`}>{result.result}</div>}<Value value={Object.fromEntries(Object.entries(result).filter(([key]) => key !== 'result'))} /></div>}</section>
}
function Value({ value }) {
  if (value == null || value === '') return <span>-</span>
  if (Array.isArray(value)) return value.length ? typeof value[0] !== 'object' ? <span className="chips">{value.map((item, index) => <b key={index}>{String(item)}</b>)}</span> : <Table rows={value} /> : <span>None</span>
  if (typeof value === 'object') return <dl>{Object.entries(value).map(([key, item]) => <div key={key}><dt>{humanize(key)}</dt><dd><Value value={item} /></dd></div>)}</dl>
  return <Badge value={value} />
}
function Dashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  const load = useCallback(async () => { try { const responses = await Promise.all(['stats', 'scan-activity', 'recent-scans'].map((path) => api.get(`/api/dashboard/${path}`))); setData({ stats: responses[0].data, activity: responses[1].data, recent: responses[2].data }); setError('') } catch (requestError) { setError(errMsg(requestError)) } }, [])
  useEffect(() => { load() }, [load])
  return <>{error && <div className="alert bad" role="alert">{error} <button className="btn sm" onClick={load}>Retry</button></div>}{!data && !error && <div className="skel" aria-busy="true" />}{data && <><div className="kpis">{Object.entries(data.stats).filter(([, value]) => typeof value === 'number').map(([key, value]) => <div key={key} className="card kpi"><b>{value}</b><span>{humanize(key)}</span></div>)}</div><section className="card"><h2>Scan activity, last 7 days</h2><div className="bars">{(data.activity || []).map((day) => <div className="col" key={day.date}><strong>{day.accepted}</strong><i style={{ height: `${Math.max(4, day.accepted * 2)}px` }} /><small>{String(day.date).slice(-5)}</small><small>{day.blocked} blocked</small></div>)}</div></section><section className="card"><h2>Recent scans</h2>{data.recent?.length ? <Table rows={data.recent} /> : <p className="empty">No scans yet.</p>}</section></>}</>
}
function QrCode() {
  const [serial, setSerial] = useState(''); const [image, setImage] = useState(''); const [error, setError] = useState('')
  async function generate(event) {
    event.preventDefault(); setError(''); setImage('')
    try { const response = await api.get(`/api/qr/${encodeURIComponent(serial.trim())}`, { responseType: 'blob' }); setImage(URL.createObjectURL(response.data)) } catch (requestError) { setError(errMsg(requestError)) }
  }
  return <section className="card"><h2>Generate serial QR code</h2><p className="mute">Enter an existing serial number to create a printable QR image.</p><form className="form" onSubmit={generate}><label>Serial number<input required value={serial} onChange={(event) => setSerial(event.target.value)} placeholder="MTH-DH-001-00042" /></label><button className="btn pri">Generate QR</button></form>{error && <div className="alert bad">{error}</div>}{image && <div className="qr-result"><img src={image} alt={`QR code for ${serial}`} /><a className="btn" href={image} download={`${serial}.png`}>Download PNG</a></div>}</section>
}
export default function Page({ cfg }) {
  const [tick, setTick] = useState(0); const [message, setMessage] = useState(null)
  if (cfg.dash) return <Dashboard />
  if (cfg.qr) return <QrCode />
  if (cfg.tiles) return <div className="tiles">{PAGES.filter((page) => page.g === 'Administration' && page.id !== 'admin').map((page) => <Link key={page.id} to={page.path} className="card tile"><h2>{page.title}</h2><span className="mute">{page.path}</span></Link>)}</div>
  return <>{cfg.note && <div className="alert info">{cfg.note}</div>}{message && <div className={`alert ${message.ok ? 'good' : 'bad'}`} role="alert">{message.text}</div>}{(cfg.forms || []).map((form) => <FormBlock key={form.title} config={form} done={() => setTick((value) => value + 1)} />)}{cfg.list && <ListBlock config={cfg.list} deleteUrl={cfg.deleteUrl} tick={tick} setMessage={setMessage} />}</>
}
