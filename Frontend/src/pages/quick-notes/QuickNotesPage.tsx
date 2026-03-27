import { useEffect, useState } from 'react'

import { getApiErrorMessage } from '../../api/client'
import { createQuickNote, deleteQuickNote, listQuickNotes, updateQuickNote } from '../../api/quickNotes'
import styles from './QuickNotesPage.module.css'

type Note = {
  id: number
  title: string
  is_favorite: boolean
}

export function QuickNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await listQuickNotes()
      setNotes(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Khong tai duoc quick notes'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onSave() {
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await updateQuickNote(editingId, { title })
      } else {
        await createQuickNote({ title, is_favorite: false })
      }
      setEditingId(null)
      setTitle('')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Khong luu duoc quick note'))
    } finally {
      setSaving(false)
    }
  }

  function onEdit(note: Note) {
    setEditingId(note.id)
    setTitle(note.title)
  }

  async function onDelete(id: number) {
    if (!window.confirm('Ban co chac muon xoa quick note nay khong?')) return
    setError('')
    try {
      await deleteQuickNote(id)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Khong xoa duoc quick note'))
    }
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Quick Notes</h2>
      <p className={styles.sub}>Ghi chu mau de chen nhanh vao description khi tao transaction.</p>

      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="Quick note..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className={styles.actions}>
          <button className={styles.primary} type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Dang luu...' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId ? (
            <button
              className={styles.secondary}
              type="button"
              onClick={() => {
                setEditingId(null)
                setTitle('')
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}
      {loading ? <p className={styles.sub}>Dang tai...</p> : null}

      <div className={styles.list}>
        {notes.map((n) => (
          <div key={n.id} className={styles.item}>
            <div className={styles.itemTop}>
              <strong>{n.title || '(Khong tieu de)'}</strong>
              <div className={styles.rowActions}>
                <button className={styles.small} type="button" onClick={() => onEdit(n)}>
                  Sua
                </button>
                <button className={styles.smallDanger} type="button" onClick={() => onDelete(n.id)}>
                  Xoa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

