# Feedly Clone

A modern RSS feed reader built with React, TypeScript, and Tailwind CSS. This application allows users to subscribe to RSS feeds, organize them into collections, and read articles in a clean, distraction-free interface.

## Features

- 📱 Responsive design that works on desktop and mobile
- 📂 Organize feeds into collections with custom colors
- ⭐ Bookmark favorite articles for later reading
- 🔄 Auto-refresh feeds every 5 minutes
- 📖 Mark articles as read/unread
- 💾 Persistent storage using Firebase
- 🎨 Clean, modern UI with Tailwind CSS
- 🤖 AI-powered article analysis and categorization
- 📝 LinkedIn post generation with AI assistance
- 💬 Interactive AI chat for post refinement

## AI Features

### Article Analysis
- Automatically detect AI-related content
- Bulk analysis of all articles
- Customizable analysis prompts
- Dedicated AI articles section

### LinkedIn Post Generation
- Generate professional LinkedIn posts from articles
- Customize tone, audience, and industry focus
- Include automatic hashtags and calls-to-action
- AI-powered chat interface for post refinement
- Save and manage multiple post versions
- Full post history and chat conversations

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Firebase (Database & Auth)
- Zustand (State Management)
- date-fns (Date Formatting)
- Lucide React (Icons)
- Vite (Build Tool)
- Ollama (Local AI Integration)

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Ollama installed locally (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/feedly-clone.git
cd feedly-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file with the following:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OLLAMA_URL=http://localhost:11434
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

1. Create a production build:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

## Usage

1. **Adding Collections**
   - Click the "+" button in the sidebar
   - Enter a collection name
   - Choose a color
   - Click "Add Collection"

2. **Adding Feeds**
   - Click the RSS icon in the sidebar
   - Enter the RSS feed URL
   - Select a collection (or create a new one)
   - Click "Add Feed"

3. **Reading Articles**
   - Click on a collection to view its feeds
   - Articles are displayed in chronological order
   - Use the bookmark icon to save favorites
   - Use the book icon to mark as read/unread

4. **Managing Favorites**
   - Click the star icon in the sidebar to view bookmarked articles
   - Toggle favorites by clicking the star icon on any article

5. **AI Analysis**
   - Click the brain icon to analyze individual articles
   - Use the "Analyze All Articles" button for bulk analysis
   - Configure AI settings through the settings dialog
   - View AI-detected articles in the AI Articles section

6. **LinkedIn Post Generation**
   - Click the LinkedIn icon on any article
   - Customize post parameters (tone, audience, etc.)
   - Generate and refine posts with AI assistance
   - Use the chat interface for post improvements
   - Copy final posts to clipboard

## License

MIT License - feel free to use this project for personal or commercial purposes.