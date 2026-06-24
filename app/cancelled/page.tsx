export default function Page() {
  const wa = process.env.WHATSAPP_NUMBER || '256759799619';
  return (
    <div className="wrap">
      <div className="card">
        <div className="brand">Synepic<span>.</span></div>
        <h1>Payment not completed</h1>
        <p className="sub">The payment was cancelled or didn&apos;t go through. No money was taken.</p>
        <p className="hint">
          Need help? Message us on WhatsApp: <a href={`https://wa.me/${wa}`}>+{wa}</a>
        </p>
        <a className="muted-link" href="/deposit">Try again →</a>
      </div>
    </div>
  );
}