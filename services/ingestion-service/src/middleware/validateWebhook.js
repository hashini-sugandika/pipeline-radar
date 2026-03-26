const crypto = require('crypto');

const validateWebhook = (req, res, next) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret || secret === '') return next();

  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    return res.status(401).json({ error: 'No signature provided' });
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  if (signature !== digest) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

module.exports = validateWebhook;
