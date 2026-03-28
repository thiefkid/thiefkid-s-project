import { PACKING_LIST } from '../../data/tripData.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import PackingCategory from './PackingCategory.jsx';

const ALL_IDS = PACKING_LIST.flatMap((c) => c.items.map((i) => i.id));
const TOTAL = ALL_IDS.length;

export default function PackingView() {
  const [checked, setChecked] = useLocalStorage('syd-tas-packing', new Set());

  const toggle = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const checkAll = () => setChecked(new Set(ALL_IDS));
  const clearAll = () => setChecked(new Set());

  const progress = Math.round((checked.size / TOTAL) * 100);

  return (
    <div className="pt-4 space-y-3">
      {/* Progress bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Packing progress</span>
          <span className="text-sm font-bold text-blue-600">{checked.size} / {TOTAL}</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-xs text-green-600 font-medium mt-2">All packed! Have a great trip!</p>
        )}
        <div className="flex gap-2 mt-3">
          <button
            onClick={checkAll}
            className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium"
          >
            Check all
          </button>
          <button
            onClick={clearAll}
            className="text-xs px-3 py-1 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors font-medium"
          >
            Clear all
          </button>
        </div>
      </div>

      {PACKING_LIST.map((cat) => (
        <PackingCategory
          key={cat.id}
          category={cat}
          checked={checked}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}
