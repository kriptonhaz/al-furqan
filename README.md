# Al-Furqan - Holy Quran Web Application

Experience the Holy Quran with beautiful recitation, translations, and spiritual guidance. Discover the divine wisdom that has guided humanity for over 1400 years.

🌐 **Live Demo**: [https://al-furqan-web.netlify.app/](https://al-furqan-web.netlify.app/)


https://github.com/user-attachments/assets/bf5da725-51f6-445f-a9d0-2d14b009791c



## ✨ Features

### Quran Experience
- 📖 **Complete Quran**: All 114 Surahs with original Arabic text
- 🌍 **Multiple Translations**: Access various translations in different languages
- 🎵 **Beautiful Recitations**: Listen to melodious recitations by renowned Qaris
- 🔊 **Audio Controls**: Play, pause, and navigate through verses with audio
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### User Interface
- 🎨 **Modern UI**: Clean and intuitive interface built with Tailwind CSS
- 🌙 **Accessibility**: Designed with accessibility best practices
- 🔍 **Easy Navigation**: Quick access to any Surah or verse
- 📋 **Verse Numbers**: Traditional Arabic-Indic numerals for authentic experience

### Technical Features
- ⚡ **Fast Performance**: Built with modern web technologies for optimal speed
- 🔄 **Real-time Updates**: Dynamic content loading and state management
- 🛠️ **Type Safety**: Full TypeScript implementation for reliability
- 📦 **Modular Architecture**: Clean, maintainable codebase structure

## 🛠️ Tech Stack

### Frontend Framework
- **TanStack Start** - Full-stack React framework
- **TanStack Router** - Type-safe routing
- **React 19** - Latest React with modern features

### State Management
- **TanStack Store** - Lightweight state management
- **TanStack Query** - Server state management and caching

### Styling & UI
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Class Variance Authority** - Component variants

### API & Data
- **Quran Foundation API** - Official Quran data source
- **Ky** - HTTP client for API requests
- **TypeScript** - Type safety and developer experience

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting with TanStack config
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework

### Deployment
- **Netlify** - Hosting and continuous deployment
- **Bun** - Fast package manager and runtime

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/al-furqan.git
cd al-furqan
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
bun run build
```

### Testing

```bash
bun run test
```

### Linting & Formatting

```bash
bun run lint    # Check for linting errors
bun run format  # Format code
bun run check   # Format and fix linting issues
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix UI + Tailwind)
│   ├── Header.tsx      # Navigation header
│   ├── MiniPlayer.tsx  # Audio player component
│   └── ...
├── routes/             # File-based routing
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Home page
│   ├── surah/          # Surah pages
│   └── api/            # API routes
├── stores/             # TanStack Store state management
│   ├── audioStore.ts   # Audio playback state
│   ├── translationStore.ts # Translation preferences
│   └── ...
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles.css          # Global styles
```

## 🎯 Next Milestone
- Add Tafsir
- Add Bookmark
- Add Gharib marker

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Quran Foundation** for providing the official Quran API
- **TanStack** for the excellent React ecosystem tools
- **Radix UI** for accessible component primitives
- All the Qaris whose beautiful recitations are featured in this application

---

*"And We have certainly made the Quran easy for remembrance, so is there any who will remember?" - Quran 54:17*
