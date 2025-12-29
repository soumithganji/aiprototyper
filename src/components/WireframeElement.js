/**
 * Wireframe Element Renderer
 * Renders simple wireframe primitives that can handle any use case
 */

import { store } from '../services/store.js';

// Simple icon set (SVG)
const icons = {
  heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  cart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  back: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  send: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
};

/**
 * Render a wireframe element (recursive for nested boxes)
 */
export function renderWireframeElement(element, screenId, depth = 0) {
  if (!element || !element.type) return '';

  const isSelected = store.isElementSelected(screenId, element.id);
  const selectedClass = isSelected ? 'selected' : '';
  const id = element.id || `el-${depth}-${Math.random().toString(36).substr(2, 5)}`;

  switch (element.type) {
    case 'text':
      const textStyle = element.style || 'body';
      return `
        <div class="wf-element wf-text wf-text-${textStyle} ${selectedClass}" data-element-id="${id}">
          ${element.content || 'Text'}
        </div>
      `;

    case 'button':
      const btnVariant = element.variant || 'primary';
      return `
        <div class="wf-element wf-button wf-button-${btnVariant} ${selectedClass}" data-element-id="${id}">
          ${element.content || 'Button'}
        </div>
      `;

    case 'input':
      const inputIcon = element.icon ? (icons[element.icon] || icons.search) : icons.search;
      return `
        <div class="wf-element wf-input ${selectedClass}" data-element-id="${id}">
          <span class="wf-input-icon">${inputIcon}</span>
          <span class="wf-input-placeholder">${element.placeholder || 'Enter text...'}</span>
        </div>
      `;

    case 'image':
      const imgSize = element.size || 'medium';
      return `
        <div class="wf-element wf-image wf-image-${imgSize} ${selectedClass}" data-element-id="${id}">
          <span class="wf-image-label">${element.label || 'Image'}</span>
        </div>
      `;

    case 'icon':
      const iconSvg = icons[element.name] || icons.star;
      return `
        <div class="wf-element wf-icon ${selectedClass}" data-element-id="${id}">
          ${iconSvg}
          ${element.label ? `<span class="wf-icon-label">${element.label}</span>` : ''}
        </div>
      `;

    case 'box':
      const boxVariant = element.variant || 'card';
      const children = element.children || [];
      const childrenHtml = children.map((child, idx) =>
        renderWireframeElement({ ...child, id: child.id || `${id}-${idx}` }, screenId, depth + 1)
      ).join('');

      return `
        <div class="wf-element wf-box wf-box-${boxVariant} ${selectedClass}" data-element-id="${id}">
          ${childrenHtml}
        </div>
      `;

    case 'divider':
      return `<div class="wf-element wf-divider" data-element-id="${id}"></div>`;

    case 'spacer':
      const spacerSize = element.size || 'medium';
      return `<div class="wf-element wf-spacer wf-spacer-${spacerSize}" data-element-id="${id}"></div>`;

    case 'navbar':
      const items = element.items || element.content?.items || ['Home', 'Search', 'Cart', 'Profile'];
      const navIcons = { 'Home': 'home', 'Search': 'search', 'Cart': 'cart', 'Profile': 'user', 'Settings': 'settings', 'Chat': 'send', 'Help': 'bell', 'Orders': 'cart', 'Activity': 'bell', 'Messages': 'mail' };

      return `
        <div class="wf-navbar" data-element-id="${id}">
          ${items.map((item, i) => `
            <div class="wf-nav-item ${i === (element.active || 0) ? 'active' : ''}">
              ${icons[navIcons[item]] || icons.home}
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
      `;

    // ===== COMPOSITE COMPONENTS =====

    case 'listItem':
      const leadingContent = element.leadingImage
        ? `<div class="wf-image wf-image-small"></div>`
        : (element.leadingIcon ? icons[element.leadingIcon] || icons.star : '');
      const trailingContent = element.trailingText
        ? `<span class="wf-list-trailing-text">${element.trailingText}</span>`
        : (icons[element.trailingIcon || 'back'] || '');

      return `
        <div class="wf-element wf-list-item ${selectedClass}" data-element-id="${id}">
          ${leadingContent ? `<div class="wf-list-leading">${leadingContent}</div>` : ''}
          <div class="wf-list-content">
            <div class="wf-list-title">${element.title || 'List Item'}</div>
            ${element.subtitle ? `<div class="wf-list-subtitle">${element.subtitle}</div>` : ''}
          </div>
          <div class="wf-list-trailing">${trailingContent}</div>
        </div>
      `;

    case 'card':
      const hasImage = element.image !== false;
      const imagePos = element.imagePosition || 'left';

      return `
        <div class="wf-element wf-card wf-card-image-${imagePos} ${selectedClass}" data-element-id="${id}">
          ${hasImage ? `<div class="wf-card-image"></div>` : ''}
          <div class="wf-card-content">
            <div class="wf-card-header">
              <div class="wf-card-title">${element.title || 'Card Title'}</div>
              ${element.badge ? `<span class="wf-card-badge">${element.badge}</span>` : ''}
            </div>
            ${element.subtitle ? `<div class="wf-card-subtitle">${element.subtitle}</div>` : ''}
            ${element.description ? `<div class="wf-card-desc">${element.description}</div>` : ''}
            <div class="wf-card-footer">
              ${element.price ? `<span class="wf-card-price">${element.price}</span>` : ''}
              ${element.action ? `<button class="wf-card-action">${element.action}</button>` : ''}
            </div>
          </div>
        </div>
      `;

    case 'stat':
      const trendIcon = element.trend === 'up' ? '↑' : element.trend === 'down' ? '↓' : '';
      const trendClass = element.trend === 'up' ? 'positive' : element.trend === 'down' ? 'negative' : '';

      return `
        <div class="wf-element wf-stat ${selectedClass}" data-element-id="${id}">
          <div class="wf-stat-value">${element.value || '0'}</div>
          <div class="wf-stat-label">${element.label || 'Stat'}</div>
          ${element.trendValue ? `<div class="wf-stat-trend ${trendClass}">${trendIcon} ${element.trendValue}</div>` : ''}
        </div>
      `;

    case 'header':
      return `
        <div class="wf-element wf-header ${selectedClass}" data-element-id="${id}">
          ${element.showBack ? `<div class="wf-header-back">${icons.back}</div>` : ''}
          <div class="wf-header-title">${element.title || 'Screen Title'}</div>
          ${element.rightAction ? `<div class="wf-header-action">${icons[element.rightAction] || element.rightAction}</div>` : ''}
        </div>
      `;

    case 'tabs':
      const tabItems = element.items || ['Tab 1', 'Tab 2', 'Tab 3'];
      const activeTab = element.active || 0;

      return `
        <div class="wf-element wf-tabs ${selectedClass}" data-element-id="${id}">
          ${tabItems.map((tab, i) => `
            <div class="wf-tab ${i === activeTab ? 'active' : ''}">${tab}</div>
          `).join('')}
        </div>
      `;

    case 'toggle':
      return `
        <div class="wf-element wf-toggle ${selectedClass}" data-element-id="${id}">
          <span class="wf-toggle-label">${element.label || 'Toggle'}</span>
          <div class="wf-toggle-switch ${element.checked ? 'checked' : ''}">
            <div class="wf-toggle-knob"></div>
          </div>
        </div>
      `;

    default:
      // Fallback: render as text
      return `
        <div class="wf-element wf-text wf-text-body ${selectedClass}" data-element-id="${id}">
          ${element.content || element.text || element.title || element.type}
        </div>
      `;
  }
}

export default renderWireframeElement;
