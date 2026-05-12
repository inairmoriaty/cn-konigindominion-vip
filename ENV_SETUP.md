# Environment Variables Setup Guide

## Room IDs

The following 29 room IDs require a password environment variable each:

| Room ID | Variable Name   |
|---------|-----------------|
| 201     | PASS_201        |
| 202     | PASS_202        |
| 203     | PASS_203        |
| 204     | PASS_204        |
| 205     | PASS_205        |
| 206     | PASS_206        |
| 207     | PASS_207        |
| 208     | PASS_208        |
| 209     | PASS_209        |
| 210     | PASS_210        |
| 211     | PASS_211        |
| 212     | PASS_212        |
| 213     | PASS_213        |
| 214     | PASS_214        |
| 215     | PASS_215        |
| 216     | PASS_216        |
| 217     | PASS_217        |
| 218     | PASS_218        |
| 219     | PASS_219        |
| 220     | PASS_220        |
| 221     | PASS_221        |
| 222     | PASS_222        |
| 223     | PASS_223        |
| 224     | PASS_224        |
| 225     | PASS_225        |
| 226     | PASS_226        |
| 227     | PASS_227        |
| 228     | PASS_228        |
| master  | PASS_MASTER     |

Plus one shared secret:

| Variable      | Description                                      |
|---------------|--------------------------------------------------|
| TOKEN_SECRET  | A long random string used to sign session tokens |

---

## Step-by-Step: Adding Variables in Vercel Dashboard

1. Open your project at https://vercel.com/dashboard
2. Click your project → **Settings** tab
3. In the left sidebar, click **Environment Variables**
4. For each variable in the table above:
   - Click **Add New**
   - Enter the **Name** (e.g. `PASS_227`)
   - Enter the **Value** (the room's password)
   - Select environment: **Production** (and Preview/Development if needed)
   - Click **Save**
5. Repeat for all 29 `PASS_*` variables and `TOKEN_SECRET`
6. After adding all variables, **redeploy** your project for the changes to take effect

---

## TOKEN_SECRET

Set `TOKEN_SECRET` to a long, random, hard-to-guess string. You can generate one with:

```bash
openssl rand -base64 32
```

Or use any password generator set to at least 32 characters.

**Never share or commit this value.** It signs the session tokens that grant access to protected pages.

---

## How It Works

1. Visitor enters a password on a `/locked_files/` page
2. The browser calls `POST /api/verify-password` with `{ room, password }`
3. The API checks the password against the matching `PASS_*` env var
4. On success, a time-limited token (valid 24 hours) is returned and stored in `sessionStorage`
5. Protected pages at `/page/private/` validate the token on every load via `POST /api/validate-token`
6. If the token is missing or expired, the visitor is redirected back to the password page
