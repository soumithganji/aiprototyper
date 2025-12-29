/**
 * AI Prototyper - Figma Plugin
 * Receives UI Spec JSON and builds Figma frames with components
 */

// Design tokens
const COLORS = {
    primary: { r: 0.545, g: 0.361, b: 0.965 },      // #8B5CF6
    secondary: { r: 0.024, g: 0.714, b: 0.831 },    // #06B6D4
    background: { r: 0.094, g: 0.094, b: 0.106 },   // #18181B
    surface: { r: 0.149, g: 0.149, b: 0.161 },      // #262629
    text: { r: 1, g: 1, b: 1 },                      // #FFFFFF
    textMuted: { r: 0.443, g: 0.443, b: 0.478 },    // #71717A
    border: { r: 0.212, g: 0.212, b: 0.224 }        // #363639
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
};

const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20
};

// Show the UI
figma.showUI(__html__, { width: 400, height: 500 });

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'create-mockup') {
        await createMockupFromSpec(msg.spec);
    }

    if (msg.type === 'cancel') {
        figma.closePlugin();
    }
};

/**
 * Create Figma mockup from UI Spec JSON
 */
async function createMockupFromSpec(spec) {
    // Load fonts
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });

    const screens = spec.screens || [];
    const createdFrames = [];

    for (let i = 0; i < screens.length; i++) {
        const screen = screens[i];
        const frame = await createScreen(screen, i);
        createdFrames.push(frame);
    }

    // Select and zoom to created frames
    figma.currentPage.selection = createdFrames;
    figma.viewport.scrollAndZoomIntoView(createdFrames);

    figma.notify(`Created ${createdFrames.length} screens for ${spec.appName || 'your app'}`);
}

/**
 * Create a single screen frame
 */
async function createScreen(screen, index) {
    // Create device frame (iPhone 15 Pro dimensions)
    const frame = figma.createFrame();
    frame.name = screen.name || `Screen ${index + 1}`;
    frame.resize(393, 852);
    frame.x = (screen.position?.x || index * 450);
    frame.y = (screen.position?.y || 0);

    // Background
    frame.fills = [{ type: 'SOLID', color: COLORS.background }];
    frame.cornerRadius = 44;
    frame.clipsContent = true;

    // Auto-layout for content
    frame.layoutMode = 'VERTICAL';
    frame.primaryAxisAlignItems = 'MIN';
    frame.counterAxisAlignItems = 'CENTER';
    frame.paddingTop = 60;
    frame.paddingBottom = 100;
    frame.paddingLeft = 20;
    frame.paddingRight = 20;
    frame.itemSpacing = 12;

    // Create elements
    for (const element of screen.elements || []) {
        const node = await createElement(element);
        if (node) {
            frame.appendChild(node);
        }
    }

    return frame;
}

/**
 * Create an element node from spec
 */
async function createElement(element) {
    switch (element.type) {
        case 'text':
            return createText(element);
        case 'button':
            return createButton(element);
        case 'input':
            return createInput(element);
        case 'image':
            return createImagePlaceholder(element);
        case 'box':
            return createBox(element);
        case 'divider':
            return createDivider();
        case 'spacer':
            return createSpacer(element);
        case 'card':
            return createCard(element);
        case 'listItem':
            return createListItem(element);
        default:
            return createText({ content: element.content || element.type, style: 'body' });
    }
}

/**
 * Create text node
 */
function createText(element) {
    const text = figma.createText();
    text.characters = element.content || 'Text';
    text.layoutSizingHorizontal = 'FILL';

    const styles = {
        heading: { size: 24, weight: 'Bold' },
        subheading: { size: 18, weight: 'Semi Bold' },
        body: { size: 14, weight: 'Regular' },
        muted: { size: 12, weight: 'Regular' },
        label: { size: 11, weight: 'Medium' }
    };

    const style = styles[element.style] || styles.body;
    text.fontSize = style.size;
    text.fontName = { family: 'Inter', style: style.weight };

    const color = element.style === 'muted' || element.style === 'label'
        ? COLORS.textMuted
        : COLORS.text;
    text.fills = [{ type: 'SOLID', color }];

    return text;
}

/**
 * Create button
 */
function createButton(element) {
    const frame = figma.createFrame();
    frame.name = 'Button';
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisAlignItems = 'CENTER';
    frame.counterAxisAlignItems = 'CENTER';
    frame.paddingTop = 14;
    frame.paddingBottom = 14;
    frame.paddingLeft = 24;
    frame.paddingRight = 24;
    frame.cornerRadius = RADIUS.md;
    frame.layoutSizingHorizontal = 'FILL';

    const isPrimary = element.variant !== 'secondary' && element.variant !== 'outline';

    if (isPrimary) {
        frame.fills = [{ type: 'SOLID', color: COLORS.primary }];
    } else if (element.variant === 'outline') {
        frame.fills = [];
        frame.strokes = [{ type: 'SOLID', color: COLORS.primary }];
        frame.strokeWeight = 2;
    } else {
        frame.fills = [{ type: 'SOLID', color: COLORS.surface }];
    }

    const text = figma.createText();
    text.characters = element.content || 'Button';
    text.fontSize = 15;
    text.fontName = { family: 'Inter', style: 'Semi Bold' };
    text.fills = [{ type: 'SOLID', color: COLORS.text }];
    text.textAlignHorizontal = 'CENTER';

    frame.appendChild(text);
    return frame;
}

/**
 * Create input field
 */
function createInput(element) {
    const frame = figma.createFrame();
    frame.name = 'Input';
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisAlignItems = 'MIN';
    frame.counterAxisAlignItems = 'CENTER';
    frame.paddingTop = 14;
    frame.paddingBottom = 14;
    frame.paddingLeft = 16;
    frame.paddingRight = 16;
    frame.itemSpacing = 12;
    frame.cornerRadius = RADIUS.md;
    frame.layoutSizingHorizontal = 'FILL';
    frame.fills = [{ type: 'SOLID', color: COLORS.surface }];
    frame.strokes = [{ type: 'SOLID', color: COLORS.border }];
    frame.strokeWeight = 1;

    const text = figma.createText();
    text.characters = element.placeholder || 'Enter text...';
    text.fontSize = 14;
    text.fontName = { family: 'Inter', style: 'Regular' };
    text.fills = [{ type: 'SOLID', color: COLORS.textMuted }];
    text.layoutSizingHorizontal = 'FILL';

    frame.appendChild(text);
    return frame;
}

/**
 * Create image placeholder
 */
function createImagePlaceholder(element) {
    const sizes = {
        small: { w: 48, h: 48 },
        medium: { w: 72, h: 72 },
        large: { w: 100, h: 100 },
        banner: { w: 353, h: 140 }
    };

    const size = sizes[element.size] || sizes.medium;

    const frame = figma.createFrame();
    frame.name = element.label || 'Image';
    frame.resize(size.w, size.h);
    frame.cornerRadius = element.size === 'banner' ? RADIUS.lg : RADIUS.md;

    // Gradient fill
    frame.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientStops: [
            { position: 0, color: { ...COLORS.primary, a: 0.3 } },
            { position: 1, color: { ...COLORS.secondary, a: 0.2 } }
        ],
        gradientTransform: [[1, 0, 0], [0, 1, 0]]
    }];

    if (element.size !== 'banner') {
        frame.layoutSizingHorizontal = 'FIXED';
        frame.layoutSizingVertical = 'FIXED';
    } else {
        frame.layoutSizingHorizontal = 'FILL';
    }

    return frame;
}

/**
 * Create box container
 */
async function createBox(element) {
    const frame = figma.createFrame();
    frame.name = 'Box';
    frame.layoutSizingHorizontal = 'FILL';

    const isRow = element.variant === 'row';
    frame.layoutMode = isRow ? 'HORIZONTAL' : 'VERTICAL';
    frame.primaryAxisAlignItems = 'MIN';
    frame.counterAxisAlignItems = isRow ? 'CENTER' : 'MIN';
    frame.itemSpacing = SPACING.md;

    if (element.variant === 'card' || element.variant === 'highlight') {
        frame.paddingTop = SPACING.md;
        frame.paddingBottom = SPACING.md;
        frame.paddingLeft = SPACING.md;
        frame.paddingRight = SPACING.md;
        frame.cornerRadius = RADIUS.lg;

        if (element.variant === 'highlight') {
            frame.fills = [{
                type: 'GRADIENT_LINEAR',
                gradientStops: [
                    { position: 0, color: { ...COLORS.primary, a: 0.15 } },
                    { position: 1, color: { ...COLORS.secondary, a: 0.1 } }
                ],
                gradientTransform: [[1, 0, 0], [0, 1, 0]]
            }];
        } else {
            frame.fills = [{ type: 'SOLID', color: COLORS.surface, opacity: 0.5 }];
            frame.strokes = [{ type: 'SOLID', color: COLORS.border }];
            frame.strokeWeight = 1;
        }
    } else {
        frame.fills = [];
    }

    // Create children
    for (const child of element.children || []) {
        const node = await createElement(child);
        if (node) {
            frame.appendChild(node);
        }
    }

    return frame;
}

/**
 * Create divider
 */
function createDivider() {
    const line = figma.createLine();
    line.strokeWeight = 1;
    line.strokes = [{ type: 'SOLID', color: COLORS.border }];
    line.layoutSizingHorizontal = 'FILL';
    return line;
}

/**
 * Create spacer
 */
function createSpacer(element) {
    const sizes = { small: 8, medium: 16, large: 28 };
    const height = sizes[element.size] || sizes.medium;

    const frame = figma.createFrame();
    frame.name = 'Spacer';
    frame.resize(1, height);
    frame.fills = [];
    frame.layoutSizingHorizontal = 'FILL';
    frame.layoutSizingVertical = 'FIXED';

    return frame;
}

/**
 * Create card component
 */
async function createCard(element) {
    const card = await createBox({ variant: 'card', children: [] });
    card.name = 'Card';
    card.layoutMode = 'HORIZONTAL';
    card.itemSpacing = SPACING.md;

    // Image
    if (element.image !== false) {
        const img = createImagePlaceholder({ size: 'medium' });
        card.appendChild(img);
    }

    // Content column
    const content = figma.createFrame();
    content.name = 'Content';
    content.layoutMode = 'VERTICAL';
    content.itemSpacing = 4;
    content.fills = [];
    content.layoutSizingHorizontal = 'FILL';

    const title = createText({ content: element.title || 'Card Title', style: 'subheading' });
    content.appendChild(title);

    if (element.subtitle) {
        const subtitle = createText({ content: element.subtitle, style: 'muted' });
        content.appendChild(subtitle);
    }

    if (element.price) {
        const price = createText({ content: element.price, style: 'heading' });
        price.fills = [{ type: 'SOLID', color: COLORS.secondary }];
        content.appendChild(price);
    }

    card.appendChild(content);

    // Action button
    if (element.action) {
        const btn = createButton({ content: element.action, variant: 'primary' });
        btn.layoutSizingHorizontal = 'HUG';
        card.appendChild(btn);
    }

    return card;
}

/**
 * Create list item component
 */
async function createListItem(element) {
    const item = figma.createFrame();
    item.name = 'List Item';
    item.layoutMode = 'HORIZONTAL';
    item.primaryAxisAlignItems = 'MIN';
    item.counterAxisAlignItems = 'CENTER';
    item.paddingTop = SPACING.md;
    item.paddingBottom = SPACING.md;
    item.paddingLeft = SPACING.md;
    item.paddingRight = SPACING.md;
    item.itemSpacing = SPACING.md;
    item.cornerRadius = RADIUS.md;
    item.layoutSizingHorizontal = 'FILL';
    item.fills = [{ type: 'SOLID', color: COLORS.surface, opacity: 0.5 }];

    // Leading icon/image
    if (element.leadingImage) {
        const img = createImagePlaceholder({ size: 'small' });
        item.appendChild(img);
    }

    // Content
    const content = figma.createFrame();
    content.name = 'Content';
    content.layoutMode = 'VERTICAL';
    content.itemSpacing = 2;
    content.fills = [];
    content.layoutSizingHorizontal = 'FILL';

    const title = createText({ content: element.title || 'List Item', style: 'body' });
    title.fontName = { family: 'Inter', style: 'Medium' };
    content.appendChild(title);

    if (element.subtitle) {
        const subtitle = createText({ content: element.subtitle, style: 'muted' });
        content.appendChild(subtitle);
    }

    item.appendChild(content);

    // Trailing text
    if (element.trailingText) {
        const trailing = createText({ content: element.trailingText, style: 'body' });
        trailing.fills = [{ type: 'SOLID', color: COLORS.primary }];
        trailing.layoutSizingHorizontal = 'HUG';
        item.appendChild(trailing);
    }

    return item;
}
