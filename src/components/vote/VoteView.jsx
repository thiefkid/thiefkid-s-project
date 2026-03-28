import { useState, useEffect } from 'react';

const VOTE_OPTIONS = [
  {
    id: 'strip-club-syd',
    emoji: '💃',
    title: 'Strip Club in Sydney',
    description: 'Visit a gentleman\'s club on the evening of May 9 (Saturday night) in Sydney.',
  },
];

const STORAGE_KEY = 'trip-votes';

function loadVotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveVotes(votes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

export default function VoteView() {
  const [votes, setVotes] = useState(loadVotes);
  const [dialog, setDialog] = useState(null); // { title, voted }

  useEffect(() => {
    saveVotes(votes);
  }, [votes]);

  function handleVote(optionId, choice) {
    setVotes((prev) => ({ ...prev, [optionId]: choice }));
    setDialog({ optionId, choice });
  }

  return (
    <div className="pt-4 space-y-4">
      <p className="text-sm text-slate-500">
        Vote on optional activities. Everyone's vote is saved on this device.
      </p>

      {VOTE_OPTIONS.map((opt) => {
        const myVote = votes[opt.id];
        const yesCount = Object.entries(votes).filter(([k, v]) => k === opt.id && v === 'yes').length;
        const noCount  = Object.entries(votes).filter(([k, v]) => k === opt.id && v === 'no').length;

        return (
          <div key={opt.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{opt.emoji}</span>
              <div>
                <h3 className="font-semibold text-slate-800">{opt.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{opt.description}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleVote(opt.id, 'yes')}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  myVote === 'yes'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                👍 Yes {myVote === 'yes' && '✓'}
              </button>
              <button
                onClick={() => handleVote(opt.id, 'no')}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  myVote === 'no'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                👎 No {myVote === 'no' && '✓'}
              </button>
            </div>

            {myVote && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                You voted <span className="font-medium">{myVote === 'yes' ? '👍 Yes' : '👎 No'}</span> — tap again to change
              </p>
            )}
          </div>
        );
      })}

      {/* Thank-you dialog */}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
          onClick={() => setDialog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">{dialog.choice === 'yes' ? '🎉' : '🙅'}</div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Thanks for voting!</h2>
            <p className="text-sm text-slate-500 mb-4">
              You voted <span className="font-semibold">{dialog.choice === 'yes' ? '👍 Yes' : '👎 No'}</span> on{' '}
              <span className="font-semibold">
                {VOTE_OPTIONS.find((o) => o.id === dialog.optionId)?.title}
              </span>.
            </p>
            <button
              onClick={() => setDialog(null)}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
