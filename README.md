# Instagram Pull

A modern web application for downloading Instagram posts, stories, and reels with seamless iOS Shortcuts integration.

Built by **Ian Musa**

## Features

- 🎯 **Download Everything**: Handles single photos, carousel posts, reels, and videos.
- 📱 **iOS Shortcuts Integration**: One-tap downloading from the Instagram app.
- 🚀 **No External APIs**: Works directly with Instagram, no third-party services or keys required.
- 🎨 **Modern & Responsive UI**: Clean and easy to use on any device.
- 🔒 **Privacy-Focused**: No login required. All processing happens on the server.

## Tech Stack

- **Framework**: Next.js 15 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes

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

This application uses a custom-built scraper that fetches media information directly from Instagram's GraphQL API. This method is more robust and reliable than legacy approaches.

1.  **Input**: Takes a public Instagram post URL.
2.  **Extraction**: The backend makes a server-side request to Instagram's internal API to retrieve the post's data, including direct links to all photos and videos.
3.  **Response**: Returns a clean JSON object with CDN URLs for all media, which can be downloaded directly.

**No API keys or external services are required!**

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

Set up a shortcut to download any Instagram post directly from the share sheet.

**Final Shortcut Preview:**
![Final Shortcut](https://i.imgur.com/example.png) *(This is a placeholder, a real screenshot would go here)*

### Step-by-Step Instructions

1.  **Create a New Shortcut**
    - Open the **Shortcuts** app and tap the **+** icon to create a new shortcut.
    - Tap "Add Action".

2.  **Receive Input from Share Sheet**
    - Search for and add the **"Get URL from Input"** action. This allows the shortcut to accept the Instagram link when you use the Share button in the app.
    - Tap the blue "Any" text and ensure that **"Shortcut Input"** is selected.

3.  **Make the API Request**
    - Search for and add the **"Get Contents of URL"** action.
    - Configure it as follows:
        - **URL**: `https://your-deployed-app-url.com/api/download` (Replace with your Vercel URL).
        - **Method**: Tap "GET" and change it to **POST**.
        - **Headers**: Add **two** headers:
            - **Header 1**:
              - **Key**: `Content-Type`
              - **Text**: `application/json`
            - **Header 2 (Important for reliability)**:
              - **Key**: `X-Client-Type`
              - **Text**: `shortcut`
        - **Request Body**: Select **JSON** and add a new field:
            - **Key**: `url`
            - **Text**: Tap the "Text" field, select the "Magic Wand" icon (or variable icon), and choose **URL**. This passes the Instagram link to the API.

    ![API Request Setup](https://i.imgur.com/example2.png) *(Placeholder)*

4.  **Process the Response**
    - Add a **"Get Dictionary from Input"** action. Set the input to **Contents of URL**.
    - Add a **"Get Dictionary Value"** action. Set the key to **media**. This extracts the list of media items.

5.  **Loop Through Media and Download**
    - Add a **"Repeat with Each"** action. The input should automatically be the **Dictionary Value** from the previous step.
    - Inside the `Repeat` block, add another **"Get Dictionary Value"** action. Set the key to **url**. This gets the direct download URL for each photo/video.
    - Finally, add a **"Save to Photo Album"** action. The input should be the **Dictionary Value** from the step above. You can choose which album to save to.

6.  **Name and Configure the Shortcut**
    - Give your shortcut a name (e.g., "Insta-Pull").
    - Tap the **(i)** icon at the bottom and enable **"Show in Share Sheet"**. This makes it accessible from Instagram.

Now, go to any public Instagram post, tap the Share button, and select "Insta-Pull" from the list to download all its media!

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

- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Next.js](https://nextjs.org/) - React framework

---

**Built with ❤️ by Ian Musa**

*No APIs, no keys, just simple Instagram downloading!*
