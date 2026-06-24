export default function Page() {
  const wa = process.env.WHATSAPP_NUMBER || '256759799619';
  return (
    <div className="wrap">
      <div className="card">
        <div className="brand">Synepic<span>.</span></div>
        <h1 className="ok">Payment received</h1>
        <p className="sub">Thanks! We&apos;re confirming your payment and will lock in your 3-business-day slot on WhatsApp.</p>
        <p className="hint">
          Questions? Message us on WhatsApp: <a href={`https://wa.me/${wa}`}>+{wa}</a>
        </p>
      </div>
    </div>
  );
}