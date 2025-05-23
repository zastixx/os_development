class TaskManager {
    constructor(taskbarId, windowManager) {
        this.taskbar = document.getElementById(taskbarId);
        this.windowManager = windowManager;
        this.dockContainer = document.createElement('div');
        this.dockContainer.className = 'dock-icons';
        this.apps = new Map();
        this._init();
    }

    _init() {
        // Add dock container to taskbar
        this.taskbar.appendChild(this.dockContainer);

        // Add default apps to dock
        const defaultApps = [
            {
                id: 'finder',
                label: 'Finder',
                icon: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%230078D4%22%3E%3Cpath%20d%3D%22M20%204H4c-1.1%200-2%20.9-2%202v12c0%201.1.9%202%202%202h16c1.1%200%202-.9%202-2V6c0-1.1-.9-2-2-2zm0%2014H4V8h16v10z%22/%3E%3C/svg%3E',
                onClick: () => alert('File Manager coming soon!')
            },
            {
                id: 'notepad',
                label: 'Notepad',
                icon: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23FFA500%22%3E%3Cpath%20d%3D%22M19%203H5c-1.1%200-2%20.9-2%202v14c0%201.1.9%202%202%202h14c1.1%200%202-.9%202-2V5c0-1.1-.9-2-2-2zm0%2016H5V5h14v14z%22/%3E%3Cpath%20d%3D%22M7%207h10v2H7zm0%204h10v2H7zm0%204h7v2H7z%22/%3E%3C/svg%3E',
                onClick: () => new Notepad(this.windowManager)
            },
            {
                id: 'calculator',
                label: 'Calculator',
                icon: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%234CAF50%22%3E%3Cpath%20d%3D%22M19%203H5c-1.1%200-2%20.9-2%202v14c0%201.1.9%202%202%202h14c1.1%200%202-.9%202-2V5c0-1.1-.9-2-2-2zm0%2016H5V5h14v14z%22/%3E%3Cpath%20d%3D%22M7%207h4v4H7zm6%200h4v4h-4zm-6%206h4v4H7zm6%200h4v4h-4z%22/%3E%3C/svg%3E',
                onClick: () => alert('Calculator coming soon!')
            },
            {
                id: 'terminal',
                label: 'Terminal',
                icon: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23E91E63%22%3E%3Cpath%20d%3D%22M20%204H4c-1.1%200-2%20.9-2%202v12c0%201.1.9%202%202%202h16c1.1%200%202-.9%202-2V6c0-1.1-.9-2-2-2zm0%2014H4V8h16v10z%22/%3E%3Cpath%20d%3D%22M6%2012l3-3v6zM12%2014h6v2h-6z%22/%3E%3C/svg%3E',
                onClick: () => alert('Terminal coming soon!')
            },
            { type: 'separator' },
            {
                id: 'settings',
                label: 'Settings',
                icon: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%239E9E9E%22%3E%3Cpath%20d%3D%22M19.14%2012.94c.04-.3.06-.61.06-.94%200-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24%200-.43.17-.47.41l-.36%202.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47%200-.59.22L2.74%208.87c-.12.21-.08.47.12.61l2.03%201.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03%201.58c-.18.14-.23.41-.12.61l1.92%203.32c.12.22.37.29.59.22l2.39-.96c.5.38%201.03.7%201.62.94l.36%202.54c.05.24.24.41.48.41h3.84c.24%200%20.44-.17.47-.41l.36-2.54c.59-.24%201.13-.56%201.62-.94l2.39.96c.22.08.47%200%20.59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12%2015.6c-1.98%200-3.6-1.62-3.6-3.6s1.62-3.6%203.6-3.6%203.6%201.62%203.6%203.6-1.62%203.6-3.6%203.6z%22/%3E%3C/svg%3E',
                onClick: () => alert('Settings coming soon!')
            }
        ];

        defaultApps.forEach(app => this.addApp(app));
    }

    addApp(app) {
        if (app.type === 'separator') {
            const separator = document.createElement('div');
            separator.className = 'dock-separator';
            this.dockContainer.appendChild(separator);
            return;
        }

        const iconEl = document.createElement('div');
        iconEl.className = 'dock-icon';
        iconEl.innerHTML = `
            <img src="${app.icon}" alt="${app.label}">
            <div class="dock-icon-tooltip">${app.label}</div>
        `;
        
        iconEl.addEventListener('click', () => {
            app.onClick();
            this.setAppRunning(app.id, true);
        });

        this.dockContainer.appendChild(iconEl);
        this.apps.set(app.id, { element: iconEl, onClick: app.onClick });
    }

    setAppRunning(id, isRunning) {
        const app = this.apps.get(id);
        if (app) {
            app.element.classList.toggle('running', isRunning);
        }
    }
}
