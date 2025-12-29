/**
 * Component Registry
 * Defines all available UI components with their props and variants
 * This is the "source of truth" for what components the AI can generate
 */

export const COMPONENT_REGISTRY = {
    // ===== TEXT COMPONENTS =====
    text: {
        name: 'Text',
        description: 'Text content with various styles',
        props: {
            content: { type: 'string', required: true, description: 'Text content' },
            style: {
                type: 'enum',
                values: ['heading', 'subheading', 'body', 'muted', 'label', 'caption'],
                default: 'body',
                description: 'Text style/size'
            }
        }
    },

    // ===== INTERACTIVE COMPONENTS =====
    button: {
        name: 'Button',
        description: 'Clickable button',
        props: {
            content: { type: 'string', required: true, description: 'Button label' },
            variant: {
                type: 'enum',
                values: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
                default: 'primary',
                description: 'Button style variant'
            },
            size: {
                type: 'enum',
                values: ['small', 'medium', 'large', 'full'],
                default: 'medium',
                description: 'Button size'
            },
            icon: { type: 'string', description: 'Optional icon name' }
        }
    },

    input: {
        name: 'Input',
        description: 'Text input field',
        props: {
            placeholder: { type: 'string', default: 'Enter text...', description: 'Placeholder text' },
            label: { type: 'string', description: 'Optional label above input' },
            icon: {
                type: 'enum',
                values: ['search', 'user', 'mail', 'lock', 'phone', 'calendar', 'dollar'],
                description: 'Optional leading icon'
            },
            type: {
                type: 'enum',
                values: ['text', 'password', 'email', 'number', 'textarea'],
                default: 'text'
            }
        }
    },

    toggle: {
        name: 'Toggle',
        description: 'On/off switch',
        props: {
            label: { type: 'string', required: true, description: 'Toggle label' },
            checked: { type: 'boolean', default: false }
        }
    },

    // ===== MEDIA COMPONENTS =====
    image: {
        name: 'Image',
        description: 'Image placeholder',
        props: {
            label: { type: 'string', default: 'Image', description: 'Image description' },
            size: {
                type: 'enum',
                values: ['avatar', 'thumbnail', 'small', 'medium', 'large', 'banner', 'full'],
                default: 'medium'
            },
            shape: {
                type: 'enum',
                values: ['square', 'rounded', 'circle'],
                default: 'rounded'
            }
        }
    },

    icon: {
        name: 'Icon',
        description: 'Icon with optional label',
        props: {
            name: {
                type: 'enum',
                values: ['heart', 'star', 'cart', 'user', 'settings', 'bell', 'home', 'search',
                    'menu', 'back', 'send', 'plus', 'trash', 'edit', 'check', 'close',
                    'arrow-right', 'arrow-left', 'calendar', 'clock', 'dollar', 'percent',
                    'chart', 'download', 'upload', 'share', 'copy', 'filter', 'sort'],
                required: true
            },
            label: { type: 'string', description: 'Optional label next to icon' },
            size: {
                type: 'enum',
                values: ['small', 'medium', 'large'],
                default: 'medium'
            }
        }
    },

    // ===== LAYOUT COMPONENTS =====
    box: {
        name: 'Box',
        description: 'Container for grouping elements',
        props: {
            variant: {
                type: 'enum',
                values: ['card', 'row', 'column', 'highlight', 'outline', 'transparent'],
                default: 'card'
            },
            padding: {
                type: 'enum',
                values: ['none', 'small', 'medium', 'large'],
                default: 'medium'
            },
            gap: {
                type: 'enum',
                values: ['none', 'small', 'medium', 'large'],
                default: 'medium'
            },
            children: { type: 'array', description: 'Nested elements' }
        }
    },

    divider: {
        name: 'Divider',
        description: 'Horizontal separator line',
        props: {}
    },

    spacer: {
        name: 'Spacer',
        description: 'Vertical spacing',
        props: {
            size: {
                type: 'enum',
                values: ['small', 'medium', 'large', 'xlarge'],
                default: 'medium'
            }
        }
    },

    // ===== COMPOSITE COMPONENTS =====
    listItem: {
        name: 'List Item',
        description: 'Row with icon, title, subtitle, and action',
        props: {
            title: { type: 'string', required: true },
            subtitle: { type: 'string' },
            leadingIcon: { type: 'string', description: 'Icon name for left side' },
            leadingImage: { type: 'boolean', description: 'Show image placeholder instead of icon' },
            trailingIcon: { type: 'string', default: 'arrow-right' },
            trailingText: { type: 'string', description: 'Right-aligned text (e.g. price, time)' }
        }
    },

    card: {
        name: 'Card',
        description: 'Content card with optional image and actions',
        props: {
            title: { type: 'string', required: true },
            subtitle: { type: 'string' },
            description: { type: 'string' },
            image: { type: 'boolean', default: true },
            imagePosition: {
                type: 'enum',
                values: ['top', 'left', 'right'],
                default: 'left'
            },
            badge: { type: 'string', description: 'Optional badge text' },
            action: { type: 'string', description: 'Optional action button text' },
            price: { type: 'string', description: 'Optional price display' }
        }
    },

    stat: {
        name: 'Stat',
        description: 'Statistic display with value and label',
        props: {
            value: { type: 'string', required: true, description: 'Main value (e.g. "$1,234")' },
            label: { type: 'string', required: true, description: 'Stat label' },
            trend: {
                type: 'enum',
                values: ['up', 'down', 'neutral'],
                description: 'Optional trend indicator'
            },
            trendValue: { type: 'string', description: 'Trend value (e.g. "+12%")' }
        }
    },

    // ===== NAVIGATION =====
    navbar: {
        name: 'Navigation Bar',
        description: 'Bottom tab navigation',
        props: {
            items: {
                type: 'array',
                required: true,
                description: 'Array of tab names (e.g. ["Home", "Search", "Profile"])'
            },
            active: { type: 'number', default: 0, description: 'Active tab index' }
        }
    },

    header: {
        name: 'Screen Header',
        description: 'Top header with title and optional actions',
        props: {
            title: { type: 'string', required: true },
            showBack: { type: 'boolean', default: false },
            rightAction: { type: 'string', description: 'Right button text or icon' }
        }
    },

    tabs: {
        name: 'Tab Bar',
        description: 'Horizontal tab selection',
        props: {
            items: { type: 'array', required: true },
            active: { type: 'number', default: 0 }
        }
    }
};

/**
 * Generate component documentation for AI prompt
 */
export function generateComponentDocs() {
    let docs = '';
    for (const [type, component] of Object.entries(COMPONENT_REGISTRY)) {
        docs += `\n${type.toUpperCase()}: ${component.description}\n`;
        docs += `Props: `;
        const propList = Object.entries(component.props).map(([name, prop]) => {
            let propStr = name;
            if (prop.type === 'enum') {
                propStr += ` (${prop.values.join('|')})`;
            } else if (prop.type) {
                propStr += ` (${prop.type})`;
            }
            if (prop.required) propStr += ' *required*';
            return propStr;
        });
        docs += propList.join(', ') || 'none';
        docs += '\n';
    }
    return docs;
}

/**
 * Validate a component against the registry
 */
export function validateComponent(component) {
    if (!component || !component.type) {
        return { valid: false, error: 'Component missing type' };
    }

    const spec = COMPONENT_REGISTRY[component.type];
    if (!spec) {
        return { valid: false, error: `Unknown component type: ${component.type}` };
    }

    // Check required props
    for (const [propName, propSpec] of Object.entries(spec.props)) {
        if (propSpec.required && !component[propName] && component[propName] !== 0) {
            return { valid: false, error: `Missing required prop: ${propName}` };
        }
    }

    return { valid: true };
}

export default COMPONENT_REGISTRY;
