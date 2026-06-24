import Link from 'next/link';

export default function Page() {
  const deposit = Number(process.env.DEPOSIT_AMOUNT || 175000);
  const balance = Number(process.env.BALANCE_AMOUNT || 175000);
  return (
    <div className="wrap">
      <div className="card">
        <div className="brand">Synepic<span>.</span></div>
        <h1>Pay for your dashboard</h1>
        <p className="sub">Sales &amp; Profit Dashboard Setup — secure payment via Pesapal.</p>
        <Link href="/deposit" className="muted-link">Pay deposit (UGX {deposit.toLocaleString()}) →</Link>
        <br />
        <Link href="/balance" className="muted-link">Pay balance (UGX {balance.toLocaleString()}) →</Link>
      </div>
    </div>
  );
}