class Notepad {
    constructor(windowManager, id) {
        this.windowManager = windowManager;
        this.id = id || `notepad-${Date.now()}`;
        this.createNotepadWindow();
    }

    createNotepadWindow() {
        const content = `
            <div class="notepad-toolbar">
                <button class="new-btn">New</button>
                <button class="open-btn">Open</button>
                <button class="save-btn">Save</button>
            </div>
            <textarea class="notepad-editor" spellcheck="false"></textarea>
        `;

        const window = this.windowManager.createWindow(
            this.id,
            'Notepad',
            content,
            {
                width: 500,
                height: 400
            }
        );

        if (!window) return;

        // Add notepad-specific class
        window.classList.add('notepad-window');

        // Setup event listeners
        const toolbar = window.querySelector('.notepad-toolbar');
        toolbar.querySelector('.new-btn').addEventListener('click', () => this.newFile());
        toolbar.querySelector('.open-btn').addEventListener('click', () => this.openFile());
        toolbar.querySelector('.save-btn').addEventListener('click', () => this.saveFile());

        // Store textarea reference
        this.editor = window.querySelector('.notepad-editor');
    }

    newFile() {
        if (this.editor.value && !confirm('Do you want to create a new file? Unsaved changes will be lost.')) {
            return;
        }
        this.editor.value = '';
    }

    async openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                this.editor.value = text;
            } catch (error) {
                console.error('Error reading file:', error);
                alert('Error reading file');
            }
        };

        input.click();
    }

    saveFile() {
        const content = this.editor.value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notepad.txt';
        a.click();
        
        URL.revokeObjectURL(url);
    }
}
