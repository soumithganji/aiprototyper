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

ELEMENT TYPES: text, button, input, image, icon, box, divider, spacer, navbar, header, listItem, card, stat, tabs, toggle
BOX VARIANTS: card, row, column, highlight
COMPOSITE COMPONENTS:
- header: { "type": "header", "title": "Title", "showBack": true }
- listItem: { "type": "listItem", "title": "Title", "subtitle": "Desc", "leadingIcon": "star", "trailingText": "$9.99" }
- card: { "type": "card", "title": "Title", "subtitle": "Info", "price": "$12.99", "action": "Add" }
- stat: { "type": "stat", "value": "$1,234", "label": "Total" }
- tabs: { "type": "tabs", "items": ["Tab 1", "Tab 2"], "active": 0 }
- toggle: { "type": "toggle", "label": "Setting", "checked": true }

Use nested "box" elements with "children" arrays for complex layouts.
Return the COMPLETE updated mockup JSON. Only valid JSON, no explanations.`;

const VISION_EDIT_PROMPT = `You are editing a mobile app screen. Look at the image to understand the current UI.

TASK: Make ONLY the change the user requests. Keep everything else exactly the same.

CRITICAL RULES:
1. Return the COMPLETE screen JSON with ALL elements
2. Copy all existing elements, just modify the ones mentioned
3. Do NOT remove or skip any elements
4. Output ONLY valid JSON - no explanations, no markdown

OUTPUT STRUCTURE (you MUST follow this exactly):
{
  "name": "Screen Name",
  "elements": [
    { "type": "text", "content": "Hello", "style": "heading" },
    { "type": "button", "content": "Click", "variant": "primary" }
  ]
}

COMPONENT TYPES:
- text: content (string), style (heading|subheading|body|muted|label)
- button: content (string), variant (primary|secondary|outline)
- input: placeholder (string), icon (search|user|mail|lock)
- image: size (small|medium|large|banner)
- box: variant (card|row|column|highlight), children (array of elements)
- header: title, showBack (boolean)
- listItem: title, subtitle, leadingIcon, trailingText
- card: title, subtitle, price, action
- tabs: items (array), active (number)
- toggle: label, checked (boolean)
- navbar: items (array), active (number)
- divider, spacer

Remember: Output ONLY the JSON object. Start with { and end with }.`;


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

    // Use faster 8B model for analysis to speed up the first step
    const fastModel = 'meta/llama-3.1-8b-instruct';
    return this._streamChat(messages, onChunk, fastModel);
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
   * Step 3 (Progressive): Generate details for a single screen based on product spec
   */
  async generateScreenDetails(screenSpec, productSpec, onChunk = null) {
    if (!this.hasApiKey()) {
      throw new Error('API key is required.');
    }

    console.log(`Generating details for screen: ${screenSpec.name}`);

    const enhancedPrompt = `Generate UI elements for "${screenSpec.name}" screen in a ${productSpec.appName || 'mobile'} app.

PURPOSE: ${screenSpec.purpose || 'Display content'}
KEY FEATURES: ${screenSpec.keyElements?.join(', ') || 'content display'}

IMPORTANT: Use REALISTIC, MEANINGFUL content:
- Real names: "Sarah Johnson", "Mike Chen"
- Real values: "$24.99", "4.8 ★", "2.5k followers"
- Real actions: "Start Workout", "View Details", "Add to Cart"
- Real timestamps: "5 min ago", "Yesterday"

Return ONLY valid JSON:
{
  "elements": [
    { "type": "header", "title": "${screenSpec.name}", "showBack": ${screenSpec.name !== 'Home' && screenSpec.name !== 'Dashboard'} },
    { "type": "listItem", "title": "Example Item", "subtitle": "Description here", "trailingText": "$9.99" },
    { "type": "card", "title": "Featured", "subtitle": "4.5 ★ • Popular", "action": "View" },
    { "type": "navbar", "items": ["Home", "Search", "Profile"], "active": 0 }
  ]
}

Generate 10-12 elements with realistic content appropriate for a "${screenSpec.name}" screen.`;

    const messages = [
      { role: 'system', content: 'You are a professional UI designer. Generate realistic mobile app screens with meaningful content. Return only valid JSON.' },
      { role: 'user', content: enhancedPrompt }
    ];

    // Use faster 8B model for screen details
    const fastModel = 'meta/llama-3.1-8b-instruct';
    return this._streamChat(messages, onChunk, fastModel);
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
   * Edit a single screen with focused context
   */
  async editSingleScreen(screen, userRequest, onChunk = null) {
    if (!this.hasApiKey()) {
      throw new Error('API key is required. Please add your NVIDIA NIM API key in settings.');
    }

    const messages = [
      {
        role: 'system', content: `You are a professional mobile app UI designer editing a screen.

IMPORTANT: Generate REALISTIC, CONTEXTUAL content based on the screen name and purpose.
- For "Home Feed": add feed posts, user avatars, like buttons, timestamps
- For "Profile": add user info, stats, settings options
- For "Settings": add toggles, list items for preferences
- For any screen: use realistic text like "John posted a photo", "$24.99", "5 min ago"

NEVER use generic labels like "Button" or "Text". Always use meaningful content.

ELEMENT TYPES AND EXAMPLES:
- header: { "type": "header", "title": "Home", "showBack": false }
- listItem: { "type": "listItem", "title": "Dark Mode", "subtitle": "Enable dark theme", "trailingText": "On" }
- card: { "type": "card", "title": "Morning Workout", "subtitle": "45 min • 320 cal", "action": "Start" }
- stat: { "type": "stat", "value": "1,234", "label": "Followers" }
- text: { "type": "text", "content": "Welcome back, Sarah!", "style": "heading" }
- button: { "type": "button", "content": "Get Started", "variant": "primary" }
- input: { "type": "input", "placeholder": "Search workouts...", "icon": "search" }
- image: { "type": "image", "size": "medium" }
- tabs: { "type": "tabs", "items": ["All", "Popular", "Recent"], "active": 0 }
- navbar: { "type": "navbar", "items": ["Home", "Search", "Profile"], "active": 0 }

Output ONLY valid JSON. No markdown, no explanations.` },
      {
        role: 'user',
        content: `Screen: "${screen.name}"
Current elements: ${screen.elements?.length || 0}

${JSON.stringify(screen, null, 2)}

REQUEST: "${userRequest}"

Add contextually appropriate elements for a "${screen.name}" screen. Return complete screen JSON.`
      }
    ];

    return this._streamChat(messages, onChunk);
  }

  /**
   * Edit mockup using vision - sends screenshot to AI for contextual understanding
   */
  async editMockupWithVision(screen, screenImageBase64, userRequest, onChunk = null) {
    if (!this.hasApiKey()) {
      throw new Error('API key is required. Please add your NVIDIA NIM API key in settings.');
    }

    // Use a vision-capable model - 90B is more capable than 11B
    const visionModel = 'meta/llama-3.2-90b-vision-instruct';

    const messages = [
      { role: 'system', content: VISION_EDIT_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Here is the current screen JSON that you MUST preserve and only modify as requested:

${JSON.stringify(screen, null, 2)}

USER REQUEST: "${userRequest}"

IMPORTANT: 
- Keep ALL existing elements from the JSON above
- Only make the specific change the user requested
- Return the complete screen JSON with the "name", "id", and full "elements" array
- Do NOT remove any elements unless specifically asked`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${screenImageBase64}`
            }
          }
        ]
      }
    ];

    try {
      console.log('Calling vision API with model:', visionModel);
      const result = await this._streamChatVision(messages, visionModel, onChunk);
      console.log('Vision API response length:', result?.length || 0);
      console.log('Vision API response preview:', result?.substring(0, 200));
      return result;
    } catch (err) {
      console.warn('Vision API failed, falling back to text-only:', err);
      // Fallback to text-only with better prompt
      const textMessages = [
        {
          role: 'system', content: `You are editing a mobile app screen. Make ONLY the requested change and keep ALL other elements exactly the same.

CRITICAL: You MUST return the complete screen JSON with ALL elements preserved. Only modify what was requested.

Output ONLY valid JSON. Start with { and end with }. No markdown, no explanations.` },
        {
          role: 'user',
          content: `Here is the current screen JSON. PRESERVE ALL ELEMENTS, only make the requested change:

${JSON.stringify(screen, null, 2)}

USER REQUEST: "${userRequest}"

Return the complete updated screen JSON with the "name" and full "elements" array.`
        }
      ];
      return this._streamChat(textMessages, onChunk);
    }
  }

  /**
   * Stream chat with vision model
   */
  async _streamChatVision(messages, model, onChunk = null) {
    const response = await fetch(`${NIM_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 8192,
        temperature: 0.3,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vision API error: ${response.status} - ${error}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content || '';
            fullResponse += content;
            if (onChunk) onChunk(content);
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }

    return fullResponse;
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

  async _streamChat(messages, onChunk, modelOverride = null) {
    const response = await fetch(`${NIM_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelOverride || this.model,
        messages: messages,
        stream: true,
        max_tokens: 8192,
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
   * Parse JSON from LLM response (handles markdown code blocks and malformed JSON)
   */
  parseJsonResponse(response) {
    let jsonStr = response;

    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // Find the first { and last }
      const start = response.indexOf('{');
      const end = response.lastIndexOf('}');

      if (start !== -1 && end !== -1 && end > start) {
        jsonStr = response.slice(start, end + 1);
      }
    }

    // Try to parse directly first
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Initial JSON parse failed, attempting to fix:', e.message);
    }

    // Try to fix common issues
    try {
      // Count open/close braces and brackets
      let openBraces = (jsonStr.match(/{/g) || []).length;
      let closeBraces = (jsonStr.match(/}/g) || []).length;
      let openBrackets = (jsonStr.match(/\[/g) || []).length;
      let closeBrackets = (jsonStr.match(/]/g) || []).length;

      // Add missing closing brackets/braces
      while (closeBrackets < openBrackets) {
        jsonStr += ']';
        closeBrackets++;
      }
      while (closeBraces < openBraces) {
        jsonStr += '}';
        closeBraces++;
      }

      // Remove trailing commas before } or ]
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

      // Try parsing again
      return JSON.parse(jsonStr);
    } catch (e2) {
      console.error('JSON fix attempt failed:', e2.message);
      console.log('Raw response:', response.substring(0, 500) + '...');
    }

    // Last resort: try to extract a partial valid JSON object
    try {
      // Find screens array if present
      const screensMatch = jsonStr.match(/"screens"\s*:\s*\[([\s\S]*)/);
      if (screensMatch) {
        // Try to build a minimal valid object
        const partial = '{"screens":[' + screensMatch[1];
        // Balance the brackets/braces
        let balanced = partial;
        let ob = (balanced.match(/{/g) || []).length;
        let cb = (balanced.match(/}/g) || []).length;
        let oB = (balanced.match(/\[/g) || []).length;
        let cB = (balanced.match(/]/g) || []).length;

        while (cB < oB) { balanced += ']'; cB++; }
        while (cb < ob) { balanced += '}'; cb++; }
        balanced = balanced.replace(/,\s*([}\]])/g, '$1');

        return JSON.parse(balanced);
      }
    } catch (e3) {
      // Continue to throw error
    }

    throw new Error('JSON Parse error: Could not parse AI response. The response may have been truncated.');
  }
}

// Export singleton instance
export const nimApi = new NIMApiService();
export default nimApi;
