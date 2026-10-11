// Retired (audit 50): billing setup lives only in finalize-join.js, which follows
// Exhibit A and Manual 68.1. This endpoint no longer creates any charge.
module.exports = async function handler(req, res) {
  return res.status(410).json({ error: 'gone', detail: 'This endpoint is retired. Billing is set up by finalize-join.' });
};
