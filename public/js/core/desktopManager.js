class DesktopManager {
    constructor(desktopId, windowManager) {
        this.desktop = document.getElementById(desktopId);
        this.windowManager = windowManager;
        this.icons = new Map();
        this.selectedIcons = new Set();
        this.contextMenu = null;
        this.gridSize = { width: 100, height: 100 };
        this.currentFocus = null;
        this._init();
    }

    _init() {
        // Initialize grid layout
        this._initializeGrid();
        
        // Handle desktop clicks
        this.desktop.addEventListener('click', (e) => {
            if (e.target === this.desktop) {
                this.clearSelection();
                this.hideContextMenu();
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => this._handleKeyboard(e));

        // Handle context menu
        this.desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target === this.desktop) {
                this.showDesktopContextMenu(e.clientX, e.clientY);
            }
        });

        // Handle selection area
        this._initializeSelectionArea();
    }

    _initializeGrid() {
        // Calculate grid dimensions based on desktop size
        const desktopRect = this.desktop.getBoundingClientRect();
        this.columns = Math.floor(desktopRect.width / this.gridSize.width);
        this.rows = Math.floor(desktopRect.height / this.gridSize.height);
        
        // Initialize grid occupancy
        this.grid = Array(this.rows).fill().map(() => Array(this.columns).fill(null));
    }

    _initializeSelectionArea() {
        let selecting = false;
        let startX, startY;
        let selectionArea = null;

        this.desktop.addEventListener('mousedown', (e) => {
            if (e.target !== this.desktop) return;
            
            selecting = true;
            startX = e.clientX;
            startY = e.clientY;
            
            selectionArea = document.createElement('div');
            selectionArea.className = 'selection-area';
            this.desktop.appendChild(selectionArea);
        });

        document.addEventListener('mousemove', (e) => {
            if (!selecting || !selectionArea) return;

            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            selectionArea.style.left = left + 'px';
            selectionArea.style.top = top + 'px';
            selectionArea.style.width = width + 'px';
            selectionArea.style.height = height + 'px';

            // Select icons within the area
            this._selectIconsInArea(left, top, width, height);
        });

        document.addEventListener('mouseup', () => {
            if (!selecting) return;
            selecting = false;
            if (selectionArea) {
                selectionArea.remove();
                selectionArea = null;
            }
        });
    }

    _handleKeyboard(e) {
        if (!this.currentFocus) return;

        const currentPos = this._getIconGridPosition(this.currentFocus);
        let newPos = { ...currentPos };

        switch (e.key) {
            case 'ArrowUp':
                newPos.row = Math.max(0, currentPos.row - 1);
                break;
            case 'ArrowDown':
                newPos.row = Math.min(this.rows - 1, currentPos.row + 1);
                break;
            case 'ArrowLeft':
                newPos.col = Math.max(0, currentPos.col - 1);
                break;
            case 'ArrowRight':
                newPos.col = Math.min(this.columns - 1, currentPos.col + 1);
                break;
            case 'Enter':
                this.launchIcon(this.currentFocus.dataset.iconId);
                break;
            case ' ': // Space
                this.toggleIconSelection(this.currentFocus);
                e.preventDefault();
                break;
            default:
                return;
        }

        const nextIcon = this._getIconAtPosition(newPos.row, newPos.col);
        if (nextIcon) {
            this.focusIcon(nextIcon);
            e.preventDefault();
        }
    }

    addIcon(id, label, iconPath, onClick, options = {}) {
        if (this.icons.has(id)) return null;

        const iconEl = document.createElement('div');
        iconEl.className = 'desktop-icon';
        iconEl.dataset.iconId = id;
        iconEl.tabIndex = 0; // Make focusable
        
        // Find position in grid
        const position = this._findAvailableGridPosition(options);
        iconEl.style.left = (position.col * this.gridSize.width) + 'px';
        iconEl.style.top = (position.row * this.gridSize.height) + 'px';

        iconEl.innerHTML = `
            <img src="${iconPath}" alt="${label}" draggable="false">
            <span class="icon-label">${label}</span>
        `;

        // Event listeners
        this._attachIconEventListeners(iconEl, onClick);

        this.icons.set(id, { element: iconEl, onClick });
        this.desktop.appendChild(iconEl);
        this.grid[position.row][position.col] = id;

        return iconEl;
    }

    _attachIconEventListeners(iconEl, onClick) {
        // Click handling
        iconEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!e.ctrlKey && !e.shiftKey) {
                this.clearSelection();
            }
            this.toggleIconSelection(iconEl);
        });

        // Double click
        iconEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            onClick();
        });

        // Context menu
        iconEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.selectedIcons.has(iconEl)) {
                this.clearSelection();
                this.toggleIconSelection(iconEl);
            }
            this.showIconContextMenu(e.clientX, e.clientY);
        });

        // Focus handling
        iconEl.addEventListener('focus', () => {
            this.currentFocus = iconEl;
        });

        // Make draggable
        this._makeIconDraggable(iconEl);
    }

    _makeIconDraggable(iconEl) {
        let isDragging = false;
        let startX, startY;

        iconEl.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Left click only
            isDragging = true;
            iconEl.classList.add('dragging');
            
            const rect = iconEl.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const x = e.clientX - startX;
            const y = e.clientY - startY;

            // Snap to grid
            const gridPos = this._getGridPositionFromCoords(x, y);
            iconEl.style.left = (gridPos.col * this.gridSize.width) + 'px';
            iconEl.style.top = (gridPos.row * this.gridSize.height) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            iconEl.classList.remove('dragging');
            
            // Update grid position
            const newPos = this._getIconGridPosition(iconEl);
            const id = iconEl.dataset.iconId;
            this._updateIconGridPosition(id, newPos);
        });
    }

    showIconContextMenu(x, y) {
        this.hideContextMenu();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        
        const items = [
            { label: 'Open', icon: '▶️', action: () => this._executeForSelection(id => this.launchIcon(id)) },
            { label: 'Rename', icon: '✏️', action: () => this._executeForSelection(id => this.renameIcon(id)) },
            { type: 'separator' },
            { label: 'Delete', icon: '🗑️', action: () => this._executeForSelection(id => this.removeIcon(id)) }
        ];

        items.forEach(item => {
            if (item.type === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.innerHTML = `${item.icon} ${item.label}`;
                menuItem.addEventListener('click', () => {
                    item.action();
                    this.hideContextMenu();
                });
                menu.appendChild(menuItem);
            }
        });

        // Position menu
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        // Add to DOM
        this.contextMenu = menu;
        document.body.appendChild(menu);

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 0);
    }

    showDesktopContextMenu(x, y) {
        this.hideContextMenu();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        
        const items = [
            { label: 'New Notepad', icon: '📝', action: () => this.windowManager.createWindow('notepad-' + Date.now(), 'Notepad', '') },
            { label: 'Refresh', icon: '🔄', action: () => this._refreshDesktop() },
            { type: 'separator' },
            { label: 'View', icon: '👁️', items: [
                { label: 'Small icons', action: () => this._setIconSize('small') },
                { label: 'Large icons', action: () => this._setIconSize('large') }
            ]}
        ];

        items.forEach(item => {
            if (item.type === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.innerHTML = `${item.icon} ${item.label}`;
                menuItem.addEventListener('click', () => {
                    item.action();
                    this.hideContextMenu();
                });
                menu.appendChild(menuItem);
            }
        });

        // Position menu
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        // Add to DOM
        this.contextMenu = menu;
        document.body.appendChild(menu);
    }

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    }

    _executeForSelection(action) {
        this.selectedIcons.forEach(iconEl => {
            action(iconEl.dataset.iconId);
        });
    }

    // ... Other helper methods for grid management and icon positioning ...
}
