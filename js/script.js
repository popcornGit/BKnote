// BK专属笔记 JavaScript 功能
document.addEventListener('DOMContentLoaded', function() {
    const notesContainer = document.getElementById('notesContainer');
    const newNoteBtn = document.getElementById('newNote');
    const searchInput = document.getElementById('searchNotes');
    
    // 初始化示例笔记（如果本地存储为空）
    if (!localStorage.getItem('notes')) {
        const sampleNotes = [
            {
                id: Date.now(),
                title: "欢迎使用 BK专属笔记",
                content: "这是一个功能丰富的笔记应用。你可以创建、编辑和删除笔记，还支持插入图片、代码、GIF和视频链接。",
                date: new Date().toISOString()
            },
            {
                id: Date.now() + 1,
                title: "如何使用高级功能",
                content: "1. 点击'新建笔记'按钮创建新笔记\n2. 使用搜索框查找笔记\n3. 在笔记中插入图片、代码块、GIF或视频链接\n\n例如：\n\n插入图片：![描述](图片URL)\n插入代码：```javascript\nconsole.log('Hello');\n```\n插入GIF：![GIF](gif_url)\n插入视频链接：[视频](视频URL)",
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
            
            // 将内容中的Markdown语法转换为HTML
            const processedContent = processContent(note.content);
            
            noteElement.innerHTML = `
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-toolbar">
                        <button class="insert-image-btn" title="插入图片">🖼️</button>
                        <button class="insert-code-btn" title="插入代码">()}</button>
                    </div>
                </div>
                <div class="note-content">${processedContent}</div>
                <div class="note-actions">
                    <small>创建时间: <span class="date">${formattedDate}</span></small>
                    <button class="delete-note" data-id="${note.id}">删除</button>
                </div>
            `;
            
            // 添加点击事件，跳转到编辑页面
            noteElement.addEventListener('click', function(e) {
                // 如果点击的是删除按钮或工具栏按钮，则不跳转
                if (e.target.classList.contains('delete-note') || 
                    e.target.classList.contains('insert-image-btn') || 
                    e.target.classList.contains('insert-code-btn')) {
                    e.stopPropagation(); // 阻止冒泡，防止触发跳转
                    return;
                }
                
                // 跳转到编辑页面，传递笔记ID
                window.location.href = `edit.html?id=${note.id}`;
            });
            
            notesContainer.appendChild(noteElement);
            
            // 为每个笔记添加图片插入功能（仅在编辑页面可用，这里保留兼容性）
            const insertImageBtn = noteElement.querySelector('.insert-image-btn');
            insertImageBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止冒泡，防止触发跳转
                alert('图片插入功能在编辑页面中可用。点击笔记可前往编辑页面。');
            });
            
            // 为每个笔记添加代码插入功能（仅在编辑页面可用，这里保留兼容性）
            const insertCodeBtn = noteElement.querySelector('.insert-code-btn');
            insertCodeBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止冒泡，防止触发跳转
                alert('代码插入功能在编辑页面中可用。点击笔记可前往编辑页面。');
            });
        });
        
        // 添加删除事件监听器
        document.querySelectorAll('.delete-note').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止冒泡，防止触发跳转
                const id = parseInt(this.getAttribute('data-id'));
                
                // 获取笔记标题用于确认消息
                const notes = JSON.parse(localStorage.getItem('notes')) || [];
                const note = notes.find(note => note.id === id);
                const noteTitle = note ? note.title : '未知标题';
                
                // 二次确认
                const confirmed = confirm(`确定要删除笔记 "${noteTitle}" 吗？此操作不可撤销！`);
                if (confirmed) {
                    deleteNote(id);
                }
            });
        });
    }
    
    // 处理内容中的Markdown语法
    function processContent(content) {
        // 处理代码块
        content = content.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="$1">$2</code></pre>');
        
        // 处理行内代码
        content = content.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // 处理图片和GIF（包括本地图片数据URL）
        content = content.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" title="$1" style="max-width: 100%;" onError="this.onerror=null;this.src=\'\';this.alt=\'无法加载图片\';">');
        
        // 处理视频链接
        content = content.replace(/\[(.*?)\]\((https?:\/\/.*?\.(mp4|webm|ogg))\)/g, '<video controls width="100%"><source src="$2" type="video/$3">您的浏览器不支持视频标签。</video>');
        
        // 处理普通链接
        content = content.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 处理换行
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }
    
    // 创建新笔记
    function createNote() {
        const newNote = {
            id: Date.now(),
            title: "新笔记",
            content: "在此处输入笔记内容...\n\n提示：您可以插入图片、代码、GIF和视频链接。\n- 点击笔记进入编辑页面\n- 在编辑页面可使用更多功能",
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
    
    // 添加同步到GitHub功能
    function initSyncFeature() {
        // 创建同步按钮
        const syncBtn = document.createElement('button');
        syncBtn.id = 'syncWithGithub';
        syncBtn.textContent = '同步到GitHub';
        syncBtn.addEventListener('click', openSyncModal);
        
        // 将同步按钮添加到控制区域
        const controlsDiv = document.querySelector('.controls');
        controlsDiv.appendChild(syncBtn);
    }
    
    // 打开同步模态窗口
    function openSyncModal() {
        // 创建模态窗口
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                padding: 2rem;
                border-radius: 8px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <h2>同步到GitHub</h2>
                <p>请选择同步操作：</p>
                
                <form id="syncForm">
                    <div style="margin-bottom: 1rem;">
                        <label>GitHub Token:</label>
                        <input type="password" id="githubToken" placeholder="输入您的GitHub Personal Access Token" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                        <small>需要具有repo权限的Personal Access Token</small>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label>用户名:</label>
                        <input type="text" id="githubUsername" placeholder="输入您的GitHub用户名" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label>仓库名称:</label>
                        <input type="text" id="repoName" placeholder="例如: my-notes-backup" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label>分支名称:</label>
                        <input type="text" id="branchName" placeholder="例如: main (默认)" value="main" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label>文件名:</label>
                        <input type="text" id="fileName" placeholder="例如: notes.json (默认)" value="notes.json" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-direction: column;">
                        <button type="button" id="syncUpload" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">上传本地笔记到GitHub</button>
                        
                        <button type="button" id="syncDownload" style="
                            background: #28a745;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">从GitHub下载笔记</button>
                        
                        <button type="button" id="syncMerge" style="
                            background: #ffc107;
                            color: black;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">合并本地与GitHub笔记</button>
                        
                        <button type="button" id="closeModal" style="
                            background: #6c757d;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">关闭</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定关闭事件
        document.getElementById('closeModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 绑定上传事件
        document.getElementById('syncUpload').addEventListener('click', () => {
            const token = document.getElementById('githubToken').value;
            const username = document.getElementById('githubUsername').value;
            const repo = document.getElementById('repoName').value;
            const branch = document.getElementById('branchName').value;
            const fileName = document.getElementById('fileName').value;
            
            if (!token || !username || !repo) {
                alert('请填写完整的GitHub信息！');
                return;
            }
            
            syncToGithubUpload(token, username, repo, branch, fileName).then(() => {
                document.body.removeChild(modal);
            }).catch(error => {
                console.error('上传错误:', error);
            });
        });
        
        // 绑定下载事件
        document.getElementById('syncDownload').addEventListener('click', () => {
            const token = document.getElementById('githubToken').value;
            const username = document.getElementById('githubUsername').value;
            const repo = document.getElementById('repoName').value;
            const branch = document.getElementById('branchName').value;
            const fileName = document.getElementById('fileName').value;
            
            if (!token || !username || !repo) {
                alert('请填写完整的GitHub信息！');
                return;
            }
            
            syncToGithubDownload(token, username, repo, branch, fileName).then(() => {
                document.body.removeChild(modal);
            }).catch(error => {
                console.error('下载错误:', error);
            });
        });
        
        // 绑定合并事件
        document.getElementById('syncMerge').addEventListener('click', () => {
            const token = document.getElementById('githubToken').value;
            const username = document.getElementById('githubUsername').value;
            const repo = document.getElementById('repoName').value;
            const branch = document.getElementById('branchName').value;
            const fileName = document.getElementById('fileName').value;
            
            if (!token || !username || !repo) {
                alert('请填写完整的GitHub信息！');
                return;
            }
            
            syncToGithubMerge(token, username, repo, branch, fileName).then(() => {
                document.body.removeChild(modal);
            }).catch(error => {
                console.error('合并错误:', error);
            });
        });
    }
    
    // 上传笔记到GitHub
    async function syncToGithubUpload(token, username, repo, branch, fileName) {
        const notesData = localStorage.getItem('notes');
        const blobContent = notesData;
        
        try {
            // 获取当前文件SHA（如果存在）
            let sha = null;
            try {
                const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${fileName}?ref=${branch}`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (response.ok) {
                    const fileData = await response.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                console.log("文件可能不存在，将创建新文件");
            }
            
            // 准备请求体
            const requestBody = {
                message: `Sync notes on ${new Date().toLocaleString()}`,
                content: btoa(unescape(encodeURIComponent(blobContent))),
                branch: branch
            };
            
            if (sha) {
                requestBody.sha = sha; // 如果文件存在，包含SHA以更新文件
            }
            
            // 发送API请求
            const url = sha 
                ? `https://api.github.com/repos/${username}/${repo}/contents/${fileName}`
                : `https://api.github.com/repos/${username}/${repo}/contents/${fileName}`;
                
            const response = await fetch(url, {
                method: sha ? 'PUT' : 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(requestBody)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert(`上传成功！笔记已保存到 ${username}/${repo}/${fileName}`);
            } else {
                throw new Error(result.message || '上传失败');
            }
        } catch (error) {
            console.error('上传错误:', error);
            alert(`上传失败: ${error.message}`);
        }
    }
    
    // 从GitHub下载笔记
    async function syncToGithubDownload(token, username, repo, branch, fileName) {
        try {
            const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${fileName}?ref=${branch}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error('无法获取远程文件，请检查仓库信息和文件名是否正确');
            }
            
            const fileData = await response.json();
            const content = atob(fileData.content.replace(/\n/g, ''));
            
            // 解析内容并验证是否为有效的笔记数据
            let notes = JSON.parse(content);
            if (!Array.isArray(notes) || notes.some(note => !note.hasOwnProperty('id') || !note.hasOwnProperty('title'))) {
                throw new Error('下载的文件不是有效的笔记格式');
            }
            
            // 确认覆盖本地数据
            const confirmed = confirm(`确定要从GitHub下载笔记并覆盖本地数据吗？这将替换您当前所有的本地笔记！`);
            if (confirmed) {
                localStorage.setItem('notes', JSON.stringify(notes));
                renderNotes();
                alert(`下载成功！已从 ${username}/${repo}/${fileName} 下载笔记并更新本地数据`);
            }
        } catch (error) {
            console.error('下载错误:', error);
            alert(`下载失败: ${error.message}`);
        }
    }
    
    // 合并本地与GitHub笔记
    async function syncToGithubMerge(token, username, repo, branch, fileName) {
        try {
            // 首先获取远程笔记
            const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${fileName}?ref=${branch}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            let remoteNotes = [];
            if (response.ok) {
                const fileData = await response.json();
                const content = atob(fileData.content.replace(/\n/g, ''));
                remoteNotes = JSON.parse(content);
                
                // 验证数据格式
                if (!Array.isArray(remoteNotes) || remoteNotes.some(note => !note.hasOwnProperty('id') || !note.hasOwnProperty('title'))) {
                    throw new Error('远程文件不是有效的笔记格式');
                }
            } else {
                alert('远程文件不存在，将创建新文件');
            }
            
            // 获取本地笔记
            const localNotes = JSON.parse(localStorage.getItem('notes')) || [];
            
            // 合并策略：远程笔记优先，本地笔记补充
            const mergedNotesMap = new Map();
            
            // 先添加远程笔记
            remoteNotes.forEach(note => {
                mergedNotesMap.set(note.id, note);
            });
            
            // 再添加本地笔记（仅添加远程没有的）
            localNotes.forEach(note => {
                if (!mergedNotesMap.has(note.id)) {
                    mergedNotesMap.set(note.id, note);
                } else {
                    // 如果笔记在两边都存在，使用较新的版本
                    const remoteNote = mergedNotesMap.get(note.id);
                    const localDate = new Date(note.date);
                    const remoteDate = new Date(remoteNote.date);
                    
                    if (localDate > remoteDate) {
                        mergedNotesMap.set(note.id, note);
                    }
                }
            });
            
            // 转回数组
            const mergedNotes = Array.from(mergedNotesMap.values());
            
            // 询问用户是否确认合并
            const confirmed = confirm(`合并后将有 ${mergedNotes.length} 条笔记。是否确认合并？\n注意：合并后会自动上传到GitHub。`);
            if (confirmed) {
                localStorage.setItem('notes', JSON.stringify(mergedNotes));
                renderNotes();
                
                // 自动上传合并后的结果
                await syncToGithubUpload(token, username, repo, branch, fileName);
            }
        } catch (error) {
            console.error('合并错误:', error);
            alert(`合并失败: ${error.message}`);
        }
    }
    
    // 事件监听器
    newNoteBtn.addEventListener('click', createNote);
    
    searchInput.addEventListener('input', function() {
        searchNotes(this.value);
    });
    
    // 初始化同步功能
    initSyncFeature();
    
    // 初始渲染
    renderNotes();
});