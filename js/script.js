// BKnote JavaScript 功能
document.addEventListener('DOMContentLoaded', function() {
    const notesContainer = document.getElementById('notesContainer');
    const newNoteBtn = document.getElementById('newNote');
    const searchInput = document.getElementById('searchNotes');
    
    // 初始化示例笔记（如果本地存储为空）
    if (!localStorage.getItem('notes')) {
        const sampleNotes = [
            {
                id: Date.now(),
                title: "欢迎使用 BKnote",
                content: "这是一个简单的笔记应用示例。你可以创建、编辑和删除笔记。",
                date: new Date().toISOString()
            },
            {
                id: Date.now() + 1,
                title: "如何使用",
                content: "1. 点击'新建笔记'按钮创建新笔记\n2. 使用搜索框查找笔记\n3. 点击笔记标题或内容进行编辑",
                date: new Date().toISOString()
            }
        ];
        localStorage.setItem('notes', JSON.stringify(sampleNotes));
    }
    
    // 渲染所有笔记
    function renderNotes(notes = JSON.parse(localStorage.getItem('notes'))) {
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            notesContainer.innerHTML = '<p class="no-notes">还没有笔记，点击"新建笔记"创建一个吧！</p>';
            return;
        }
        
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.dataset.id = note.id;
            
            const date = new Date(note.date);
            const formattedDate = date.toLocaleString();
            
            noteElement.innerHTML = `
                <h3 contenteditable="true" class="note-title">${note.title}</h3>
                <p contenteditable="true" class="note-content">${note.content}</p>
                <div class="note-actions">
                    <small>创建时间: <span class="date">${formattedDate}</span></small>
                    <button class="delete-note" data-id="${note.id}">删除</button>
                </div>
            `;
            
            notesContainer.appendChild(noteElement);
        });
        
        // 添加删除事件监听器
        document.querySelectorAll('.delete-note').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteNote(id);
            });
        });
        
        // 添加编辑事件监听器
        document.querySelectorAll('.note-title, .note-content').forEach(element => {
            element.addEventListener('blur', function() {
                updateNote(parseInt(this.closest('.note').dataset.id), 
                          document.querySelector(`.note[data-id="${this.closest('.note').dataset.id}"] .note-title`).textContent,
                          document.querySelector(`.note[data-id="${this.closest('.note').dataset.id}"] .note-content`).textContent);
            });
        });
    }
    
    // 创建新笔记
    function createNote() {
        const newNote = {
            id: Date.now(),
            title: "新笔记",
            content: "在此处输入笔记内容...",
            date: new Date().toISOString()
        };
        
        const notes = JSON.parse(localStorage.getItem('notes'));
        notes.unshift(newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        renderNotes();
    }
    
    // 删除笔记
    function deleteNote(id) {
        let notes = JSON.parse(localStorage.getItem('notes'));
        notes = notes.filter(note => note.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    }
    
    // 更新笔记
    function updateNote(id, title, content) {
        const notes = JSON.parse(localStorage.getItem('notes'));
        const noteIndex = notes.findIndex(note => note.id === id);
        
        if (noteIndex !== -1) {
            notes[noteIndex].title = title.trim() || "未命名笔记";
            notes[noteIndex].content = content;
            notes[noteIndex].date = new Date().toISOString();
            localStorage.setItem('notes', JSON.stringify(notes));
        }
    }
    
    // 搜索笔记
    function searchNotes(query) {
        const allNotes = JSON.parse(localStorage.getItem('notes'));
        if (!query) {
            renderNotes(allNotes);
            return;
        }
        
        const filteredNotes = allNotes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) || 
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        
        renderNotes(filteredNotes);
    }
    
    // 事件监听器
    newNoteBtn.addEventListener('click', createNote);
    
    searchInput.addEventListener('input', function() {
        searchNotes(this.value);
    });
    
    // 初始渲染
    renderNotes();
});