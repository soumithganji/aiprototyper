/**
 * NVIDIA NIM API Service
 * Handles all communication with NVIDIA NIM LLM endpoints
 */

const NIM_API_BASE = '/api/nvidia/v1';

// Product Understanding Prompt - Step 1: Extract structured intent from vague prompts
const PRODUCT_UNDERSTANDING_PROMPT = `You are a product strategist. Analyze the user's app idea and extract structured product requirements.

RESPOND ONLY WITH VALID JSON. No markdown, no explanations.

OUTPUT FORMAT:
{
  "appName": "Suggested app name",
  "tagline": "One-line description",
  "persona": {
    "who": "Target user description",
    "needs": "What they need"
  },
  "problem": "Core problem being solved",
  "solution": "How the app solves it",
  "successMetric": "Primary success metric",
  "userFlows": [
    {
      "name": "Flow name",
      "steps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "screens": [
    {
      "id": "screen-1",
      "name": "Screen Name",
      "purpose": "What user does here",
      "keyElements": ["Element 1", "Element 2"]
    }
  ],
  "style": {
    "tone": "professional|friendly|playful|minimal|bold",
    "industry": "B2B SaaS|Consumer|E-commerce|Social|Productivity|Healthcare|Finance"
  }
}

REQUIREMENTS:
1. Generate 5-8 screens that cover the complete user journey
2. Each flow should have 3-5 logical steps
3. Screen names should be clear and descriptive
4. Key elements should reflect what's needed on that screen
5. Be specific about persona - not generic "users"
6. Success metric should be measurable

EXAMPLE INPUT: "food delivery app"
EXAMPLE OUTPUT (partial):
{
  "appName": "QuickBite",
  "tagline": "Hot meals delivered in 30 minutes",
  "persona": {
    "who": "Busy professionals aged 25-40 in urban areas",
    "needs": "Quick, convenient meals without cooking or going out"
  },
  "problem": "Ordering food online is slow and the experience is fragmented",
  "solution": "Streamlined ordering with real-time tracking and personalized recommendations",
  "successMetric": "Time from app open to order placed (target: under 60 seconds)",
  "screens": [
    { "id": "home", "name": "Home", "purpose": "Browse restaurants and deals", "keyElements": ["Search bar", "Categories", "Featured restaurants", "Promotions"] },
    { "id": "restaurant", "name": "Restaurant", "purpose": "View menu and add items", "keyElements": ["Restaurant header", "Menu categories", "Food items with Add button", "Cart summary"] }
  ]
}

Analyze the user's idea and provide comprehensive product understanding.`;

// System prompt for generating mobile app mockups
const MOCKUP_SYSTEM_PROMPT = `You are a senior mobile app designer. Generate PROFESSIONAL wireframe JSON.

RESPOND ONLY WITH VALID JSON. No markdown, no explanations.

=== JSON STRUCTURE ===
{
  "appName": "App Name",
  "screens": [{ "id": "screen-1", "name": "Name", "position": {"x": 100, "y": 100}, "elements": [] }],
  "flows": [{ "from": "screen-1", "to": "screen-2", "label": "Tap", "type": "tap" }]
}

=== ELEMENT TYPES ===

BASIC:
- text: { "type": "text", "content": "Text", "style": "heading|subheading|body|muted|label" }
- button: { "type": "button", "content": "Label", "variant": "primary|secondary|outline" }
- input: { "type": "input", "placeholder": "Text...", "icon": "search|user|mail|lock" }
- image: { "type": "image", "size": "small|medium|large|banner" }
- icon: { "type": "icon", "name": "heart|star|cart|user|settings|bell|home|search|back|plus|trash|edit|check" }
- divider: { "type": "divider" }
- spacer: { "type": "spacer", "size": "small|medium|large" }

LAYOUT:
- box: { "type": "box", "variant": "card|row|column|highlight", "children": [...] }

COMPOSITE (USE THESE FOR BEST RESULTS):
- header: { "type": "header", "title": "Screen Title", "showBack": true, "rightAction": "settings" }
- listItem: { "type": "listItem", "title": "Title", "subtitle": "Description", "leadingIcon": "star", "trailingText": "$9.99" }
- card: { "type": "card", "title": "Title", "subtitle": "4.5 ★ • 25 min", "price": "$12.99", "action": "Add" }
- stat: { "type": "stat", "value": "$1,234", "label": "Total", "trend": "up", "trendValue": "+12%" }
- tabs: { "type": "tabs", "items": ["All", "Active", "Done"], "active": 0 }
- toggle: { "type": "toggle", "label": "Enable notifications", "checked": true }
- navbar: { "type": "navbar", "items": ["Home", "Search", "Cart", "Profile"], "active": 0 }

=== SCREEN TEMPLATES ===

HOME SCREEN:
- header (no back, maybe with icon)
- search input
- section label
- 3-4 card components (horizontal row or vertical list)
- another section
- 2-3 listItem components
- navbar

DETAIL SCREEN:
- header with back button
- banner image
- title + subtitle texts
- tabs for categories
- multiple cards or listItems
- primary action button

SETTINGS/PROFILE:
- header
- highlight box with user info (image + name + email)
- multiple listItem components for settings
- toggle components for switches
- danger button for logout
- navbar

FORM SCREEN (Cart/Checkout):
- header with back
- listItems showing items with prices
- dividers between items
- stat components for totals
- input fields
- primary button

=== CRITICAL RULES ===
1. USE COMPOSITE COMPONENTS (listItem, card, stat, header, tabs, toggle) - they look much better
2. Each screen: 8-12 top-level elements
3. REALISTIC content: real names, prices like "$24.99", times like "25 min"
4. Main screens end with navbar
5. Detail/form screens use header with showBack:true
6. Include flows between screens

=== POSITIONS ===
First screen: x:100, y:100. Add 420 to x for each subsequent screen.

Generate 5-7 screens with professional, detailed content.`;


const EDIT_SYSTEM_PROMPT = `You are a wireframe designer. Modify the wireframe based on user request.

ELEMENT TYPES: text, button, input, image, icon, box, divider, spacer, navbar
BOX VARIANTS: card, row, column, highlight
Use nested "box" elements with "children" arrays for complex layouts.

Return the COMPLETE updated mockup JSON. Only valid JSON, no explanations.`;


class NIMApiService {
  constructor() {
    // Get API key from environment variable (set in .env file)
    this.apiKey = import.meta.env.VITE_NIM_API_KEY || '';
    this.model = localStorage.getItem('nim_model') || 'meta/llama-3.1-70b-instruct';
  }

  setApiKey(key) {
    // API key is now managed via .env file, this is kept for compatibility
    this.apiKey = key;
  }

  getApiKey() {
    return this.apiKey;
  }

  setModel(model) {
    this.model = model;
    localStorage.setItem('nim_model', model);
  }

  getModel() {
    return this.model;
  }

  hasApiKey() {
    return this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Step 1: Analyze product idea and extract structured understanding
   */
  async analyzeProduct(userPrompt, options = {}, onChunk = null) {
    if (!this.hasApiKey()) {
      throw new Error('API key is required. Please add your NVIDIA NIM API key in settings.');
    }

    const modeScreenCounts = {
      'full': '6-8',
      'mvp': '4-5',
      'pitch': '3'
    };
    const screenCount = modeScreenCounts[options.mode] || '5-7';

    const enhancedPrompt = `${userPrompt}

REQUIREMENTS:
- Style: ${options.style || 'modern'}
- App Type: ${options.appType || 'consumer'}
- Generate ${screenCount} screens`;

    const messages = [
      { role: 'system', content: PRODUCT_UNDERSTANDING_PROMPT },
      { role: 'user', content: enhancedPrompt }
    ];

    return this._streamChat(messages, onChunk);
  }

  /**
   * Step 2: Generate mockup from product understanding
   */
  async generateMockupFromSpec(productSpec, onChunk = null) {
    if (!this.hasApiKey()) {
      throw new Error('API key is required. Please add your NVIDIA NIM API key in settings.');
    }

    const screenCount = productSpec.screens?.length || 5;
    const screenList = productSpec.screens?.map((s, i) =>
      `${i + 1}. "${s.name}" (id: "${s.id || 'screen-' + (i + 1)}"): ${s.purpose}. Key elements: ${s.keyElements?.join(', ') || 'standard UI'}`
    ).join('\n') || '';

    const enhancedPrompt = `Generate a complete mobile app wireframe with EXACTLY ${screenCount} screens.

APP: ${productSpec.appName} - ${productSpec.tagline}
TARGET USER: ${productSpec.persona?.who || 'General users'}
STYLE: ${productSpec.style?.tone || 'professional'}

YOU MUST CREATE ALL ${screenCount} SCREENS BELOW:
${screenList}

CRITICAL REQUIREMENTS:
1. Create EXACTLY ${screenCount} separate screen objects in the "screens" array
2. Each screen must have 10-15 elements with realistic content
3. Use the screen IDs exactly as specified above
4. Position screens: first at x:100,y:100, then increment x by 400 for each
5. Include navbar on main screens (Home, Profile, Settings)
6. Use composite components: card, listItem, stat, header, tabs where appropriate

Generate the complete JSON with all ${screenCount} screens now.`;

    const messages = [
      { role: 'system', content: MOCKUP_SYSTEM_PROMPT },
      { role: 'user', content: enhancedPrompt }
    ];

    return this._streamChat(messages, onChunk);
  }

  /**
   * Generate mockup from user prompt (legacy - single step)
   */
  async generateMockup(userPrompt, onChunk = null) {
    if (!this.hasApiKey()) {
      throw new Error('API key is required. Please add your NVIDIA NIM API key in settings.');
    }

    const messages = [
      { role: 'system', content: MOCKUP_SYSTEM_PROMPT },
      { role: 'user', content: `Create a mobile app mockup for: ${userPrompt}` }
    ];

    return this._streamChat(messages, onChunk);
  }

  /**
   * Edit existing mockup based on selection and request
   */
  async editMockup(currentMockup, selectedItems, userRequest, onChunk = null) {
    if (!this.hasApiKey()) {
      throw new Error('API key is required. Please add your NVIDIA NIM API key in settings.');
    }

    const selectionContext = this._buildSelectionContext(selectedItems);

    const messages = [
      { role: 'system', content: EDIT_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Current mockup:
${JSON.stringify(currentMockup, null, 2)}

Selected items:
${selectionContext}

User request: ${userRequest}

Please provide the updated mockup JSON.`
      }
    ];

    return this._streamChat(messages, onChunk);
  }

  /**
   * Chat for general questions or feedback
   */
  async chat(messages, onChunk = null) {
    if (!this.hasApiKey()) {
      throw new Error('API key is required. Please add your NVIDIA NIM API key in settings.');
    }

    return this._streamChat(messages, onChunk);
  }

  _buildSelectionContext(selectedItems) {
    if (!selectedItems || selectedItems.length === 0) {
      return 'No specific items selected (apply changes globally)';
    }

    const screens = selectedItems.filter(item => item.type === 'screen');
    const elements = selectedItems.filter(item => item.type === 'element');

    let context = '';

    if (screens.length > 0) {
      context += `Selected screens: ${screens.map(s => s.id).join(', ')}\n`;
    }

    if (elements.length > 0) {
      context += `Selected elements: ${elements.map(e => `${e.screenId}/${e.id}`).join(', ')}`;
    }

    return context;
  }

  async _streamChat(messages, onChunk) {
    const response = await fetch(`${NIM_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              if (onChunk) {
                onChunk(content, fullContent);
              }
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }

    return fullContent;
  }

  /**
   * Parse JSON from LLM response (handles markdown code blocks)
   */
  parseJsonResponse(response) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try to parse the entire response as JSON
    // First, find the first { and last }
    const start = response.indexOf('{');
    const end = response.lastIndexOf('}');

    if (start !== -1 && end !== -1) {
      return JSON.parse(response.slice(start, end + 1));
    }

    throw new Error('Could not parse JSON from response');
  }
}

// Export singleton instance
export const nimApi = new NIMApiService();
export default nimApi;
