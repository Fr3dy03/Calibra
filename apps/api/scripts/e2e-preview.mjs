import { readFileSync } from 'node:fs';
const xml = readFileSync('assets/dcc-sample.xml', 'utf8');
const res = await fetch('http://localhost:4000/api/v1/certificates/validate-schema', {
  method: 'POST',
  headers: { Authorization: `Bearer ${readFileSync(process.env.TEMP + '/cg-token.txt', 'utf8').trim()}`, 'content-type': 'application/json' },
  body: JSON.stringify({ xml }),
});
console.log(res.status, await res.text());
