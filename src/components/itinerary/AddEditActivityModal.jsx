import { useState, useEffect } from 'react';

const TYPE_OPTIONS = [
  { value: 'activity', label: '🥾 Activity' },
  { value: 'food',     label: '🍽️ Food & Drink' },
  { value: 'tour',     label: '🎟️ Tour' },
  { value: 'transport',label: '🚗 Transport' },
  { value: 'free',     label: '☀️ Free time' },
];

const EMPTY_FORM = {
  name: '',
  type: 'activity',
  time: '',
  duration: '',
  address: '',
  notes: '',
};

function activityToForm(activity) {
  return {
    name:     activity.name     ?? '',
    type:     activity.type     ?? 'activity',
    time:     activity.time     ? activity.time.slice(0, 16) : '', // datetime-local needs YYYY-MM-DDTHH:MM
    duration: activity.duration ?? '',
    address:  activity.address  ?? '',
    notes:    activity.notes    ?? '',
  };
}

/**
 * Add / Edit activity modal.
 *
 * Props:
 *   existing  — Activity object when editing, null when adding
 *   dayDate   — ISO date string of the day (used to pre-fill time input)
 *   onSave(activity) — called with the new/updated activity object
 *   onClose() — called to dismiss without saving
 */
export default function AddEditActivityModal({ existing, dayDate, onSave, onClose }) {
  const isEdit = existing != null;
  const [form, setForm] = useState(isEdit ? activityToForm(existing) : { ...EMPTY_FORM, time: dayDate ? `${dayDate}T` : '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Trap focus inside modal on mount
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const activity = {
        id:       isEdit ? existing.id : `user-${Date.now()}`,
        name:     form.name.trim(),
        type:     form.type,
        time:     form.time     || null,
        duration: form.duration.trim() || null,
        address:  form.address.trim()  || null,
        notes:    form.notes.trim()    || null,
        lat:      isEdit ? (existing.lat ?? null) : null,
        lng:      isEdit ? (existing.lng ?? null) : null,
      };
      await onSave(activity);
      onClose();
    } catch (err) {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {isEdit ? 'Edit activity' : 'Add activity'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Harbour Bridge walk"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Time + Duration */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Time (optional)</label>
              <input
                type="datetime-local"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration (optional)</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
                placeholder="e.g. 2h"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Address (optional)</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="e.g. 1 Macquarie St, Sydney NSW 2000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Booking reference, tips, opening hours…"
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
