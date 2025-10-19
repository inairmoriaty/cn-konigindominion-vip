// /api/commission.js  —— Edge-friendly（直接调用 Resend REST API）
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RECIPIENT = process.env.COMMISSION_INBOX;      // 你的收件邮箱
const FROM = process.env.COMMISSION_FROM || 'KONIGIN <onboarding@resend.dev>'; 
// ↑ 未验证自域名前，用 onboarding@resend.dev；验证域名后改成：'KONIGIN <commission@konigindominion.com>'

export const config = {
  runtime: 'edge',
};

function sanitize(str = '') {
  return String(str).slice(0, 5000);
}
function isEmail(v = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

async function sendEmail({ from, to, subject, html, text, reply_to }) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(reply_to ? { reply_to } : {}),
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Resend failed: ${resp.status} ${errText}`);
  }
  return resp.json();
}

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    // 表单数据
    const form = await req.formData();

    // 蜜罐
    if (form.get('website')) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const name = sanitize(form.get('name'));
    const contact = sanitize(form.get('contact'));
    const type = sanitize(form.get('type'));
    const budget = sanitize(form.get('budget'));
    const deadline = sanitize(form.get('deadline'));
    const refs = sanitize(form.get('refs'));
    const message = sanitize(form.get('message'));
    const agree = form.get('agree');

    // 基础校验（放宽 contact，不强制邮箱）
    if (!name || !contact || !message || !agree) {
      return new Response(JSON.stringify({ error: '请填写必填字段：称呼 / 联系方式 / 需求描述 / 同意条款' }), { status: 400 });
    }
    if (!RESEND_API_KEY || !RECIPIENT) {
      return new Response(JSON.stringify({ error: '服务端未配置收件邮箱或 Resend API Key。' }), { status: 500 });
    }

    const subject = `【Commission】${name} - ${type || '未选择类型'}`;
    const lines = [
      `称呼: ${name}`,
      `联系方式: ${contact}`,
      `类型: ${type || '-'}`,
      `预算: ${budget || '-'}`,
      `截止: ${deadline || '-'}`,
      `参考: ${refs || '-'}`,
      `——`,
      message,
      `——`,
      `时间: ${new Date().toLocaleString('zh-CN', { hour12: false })}`
    ];

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system">
        <h2>新委托表单</h2>
        <p><b>称呼：</b>${escapeHtml(name)}</p>
        <p><b>联系方式：</b>${escapeHtml(contact)}</p>
        <p><b>类型：</b>${escapeHtml(type || '-')}</p>
        <p><b>预算：</b>${escapeHtml(budget || '-')}</p>
        <p><b>截止：</b>${escapeHtml(deadline || '-')}</p>
        <p><b>参考：</b>${escapeHtml(refs || '-')}</p>
        <hr />
        <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
        <hr />
        <small>提交时间：${new Date().toLocaleString('zh-CN', { hour12: false })}</small>
      </div>
    `;

    // 如果 contact 是邮箱就作为 reply_to；否则不设置
    const replyTo = isEmail(contact) ? contact : undefined;

    await sendEmail({
      from: FROM,
      to: RECIPIENT,
      subject,
      html,
      text: lines.join('\n'),
      reply_to: replyTo,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    // 可选：把 err.message 打到 Vercel Logs 中
    console.error(err);
    return new Response(JSON.stringify({ error: '委托表单发送失败，请稍后再试。' }), { status: 500 });
  }
}