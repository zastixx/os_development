// Main initialization code
window.addEventListener('load', () => {
    // Initialize window management
    const windowManager = new WindowManager('desktop');
    const taskManager = new TaskManager('taskbar', windowManager);

    // Create a welcome window
    windowManager.createWindow(
        'welcome-window',
        'Welcome to Web OS',
        `
        <div style="padding: 20px; text-align: center;">
            <h1>Welcome to Web OS!</h1>
            <p>This is a web-based operating system interface.</p>
            <p>Features available:</p>
            <ul style="list-style: none; padding: 0;">
                <li>✨ Draggable windows</li>
                <li>🔄 Window management</li>
                <li>📑 Multiple windows support</li>
            </ul>
        </div>
        `,
        {
            x: Math.round(window.innerWidth / 2 - 200),
            y: Math.round(window.innerHeight / 2 - 150),
            width: 400,
            height: 300
        }
    );

    // Initialize desktop manager
    const desktopManager = new DesktopManager('desktop');

    // Encoded SVG icons
    const icons = {
        notepad: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"%3E%3Cpath d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5z"/%3E%3Cpath d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/%3E%3C/svg%3E',
        calculator: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"%3E%3Cpath d="M5 3C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5zm14 16H5V5h14v14z"/%3E%3Cpath d="M7 7h4v4H7V7zm6 0h4v4h-4V7zM7 13h4v4H7v-4zm6 0h4v4h-4v-4z"/%3E%3C/svg%3E',
        terminal: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"%3E%3Cpath d="M2 6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6zm2 0v12h16V6H4z"/%3E%3Cpath d="M6 12l3-3v2.25L7.25 12 9 12.75V15zM12 14h6v2h-6z"/%3E%3C/svg%3E',
        settings: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"%3E%3Cpath d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 00.12-.61l-1.92-3.32a.5.5 0 00-.59-.22l-2.39.96a6.86 6.86 0 00-1.62-.94l-.36-2.54a.5.5 0 00-.48-.41h-3.84a.5.5 0 00-.47.41l-.36 2.54a6.86 6.86 0 00-1.62.94l-2.39-.96a.5.5 0 00-.59.22L2.74 8.87a.5.5 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94L2.86 15.5a.5.5 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96a6.86 6.86 0 001.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a6.86 6.86 0 001.62-.94l2.39.96a.5.5 0 00.59-.22l1.92-3.32a.5.5 0 00-.12-.61l-2.03-1.58zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z"/%3E%3C/svg%3E'
    };

    const iconApps = [
        {
            id: 'notepad',
            label: 'Notepad',
            icon: icons.notepad,
            onClick: () => new Notepad(windowManager)
        },
        {
            id: 'calculator',
            label: 'Calculator',
            icon: icons.calculator,
            onClick: () => alert('Calculator app coming soon!')
        },
        {
            id: 'terminal',
            label: 'Terminal',
            icon: icons.terminal,
            onClick: () => alert('Terminal app coming soon!')
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: icons.settings,
            onClick: () => alert('Settings app coming soon!')
        }
    ];

    // Add icons to desktop
    iconApps.forEach((app, index) => {
        const x = (index % 4) * 100 + 20; // 4 icons per row
        const y = Math.floor(index / 4) * 120 + 20;
        desktopManager.addIcon(app.id, app.label, app.icon, app.onClick, { x, y });
    });

    // Add welcome text
    const welcomeText = document.createElement('div');
    welcomeText.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: white;
        text-align: center;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    `;
    welcomeText.innerHTML = `
        <h1>Welcome to Web OS</h1>
        <p>Double-click on icons to open applications</p>
    `;
    document.getElementById('desktop').appendChild(welcomeText);
});
