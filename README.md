# Instagram Pull

A modern web application for downloading Instagram posts, stories, and reels with seamless iOS Shortcuts integration.

Built by **Ian Musa**

## Features

- 🎯 Download Instagram posts, stories, and reels
- 📱 iOS Shortcuts integration
- 🚀 No external APIs required
- 🎨 Modern, responsive UI
- 📋 Simple and fast processing

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **UI Components**: shadcn/ui
- **Instagram Integration**: [instagram-url-direct](https://github.com/victorsouzaleal/instagram-direct-url)

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/instagram-pull.git
cd instagram-pull
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

This application uses the `instagram-url-direct` npm package which:
- Directly extracts media URLs from Instagram posts
- Works without requiring any external APIs or API keys
- Handles posts, reels, and IGTV content
- Returns direct CDN links for downloading

**No API keys or external services required!**

## Supported Content

- ✅ Public Instagram posts
- ✅ Instagram reels
- ✅ IGTV videos
- ❌ Private posts (not accessible)
- ❌ Stories (limited support)

## API Usage

### Download Endpoint

**URL**: \`POST /api/download\`

**Headers**:
\`\`\`
Content-Type: application/json
\`\`\`

**Body**:
\`\`\`json
{
  "url": "https://www.instagram.com/p/example/"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "media": [
    {
      "url": "https://scontent.cdninstagram.com/...",
      "type": "image",
      "thumbnail": "https://scontent.cdninstagram.com/..."
    }
  ],
  "postType": "post",
  "postInfo": {
    "owner_username": "username",
    "owner_fullname": "Full Name",
    "likes": 1234,
    "is_verified": false
  }
}
\`\`\`

### Error Response:
\`\`\`json
{
  "success": false,
  "error": "Invalid Instagram URL",
  "media": []
}
\`\`\`

## iOS Shortcuts Integration

### Quick Setup

1. **Create New Shortcut** in iOS Shortcuts app
2. **Add "Get URLs from Input"** action
3. **Add "Get Contents of URL"** action:
   - URL: \`https://your-domain.com/api/download\`
   - Method: \`POST\`
   - Headers: \`Content-Type: application/json\`
   - Body: \`{"url": "[URLs from Input]"}\`
4. **Add "Get Dictionary Value"** for "media"
5. **Add "Repeat with Each"** for media array
6. **Add "Get Dictionary Value"** for "url" inside repeat
7. **Add "Download URL"** to save media

### Detailed Instructions

[Previous detailed iOS Shortcuts instructions remain the same...]

## Troubleshooting

### Common Issues

1. **"CSRF token not found"**
   - This is temporary - Instagram sometimes blocks requests
   - Wait a few minutes and try again
   - Try with a different post

2. **"No media found"**
   - Check if the post is public
   - Verify the URL is correct
   - Some posts might have restricted content

3. **Download fails**
   - The media URL might have expired
   - Try processing the URL again

### Tips for Best Results

- Use public Instagram posts
- Copy the URL directly from Instagram
- Don't make too many requests in quick succession
- If one post fails, try another

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy (no environment variables needed!)

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Commit your changes: \`git commit -am 'Add feature'\`
4. Push to the branch: \`git push origin feature-name\`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is for educational and personal use only. Please respect Instagram's Terms of Service and copyright laws. Only download content you have permission to download.

## Support

If you encounter any issues:

1. Check if the Instagram post is public
2. Try with a different post URL
3. Wait a few minutes if you get CSRF errors
4. Create an issue on GitHub with details

## Acknowledgments

- [instagram-url-direct](https://github.com/victorsouzaleal/instagram-direct-url) - Core Instagram extraction
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Next.js](https://nextjs.org/) - React framework

---

**Built with ❤️ by Ian Musa**

*No APIs, no keys, just simple Instagram downloading!*
