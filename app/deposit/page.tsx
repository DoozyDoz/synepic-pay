import PayForm from '@/app/_components/PayForm';

export default function Page() {
  const amount = Number(process.env.DEPOSIT_AMOUNT || 175000);
  return (
    <div className="wrap">
      <div className="card">
        <div className="brand">Synepic<span>.</span></div>
        <h1>Pay your deposit</h1>
        <p className="sub">Sales &amp; Profit Dashboard Setup — UGX {amount.toLocaleString()} deposit (50%).</p>
        <PayForm type="deposit" amount={amount} label="deposit" />
      </div>
    </div>
  );
}