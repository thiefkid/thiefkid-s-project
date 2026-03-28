import { useState } from 'react';

export default function PackingCategory({ category, checked, onToggle }) {
  const [open, setOpen] = useState(true);
  const checkedCount = category.items.filter((i) => checked.has(i.id)).length;
  const allDone = checkedCount === category.items.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-800">{category.category}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            allDone
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {checkedCount}/{category.items.length}
          </span>
        </div>
        <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {category.items.map((item) => {
            const isChecked = checked.has(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(item.id)}
                  className="w-4 h-4 rounded accent-blue-500 flex-shrink-0"
                />
                <span className={`text-sm ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
