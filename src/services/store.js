/**
 * Application State Store
 * Simple pub/sub state management
 */

class Store {
    constructor() {
        this.state = {
            // Project data
            mockup: null,

            // Selection state
            selectedScreens: new Set(),
            selectedElements: new Set(), // Format: "screenId:elementId"

            // UI state
            currentTool: 'pan', // 'pan' | 'select'
            zoom: 1,
            pan: { x: 0, y: 0 },

            // Modal states
            isGenerating: false,
            isEditing: false,

            // Chat
            chatMessages: [],
        };

        this.listeners = new Map();
        this.nextListenerId = 0;
    }

    /**
     * Get current state
     */
    getState() {
        return this.state;
    }

    /**
     * Update state and notify listeners
     */
    setState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };

        // Notify all listeners
        this.listeners.forEach((callback) => {
            callback(this.state, oldState);
        });
    }

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
        const id = this.nextListenerId++;
        this.listeners.set(id, callback);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(id);
        };
    }

    // ===== Mockup Methods =====

    setMockup(mockup) {
        this.setState({ mockup });
    }

    getMockup() {
        return this.state.mockup;
    }

    // Product spec from analysis step
    setProductSpec(spec) {
        this.setState({ productSpec: spec });
    }

    getProductSpec() {
        return this.state.productSpec;
    }

    updateScreen(screenId, updates) {
        if (!this.state.mockup) return;

        const screens = this.state.mockup.screens.map(screen => {
            if (screen.id === screenId) {
                return { ...screen, ...updates };
            }
            return screen;
        });

        this.setState({
            mockup: { ...this.state.mockup, screens }
        });
    }

    updateElement(screenId, elementId, updates) {
        if (!this.state.mockup) return;

        const screens = this.state.mockup.screens.map(screen => {
            if (screen.id === screenId) {
                const elements = screen.elements.map(element => {
                    if (element.id === elementId) {
                        return { ...element, ...updates };
                    }
                    return element;
                });
                return { ...screen, elements };
            }
            return screen;
        });

        this.setState({
            mockup: { ...this.state.mockup, screens }
        });
    }

    // ===== Selection Methods =====

    selectScreen(screenId, addToSelection = false) {
        const selectedScreens = addToSelection
            ? new Set(this.state.selectedScreens)
            : new Set();

        if (this.state.selectedScreens.has(screenId) && addToSelection) {
            selectedScreens.delete(screenId);
        } else {
            selectedScreens.add(screenId);
        }

        this.setState({
            selectedScreens,
            selectedElements: addToSelection ? this.state.selectedElements : new Set()
        });
    }

    selectElement(screenId, elementId, addToSelection = false) {
        const key = `${screenId}:${elementId}`;
        const selectedElements = addToSelection
            ? new Set(this.state.selectedElements)
            : new Set();

        if (this.state.selectedElements.has(key) && addToSelection) {
            selectedElements.delete(key);
        } else {
            selectedElements.add(key);
        }

        this.setState({
            selectedElements,
            selectedScreens: addToSelection ? this.state.selectedScreens : new Set()
        });
    }

    selectMultiple(items) {
        const selectedScreens = new Set();
        const selectedElements = new Set();

        items.forEach(item => {
            if (item.type === 'screen') {
                selectedScreens.add(item.id);
            } else if (item.type === 'element') {
                selectedElements.add(`${item.screenId}:${item.id}`);
            }
        });

        this.setState({ selectedScreens, selectedElements });
    }

    clearSelection() {
        this.setState({
            selectedScreens: new Set(),
            selectedElements: new Set()
        });
    }

    getSelectedItems() {
        const items = [];

        this.state.selectedScreens.forEach(id => {
            items.push({ type: 'screen', id });
        });

        this.state.selectedElements.forEach(key => {
            const [screenId, elementId] = key.split(':');
            items.push({ type: 'element', screenId, id: elementId });
        });

        return items;
    }

    hasSelection() {
        return this.state.selectedScreens.size > 0 || this.state.selectedElements.size > 0;
    }

    isScreenSelected(screenId) {
        return this.state.selectedScreens.has(screenId);
    }

    isElementSelected(screenId, elementId) {
        return this.state.selectedElements.has(`${screenId}:${elementId}`);
    }

    // ===== Tool Methods =====

    setTool(tool) {
        this.setState({ currentTool: tool });
    }

    getTool() {
        return this.state.currentTool;
    }

    // ===== Zoom/Pan Methods =====

    setZoom(zoom) {
        const clampedZoom = Math.max(0.25, Math.min(3, zoom));
        this.setState({ zoom: clampedZoom });
    }

    getZoom() {
        return this.state.zoom;
    }

    setPan(pan) {
        this.setState({ pan });
    }

    getPan() {
        return this.state.pan;
    }

    zoomIn() {
        this.setZoom(this.state.zoom * 1.2);
    }

    zoomOut() {
        this.setZoom(this.state.zoom / 1.2);
    }

    resetView() {
        this.setState({ zoom: 1, pan: { x: 0, y: 0 } });
    }

    // ===== Loading States =====

    setGenerating(isGenerating) {
        this.setState({ isGenerating });
    }

    setEditing(isEditing) {
        this.setState({ isEditing });
    }

    // ===== Chat Methods =====

    addChatMessage(role, content) {
        const message = {
            id: Date.now(),
            role,
            content,
            timestamp: new Date().toISOString()
        };

        this.setState({
            chatMessages: [...this.state.chatMessages, message]
        });

        return message;
    }

    getChatMessages() {
        return this.state.chatMessages;
    }

    clearChat() {
        this.setState({ chatMessages: [] });
    }
}

// Export singleton instance
export const store = new Store();
export default store;
