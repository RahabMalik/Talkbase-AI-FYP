/**
 * TalkBase Chat Widget — Embeddable Script
 * =========================================
 * Usage:
 *   <script src="https://yourdomain.com/widget.js"
 *           data-api-key="your-business-api-key"></script>
 *
 * BREAKING CHANGE FROM PREVIOUS VERSION
 * ──────────────────────────────────────
 * The old embed used  data-business-id="..."  which exposed an internal
 * MongoDB ObjectId publicly and allowed anyone to call the visitor-ping and
 * chat endpoints on behalf of any business.
 *
 * The new embed uses  data-api-key="..."  (your Business API key from
 * Settings → API Configuration).  The API key is sent as an  x-api-key
 * header; the backend resolves the businessId server-side from that key.
 *
 * SECURITY FIXES APPLIED
 * ──────────────────────
 * 1. Visitor ping: businessId is no longer sent in the request body.
 *    The x-api-key header is used instead; the backend validates it.
 *
 * 2. Chat: businessId is no longer sent in the request body.
 *    The x-api-key header is used instead; the backend resolves businessId
 *    from the key (see routes/ai.js resolveBusinessId).
 *
 * Widget settings (theme, title, welcome message) are still fetched from
 * the public  /api/business/:id/widget-settings  endpoint using the
 * businessId returned by the key-lookup response.
 */
(function () {
  var scripts = document.querySelectorAll('script[data-api-key]');
  var currentScript = scripts[scripts.length - 1];
  var apiKey = currentScript ? currentScript.getAttribute('data-api-key') : null;

  if (!apiKey) {
    // Backwards-compatibility warning for old embeds
    console.error(
      '[TalkBase] data-api-key is required on the script tag.\n' +
      'Update your embed: replace data-business-id with data-api-key.\n' +
      'Find your API key in the TalkBase dashboard → Settings → API Configuration.'
    );
    return;
  }

  // BACKEND is derived from wherever widget.js is hosted — never hardcoded.
  var BACKEND = currentScript.src.replace('/widget.js', '');

  // Standard headers for all authenticated requests
  var AUTH_HEADERS = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };

  // Fallback values from script attributes (used if fetch fails)
  var fallbackColor = currentScript.getAttribute('data-color') || '#2563EB';
  var fallbackTitle = currentScript.getAttribute('data-title') || 'Support';

  // ── Resolve businessId from API key, then fetch widget settings ──────────
  // We hit the same public widget-settings endpoint but need businessId first.
  // The /api/business/by-api-key endpoint returns the businessId for a key.
  // If that endpoint doesn't exist yet, fall back to just rendering with defaults.
  fetchSettingsAndRender();

  function fetchSettingsAndRender() {
    // Attempt to resolve businessId from the API key
    fetch(BACKEND + '/api/business/by-api-key', {
      method: 'GET',
      headers: AUTH_HEADERS,
    })
      .then(function (r) {
        if (!r.ok) throw new Error('key lookup failed');
        return r.json();
      })
      .then(function (data) {
        var businessId = data.businessId || data._id;
        if (!businessId) throw new Error('no businessId in response');
        return fetch(BACKEND + '/api/business/' + businessId + '/widget-settings')
          .then(function (r) { return r.json(); })
          .then(function (settings) {
            render(
              businessId,
              settings.themeColor  || fallbackColor,
              settings.widgetTitle || fallbackTitle,
              settings.welcomeMsg  || 'Hi! 👋 How can I help you today?'
            );
          });
      })
      .catch(function () {
        // Backend unreachable or key lookup not yet implemented —
        // render with fallback values so widget still appears.
        render(null, fallbackColor, fallbackTitle, 'Hi! 👋 How can I help you today?');
      });
  }

  // ── render() builds and mounts the widget ────────────────────────────────
  function render(businessId, widgetColor, widgetTitle, welcomeMsg) {

    var style = document.createElement('style');
    style.innerHTML = [
      '#tb-btn{position:fixed;bottom:24px;right:24px;z-index:99999;width:56px;height:56px;border-radius:50%;background:' + widgetColor + ';color:#fff;border:none;cursor:pointer;font-size:26px;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;transition:transform .2s;}',
      '#tb-btn:hover{transform:scale(1.1);}',
      '#tb-box{display:none;position:fixed;bottom:90px;right:24px;z-index:99999;width:340px;height:500px;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.18);overflow:hidden;flex-direction:column;font-family:Inter,system-ui,sans-serif;border:1px solid #e2e8f0;background:#fff;}',
      '#tb-box.tb-open{display:flex;}',
      '#tb-head{background:' + widgetColor + ';color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;}',
      '#tb-head-info{display:flex;align-items:center;gap:10px;}',
      '#tb-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;}',
      '#tb-head-title{font-weight:700;font-size:15px;}',
      '#tb-head-sub{font-size:12px;opacity:0.85;}',
      '#tb-close{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.8;line-height:1;padding:0;}',
      '#tb-msgs{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;background:#f8fafc;}',
      '.tb-msg{display:flex;align-items:flex-end;gap:6px;}',
      '.tb-msg.tb-user{justify-content:flex-end;}',
      '.tb-bubble{max-width:78%;padding:10px 13px;border-radius:16px;font-size:13px;line-height:1.5;}',
      '.tb-bot .tb-bubble{background:#fff;color:#1e293b;border-radius:16px 16px 16px 4px;border:1px solid #e2e8f0;}',
      '.tb-user .tb-bubble{background:' + widgetColor + ';color:#fff;border-radius:16px 16px 4px 16px;}',
      '.tb-bot-icon{width:26px;height:26px;border-radius:50%;background:' + widgetColor + ';display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}',
      '#tb-inp-area{padding:10px 12px;border-top:1px solid #e2e8f0;background:#fff;display:flex;gap:8px;align-items:center;}',
      '#tb-inp{flex:1;border:1.5px solid #e2e8f0;border-radius:10px;padding:9px 12px;font-size:13px;outline:none;background:#f8fafc;font-family:inherit;}',
      '#tb-inp:focus{border-color:' + widgetColor + ';}',
      '#tb-send{width:36px;height:36px;border-radius:9px;background:' + widgetColor + ';color:#fff;border:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '#tb-send:disabled{background:#cbd5e1;cursor:default;}',
      '#tb-footer{text-align:center;padding:5px 0 7px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;}',
      '.tb-dots{display:flex;gap:4px;align-items:center;padding:2px 0;}',
      '.tb-dot{width:6px;height:6px;border-radius:50%;background:#94a3b8;animation:tb-bounce 1.2s ease-in-out infinite;}',
      '.tb-dot:nth-child(2){animation-delay:.2s;}',
      '.tb-dot:nth-child(3){animation-delay:.4s;}',
      '@keyframes tb-bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-5px);}}',
    ].join('');
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.id = 'tb-btn';
    btn.title = 'Chat with us';
    btn.innerHTML = '💬';

    var box = document.createElement('div');
    box.id = 'tb-box';
    box.innerHTML = [
      '<div id="tb-head">',
      '  <div id="tb-head-info">',
      '    <div id="tb-avatar">🤖</div>',
      '    <div><div id="tb-head-title">' + escHtml(widgetTitle) + '</div><div id="tb-head-sub">● Online</div></div>',
      '  </div>',
      '  <button id="tb-close">✕</button>',
      '</div>',
      '<div id="tb-msgs"></div>',
      '<div id="tb-inp-area">',
      '  <input id="tb-inp" type="text" placeholder="Type your question…" />',
      '  <button id="tb-send">➤</button>',
      '</div>',
      '<div id="tb-footer">Powered by <strong>TalkBase AI</strong></div>',
    ].join('');

    document.body.appendChild(btn);
    document.body.appendChild(box);

    var msgs    = document.getElementById('tb-msgs');
    var inp     = document.getElementById('tb-inp');
    var send    = document.getElementById('tb-send');
    var loading = false;

    // Generate a stable visitor ID for this browser session
    var visitorId = sessionStorage.getItem('tb_vid') || (Math.random().toString(36).slice(2) + Date.now());
    sessionStorage.setItem('tb_vid', visitorId);

    // ── FIX: chat history persistence across open/close via sessionStorage ──
    // Messages are stored as [{role:'bot'|'user', text:'...'}] in sessionStorage.
    // On open, existing messages are replayed so the user sees their full thread.
    // The welcome message is only shown once per session (not on every open).
    var HISTORY_KEY = 'tb_chat_history_' + (visitorId);

    function loadHistory() {
      try {
        return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
      } catch { return []; }
    }

    function saveHistory(history) {
      try {
        // Keep last 50 messages to avoid unbounded sessionStorage growth
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-50)));
      } catch {}
    }

    function replayHistory() {
      var history = loadHistory();
      if (history.length === 0) {
        // First open — show welcome message and save it
        var welcomeEntry = { role: 'bot', text: welcomeMsg };
        saveHistory([welcomeEntry]);
        addBotMessageDOM(welcomeMsg);
      } else {
        // Subsequent opens — replay saved messages without re-saving
        history.forEach(function (entry) {
          if (entry.role === 'user') addUserMessageDOM(entry.text);
          else addBotMessageDOM(entry.text);
        });
      }
    }

    btn.addEventListener('click', function () {
      box.classList.add('tb-open');
      inp.focus();
      // FIX: send x-api-key header; do NOT send businessId in the body
      fetch(BACKEND + '/api/analytics/visitor', {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({ visitorId: visitorId }),
      }).catch(function () {});
    });
    document.getElementById('tb-close').addEventListener('click', function () { box.classList.remove('tb-open'); });

    // FIX: replay history instead of always showing welcome message fresh
    replayHistory();

    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendMessage(); });
    send.addEventListener('click', sendMessage);

    function sendMessage() {
      var q = inp.value.trim();
      if (!q || loading) return;
      addUserMessage(q);
      inp.value = '';
      loading = true;
      send.disabled = true;
      var typingEl = addTyping();
      // FIX: send x-api-key header; do NOT send businessId in the body
      fetch(BACKEND + '/api/ai/chat', {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({ question: q }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          typingEl.remove();
          var answer = data.answer || 'I am not fully sure. Please contact our support team.';
          addBotMessage(answer);
        })
        .catch(function () {
          typingEl.remove();
          addBotMessage('Sorry, I could not connect. Please try again later.');
        })
        .finally(function () { loading = false; send.disabled = false; });
    }

    function addUserMessage(text) {
      addUserMessageDOM(text);
      var history = loadHistory();
      history.push({ role: 'user', text: text });
      saveHistory(history);
    }

    function addBotMessage(text) {
      addBotMessageDOM(text);
      var history = loadHistory();
      history.push({ role: 'bot', text: text });
      saveHistory(history);
    }

    function addUserMessageDOM(text) {
      var d = document.createElement('div');
      d.className = 'tb-msg tb-user';
      d.innerHTML = '<div class="tb-bubble">' + escHtml(text) + '</div>';
      msgs.appendChild(d); scrollBottom();
    }

    function addBotMessageDOM(text) {
      var d = document.createElement('div');
      d.className = 'tb-msg tb-bot';
      d.innerHTML = '<div class="tb-bot-icon">🤖</div><div class="tb-bubble">' + escHtml(text) + '</div>';
      msgs.appendChild(d); scrollBottom();
      return d;
    }

    function addTyping() {
      var d = document.createElement('div');
      d.className = 'tb-msg tb-bot';
      d.innerHTML = '<div class="tb-bot-icon">🤖</div><div class="tb-bubble"><div class="tb-dots"><div class="tb-dot"></div><div class="tb-dot"></div><div class="tb-dot"></div></div></div>';
      msgs.appendChild(d); scrollBottom();
      return d;
    }

    function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }
  }

  function escHtml(t) {
    return String(t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
