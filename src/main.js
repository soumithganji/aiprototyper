/**
 * AI Prototyper - Main Application
 * Mobile App Mockup Generator using NVIDIA NIM
 */

import './style.css';
import './wireframe.css';
import { store } from './services/store.js';
import { nimApi } from './services/nimApi.js';
import { initCanvas } from './components/Canvas.js';
import { exportToPDF } from './utils/pdfExport.js';
import html2canvas from 'html2canvas';

class App {
  constructor() {
    this.canvas = null;
    this.init();
  }

  async init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Initialize canvas
    const canvasContainer = document.getElementById('canvas-container');
    this.canvas = initCanvas(canvasContainer);

    // Setup event listeners
    this.setupToolbar();
    this.setupPromptModal();
    this.setupSettingsModal();
    this.setupChatPanel();
    this.setupKeyboardShortcuts();

    // Check for API key
    this.checkApiKey();

    // Hide loading, show app
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      document.getElementById('main-app').classList.remove('hidden');
    }, 500);
  }

  checkApiKey() {
    if (!nimApi.hasApiKey()) {
      // Show prompt to add API key via settings
      const promptModal = document.getElementById('prompt-modal');
      const generateBtn = document.getElementById('generate-btn');

      generateBtn.addEventListener('click', (e) => {
        if (!nimApi.hasApiKey()) {
          e.preventDefault();
          this.showSettingsModal();
          this.showNotification('Please add your NVIDIA NIM API key first', 'warning');
        }
      });
    }
  }

  setupToolbar() {
    // Tool buttons
    const panTool = document.getElementById('pan-tool');
    const selectTool = document.getElementById('select-tool');

    panTool.addEventListener('click', () => {
      store.setTool('pan');
      panTool.classList.add('active');
      selectTool.classList.remove('active');
    });

    selectTool.addEventListener('click', () => {
      store.setTool('select');
      selectTool.classList.add('active');
      panTool.classList.remove('active');
    });

    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => store.zoomIn());
    document.getElementById('zoom-out').addEventListener('click', () => store.zoomOut());
    document.getElementById('zoom-fit').addEventListener('click', () => this.canvas.fitView());

    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.showSettingsModal();
    });

    // Export button
    document.getElementById('export-btn').addEventListener('click', async () => {
      try {
        const btn = document.getElementById('export-btn');
        btn.disabled = true;
        btn.innerHTML = `
          <span class="spinner" style="width: 16px; height: 16px;"></span>
          Exporting...
        `;

        await exportToPDF();
        this.showNotification('PDF exported successfully!', 'success');
      } catch (err) {
        this.showNotification(err.message, 'error');
      } finally {
        const btn = document.getElementById('export-btn');
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          PDF
        `;
      }
    });

    // Export to Figma button - copies JSON to clipboard
    document.getElementById('export-figma-btn')?.addEventListener('click', async () => {
      const mockup = store.getMockup();
      if (!mockup || !mockup.screens?.length) {
        this.showNotification('Generate a mockup first', 'warning');
        return;
      }

      try {
        const json = JSON.stringify(mockup, null, 2);
        await navigator.clipboard.writeText(json);
        this.showNotification('JSON copied! Paste in Figma Plugin to create frames.', 'success');
      } catch (err) {
        this.showNotification('Failed to copy: ' + err.message, 'error');
      }
    });

    // Subscribe to store for tool updates
    store.subscribe((state, oldState) => {
      if (state.currentTool !== oldState.currentTool) {
        panTool.classList.toggle('active', state.currentTool === 'pan');
        selectTool.classList.toggle('active', state.currentTool === 'select');
      }
    });
  }

  setupPromptModal() {
    const modal = document.getElementById('prompt-modal');
    const textarea = document.getElementById('initial-prompt');
    const generateBtn = document.getElementById('generate-btn');
    const quickPromptBtns = document.querySelectorAll('.quick-prompt-btn');
    const styleBtns = document.querySelectorAll('.style-btn');
    const appTypeSelect = document.getElementById('app-type-select');
    const modeSelect = document.getElementById('generation-mode');

    // Track selected style
    let selectedStyle = 'modern';

    // Enable button when text is entered
    textarea.addEventListener('input', () => {
      generateBtn.disabled = textarea.value.trim().length === 0;
    });

    // Quick prompts
    quickPromptBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        textarea.value = btn.dataset.prompt;
        generateBtn.disabled = false;
        textarea.focus();
      });
    });

    // Style preset buttons
    styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        styleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedStyle = btn.dataset.style;
      });
    });

    // Generate mockup - TWO STEP PROCESS
    generateBtn.addEventListener('click', async () => {
      if (!nimApi.hasApiKey()) {
        this.showSettingsModal();
        return;
      }

      const prompt = textarea.value.trim();
      if (!prompt) return;

      // Get generation options
      const options = {
        style: selectedStyle,
        appType: appTypeSelect?.value || 'consumer',
        mode: modeSelect?.value || 'full'
      };

      try {
        this.setGenerating(true, 'Analyzing your idea...');

        // STEP 1: Analyze product to get structured understanding
        // We pass a callback to show we are alive
        const analysisResponse = await nimApi.analyzeProduct(prompt, options, (chunk) => {
          this.setGenerating(true, 'Analyzing intent ' + (chunk.length > 5 ? '...' : chunk));
        });
        const productSpec = nimApi.parseJsonResponse(analysisResponse);

        // Apply style from options
        productSpec.style = productSpec.style || {};
        productSpec.style.tone = options.style;
        productSpec.style.industry = options.appType;

        console.log('Product Understanding:', productSpec);

        // Store product spec for future reference
        store.setProductSpec(productSpec);

        this.setGenerating(true, 'Initializing skeletal structure...');

        // STEP 2 (Progressive): Create immediate skeleton mockup
        const skeletonMockup = this.createSkeletonMockup(productSpec);
        this.ensureMockupIds(skeletonMockup);
        store.setMockup(skeletonMockup);

        // Render immediate skeleton view
        setTimeout(() => this.canvas.fitView(), 100);

        // STEP 3: Progressively fill in details
        const screens = skeletonMockup.screens;
        let completedScreens = 0;

        // Process screens in parallel (or sequential if needed, but parallel is faster)
        // We do sequential to avoid rate limits if any, but parallel feels faster. Let's do batches of 2.
        const batchSize = 2;

        for (let i = 0; i < screens.length; i += batchSize) {
          const batch = screens.slice(i, i + batchSize);

          await Promise.all(batch.map(async (screen) => {
            try {
              this.setGenerating(true, `Designing ${screen.name}...`);

              const response = await nimApi.generateScreenDetails(screen, productSpec, (chunk) => {
                // Optional: update UI with token output if desired, but might be too noisy for parallel
              });

              const details = nimApi.parseJsonResponse(response);
              if (details && details.elements) {
                // Update store with new elements for this screen
                store.updateScreen(screen.id, { elements: details.elements });
              }

              completedScreens++;
            } catch (err) {
              console.error(`Failed to generate details for ${screen.name}:`, err);
            }
          }));

          this.setGenerating(true, `Completed ${completedScreens} of ${screens.length} screens...`);
        }

        // Finalize
        const finalMockup = store.getMockup();
        const elementCount = finalMockup.screens?.reduce((sum, s) => sum + (s.elements?.length || 0), 0) || 0;

        store.addChatMessage('assistant', `🎉 Created **${productSpec.appName || 'your app'}**!
        
**Target:** ${productSpec.persona?.who || 'Users'}
**Screens:** ${completedScreens} screens designed
**Flows:** ${finalMockup.flows?.length || 0} user journeys mapped

Select elements or describe changes to refine the design.`);

        // Close modal
        modal.classList.add('hidden');

      } catch (err) {
        console.error('Generation error:', err);
        this.showNotification(err.message, 'error');
      } finally {
        this.setGenerating(false);
      }
    });
  }

  createSkeletonMockup(productSpec) {
    const screens = productSpec.screens.map((s, i) => ({
      id: s.id || `screen-${i + 1}`,
      name: s.name,
      position: {
        x: 100 + (i % 3) * 400,
        y: 100 + Math.floor(i / 3) * 700
      },
      elements: [
        // Skeleton placeholder elements
        { type: 'header', title: s.name, showBack: i > 0 },
        {
          type: 'box', variant: 'column', children: [
            { type: 'text', content: 'Generating...', style: 'muted' },
            { type: 'spacer', size: 'large' }
          ]
        }
      ]
    }));

    // Generate basic flows based on order
    const flows = [];
    for (let i = 0; i < screens.length - 1; i++) {
      flows.push({
        from: screens[i].id,
        to: screens[i + 1].id,
        label: 'Next',
        type: 'tap'
      });
    }

    return {
      appName: productSpec.appName,
      screens: screens,
      flows: flows
    };
  }

  setGenerating(isGenerating, statusMessage = 'Generating...') {
    const btn = document.getElementById('generate-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    btn.disabled = isGenerating;
    btnText.classList.toggle('hidden', isGenerating);
    btnLoading.classList.toggle('hidden', !isGenerating);

    // Update loading text if provided
    if (isGenerating && statusMessage) {
      const loadingText = btnLoading.querySelector('span:not(.spinner)');
      if (loadingText) loadingText.textContent = statusMessage;
    }

    store.setGenerating(isGenerating);
  }

  ensureMockupIds(mockup) {
    if (!mockup.screens) mockup.screens = [];

    mockup.screens.forEach((screen, sIdx) => {
      if (!screen.id) screen.id = `screen-${sIdx + 1}`;
      if (!screen.position) {
        screen.position = {
          x: 100 + (sIdx % 3) * 400,
          y: 100 + Math.floor(sIdx / 3) * 700
        };
      }
      if (!screen.elements) screen.elements = [];

      screen.elements.forEach((element, eIdx) => {
        if (!element.id) element.id = `${screen.id}-el-${eIdx + 1}`;
      });
    });

    if (!mockup.flows) mockup.flows = [];
  }

  setupSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-settings');
    const saveBtn = document.getElementById('save-settings');
    const apiKeyInput = document.getElementById('api-key-input');
    const toggleKeyBtn = document.getElementById('toggle-api-key');
    const modelSelect = document.getElementById('model-select');

    // Load current settings
    apiKeyInput.value = nimApi.getApiKey();
    modelSelect.value = nimApi.getModel();

    // Toggle password visibility
    toggleKeyBtn.addEventListener('click', () => {
      const isPassword = apiKeyInput.type === 'password';
      apiKeyInput.type = isPassword ? 'text' : 'password';
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      const model = modelSelect.value;

      if (apiKey) {
        nimApi.setApiKey(apiKey);
      }
      nimApi.setModel(model);

      modal.classList.add('hidden');
      this.showNotification('Settings saved!', 'success');
    });
  }

  showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const modelSelect = document.getElementById('model-select');

    apiKeyInput.value = nimApi.getApiKey();
    modelSelect.value = nimApi.getModel();

    modal.classList.remove('hidden');
    apiKeyInput.focus();
  }

  setupChatPanel() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const selectionContext = document.getElementById('selection-context');
    const selectionCount = document.getElementById('selection-count');
    const clearSelectionBtn = document.getElementById('clear-selection');

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
      sendBtn.disabled = chatInput.value.trim().length === 0;
    });

    // Send message
    const sendMessage = async () => {
      const message = chatInput.value.trim();
      if (!message || !nimApi.hasApiKey()) return;

      // Add user message
      store.addChatMessage('user', message);
      this.renderChatMessages();

      chatInput.value = '';
      chatInput.style.height = 'auto';
      sendBtn.disabled = true;

      try {
        const mockup = store.getMockup();
        const selectedItems = store.getSelectedItems();

        let response;
        // Keywords that indicate the user wants to edit the mockup
        const editKeywords = ['change', 'update', 'add', 'show', 'remove', 'delete', 'make', 'put', 'modify', 'replace', 'move', 'resize', 'edit', 'create', 'insert', 'hide', 'display'];
        const wantsEdit = editKeywords.some(keyword => message.toLowerCase().includes(keyword));

        if (mockup && (selectedItems.length > 0 || wantsEdit)) {
          // Check if a single screen is selected - use vision-based editing
          const selectedScreens = selectedItems.filter(i => i.type === 'screen');

          if (selectedScreens.length === 1) {
            // Vision-based editing for single screen
            const screenId = selectedScreens[0].id;
            const screenData = mockup.screens.find(s => s.id === screenId);

            if (screenData) {
              console.log('Using vision-based editing for screen:', screenId);
              store.addChatMessage('assistant', '👀 Analyzing screen...');
              this.renderChatMessages();

              try {
                // Use text-based editing for single screen (vision capture has issues)
                // The AI still gets the full JSON structure which provides good context
                console.log('Editing single screen with text-based API:', screenId);
                response = await nimApi.editSingleScreen(screenData, message);
              } catch (editErr) {
                console.error('Single screen edit failed:', editErr);
                // Try global edit as fallback
                response = await nimApi.editMockup(mockup, selectedItems, message);
              }

              console.log('Raw AI response:', response);
              const updatedScreen = nimApi.parseJsonResponse(response);
              console.log('Parsed screen update:', updatedScreen);

              // Safety check: don't apply if AI returned empty elements but original had content
              const originalElements = screenData.elements?.length || 0;
              const newElements = updatedScreen.elements?.length || 0;

              if (originalElements > 0 && newElements === 0) {
                console.error('AI returned empty screen, ignoring update');
                store.addChatMessage('assistant', `⚠️ Could not process that request properly. Try being more specific, like "change the title text to X" or "add a button below the header".`);
              } else {
                // Update only the selected screen in the mockup - DEEP CLONE to trigger re-render
                const updatedMockup = {
                  ...mockup,
                  screens: mockup.screens.map(s => {
                    if (s.id === screenId) {
                      return {
                        ...updatedScreen,
                        id: screenId,
                        position: s.position,  // Keep original position
                        name: updatedScreen.name || s.name  // Keep name if not provided
                      };
                    }
                    return { ...s };  // Clone other screens too
                  })
                };

                console.log('Applying updated mockup:', updatedMockup);
                console.log('Screen being updated:', screenId, 'with elements:', updatedScreen.elements?.length);
                this.ensureMockupIds(updatedMockup);
                store.setMockup(updatedMockup);
                console.log('Store mockup after update:', store.getMockup());

                // Force immediate re-render of canvas
                if (this.canvas) {
                  console.log('Calling canvas.render()');
                  this.canvas.render();
                  // Also try after a short delay
                  setTimeout(() => {
                    console.log('Delayed canvas.render()');
                    this.canvas.render();
                  }, 200);
                } else {
                  console.error('Canvas not available for re-render');
                }

                const elementCount = updatedScreen.elements?.length || 0;
                store.addChatMessage('assistant', `✅ Updated "${updatedScreen.name || 'screen'}" with ${elementCount} elements.`);
              }
            }
          } else {
            // Regular text-based editing for multiple selections or elements
            console.log('Editing mockup with request:', message);
            response = await nimApi.editMockup(mockup, selectedItems, message);
            console.log('Raw AI response:', response);
            const updatedMockup = nimApi.parseJsonResponse(response);
            console.log('Parsed mockup:', updatedMockup);

            // Preserve original screen positions if not specified in update
            if (mockup.screens && updatedMockup.screens) {
              updatedMockup.screens.forEach((screen, idx) => {
                const originalScreen = mockup.screens.find(s => s.id === screen.id) || mockup.screens[idx];
                if (originalScreen && !screen.position) {
                  screen.position = originalScreen.position;
                }
              });
            }

            this.ensureMockupIds(updatedMockup);
            store.setMockup(updatedMockup);

            const screenCount = updatedMockup.screens?.length || 0;
            const elementCount = updatedMockup.screens?.reduce((sum, s) => sum + (s.elements?.length || 0), 0) || 0;
            store.addChatMessage('assistant', `Done! Updated mockup with ${screenCount} screens and ${elementCount} elements.`);
          }
        } else if (!mockup) {
          // Generate new mockup
          response = await nimApi.generateMockup(message);
          const newMockup = nimApi.parseJsonResponse(response);
          this.ensureMockupIds(newMockup);
          store.setMockup(newMockup);

          // Close prompt modal if open
          document.getElementById('prompt-modal').classList.add('hidden');

          store.addChatMessage('assistant', `Created ${newMockup.screens?.length || 0} screens for your app!`);
          setTimeout(() => this.canvas.fitView(), 100);
        } else {
          // General chat response
          store.addChatMessage('assistant', 'Select some elements on the canvas, or describe what changes you\'d like to make to the mockup.');
        }
      } catch (err) {
        console.error('Chat error:', err);
        store.addChatMessage('assistant', `Sorry, there was an error: ${err.message}`);
      }

      this.renderChatMessages();
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Clear selection
    clearSelectionBtn.addEventListener('click', () => {
      store.clearSelection();
    });

    // Subscribe to selection changes
    store.subscribe((state, oldState) => {
      const hasSelection = store.hasSelection();
      selectionContext.classList.toggle('hidden', !hasSelection);

      if (hasSelection) {
        const items = store.getSelectedItems();
        const screenCount = items.filter(i => i.type === 'screen').length;
        const elementCount = items.filter(i => i.type === 'element').length;

        let text = '';
        if (screenCount > 0) text += `${screenCount} screen${screenCount > 1 ? 's' : ''}`;
        if (screenCount > 0 && elementCount > 0) text += ', ';
        if (elementCount > 0) text += `${elementCount} element${elementCount > 1 ? 's' : ''}`;

        selectionCount.textContent = text;
      }
    });
  }

  renderChatMessages() {
    const container = document.getElementById('chat-messages');
    const messages = store.getChatMessages();

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="chat-welcome">
          <div class="welcome-icon">✨</div>
          <h4>Welcome to AI Prototyper</h4>
          <p>Describe your mobile app idea or select elements on the canvas to modify them.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = messages.map(msg => `
      <div class="chat-message ${msg.role}">
        <div class="message-content">
          <div class="message-text">${this.escapeHtml(msg.content)}</div>
          <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    `).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + E: Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        document.getElementById('export-btn').click();
      }

      // Cmd/Ctrl + ,: Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        this.showSettingsModal();
      }
    });
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10000;
          animation: slideIn 0.3s ease;
        }
        .notification-success { border-color: var(--success); }
        .notification-error { border-color: var(--error); }
        .notification-warning { border-color: var(--warning); }
        .notification-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 18px;
          cursor: pointer;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto-close after 4 seconds
    const timeout = setTimeout(() => {
      notification.remove();
    }, 4000);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
      clearTimeout(timeout);
      notification.remove();
    });
  }
}

// Initialize app
const app = new App();
export default app;
