# Postman Setup for Feature Flags API Testing

## Base URL
```
http://localhost:8080/api/node
```

## Authentication
All endpoints (except login) require JWT token in Authorization header.

### 1. Login Endpoint
**Endpoint:** `POST /admin/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "luthor@lexcorp.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "user_id": 1,
    "email": "luthor@lexcorp.com",
    "role": "ADMIN",
    "name": "Lex Luthor"
  }
}
```

**Steps:**
1. Copy the `token` value
2. Simpan di Postman Environment Variable atau gunakan untuk endpoint selanjutnya

---

## Setup Authorization Header
Di Postman, untuk semua request berikutnya:

1. **Tab "Authorization"** → Pilih type **"Bearer Token"**
2. Paste token dari login response di field "Token"

Atau di **Tab "Headers"** tambah manual:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Get Effective Feature Flag
**Endpoint:** `POST /admin/feature-flags/effective`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token_dari_login>
```

**Body (raw JSON):**
```json
{
  "userId": 1,
  "featureName": "auction_enabled"
}
```

**Possible featureName values:**
- `checkout_enabled`
- `chat_enabled`
- `auction_enabled`

**Response:**
```json
{
  "enabled": true,
  "scope": "ok",
  "reason": null
}
```

**Scope meanings:**
- `"global"` → Feature is globally disabled
- `"user"` → Feature is disabled for this specific user
- `"ok"` → Feature is enabled

---

## 3. Update Feature Flag
**Endpoint:** `PATCH /admin/feature-flags`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token_dari_login>
```

**Body (raw JSON):**
```json
{
  "userId": 2,
  "featureName": "auction_enabled",
  "isEnabled": false,
  "reason": "Testing feature flag update"
}
```

**Parameters:**
- `userId` (number, required): User ID to update the flag for
- `featureName` (string, required): One of the valid feature names above
- `isEnabled` (boolean, required): Enable or disable the feature
- `reason` (string, optional): Reason for the change

**Response:**
```json
{
  "message": "",
  "result": {
    "user_id": 2,
    "feature_name": "auction_enabled",
    "is_enabled": false,
    "reason": "Testing feature flag update"
  }
}
```

---

## Postman Environment Setup (Optional but Recommended)

### Create Environment Variable
1. Click **"Environments"** (left sidebar)
2. Click **"+"** or **"Create"**
3. Name: `Local Dev`
4. Add variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:8080/api/node` | `http://localhost:8080/api/node` |
| `token` | (empty) | (paste token here) |

### Use Variables in Requests
- **URL:** `{{base_url}}/admin/login`
- **Authorization Bearer Token:** `{{token}}`
- **Body:** Still paste JSON directly

---

## Test Sequence

### Test 1: Login
1. POST `{{base_url}}/admin/login`
2. Copy token dari response
3. Paste ke Environment variable `token`

### Test 2: Check Effective Flag (Before Update)
1. POST `{{base_url}}/admin/feature-flags/effective`
2. Body: `{"userId": 2, "featureName": "auction_enabled"}`
3. Note the response

### Test 3: Update Flag
1. PATCH `{{base_url}}/admin/feature-flags`
2. Body: `{"userId": 2, "featureName": "auction_enabled", "isEnabled": false, "reason": "Test"}`
3. Should get 200 OK

### Test 4: Verify Update
1. POST `{{base_url}}/admin/feature-flags/effective`
2. Body: `{"userId": 2, "featureName": "auction_enabled"}`
3. Check if `"enabled"` is now `false`

---

## Error Handling

### 401 Unauthorized
**Problem:** Invalid or expired token
**Solution:** Re-login and get new token

### 500 Internal Server Error
**Problem:** Invalid `featureName` or database error
**Solution:** 
- Check featureName is one of: `checkout_enabled`, `chat_enabled`, `auction_enabled`
- Check userId exists in database

### 400 Bad Request
**Problem:** Missing required fields
**Solution:** 
- Ensure `featureName`, `isEnabled` are provided for PATCH
- Ensure `userId`, `featureName` are provided for POST

---

## Tips

1. **Use Pre-request Script** to auto-extract token (advanced):
   ```javascript
   // After login, copy this to "Pre-request Script" tab
   if (pm.response.code === 200) {
     let jsonData = pm.response.json();
     pm.environment.set("token", jsonData.token);
   }
   ```

2. **Tests Tab** untuk auto-verify:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has token", function () {
       pm.expect(pm.response.json()).to.have.property("token");
   });
   ```

3. **Save as Collection** untuk reuse later

---

## Quick Reference

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/admin/login` | Get JWT token | No |
| POST | `/admin/feature-flags/effective` | Check flag status | Yes |
| PATCH | `/admin/feature-flags` | Update flag | Yes |
| GET | `/admin/me` | Get current admin | Yes |
| POST | `/admin/dashboard` | Get all users | Yes |
