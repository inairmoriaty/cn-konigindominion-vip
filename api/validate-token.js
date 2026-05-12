export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, room } = req.body;

  if (!token || !room) {
    return res.status(400).json({ valid: false });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [tokenRoom, timestamp, secret] = decoded.split(':');

    if (tokenRoom !== room || secret !== process.env.TOKEN_SECRET) {
      return res.status(401).json({ valid: false });
    }

    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 86400000) {
      return res.status(401).json({ valid: false, reason: 'expired' });
    }

    return res.status(200).json({ valid: true });
  } catch {
    return res.status(401).json({ valid: false });
  }
}
