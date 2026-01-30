let wecomTokenCache = { token: null, expire: 0 }

export default {
  async fetch(req, env) {
    const url = new URL(req.url)

    /* ================= 静态 HTML（Assets） ================= */
    if (req.method === 'GET' && url.pathname.startsWith('/detail')) {
      // 直接交给 Assets（detail.html）
      return env.ASSETS.fetch(req)
    }

    /* ================= Webhook 通知 ================= */
    if (req.method !== 'POST' || url.pathname !== '/notify') {
      return new Response('OK')
    }

    /* ---------- API-Key 校验 ---------- */
    if (env.API_KEY && req.headers.get('x-api-key') !== env.API_KEY) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()

    /* ---------- Uptime Kuma 适配 ---------- */
    const status = body.status || 'unknown'
    const monitorName = body.monitor?.name || '未知服务'
    const msg = body.msg || ''
    const time = body.time || new Date().toISOString()

    const title =
      status === 'down'
        ? '🔴 服务异常'
        : status === 'up'
          ? '🟢 服务恢复'
          : '⚠️ 状态变更'

    const level =
      status === 'down' ? 'error' : status === 'up' ? 'success' : 'info'

    /* ---------- 详情页 URL（核心） ---------- */
    const detailUrl =
      `${url.origin}/detail.html` +
      `?title=${enc(title)}` +
      `&level=${enc(level)}` +
      `&content=${enc(`${monitorName}\n${msg}\n${time}`)}` +
      `&url=${enc(env.DEFAULT_LINK)}`

    const tasks = []

    /* ---------- Telegram ---------- */
    if (env.TG_TOKEN && env.TG_CHAT_ID) {
      tasks.push(
        sendTelegram(
          env.TG_TOKEN,
          env.TG_CHAT_ID,
          title,
          monitorName,
          detailUrl
        )
      )
    }

    /* ---------- 企业微信（自定义应用） ---------- */
    if (env.WECOM_CORP_ID && env.WECOM_SECRET) {
      tasks.push(sendWeComApp(env, title, monitorName, detailUrl))
    }

    /* ---------- 钉钉 ---------- */
    if (env.DINGTALK_TOKEN && env.DINGTALK_SECRET) {
      tasks.push(
        sendDingTalk(
          env.DINGTALK_TOKEN,
          env.DINGTALK_SECRET,
          title,
          monitorName,
          detailUrl
        )
      )
    }

    await Promise.all(tasks)
    return json({ ok: true })
  }
}

/* ================= Telegram ================= */
async function sendTelegram(token, chatId, title, content, link) {
  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: 'Markdown',
      text: `*${title}*\n\n${content}`,
      reply_markup: {
        inline_keyboard: [[{ text: '🔍 查看详情', url: link }]]
      }
    })
  })
}

/* ================= 企业微信应用消息 ================= */
async function sendWeComApp(env, title, content, link) {
  const token = await getWeComToken(env)

  return fetch(
    `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        touser: '@all',
        msgtype: 'textcard',
        agentid: Number(env.WECOM_AGENT_ID),
        textcard: {
          title,
          description: `<div>${content}</div>`,
          url: link,
          btntxt: '查看详情'
        }
      })
    }
  )
}

async function getWeComToken(env) {
  const now = Date.now()
  if (wecomTokenCache.token && wecomTokenCache.expire > now) {
    return wecomTokenCache.token
  }

  const r = await fetch(
    `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${env.WECOM_CORP_ID}&corpsecret=${env.WECOM_SECRET}`
  )
  const d = await r.json()

  wecomTokenCache = {
    token: d.access_token,
    expire: now + (d.expires_in - 300) * 1000
  }

  return d.access_token
}

/* ================= 钉钉 ================= */
async function sendDingTalk(token, secret, title, content, link) {
  const ts = Date.now()
  const sign = await hmac(`${ts}\n${secret}`, secret)

  return fetch(
    `https://oapi.dingtalk.com/robot/send?access_token=${token}&timestamp=${ts}&sign=${encodeURIComponent(sign)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'actionCard',
        actionCard: {
          title,
          text: `### ${title}\n\n${content}`,
          singleTitle: '查看详情',
          singleURL: link
        }
      })
    }
  )
}

/* ================= 工具 ================= */
const enc = encodeURIComponent

const json = (obj) =>
  new Response(JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json' }
  })

async function hmac(msg, secret) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}
