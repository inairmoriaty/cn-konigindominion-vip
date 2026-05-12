export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { room, password } = req.body;

  const passwords = {
    '201': process.env.PASS_201,
    '202': process.env.PASS_202,
    '203': process.env.PASS_203,
    '204': process.env.PASS_204,
    '205': process.env.PASS_205,
    '206': process.env.PASS_206,
    '207': process.env.PASS_207,
    '208': process.env.PASS_208,
    '209': process.env.PASS_209,
    '210': process.env.PASS_210,
    '211': process.env.PASS_211,
    '212': process.env.PASS_212,
    '213': process.env.PASS_213,
    '214': process.env.PASS_214,
    '215': process.env.PASS_215,
    '216': process.env.PASS_216,
    '217': process.env.PASS_217,
    '218': process.env.PASS_218,
    '219': process.env.PASS_219,
    '220': process.env.PASS_220,
    '221': process.env.PASS_221,
    '222': process.env.PASS_222,
    '223': process.env.PASS_223,
    '224': process.env.PASS_224,
    '225': process.env.PASS_225,
    '226': process.env.PASS_226,
    '227': process.env.PASS_227,
    '228': process.env.PASS_228,
    'master': process.env.PASS_MASTER,
  };

  const correctPassword = passwords[room];

  if (!correctPassword) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (password === correctPassword) {
    const token = Buffer.from(`${room}:${Date.now()}:${process.env.TOKEN_SECRET}`).toString('base64');
    return res.status(200).json({ success: true, token, room });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid password' });
  }
}
