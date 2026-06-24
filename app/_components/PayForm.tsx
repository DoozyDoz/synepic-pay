'use client';
import { useState } from 'react';

export default function PayForm({
  type,
  amount,
  label,
}: {
  type: 'deposit' | 'balance';
  amount: number;
  label: string;
}) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type }),
      });
      const data = await res.json();
      if (data.success && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        setError(data.error || 'Could not start payment. Try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={pay}>
      <label htmlFor="phone">Mobile Money number</label>
      <input
        id="phone"
        type="tel"
        inputMode="tel"
        placeholder="07XX XXX XXX or 2567XX XXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        autoFocus
      />
      <button type="submit" disabled={loading || !phone}>
        {loading ? 'Starting…' : `Pay UGX ${amount.toLocaleString()} ${label}`}
      </button>
      {error && <div className="error">{error}</div>}
      <p className="hint">
        You&apos;ll be redirected to Pesapal to choose MTN or Airtel and approve the PIN prompt on your phone.
        Your address and personal details are not required.
      </p>
    </form>
  );
}