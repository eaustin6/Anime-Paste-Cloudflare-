<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AnimePaste</title>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-light: linear-gradient(120deg, #fce4ec, #f3e5f5);
      --bg-dark: #1e1e2f;
      --text-light: #333;
      --text-dark: #eee;
      --card-light: white;
      --card-dark: #2a2a3c;
      --accent: #8e44ad;
      --accent-dark: #732d91;
    }

    body {
      margin: 0;
      font-family: 'Noto Sans JP', sans-serif;
      background: var(--bg-light);
      color: var(--text-light);
      transition: all 0.3s;
    }

    body.dark-mode {
      background: var(--bg-dark);
      color: var(--text-dark);
    }

    header {
      background-color: var(--accent);
      color: white;
      padding: 1em;
      text-align: center;
      font-size: 1.5em;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    main {
      max-width: 700px;
      margin: 2em auto;
      background: var(--card-light);
      padding: 2em;
      border-radius: 1em;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    body.dark-mode main {
      background: var(--card-dark);
    }

    textarea {
      width: 100%;
      height: 200px;
      padding: 1em;
      font-family: 'Fira Code', monospace;
      font-size: 1em;
      border: 2px solid var(--accent);
      border-radius: 0.5em;
      resize: vertical;
    }

    select, input[type="checkbox"], input[type="password"] {
      margin-top: 1em;
    }

    button {
      background-color: var(--accent);
      color: white;
      padding: 0.7em 1.5em;
      border: none;
      font-size: 1em;
      border-radius: 0.5em;
      cursor: pointer;
      margin-top: 1em;
    }

    button:hover {
      background-color: var(--accent-dark);
    }

    .result {
      margin-top: 1em;
      padding: 1em;
      background: #f3e5f5;
      border-left: 4px solid var(--accent);
      font-family: 'Fira Code', monospace;
      word-break: break-word;
    }

    body.dark-mode .result {
      background: #3b3b4e;
    }

    footer {
      margin-top: 2em;
      text-align: center;
      font-size: 0.9em;
      color: #666;
    }

    .toggle-wrapper {
      text-align: right;
      padding: 0.5em 2em 0 0;
    }

    #loginBox {
      text-align: center;
      margin: 1em;
    }
  </style>
</head>
<body>
  <header>AnimePaste - Kawaii Snippets</header>
  <div class="toggle-wrapper">
    <label><input type="checkbox" id="toggleMode"> Dark Mode</label>
  </div>

  <main>
    <div id="loginBox">
      <input type="password" id="password" placeholder="Enter password (used for encryption)">
      <button onclick="login()">Login</button>
    </div>

    <textarea id="paste" placeholder="Paste your code or text here..."></textarea>
    <div>
      <label>Expiration:
        <select id="expire">
          <option value="1h">1 Hour</option>
          <option value="1d">1 Day</option>
          <option value="1w">1 Week</option>
          <option value="never" selected>Never</option>
        </select>
      </label>
      <label>
        <input type="checkbox" id="private"> Private Paste
      </label>
    </div>
    <button onclick="submitPaste()">Create Paste</button>
    <div class="result" id="result"></div>
    <div class="result" id="views"></div>
  </main>

  <footer>Inspired by anime. Powered by Cloudflare.</footer>

  <script>
    document.getElementById('toggleMode').addEventListener('change', function () {
      document.body.classList.toggle('dark-mode');
    });

    let userKey;

    async function login() {
      const password = document.getElementById('password').value;
      if (!password) return alert('Enter password');

      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), {name: 'PBKDF2'}, false, ['deriveKey']);
      userKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: enc.encode('anime-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      alert('Logged in and encryption key loaded.');
    }

    function arrayToBase64(arrayBuffer) {
      return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    }

    async function submitPaste() {
      const text = document.getElementById('paste').value;
      const expire = document.getElementById('expire').value;
      const isPrivate = document.getElementById('private').checked;
      if (!text || !userKey) return alert('Missing content or not logged in.');

      const enc = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, userKey, enc.encode(text));

      const keyHash = arrayToBase64(iv); // use IV for shareable decryption key (simplified)

      const payload = {
        content: arrayToBase64(encrypted),
        iv: keyHash,
        expire,
        private: isPrivate
      };

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const url = location.origin + '/' + data.id + '#' + keyHash;
      document.getElementById('result').innerHTML = `Paste URL: <a href="${url}" target="_blank">${url}</a>`;
    }

    async function loadPaste(id) {
      const res = await fetch('/' + id);
      const json = await res.json();

      const iv = Uint8Array.from(atob(json.iv), c => c.charCodeAt(0));
      const content = Uint8Array.from(atob(json.content), c => c.charCodeAt(0));

      const keyFromHash = window.location.hash.slice(1);
      if (!keyFromHash) return alert('Missing encryption key from URL');

      const ivBuf = Uint8Array.from(atob(keyFromHash), c => c.charCodeAt(0));

      if (!userKey) return alert('Please login to decrypt');

      const decrypted = await crypto.subtle.decrypt({name: 'AES-GCM', iv: ivBuf}, userKey, content);
      document.getElementById('paste').value = new TextDecoder().decode(decrypted);
      document.getElementById('result').innerText = 'Editing existing paste';

      // fetch view count (simulated for now)
      fetch(`/views/${id}`).then(r => r.text()).then(count => {
        document.getElementById('views').innerText = `Views: ${count}`;
      });
    }

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length === 1) {
      window.onload = () => setTimeout(() => loadPaste(pathParts[0]), 500);
    }
  </script>
</body>
</html>
