// Run ONCE, AFTER the app is live at APP_URL, to register this app's own IPN URL
// with Pesapal and obtain the notification_id to put in PESAPAL_NOTIFICATION_ID.
//
//   npm run register-ipn
//
// (loads .env via `node --env-file=.env` in the package.json script)
// Prints the Pesapal response; copy `ipn_id` into .env as PESAPAL_NOTIFICATION_ID, then restart.

const env = process.env.PESAPAL_ENVIRONMENT === 'production'
  ? 'https://pay.pesapal.com/v3/api'
  : 'https://cybqa.pesapal.com/pesapalv3/api';

const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
const ipnUrl = process.env.IPN_URL || 'https://pay.synepic.com/api/pesapal/ipn';
const ipnMethod = process.env.IPN_METHOD || 'GET';

if (!consumerKey || !consumerSecret) {
  console.error('PESAPAL_CONSUMER_KEY / PESAPAL_CONSUMER_SECRET must be set in .env');
  process.exit(1);
}

const tok = await fetch(`${env}/Auth/RequestToken`, {
  method: 'POST',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
}).then((r) => r.json());

if (!tok.token) {
  console.error('Token request failed:', tok);
  process.exit(1);
}

const res = await fetch(`${env}/URLSetup/RegisterIPN`, {
  method: 'POST',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${tok.token}` },
  body: JSON.stringify({ url: ipnUrl, ipn_notification_type: ipnMethod }),
}).then((r) => r.json());

console.log('IPN registration response:');
console.log(JSON.stringify(res, null, 2));
if (res.ipn_id) console.log('\n=> Set PESAPAL_NOTIFICATION_ID=' + res.ipn_id + ' in .env and restart.');