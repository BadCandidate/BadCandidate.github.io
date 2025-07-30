# Waline Comments Setup

This project now uses Waline for comments instead of Disqus. Here's what you need to do to set up Waline:

## 1. Set up Waline Server

You need to deploy a Waline server. The easiest way is using Vercel:

1. Fork the [Waline repository](https://github.com/walinejs/waline)
2. Deploy to Vercel using their template
3. Get your server URL (e.g., `https://your-waline-server.vercel.app`)

## 2. Update Server URL

In `public/js/in.js`, update the `serverURL` in the `initWaline` function:

```javascript
serverURL: 'https://your-waline-server.vercel.app', // Replace with your server URL
```

## 3. Features

- **Theme Support**: Automatically adapts to light/dark theme
- **Vietnamese Localization**: All text is in Vietnamese
- **Anonymous Comments**: Users can comment without registration
- **Moderation**: Admin panel for comment moderation
- **Responsive**: Works on mobile and desktop

## 4. Configuration Options

The current configuration includes:

- **Avatar**: MonsterID avatars
- **Required Fields**: Only nickname is required
- **Page Size**: 10 comments per page
- **Word Limit**: No limit
- **Login**: Enabled for admin features

## 5. Customization

You can customize Waline by modifying the configuration in `public/js/in.js`:

- Change avatar style
- Modify required fields
- Adjust page size
- Add custom CSS variables for theming

## 6. Migration from Disqus

- Comments from Disqus will not be migrated automatically
- Users will need to re-comment using Waline
- The comment system is now self-hosted and more privacy-friendly

## 7. Troubleshooting

If comments don't load:
1. Check that the server URL is correct
2. Ensure the Waline server is running
3. Check browser console for errors
4. Verify CORS settings on your Waline server 