# AI Prototyper - Figma Plugin

Import mockups created by AI Prototyper directly into Figma with proper frames, auto-layout, and components.

## Installation

1. Open Figma Desktop
2. Go to **Plugins → Development → Import plugin from manifest...**
3. Select the `manifest.json` file from this folder

## Usage

1. Generate a mockup in AI Prototyper (web app)
2. Click the **"Figma"** button in the toolbar
3. JSON is copied to your clipboard
4. In Figma, run the AI Prototyper plugin
5. Paste JSON and click **"Create Mockup"**

## What Gets Created

- **Frames**: iPhone 15 Pro sized (393x852) with rounded corners
- **Auto-layout**: All elements use proper Figma auto-layout
- **Components**: Text, buttons, inputs, images, boxes, cards, list items
- **Styling**: Matches the web preview (dark theme, purple accent)

## Component Support

| Element Type | Figma Equivalent |
|--------------|------------------|
| text | Text with Inter font |
| button | Frame with text (primary/secondary/outline) |
| input | Frame with placeholder text |
| image | Gradient placeholder frame |
| box | Auto-layout frame (horizontal/vertical) |
| card | Card with image + content + action |
| listItem | Row with leading/content/trailing |
| divider | Line |
| spacer | Empty frame with fixed height |

## Customization

After import, you can:
- Replace placeholder images with real assets
- Edit text content
- Adjust colors and styles
- Add interactions and prototyping flows
