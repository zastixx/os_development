// Window Manager Class
class WindowManager {
    constructor(desktopId) {
        this.desktop = document.getElementById(desktopId);
        if (!this.desktop) {
            console.error(`Desktop container with ID "${desktopId}" not found.`);
            return;
        }
        this.windows = new Map(); // To store window instances by ID
        this.highestZIndex = 1000; // Start high to ensure windows stay above other elements
        this._init();
    }

    _init() {
        // Click on desktop to deselect active windows
        this.desktop.addEventListener('click', (e) => {
            if (e.target === this.desktop) {
                this.windows.forEach(win => {
                    win.classList.remove('active');
                });
            }
        });
    }

    createWindow(id, title, content, options = {}) {
        if (this.windows.has(id)) {
            console.error(`Window with ID "${id}" already exists.`);
            return null;
        }

        // Default options
        const defaultOptions = {
            x: 50,
            y: 50,
            width: 400,
            height: 300,
            ...options
        };

        // Create window element
        const windowEl = document.createElement('div');
        windowEl.className = 'window';
        windowEl.dataset.windowId = id;
        windowEl.style.cssText = `
            position: absolute;
            top: ${defaultOptions.y}px;
            left: ${defaultOptions.x}px;
            width: ${defaultOptions.width}px;
            height: ${defaultOptions.height}px;
            z-index: ${++this.highestZIndex};
        `;

        // Create window structure
        windowEl.innerHTML = `
            <div class="title-bar">
                <span class="title">${title}</span>
                <div class="window-controls">
                    <button class="minimize-btn" aria-label="Minimize">-</button>
                    <button class="maximize-btn" aria-label="Maximize">□</button>
                    <button class="close-btn" aria-label="Close">×</button>
                </div>
            </div>
            <div class="window-content"></div>
        `;

        // Set content
        const contentContainer = windowEl.querySelector('.window-content');
        if (typeof content === 'string') {
            contentContainer.innerHTML = content;
        } else if (content instanceof Node) {
            contentContainer.appendChild(content);
        }

        // Add event listeners
        this._makeDraggable(windowEl);
        
        windowEl.querySelector('.close-btn').addEventListener('click', () => {
            this._handleClose(windowEl);
        });

        windowEl.querySelector('.maximize-btn').addEventListener('click', () => {
            this._handleMaximize(windowEl);
        });

        windowEl.querySelector('.minimize-btn').addEventListener('click', () => {
            this._handleMinimize(windowEl);
        });

        // Click anywhere on window to bring it to front
        windowEl.addEventListener('mousedown', () => {
            this._bringToFront(windowEl);
        });

        // Add to DOM and store reference
        this.desktop.appendChild(windowEl);
        this.windows.set(id, windowEl);
        this._bringToFront(windowEl);

        return windowEl;
    }

    _makeDraggable(windowEl) {
        const titleBar = windowEl.querySelector('.title-bar');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return; // Don't drag if clicking controls

            isDragging = true;
            windowEl.classList.add('dragging');

            // Get the current position of the window
            const rect = windowEl.getBoundingClientRect();
            initialX = e.clientX - rect.left;
            initialY = e.clientY - rect.top;

            // Prevent text selection while dragging
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Constrain to desktop bounds
            const desktopRect = this.desktop.getBoundingClientRect();
            const windowRect = windowEl.getBoundingClientRect();

            currentX = Math.max(0, Math.min(currentX, desktopRect.width - windowRect.width));
            currentY = Math.max(0, Math.min(currentY, desktopRect.height - windowRect.height));

            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            windowEl.classList.remove('dragging');
        });
    }

    _bringToFront(windowEl) {
        // Remove active class from all windows
        this.windows.forEach(win => {
            win.classList.remove('active');
        });

        // Add active class and update z-index
        windowEl.classList.add('active');
        windowEl.style.zIndex = ++this.highestZIndex;
    }

    _handleClose(windowEl) {
        const id = windowEl.dataset.windowId;
        windowEl.remove();
        this.windows.delete(id);

        // Custom event for window closing
        const event = new CustomEvent('windowclose', {
            detail: { windowId: id }
        });
        this.desktop.dispatchEvent(event);
    }

    _handleMaximize(windowEl) {
        windowEl.classList.toggle('maximized');
        if (windowEl.classList.contains('maximized')) {
            // Store current dimensions for restore
            windowEl.dataset.restore = JSON.stringify({
                top: windowEl.style.top,
                left: windowEl.style.left,
                width: windowEl.style.width,
                height: windowEl.style.height
            });

            // Maximize
            windowEl.style.top = '0';
            windowEl.style.left = '0';
            windowEl.style.width = '100%';
            windowEl.style.height = '100%';
        } else {
            // Restore
            const restore = JSON.parse(windowEl.dataset.restore);
            Object.assign(windowEl.style, restore);
        }
    }

    _handleMinimize(windowEl) {
        // For now, just hide the window
        // In a full implementation, you'd want to add it to the taskbar
        windowEl.classList.toggle('minimized');
    }

    // Public methods for window management
    getWindow(id) {
        return this.windows.get(id);
    }

    closeWindow(id) {
        const windowEl = this.windows.get(id);
        if (windowEl) {
            this._handleClose(windowEl);
        }
    }

    minimizeWindow(id) {
        const windowEl = this.windows.get(id);
        if (windowEl) {
            this._handleMinimize(windowEl);
        }
    }

    maximizeWindow(id) {
        const windowEl = this.windows.get(id);
        if (windowEl) {
            this._handleMaximize(windowEl);
        }
    }
}
