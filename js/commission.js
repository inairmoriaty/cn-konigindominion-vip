// /api/commission.js
import { Resend } from 'resend';

// 读取环境变量（到 Vercel 设置）
const resend = new Resend(process.env.RESEND_API_KEY);
const RECIPIENT = process.env.COMMISSION_INBOX; // 你的收件联系方式

export const config = {
  runtime: 'edge', // 也可以删掉用 Node runtime
};

function sanitize(str = '') {
  return String(str).slice(0, 5000);
}

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    // 接 FormData（更适合文件/表单）
    const form = await req.formData();

    // 蜜罐：有值直接丢弃
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

    // 基础校验
    if (!name || !contact || !message || !agree) {
      return new Response(JSON.stringify({ error: '请填写必填字段：预算（字数范围）/ 联系方式 / 需求描述 / 同意条款' }), { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      return new Response(JSON.stringify({ error: '联系方式格式不正确' }), { status: 400 });
    }

    // 构造邮件内容（纯文本 + HTML）
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

    // 发送邮件
    const { error } = await resend.contacts.send({
      from: 'KONIGIN Commission <commission@your-domain.com>', // 可以用 Resend 提供的域或已验证域名
      to: [RECIPIENT],
      reply_to: contact,
      subject,
      text: lines.join('\n'),
      html
    });

    if (error) {
      return new Response(JSON.stringify({ error: '委托表单发送失败，请稍后再试。' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: '委托表单发送失败，请稍后再试。' }), { status: 500 });
  }
}

// 简单的 XSS 处理
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
