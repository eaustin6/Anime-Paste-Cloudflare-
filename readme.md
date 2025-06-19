# AnimePaste

A lightweight, encrypted, anime-themed Pastebin clone built with **Cloudflare Pages Functions** and **KV Storage**.

## 🌟 Features

- Paste creation & retrieval
- Optional dark mode toggle
- Expiration options (1h, 1d, 1w, never)
- Optional private pastes
- AES-GCM encryption (client-side)
- Password-based paste login
- Shareable encrypted URLs
- View counter for each paste

---

## 📁 Folder Structure

```
/functions
  index.js          ← Create a new paste
  [id].js           ← Retrieve & increment view count
  views/[id].js     ← Return view count
/static
  index.html        ← Frontend UI (Anime styled)
```

---

## 🔧 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-repo/animepaste
cd animepaste
```

### 2. Configure `wrangler.toml`

Create this config file:

```toml
name = "animepaste"
type = "javascript"
compatibility_date = "2024-06-01"

kv_namespaces = [
  { binding = "PASTES", id = "<PASTES_KV_ID>", preview_id = "<PASTES_KV_ID>" },
  { binding = "PASTE_VIEWS", id = "<VIEWS_KV_ID>", preview_id = "<VIEWS_KV_ID>" }
]
```

> 🔐 Replace `<PASTES_KV_ID>` and `<VIEWS_KV_ID>` with your real Cloudflare KV namespace IDs from the dashboard.

### 3. Deploy to Cloudflare Pages

- Push to GitHub
- Link the repo on **Cloudflare Pages**
- Enable **Functions**
- Set environment variables if needed

---

## 🖼️ Frontend Highlights

- Paste form with expiration, privacy checkbox
- Login box for encryption password (AES key derived using PBKDF2)
- Generates a shareable encrypted URL (with IV as key in hash `#`)
- Supports paste reloading/decryption via URL
- Shows live view count from backend KV

---

## 📜 API Endpoints

### `POST /`

Create a paste

```json
{
  "content": "Base64EncryptedText",
  "iv": "Base64IV",
  "expire": "1h|1d|1w|never",
  "private": true
}
```

Returns:

```json
{ "id": "abcdefg" }
```

### `GET /:id`

Returns encrypted paste (and increments view count).

### `GET /views/:id`

Returns plain text view count for the paste.

---

## 🛠️ To-Do / Extensions

- Auto-deletion logic by expiration
- Full authentication (e.g., via GitHub or Cloudflare Access)
- User paste dashboard
- Search or tag system

---

## 🤖 GitHub Actions CI/CD

To enable automatic deployment:

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Publish
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: animepaste
          directory: .
```

2. Add secrets to your GitHub repo:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -am 'Add foo feature'`)
4. Push to the branch (`git push origin feature/foo`)
5. Open a pull request ❤️

---

## 💌 Credits

- Inspired by [Pastebin](https://pastebin.com)
- Anime theme using Noto Sans JP + Fira Code
- Powered by Cloudflare Pages + KV + Web Crypto API

---

## 📄 License

MIT License

```
MIT License

Copyright (c) 2025 AnimePaste

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

