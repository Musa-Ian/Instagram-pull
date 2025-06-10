# Troubleshooting Guide

## Installation Issues

### 1. Package Installation
If you're getting import errors, try these steps:

\`\`\`bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Specifically install the Instagram package
npm install instagram-url-direct@latest --save
\`\`\`

### 2. Check Package Installation
\`\`\`bash
# Check if the package is installed
npm ls instagram-url-direct

# Check package contents
ls node_modules/instagram-url-direct/
\`\`\`

### 3. Alternative Package Versions
If the current version doesn't work, try:

\`\`\`bash
# Try different versions
npm install instagram-url-direct@1.0.12
# or
npm install instagram-url-direct@1.0.11
\`\`\`

## Runtime Issues

### 1. Import Errors
- The code now tries multiple import methods
- Check browser console for detailed error messages
- Ensure you're using Node.js 18+ 

### 2. CSRF Token Errors
- This is temporary from Instagram's side
- Wait 5-10 minutes and try again
- Try with different Instagram URLs

### 3. No Media Found
- Ensure the Instagram post is public
- Check if the URL format is correct
- Some posts might have restricted content

## Testing

### Test URLs
Try these public Instagram posts for testing:

\`\`\`
https://www.instagram.com/p/[public-post-id]/
https://www.instagram.com/reel/[public-reel-id]/
\`\`\`

### Debug Mode
Set \`NODE_ENV=development\` to see detailed error messages.

## Alternative Solutions

If the primary package doesn't work, the code includes:
1. HTML scraping fallback
2. Meta tag extraction
3. JSON-LD data parsing

## Getting Help

1. Check the browser console for errors
2. Look at the server logs
3. Try with different Instagram URLs
4. Ensure the post is public and accessible
\`\`\`
