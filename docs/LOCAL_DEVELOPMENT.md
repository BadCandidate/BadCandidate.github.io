# Local Development with Waline

## Quick Fix for Localhost

The current setup uses a demo Waline server that should work on localhost. If you're still having issues, here are the solutions:

## Option 1: Use Demo Server (Current Setup)
The code now uses `https://waline-demo.vercel.app` which should work on localhost.

## Option 2: Disable Comments for Local Development
If you want to disable comments during local development, modify `public/js/in.js`:

```javascript
// Comment out or remove the Waline initialization
// initWaline(currentTheme);
```

## Option 3: Set up Local Waline Server

1. **Install Waline locally:**
```bash
npm install @waline/vercel
```

2. **Create a local server file** (e.g., `waline-server.js`):
```javascript
const Waline = require('@waline/vercel/edge');

module.exports = Waline({
  // Your configuration
});
```

3. **Update the server URL** in `public/js/in.js`:
```javascript
serverURL: 'http://localhost:3000/api/waline',
```

## Option 4: Use a Different Comment System

If Waline continues to cause issues, you can temporarily use a simpler solution:

### Simple Comments (No Server Required)
Replace the Waline container with a simple form:

```html
<div id="comments-container">
    <div class="simple-comments">
        <h3>💬 Nhận Xét</h3>
        <form id="comment-form">
            <input type="text" id="comment-name" placeholder="Tên của bạn" required>
            <textarea id="comment-text" placeholder="Nhận xét của bạn" required></textarea>
            <button type="submit">Gửi</button>
        </form>
        <div id="comments-list"></div>
    </div>
</div>
```

## Troubleshooting

1. **Check Browser Console** for errors
2. **Network Tab** - see if requests to Waline server are failing
3. **CORS Issues** - Waline server might not allow localhost
4. **Server Status** - verify the demo server is running

## Current Status

- ✅ Waline CSS/JS loaded
- ✅ Error handling added
- ✅ Fallback message if Waline fails
- ✅ Demo server configured

The comments should now work on localhost with the demo server. If not, check the browser console for specific error messages. 