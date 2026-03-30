import { useState } from 'react';
import { useVotes } from '../../hooks/useVotes.js';

const VOTE_OPTIONS = [
  {
    id: 'strip-club-syd',
    emoji: '💃',
    title: 'Strip Club in Sydney',
    description: "Visit a gentleman's club on the evening of May 9 (Saturday night) in Sydney.",
  },
];

function getSavedName() {
  try {
    return localStorage.getItem('voter-name') ?? '';
  } catch {
    return '';
  }
}

function saveName(name) {
  try {
    localStorage.setItem('voter-name', name);
  } catch {}
}

export default function VoteView() {
  const { votersByOption, submitVote } = useVotes();
  const [pendingVote, setPendingVote] = useState(null); // { optionId, choice }
  const [nameInput, setNameInput] = useState('');
  const [thankYou, setThankYou] = useState(null); // { optionId, choice }

  function handleVoteClick(optionId, choice) {
    const saved = getSavedName();
    if (saved) {
      submitVote(optionId, saved, choice);
      setThankYou({ optionId, choice });
    } else {
      setPendingVote({ optionId, choice });
      setNameInput('');
    }
  }

  function handleNameSubmit() {
    const name = nameInput.trim();
    if (!name) return;
    saveName(name);
    submitVote(pendingVote.optionId, name, pendingVote.choice);
    setThankYou({ optionId: pendingVote.optionId, choice: pendingVote.choice });
    setPendingVote(null);
    setNameInput('');
  }

  return (
    <div className="pt-4 space-y-4">
      <p className="text-sm text-slate-500">
        Vote on optional activities. Results are shared across all devices in real-time.
      </p>

      {VOTE_OPTIONS.map((opt) => {
        const voters = votersByOption[opt.id] ?? {};
        const yesVoters = Object.entries(voters).filter(([, v]) => v === 'yes').map(([k]) => k);
        const noVoters  = Object.entries(voters).filter(([, v]) => v === 'no').map(([k]) => k);
        const total = yesVoters.length + noVoters.length;
        const yesPct = total > 0 ? Math.round((yesVoters.length / total) * 100) : null;
        const savedName = getSavedName();
        const myVote = savedName ? voters[savedName.toLowerCase()] : null;

        return (
          <div key={opt.id} className="bg-white rounded-xl shadow-sm border border-slateate-200 p-4">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{opt.emoji}</span>
              <div>
                <h3 className="font-semibold text-slate-800">{opt.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{opt.description}</p>
              </div>
            </div>

            {/* Voter lists */}
            {total > 0 && (
              <div className="mb-3 space-y-1">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-green-600">👍 Yes ({yesVoters.length})</span>
                  {yesVoters.length > 0 && (
                    <span className="text-slate-400"> — {yesVoters.join(', ')}</span>
                  )}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-red-600">👎 No ({noVoters.length})</span>
                  {noVoters.length > 0 && (
                    <span className="text-slate-400"> — {noVoters.join(', ')}</span>
                  )}
                </div>

                {/* Percentage bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{yesPct}% Yes</span>
                    <span>{100 - yesPct}% No</span>
                  </div>
                  <div className="h-2 rounded-full bg-red-100 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${yesPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Vote buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleVoteClick(opt.id, 'yes')}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  myVote === 'yes'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                👍 Yes {myVote === 'yes' && '✓'}
              </button>
              <button
                onClick={() => handleVoteClick(opt.id, 'no')}
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

      {/* Name prompt dialog */}
      {pendingVote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
          onClick={() => setPendingVote(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3 text-center">
              {pendingVote.choice === 'yes' ? '👍' : '👎'}
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1 text-center">What's your name?</h2>
            <p className="text-sm text-slate-500 mb-4 text-center">
              So everyone knows who voted{' '}
              <span className="font-semibold">{pendingVote.choice === 'yes' ? 'Yes' : 'No'}</span>.
            </p>
            <input
              autoFocus
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              placeholder="e.g. Alice"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-medium rounded-lg transition-colors"
            >
              Submit Vote
            </button>
          </div>
        </div>
      )}

      {/* Thank-you dialog */}
      {thankYou && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
          onClick={() => setThankYou(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">{thankYou.choice === 'yes' ? '🎉' : '🙅'}</div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Thanks for voting!</h2>
            <p className="text-sm text-slate-500 mb-4">
              You voted <span className="font-semibold">{thankYou.choice === 'yes' ? '👍 Yes' : '👎 No'}</span> on{' '}
              <span className="font-semibold">
                {VOTE_OPTIONS.find((o) => o.id === thankYou.optionId)?.title}
              </span>.
            </p>
            <button
              onClick={() => setThankYou(null)}
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
