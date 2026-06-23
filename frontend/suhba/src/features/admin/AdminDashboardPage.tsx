import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@components/Modal'
import { CaretRight, Check, X, PencilSimple, Trash } from '@phosphor-icons/react'
import {
  adminService,
  type PendingSpot,
  type PendingHalal,
  type PendingEvent,
  type ApprovalStatus,
} from '@services/adminService'

type Tab = 'spots' | 'halal' | 'events'
type StatusFilter = 'ALL' | ApprovalStatus
type DateFilter = 'ALL' | 'UPCOMING' | 'PAST'

type SelectedItem =
  | { kind: 'spot';  data: PendingSpot }
  | { kind: 'halal'; data: PendingHalal }
  | { kind: 'event'; data: PendingEvent }

interface AdminDashboardPageProps {
  username: string
  onLogout: () => void
}

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

const STATUS_CLASS: Record<ApprovalStatus, string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export function AdminDashboardPage({ username, onLogout }: AdminDashboardPageProps): JSX.Element {
  const [activeTab, setActiveTab]   = useState<Tab>('spots')
  const [spots,  setSpots]  = useState<PendingSpot[]>([])
  const [halal,  setHalal]  = useState<PendingHalal[]>([])
  const [events, setEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [selected,  setSelected]  = useState<SelectedItem | null>(null)
  const [editMode,  setEditMode]  = useState(false)
  const [editData,  setEditData]  = useState<Record<string, unknown>>({})
  const [acting,    setActing]    = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [dateFilter,   setDateFilter]   = useState<DateFilter>('ALL')

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const [s, h, e] = await Promise.all([
        adminService.allPrayerSpots(),
        adminService.allHalalSpots(),
        adminService.allEvents(),
      ])
      setSpots(s); setHalal(h); setEvents(e)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401 || status === 403) {
        setError('Session expired or not authorised. Please sign in again.')
      } else if (status !== undefined) {
        setError(`Failed to load listings (HTTP ${status}).`)
      } else {
        // No status → request never completed: network error or blocked CORS response.
        setError('Failed to load listings — could not reach the server (network or CORS).')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  async function handleLogout(): Promise<void> {
    try { await adminService.logout() } finally { onLogout() }
  }

  async function handleAction(action: 'approve' | 'reject'): Promise<void> {
    if (selected === null) return
    setActing(true)
    setError(null)
    try {
      if (selected.kind === 'spot') {
        const updated = action === 'approve'
          ? await adminService.approvePrayerSpot(selected.data.id)
          : await adminService.rejectPrayerSpot(selected.data.id)
        setSpots(prev => prev.map(s => s.id === updated.id ? updated : s))
      } else if (selected.kind === 'halal') {
        const updated = action === 'approve'
          ? await adminService.approveHalalSpot(selected.data.id)
          : await adminService.rejectHalalSpot(selected.data.id)
        setHalal(prev => prev.map(h => h.id === updated.id ? updated : h))
      } else {
        const updated = action === 'approve'
          ? await adminService.approveEvent(selected.data.id)
          : await adminService.rejectEvent(selected.data.id)
        setEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev))
      }
      setSelected(null)
    } catch {
      setError('Action failed. Please try again.')
    } finally {
      setActing(false)
    }
  }

  async function handleSave(): Promise<void> {
    if (selected === null) return
    setActing(true)
    setError(null)
    try {
      if (selected.kind === 'spot') {
        const updated = await adminService.updatePrayerSpot(selected.data.id, editData as Partial<PendingSpot>)
        setSpots(prev => prev.map(s => s.id === updated.id ? updated : s))
        setSelected({ kind: 'spot', data: updated })
      } else if (selected.kind === 'halal') {
        const updated = await adminService.updateHalalSpot(selected.data.id, editData as Partial<PendingHalal>)
        setHalal(prev => prev.map(h => h.id === updated.id ? updated : h))
        setSelected({ kind: 'halal', data: updated })
      } else {
        const updated = await adminService.updateEvent(selected.data.id, editData as Partial<PendingEvent>)
        setEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev))
        setSelected({ kind: 'event', data: updated })
      }
      setEditMode(false)
    } catch {
      setError('Save failed. Please try again.')
    } finally {
      setActing(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (selected === null) return
    setActing(true)
    setError(null)
    try {
      if (selected.kind === 'spot') {
        await adminService.deletePrayerSpot(selected.data.id)
        setSpots(prev => prev.filter(s => s.id !== selected.data.id))
      } else if (selected.kind === 'halal') {
        await adminService.deleteHalalSpot(selected.data.id)
        setHalal(prev => prev.filter(h => h.id !== selected.data.id))
      } else {
        await adminService.deleteEvent(selected.data.id)
        setEvents(prev => prev.filter(ev => ev.id !== selected.data.id))
      }
      setSelected(null)
      setConfirmDelete(false)
    } catch {
      setError('Delete failed. Please try again.')
    } finally {
      setActing(false)
    }
  }

  function openEdit(): void {
    if (selected === null) return
    setEditData(selected.kind === 'event'
      ? { ...selected.data }
      : { ...selected.data })
    setEditMode(true)
  }

  const pendingCount = spots.filter(s => s.status === 'PENDING').length
    + halal.filter(h => h.status === 'PENDING').length
    + events.filter(e => e.status === 'PENDING').length

  const now = new Date()

  function applyStatusFilter<T extends { status: ApprovalStatus }>(items: T[]): T[] {
    if (statusFilter === 'ALL') return items
    return items.filter(i => i.status === statusFilter)
  }

  function applyDateFilter(items: PendingEvent[]): PendingEvent[] {
    if (dateFilter === 'ALL') return items
    if (dateFilter === 'UPCOMING') return items.filter(e => new Date(e.startTime) >= now)
    return items.filter(e => new Date(e.startTime) < now)
  }

  const visibleSpots  = applyStatusFilter(spots)
  const visibleHalal  = applyStatusFilter(halal)
  const visibleEvents = applyDateFilter(applyStatusFilter(events))

  const totalCount = visibleSpots.length + visibleHalal.length + visibleEvents.length

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'spots',  label: 'Gebetsorte', count: visibleSpots.length  },
    { id: 'halal',  label: 'Halal',      count: visibleHalal.length  },
    { id: 'events', label: 'Events',     count: visibleEvents.length },
  ]

  const modalTitle = selected === null ? '' :
    selected.kind === 'event' ? selected.data.title : selected.data.name

  return (
    <div className="min-h-dvh bg-cream-bg">
      <header className="bg-primary text-white px-4 h-14 flex items-center justify-between shrink-0">
        <span className="font-bold text-base tracking-tight">Suhba admin</span>
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm">{username}</span>
          <button
            onClick={() => void handleLogout()}
            className="text-sm border border-white/20 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={['px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                    statusFilter === s
                      ? s === 'APPROVED' ? 'bg-green-600 text-white border-green-600'
                      : s === 'PENDING'  ? 'bg-amber-500 text-white border-amber-500'
                      : s === 'REJECTED' ? 'bg-red-600 text-white border-red-600'
                      : 'bg-primary text-white border-primary'
                      : 'bg-cream-card text-text-muted border-divider hover:border-sage-light',
                  ].join(' ')}
                >
                  {s === 'ALL' ? 'Alle' : s === 'APPROVED' ? 'Freigegeben' : s === 'PENDING' ? `Ausstehend${pendingCount > 0 ? ` (${pendingCount})` : ''}` : 'Abgelehnt'}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-text-muted">
              {loading ? 'Laden…' : `${totalCount} Einträge`}
            </span>
          </div>

          {/* Date filter — events tab only */}
          {activeTab === 'events' && (
            <div className="flex gap-1.5">
              {(['ALL', 'UPCOMING', 'PAST'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDateFilter(d)}
                  className={['px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                    dateFilter === d
                      ? 'bg-primary text-white border-primary'
                      : 'bg-cream-card text-text-muted border-divider hover:border-sage-light',
                  ].join(' ')}
                >
                  {d === 'ALL' ? 'Alle Termine' : d === 'UPCOMING' ? 'Bevorstehend' : 'Vergangen'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        {!loading && (
          <p className="text-xs text-text-muted mb-4 bg-cream-card border border-divider rounded-lg px-3 py-2 leading-relaxed">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5" />
            <strong>Freigegeben</strong> — in der App sichtbar.{' '}
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5 ml-2" />
            <strong>Ausstehend</strong> — wartet auf Prüfung.
            {activeTab === 'events' && (
              <span> · Events-Tab zeigt nur <strong>zukünftige</strong> freigegebene Events.</span>
            )}
          </p>
        )}

        {error !== null && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-3.5 py-1.5 rounded-pill text-sm font-semibold border transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-cream-card text-text-muted border-divider hover:border-sage-light',
              ].join(' ')}
            >
              {tab.label}
              <span className={['ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                activeTab === tab.id ? 'bg-white/20' : 'bg-sage-tint text-moss',
              ].join(' ')}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lists */}
        {!loading && activeTab === 'spots' && (
          <ItemList
            items={visibleSpots}
            emptyMessage="Keine Gebetsorte gefunden."
            renderRow={s => (
              <ItemRow
                key={s.id}
                title={s.name}
                badge={s.type}
                sub={`${s.address}, ${s.district}`}
                status={s.status}
                onClick={() => { setSelected({ kind: 'spot', data: s }); setEditMode(false); setConfirmDelete(false) }}
              />
            )}
          />
        )}
        {!loading && activeTab === 'halal' && (
          <ItemList
            items={visibleHalal}
            emptyMessage="Keine Halal-Einträge gefunden."
            renderRow={h => (
              <ItemRow
                key={h.id}
                title={h.name}
                badge={h.category}
                sub={`${h.address}, ${h.district}`}
                status={h.status}
                onClick={() => { setSelected({ kind: 'halal', data: h }); setEditMode(false); setConfirmDelete(false) }}
              />
            )}
          />
        )}
        {!loading && activeTab === 'events' && (
          <ItemList
            items={visibleEvents}
            emptyMessage="Keine Events gefunden."
            renderRow={e => (
              <ItemRow
                key={e.id}
                title={e.title}
                badge={e.category}
                sub={`${e.address}, ${e.district} · ${new Date(e.startTime).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                status={e.status}
                isPast={new Date(e.startTime) < new Date()}
                onClick={() => { setSelected({ kind: 'event', data: e }); setEditMode(false); setConfirmDelete(false) }}
              />
            )}
          />
        )}
      </main>

      {selected !== null && (
        <Modal
          title={editMode ? `Edit: ${modalTitle}` : modalTitle}
          onClose={() => { setSelected(null); setEditMode(false); setConfirmDelete(false) }}
        >
          <div className="px-4 py-4 flex flex-col gap-4">
            {editMode ? (
              <EditForm
                kind={selected.kind}
                data={editData}
                onChange={setEditData}
              />
            ) : (
              <>
                {selected.kind === 'spot'  && <SpotDetail  data={selected.data} />}
                {selected.kind === 'halal' && <HalalDetail data={selected.data} />}
                {selected.kind === 'event' && <EventDetail data={selected.data} />}
              </>
            )}

            {/* Action row */}
            {editMode ? (
              <div className="flex gap-2 pt-2 border-t border-divider">
                <button
                  onClick={() => void handleSave()}
                  disabled={acting}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40"
                >
                  Save changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  disabled={acting}
                  className="flex-1 py-2.5 bg-cream-card border border-divider text-text-muted rounded-lg text-sm font-semibold hover:bg-sage-tint disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            ) : confirmDelete ? (
              <div className="pt-2 border-t border-divider space-y-2">
                <p className="text-sm text-red-600 font-medium">Delete this listing permanently?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleDelete()}
                    disabled={acting}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-40"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={acting}
                    className="flex-1 py-2.5 bg-cream-card border border-divider text-text-muted rounded-lg text-sm font-semibold hover:bg-sage-tint disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-divider">
                {selected.data.status !== 'APPROVED' && (
                  <button
                    onClick={() => void handleAction('approve')}
                    disabled={acting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40"
                  >
                    <Check size={15} weight="bold" />
                    Approve
                  </button>
                )}
                {selected.data.status !== 'REJECTED' && (
                  <button
                    onClick={() => void handleAction('reject')}
                    disabled={acting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-transparent text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-40"
                  >
                    <X size={15} weight="bold" />
                    Reject
                  </button>
                )}
                <button
                  onClick={openEdit}
                  disabled={acting}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-cream-card border border-divider text-text-muted rounded-lg text-sm font-semibold hover:bg-sage-tint disabled:opacity-40"
                >
                  <PencilSimple size={15} />
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={acting}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-cream-card border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-40"
                >
                  <Trash size={15} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── List wrapper ──────────────────────────────────────────────────────────────

interface ItemListProps<T> {
  items: T[]
  renderRow: (item: T) => JSX.Element
  emptyMessage: string
}

function ItemList<T>({ items, renderRow, emptyMessage }: ItemListProps<T>): JSX.Element {
  if (items.length === 0) {
    return <p className="text-text-muted text-sm text-center py-10">{emptyMessage}</p>
  }
  return <div className="flex flex-col gap-2">{items.map(renderRow)}</div>
}

// ── Clickable row ─────────────────────────────────────────────────────────────

interface ItemRowProps {
  title: string
  badge: string
  sub: string
  status: ApprovalStatus
  isPast?: boolean
  onClick: () => void
}

function ItemRow({ title, badge, sub, status, isPast, onClick }: ItemRowProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={['w-full text-left border rounded-card px-4 py-3.5 flex items-center gap-3 hover:border-sage-light transition-colors group',
        isPast ? 'bg-cream-bg border-divider opacity-70' : 'bg-cream-card border-divider hover:bg-sage-tint/30',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-semibold text-text-dark text-sm truncate">{title}</span>
          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 bg-sage-tint text-moss rounded-full uppercase tracking-wide">
            {badge}
          </span>
          <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_CLASS[status]}`}>
            {STATUS_LABEL[status]}
          </span>
          {isPast === true && (
            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Vergangen
            </span>
          )}
        </div>
        <p className="text-text-muted text-xs truncate">{sub}</p>
      </div>
      <CaretRight size={14} className="text-text-muted shrink-0 group-hover:text-primary transition-colors" />
    </button>
  )
}

// ── Detail read-only views ────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string | null | undefined }): JSX.Element | null {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-text-dark text-sm">{value}</p>
    </div>
  )
}

function BoolRow({ label, value }: { label: string; value: boolean | null | undefined }): JSX.Element | null {
  if (value === null || value === undefined) return null
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center ${value ? 'bg-moss' : 'bg-divider'}`}>
        {value && <Check size={9} weight="bold" className="text-white" />}
      </span>
      <span className="text-text-dark text-sm">{label}</span>
    </div>
  )
}

function SpotDetail({ data }: { data: PendingSpot }): JSX.Element {
  return (
    <>
      <Row label="Status"       value={STATUS_LABEL[data.status]} />
      <Row label="Address"      value={`${data.address}, ${data.district}`} />
      <Row label="Type"         value={data.type} />
      <Row label="Description"  value={data.description} />
      <Row label="Juma time"    value={data.jumaTime} />
      <Row label="Hours"        value={data.openingHours} />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <BoolRow label="Wudu"          value={data.wuduAvailable} />
        <BoolRow label="Sisters area"  value={data.sistanAvailable} />
        <BoolRow label="Friday prayer" value={data.fridayPrayer} />
        <BoolRow label="Parking"       value={data.parking} />
      </div>
      <Row label="Coordinates" value={`${data.latitude}, ${data.longitude}`} />
    </>
  )
}

function HalalDetail({ data }: { data: PendingHalal }): JSX.Element {
  return (
    <>
      <Row label="Status"       value={STATUS_LABEL[data.status]} />
      <Row label="Address"      value={`${data.address}, ${data.district}`} />
      <Row label="Category"     value={data.category} />
      <Row label="Description"  value={data.description} />
      <Row label="Certified"    value={data.certified === true ? `Yes${data.certificationBody ? ` — ${data.certificationBody}` : ''}` : data.certified === false ? 'No' : undefined} />
      <Row label="Cuisines"     value={data.cuisines?.join(', ')} />
      <Row label="Rating"       value={data.rating !== null && data.rating !== undefined ? String(data.rating) : undefined} />
      <Row label="Phone"        value={data.phone} />
      <Row label="Website"      value={data.website} />
      <Row label="Hours"        value={data.openingHours} />
      <BoolRow label="Featured" value={data.featured} />
      <Row label="Coordinates"  value={`${data.latitude}, ${data.longitude}`} />
    </>
  )
}

function EventDetail({ data }: { data: PendingEvent }): JSX.Element {
  const fmt = (iso: string): string =>
    new Date(iso).toLocaleString('de-AT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  return (
    <>
      <Row label="Status"      value={STATUS_LABEL[data.status]} />
      <Row label="Address"     value={`${data.address}, ${data.district}`} />
      <Row label="Category"    value={data.category} />
      <Row label="Start"       value={fmt(data.startTime)} />
      <Row label="End"         value={data.endTime !== null && data.endTime !== undefined ? fmt(data.endTime) : undefined} />
      <Row label="Organizer"   value={data.organizer} />
      <Row label="Contact"     value={data.contactInfo} />
      <Row label="Entry"       value={data.isFree === true ? 'Free' : data.isFree === false ? 'Paid' : undefined} />
      <Row label="Description" value={data.description} />
    </>
  )
}

// ── Edit form ─────────────────────────────────────────────────────────────────

const INPUT = 'w-full bg-cream-bg border border-divider rounded-lg px-3 py-2 text-sm text-text-dark outline-none focus:border-sage-light'
const SELECT = 'w-full bg-cream-bg border border-divider rounded-lg px-3 py-2 text-sm text-text-dark outline-none focus:border-sage-light'
const LABEL = 'block text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1'

interface EditFormProps {
  kind: 'spot' | 'halal' | 'event'
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

function EditForm({ kind, data, onChange }: EditFormProps): JSX.Element {
  const set = (key: string, value: unknown): void => onChange({ ...data, [key]: value || null })
  const str = (key: string): string => (data[key] as string | null | undefined) ?? ''
  const bool = (key: string): boolean => !!(data[key] as boolean | null | undefined)

  if (kind === 'spot') {
    return (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        <Field label="Status">
          <select className={SELECT} value={str('status')} onChange={e => set('status', e.target.value)}>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </Field>
        <Field label="Name"><input className={INPUT} value={str('name')} onChange={e => set('name', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Address"><input className={INPUT} value={str('address')} onChange={e => set('address', e.target.value)} /></Field>
          <Field label="District"><input className={INPUT} value={str('district')} onChange={e => set('district', e.target.value)} /></Field>
        </div>
        <Field label="Type">
          <select className={SELECT} value={str('type')} onChange={e => set('type', e.target.value)}>
            <option value="MOSQUE">Mosque</option>
            <option value="MUSALLA">Musalla</option>
            <option value="PUBLIC">Public</option>
            <option value="OFFICE">Office</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Opening hours"><input className={INPUT} value={str('openingHours')} onChange={e => set('openingHours', e.target.value)} /></Field>
        <Field label="Juma time"><input className={INPUT} value={str('jumaTime')} onChange={e => set('jumaTime', e.target.value)} /></Field>
        <Field label="Description"><input className={INPUT} value={str('description')} onChange={e => set('description', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude"><input type="number" step="any" className={INPUT} value={str('latitude')} onChange={e => set('latitude', Number(e.target.value))} /></Field>
          <Field label="Longitude"><input type="number" step="any" className={INPUT} value={str('longitude')} onChange={e => set('longitude', Number(e.target.value))} /></Field>
        </div>
        <div className="flex flex-wrap gap-4">
          <CheckField label="Wudu" value={bool('wuduAvailable')} onChange={v => set('wuduAvailable', v)} />
          <CheckField label="Sisters area" value={bool('sistanAvailable')} onChange={v => set('sistanAvailable', v)} />
          <CheckField label="Friday prayer" value={bool('fridayPrayer')} onChange={v => set('fridayPrayer', v)} />
          <CheckField label="Parking" value={bool('parking')} onChange={v => set('parking', v)} />
          <CheckField label="Verified" value={bool('verified')} onChange={v => set('verified', v)} />
        </div>
      </div>
    )
  }

  if (kind === 'halal') {
    return (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        <Field label="Status">
          <select className={SELECT} value={str('status')} onChange={e => set('status', e.target.value)}>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </Field>
        <Field label="Name"><input className={INPUT} value={str('name')} onChange={e => set('name', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Address"><input className={INPUT} value={str('address')} onChange={e => set('address', e.target.value)} /></Field>
          <Field label="District"><input className={INPUT} value={str('district')} onChange={e => set('district', e.target.value)} /></Field>
        </div>
        <Field label="Category">
          <select className={SELECT} value={str('category')} onChange={e => set('category', e.target.value)}>
            <option value="RESTAURANT">Restaurant</option>
            <option value="GROCERY">Grocery</option>
            <option value="BUTCHER">Butcher</option>
            <option value="CAFE">Café</option>
            <option value="BAKERY">Bakery</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Opening hours"><input className={INPUT} value={str('openingHours')} onChange={e => set('openingHours', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input className={INPUT} value={str('phone')} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Website"><input className={INPUT} value={str('website')} onChange={e => set('website', e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cert. body"><input className={INPUT} value={str('certificationBody')} onChange={e => set('certificationBody', e.target.value)} /></Field>
          <Field label="Rating"><input type="number" step="0.1" min="0" max="5" className={INPUT} value={str('rating')} onChange={e => set('rating', Number(e.target.value))} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude"><input type="number" step="any" className={INPUT} value={str('latitude')} onChange={e => set('latitude', Number(e.target.value))} /></Field>
          <Field label="Longitude"><input type="number" step="any" className={INPUT} value={str('longitude')} onChange={e => set('longitude', Number(e.target.value))} /></Field>
        </div>
        <div className="flex gap-4">
          <CheckField label="Certified" value={bool('certified')} onChange={v => set('certified', v)} />
          <CheckField label="Featured" value={bool('featured')} onChange={v => set('featured', v)} />
        </div>
        <Field label="Description"><input className={INPUT} value={str('description')} onChange={e => set('description', e.target.value)} /></Field>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
      <Field label="Status">
        <select className={SELECT} value={str('status')} onChange={e => set('status', e.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </Field>
      <Field label="Title"><input className={INPUT} value={str('title')} onChange={e => set('title', e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Address"><input className={INPUT} value={str('address')} onChange={e => set('address', e.target.value)} /></Field>
        <Field label="District"><input className={INPUT} value={str('district')} onChange={e => set('district', e.target.value)} /></Field>
      </div>
      <Field label="Category">
        <select className={SELECT} value={str('category')} onChange={e => set('category', e.target.value)}>
          <option value="PRAYER">Prayer</option>
          <option value="LECTURE">Lecture</option>
          <option value="CLASS">Class</option>
          <option value="COMMUNITY">Community</option>
          <option value="YOUTH">Youth</option>
          <option value="SPORT">Sport</option>
          <option value="FUNDRAISER">Fundraiser</option>
          <option value="OTHER">Other</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start time"><input type="datetime-local" className={INPUT} value={str('startTime').slice(0,16)} onChange={e => set('startTime', e.target.value ? `${e.target.value}:00Z` : null)} /></Field>
        <Field label="End time"><input type="datetime-local" className={INPUT} value={str('endTime').slice(0,16)} onChange={e => set('endTime', e.target.value ? `${e.target.value}:00Z` : null)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Organizer"><input className={INPUT} value={str('organizer')} onChange={e => set('organizer', e.target.value)} /></Field>
        <Field label="Contact"><input className={INPUT} value={str('contactInfo')} onChange={e => set('contactInfo', e.target.value)} /></Field>
      </div>
      <Field label="Description"><input className={INPUT} value={str('description')} onChange={e => set('description', e.target.value)} /></Field>
      <CheckField label="Free entry" value={bool('isFree')} onChange={v => set('isFree', v)} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  )
}

interface CheckFieldProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}

function CheckField({ label, value, onChange }: CheckFieldProps): JSX.Element {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-primary"
      />
      <span className="text-sm text-text-dark">{label}</span>
    </label>
  )
}
