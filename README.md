# AI Prototyper

<p align="center">
  <strong> Transform your app ideas into professional mobile mockups in seconds using AI</strong>
</p>

<p align="center">
  <a href="#preview">
    <img src="https://img.shields.io/badge/Live-Preview-8B5CF6?style=for-the-badge" alt="Preview"/>
  </a>
  <a href="https://build.nvidia.com">
    <img src="https://img.shields.io/badge/Powered_by-NVIDIA_NIM-76B900?style=for-the-badge&logo=nvidia" alt="NVIDIA NIM"/>
  </a>
  <a href="#quick-start">
    <img src="https://img.shields.io/badge/Get-Started-06B6D4?style=for-the-badge" alt="Get Started"/>
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#preview">Preview</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api-reference">API Reference</a>
</p>

---

## Overview

**AI Prototyper** is a powerful web-based tool that generates professional mobile app mockups from natural language descriptions. Powered by **NVIDIA NIM** (Llama 3.1 models), it enables designers, developers, and product managers to rapidly prototype app concepts without any design skills.

> Simply describe your app idea—like *"a fitness tracking app with workout plans and progress charts"*—and watch as AI Prototyper generates complete, interactive wireframes with multiple screens, navigation flows, and realistic UI components.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **Text-to-Mockup** | Describe your app in plain English, get professional wireframes |
| **Multi-Screen Flows** | Generates 3-8 interconnected screens with navigation paths |
| **AI-Powered Editing** | Select elements and describe changes in natural language |
| **Device Frames** | iPhone 15 Pro dimensions with proper safe areas |
| **PDF Export** | Generate presentation-ready documentation |
| **Figma Integration** | Export JSON and import directly into Figma via plugin |

---

## Preview

<p align="center">
  <img src="screenshots/img1.png" alt="Main Interface" width="800"/>
  <br/>
  <em>Main Interface - Describe your app idea and select generation options</em>
</p>

<p align="center">
  <img src="screenshots/img2.png" alt="Generated Mockup" width="800"/>
  <br/>
  <em>Generated Mockup - AI-generated screens with navigation flows</em>
</p>

<p align="center">
  <img src="screenshots/img3.png" alt="AI Editing" width="800"/>
  <br/>
  <em>AI Editing - Select elements and describe changes in natural language</em>
</p>

---

## Features

###  Intelligent Generation Pipeline

AI Prototyper uses a **two-step progressive generation** approach for optimal results:

1. **Product Analysis** (Fast Model: Llama 3.1 8B)
   - Extracts structured product requirements from vague prompts
   - Identifies target personas, key screens, and user flows
   - Generates app name, tagline, and success metrics

2. **Screen Design** (Quality Model: Llama 3.1 70B)
   - Creates detailed UI elements for each screen
   - Uses realistic placeholder content (names, prices, timestamps)
   - Maintains consistency across the app

###  Rich Component System

| Component | Description | Variants |
|-----------|-------------|----------|
| `header` | Navigation header with optional back button | Default, with actions |
| `listItem` | Versatile list row with leading icon | With subtitle, trailing text |
| `card` | Product/content card with image | With price, action button |
| `stat` | Metric display | With trend indicator |
| `tabs` | Horizontal navigation tabs | Multiple items |
| `toggle` | Settings switch | On/off states |
| `navbar` | Bottom navigation | 3-5 items |
| `button` | Action button | Primary, secondary, outline |
| `input` | Text input field | With icons |
| `box` | Container layout | Card, row, column, highlight |

###  Generation Modes

| Mode | Screens | Best For |
|------|---------|----------|
| **Full App** | 6-8 | Complete product demos |
| **MVP** | 4-5 | Startup pitches, quick prototypes |
| **Investor Pitch** | 3 | Fundraising decks, demos |

###  Style Presets

- **Minimal**: Clean, whitespace-focused designs
- **Modern**: Contemporary gradients and shadows
- **Bold**: High contrast, prominent typography
- **Premium**: Glassmorphism, subtle animations

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- NVIDIA NIM API Key ([Get one free at build.nvidia.com](https://build.nvidia.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aiprototyper.git
cd aiprototyper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your NVIDIA NIM API key:
# VITE_NIM_API_KEY=nvapi-your-key-here

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_NIM_API_KEY` | NVIDIA NIM API key for LLM access | Yes |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Vite)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Canvas  │  │   Chat   │  │  Export  │  │ Settings │         │
│  │Component │  │  Panel   │  │  Modal   │  │  Modal   │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │             │             │             │               │
│       └─────────────┴─────────────┴─────────────┘               │
│                          │                                      │
│                    ┌─────┴─────┐                                │
│                    │   Store   │  (Pub/Sub State Management)    │
│                    └─────┬─────┘                                │
│                          │                                      │
│                    ┌─────┴─────┐                                │
│                    │  NIM API  │  (API Service Layer)           │
│                    │  Service  │                                │
│                    └─────┬─────┘                                │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │ Vite Proxy  │  (CORS Handling)
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  NVIDIA NIM │  (LLM Inference)
                    │     API     │
                    └─────────────┘
```

### Project Structure

```
aiprototyper/
├── index.html              # Main HTML entry point
├── vite.config.js          # Vite configuration with API proxy
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (API keys)
│
├── src/
│   ├── main.js             # Application entry point & App class
│   ├── style.css           # Global styles and design tokens
│   ├── wireframe.css       # Wireframe component styles
│   │
│   ├── components/
│   │   ├── Canvas.js       # Infinite canvas with pan/zoom
│   │   ├── Screen.js       # Screen frame renderer
│   │   ├── Element.js      # UI element renderer
│   │   ├── WireframeElement.js  # Enhanced element rendering
│   │   ├── FlowArrows.js   # Screen connection arrows
│   │   └── ComponentRegistry.js # Component type definitions
│   │
│   ├── services/
│   │   ├── nimApi.js       # NVIDIA NIM API client
│   │   └── store.js        # Centralized state management
│   │
│   └── utils/
│       └── pdfExport.js    # PDF generation utility
│
└── figma-plugin/
    ├── manifest.json       # Figma plugin manifest
    ├── code.js             # Plugin logic (Figma API)
    └── ui.html             # Plugin UI
```

### Core Components

#### 1. NIM API Service (`src/services/nimApi.js`)

Handles all communication with NVIDIA NIM endpoints:

```javascript
class NIMApiService {
  // Two-step generation pipeline
  async analyzeProduct(prompt, options, onChunk)  // Step 1: Extract requirements
  async generateScreenDetails(screen, spec, onChunk)  // Step 2: Generate UI

  // Editing capabilities
  async editMockup(mockup, selectedItems, request)
  async editSingleScreen(screen, request)
  async editMockupWithVision(screen, imageBase64, request)  // Vision-based edits

  // Utilities
  parseJsonResponse(response)  // Robust JSON extraction from LLM output
}
```

**Key Features:**
- Streaming responses with progress callbacks
- Automatic JSON repair for malformed LLM outputs
- Model fallback (Vision → Text-based editing)
- Configurable models (8B for speed, 70B for quality, 340B for best)

#### 2. State Store (`src/services/store.js`)

Pub/sub state management pattern:

```javascript
const state = {
  mockup: null,              // Current mockup data
  selectedScreens: Set,      // Selected screen IDs
  selectedElements: Set,     // Selected element IDs (screenId:elementId)
  currentTool: 'pan',        // Active tool (pan/select)
  zoom: 1,                   // Canvas zoom level
  pan: { x: 0, y: 0 },       // Canvas pan offset
  chatMessages: [],          // Chat history
  isGenerating: false,       // Loading state
};

// Subscribe to changes
store.subscribe((state, oldState) => { ... });
```

#### 3. Canvas Component (`src/components/Canvas.js`)

Infinite canvas with:
- Pan and zoom (mouse wheel, trackpad)
- Circle selection tool for multi-select
- Keyboard shortcuts (H=pan, V=select, Esc=deselect)
- Transform-based rendering for performance

#### 4. Element Renderer (`src/components/Element.js`)

Renders 15+ UI component types into DOM elements with:
- Consistent styling via CSS custom properties
- SVG icon library for common actions
- Nested layout support (boxes within boxes)

---

## Data Models

### Mockup Schema

```typescript
interface Mockup {
  appName: string;
  screens: Screen[];
  flows: Flow[];
}

interface Screen {
  id: string;           // e.g., "screen-1"
  name: string;         // e.g., "Home"
  position: { x: number; y: number };
  elements: Element[];
}

interface Flow {
  from: string;         // Source screen ID
  to: string;           // Target screen ID
  label: string;        // Action description
  type: 'tap' | 'swipe' | 'submit' | 'navigate';
}
```

### Element Types

```typescript
type Element = 
  | TextElement 
  | ButtonElement 
  | InputElement 
  | ImageElement
  | BoxElement 
  | HeaderElement 
  | ListItemElement 
  | CardElement
  | StatElement 
  | TabsElement 
  | ToggleElement 
  | NavbarElement
  | DividerElement 
  | SpacerElement 
  | IconElement;

interface TextElement {
  type: 'text';
  content: string;
  style: 'heading' | 'subheading' | 'body' | 'muted' | 'label';
}

interface CardElement {
  type: 'card';
  title: string;
  subtitle?: string;
  price?: string;
  action?: string;
}

interface ListItemElement {
  type: 'listItem';
  title: string;
  subtitle?: string;
  leadingIcon?: string;
  trailingText?: string;
}
```

---

## API Reference

### NVIDIA NIM Integration

AI Prototyper uses NVIDIA NIM's OpenAI-compatible API:

**Endpoint:** `https://integrate.api.nvidia.com/v1/chat/completions`

**Supported Models:**
| Model | Use Case | Token Limit |
|-------|----------|-------------|
| `meta/llama-3.1-8b-instruct` | Fast analysis, screen details | 8192 |
| `meta/llama-3.1-70b-instruct` | High-quality generation | 8192 |
| `nvidia/nemotron-4-340b-instruct` | Highest quality | 8192 |
| `meta/llama-3.2-90b-vision-instruct` | Vision-based editing | 8192 |

**Request Format:**
```javascript
fetch('/api/nvidia/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'meta/llama-3.1-70b-instruct',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    stream: true,
    max_tokens: 8192,
    temperature: 0.7
  })
});
```

### Vite Proxy Configuration

API requests are proxied to avoid CORS issues:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api/nvidia': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
        secure: true,
      }
    }
  }
});
```

---

## Figma Plugin

The included Figma plugin allows direct import of generated mockups:

### Installation

1. Open Figma Desktop
2. Go to **Plugins → Development → Import plugin from manifest...**
3. Select `figma-plugin/manifest.json`

### Usage

1. Generate a mockup in AI Prototyper
2. Click **"Figma"** button to copy JSON
3. Open Figma and run the AI Prototyper plugin
4. Paste JSON and click **"Create Mockup"**

### Plugin Capabilities

- Creates properly structured Figma frames with Auto Layout
- Maps all component types to Figma equivalents
- Uses Inter font with proper weight variants
- Applies design tokens (colors, spacing, radius)
- Positions screens according to mockup coordinates

---

## Development

### Scripts

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Build | Vite 7.x | Fast development, HMR, bundling |
| Runtime | Vanilla JS (ES6+) | No framework overhead |
| Styling | CSS Custom Properties | Theming, design tokens |
| PDF Export | jsPDF + html2canvas | Client-side PDF generation |
| Fonts | Inter (Google Fonts) | Modern, readable typography |
| API | NVIDIA NIM | LLM inference (Llama 3.1) |

### Design Tokens

```css
:root {
  /* Colors */
  --accent: #8b5cf6;
  --accent-secondary: #06b6d4;
  --bg-primary: #0a0a0f;
  --bg-secondary: #18181b;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

---

## Production Deployment

### Build

```bash
npm run build
```

Outputs to `dist/` folder.

### Environment Variables in Production

For production, set environment variables on your hosting platform:

```
VITE_NIM_API_KEY=nvapi-xxxxxxxxxxxxx
```

### CORS Considerations

In production, you'll need to:
1. Use a backend proxy to forward NIM API requests, OR
2. Deploy your own API gateway, OR
3. Use NVIDIA's CORS-enabled endpoints (if available)

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request