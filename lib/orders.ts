export type PayType = 'deposit' | 'balance';

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('256')) return cleaned;
  if (cleaned.startsWith('0')) return `256${cleaned.slice(1)}`;
  return `256${cleaned}`;
}

export function isValidUgandaPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^(2567\d{8}|07\d{8})$/.test(cleaned);
}

export function buildMerchantReference(type: PayType): string {
  const short = crypto.randomUUID().split('-')[0].toUpperCase();
  return `SYNEPIC-${type.toUpperCase()}-${short}`;
}

export function getPayConfig(type: PayType) {
  const deposit = Number(process.env.DEPOSIT_AMOUNT || 175000);
  const balance = Number(process.env.BALANCE_AMOUNT || 175000);
  const pkg = 'Synepic Sales & Profit Dashboard Setup';
  return type === 'deposit'
    ? { amount: deposit, description: `${pkg} — Deposit (UGX ${deposit.toLocaleString()})` }
    : { amount: balance, description: `${pkg} — Balance (UGX ${balance.toLocaleString()})` };
}