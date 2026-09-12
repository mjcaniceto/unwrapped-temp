import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input, Label, FieldError } from './primitives/Field';
import Button from './primitives/Button';
import Sticker from './primitives/Sticker';
import { verifyDashboardPassword } from '../lib/dashboardAuth';

export default function AccessSurpriseModal({ onClose }: { onClose: () => void }) {
  const [surpriseId, setSurpriseId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!surpriseId.trim() || !password) {
      setError('Enter both your Surprise ID and password.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await verifyDashboardPassword(surpriseId, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(`/dashboard/${result.surpriseId}`);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-3xl border-2 border-ink bg-paper p-7 shadow-[var(--shadow-brutal-xl)] paper-texture"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-white shadow-[var(--shadow-brutal-sm)]"
          >
            <X size={14} strokeWidth={3} />
          </button>

          <Sticker emoji="🔑" rotate={-8} size="lg" />
          <h2 className="mt-3 font-display text-3xl font-bold text-ink">Access my surprise</h2>
          <p className="mt-1 font-sans text-sm text-ink-soft">
            Enter the Surprise ID and password you set when you created it.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="surpriseId">Surprise ID</Label>
              <Input
                id="surpriseId"
                placeholder="e.g. B7K2QF"
                value={surpriseId}
                autoCapitalize="characters"
                onChange={(e) => setSurpriseId(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" loading={loading} className="w-full justify-center">
              Access dashboard
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
