import PayForm from '@/app/_components/PayForm';

export default function Page() {
  const amount = Number(process.env.BALANCE_AMOUNT || 175000);
  return (
    <div className="wrap">
      <div className="card">
        <div className="brand">Synepic<span>.</span></div>
        <h1>Pay your balance</h1>
        <p className="sub">Sales &amp; Profit Dashboard Setup — UGX {amount.toLocaleString()} balance on delivery.</p>
        <PayForm type="balance" amount={amount} label="balance" />
      </div>
    </div>
  );
}