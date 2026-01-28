// BK专属笔记 JavaScript 功能
document.addEventListener('DOMContentLoaded', function() {
    const notesContainer = document.getElementById('notesContainer');
    const newNoteBtn = document.getElementById('newNote');
    const searchInput = document.getElementById('searchNotes');
    const importNotesBtn = document.getElementById('importNotesBtn');
    const importNotesInput = document.getElementById('importNotes');
    let currentTagFilter = ''; // 当前标签过滤器
    
    // 初始化示例笔记（如果本地存储为空）
    if (!localStorage.getItem('notes')) {
        const sampleNotes = [
            {
                id: Date.now(),
                title: "欢迎使用 BK专属笔记",
                content: "这是一个功能丰富的笔记应用。你可以创建、编辑和删除笔记，还支持插入图片、代码、GIF和视频链接。",
                date: new Date().toISOString(),
                tags: ["欢迎", "介绍", "帮助"]
            },
            {
                id: Date.now() + 1,
                title: "如何使用高级功能",
                content: "1. 点击'新建笔记'按钮创建新笔记\n2. 使用搜索框查找笔记\n3. 在笔记中插入图片、代码块、GIF或视频链接\n\n例如：\n\n插入图片：![描述](图片URL)\n插入代码：``javascript\nconsole.log('Hello');\n```\n插入GIF：![GIF](gif_url)\n插入视频链接：[视频](视频URL)",
                date: new Date().toISOString(),
                tags: ["功能", "教程", "说明"]
            }
        ];
        localStorage.setItem('notes', JSON.stringify(sampleNotes));
    }
    
    // 渲染所有笔记
    function renderNotes(notes = JSON.parse(localStorage.getItem('notes'))) {
        // 应用标签过滤
        if(currentTagFilter) {
            notes = notes.filter(note => note.tags && note.tags.includes(currentTagFilter));
        }
        
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
            
            // 生成标签HTML
            const tagsHtml = note.tags && note.tags.length > 0 
                ? note.tags.map(tag => `<span class="tag" data-tag="${tag}" onclick="filterByTag('${tag}')">${tag}</span>`).join(' ')
                : '<span class="no-tags">无标签</span>';
            
            noteElement.innerHTML = `
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-toolbar">
                        <button class="insert-image-btn" title="插入图片">🖼️</button>
                        <button class="insert-code-btn" title="插入代码">()}</button>
                    </div>
                </div>
                <div class="note-content">${processedContent}</div>
                <div class="note-tags">
                    ${tagsHtml}
                </div>
                <div class="note-actions">
                    <small>创建时间: <span class="date">${formattedDate}</span></small>
                    <button class="delete-note" data-id="${note.id}">删除</button>
                </div>
            `;
            
            // 添加点击事件，跳转到编辑页面
            noteElement.addEventListener('click', function(e) {
                // 如果点击的是删除按钮、工具栏按钮或标签，则不跳转
                if (e.target.classList.contains('delete-note') || 
                    e.target.classList.contains('insert-image-btn') || 
                    e.target.classList.contains('insert-code-btn') ||
                    e.target.classList.contains('tag')) {
                    e.stopPropagation(); // 阻止冒泡，防止触发跳转
                    return;
                }
                
                // 跳转到编辑页面，传递笔记ID
                window.location.href = `edit.html?id=${note.id}`;
            });
            
            notesContainer.appendChild(noteElement);
            
            // 为每个笔记添加图片插入功能（仅在编辑页面可用，这里保留兼容性）
            const insertImageBtn = noteElement.querySelector('.insert-image-btn');
            if (insertImageBtn) {
                insertImageBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // 阻止冒泡，防止触发跳转
                    alert('图片插入功能在编辑页面中可用。点击笔记可前往编辑页面。');
                });
            }
            
            // 为每个笔记添加代码插入功能（仅在编辑页面可用，这里保留兼容性）
            const insertCodeBtn = noteElement.querySelector('.insert-code-btn');
            if (insertCodeBtn) {
                insertCodeBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // 阻止冒泡，防止触发跳转
                    alert('代码插入功能在编辑页面中可用。点击笔记可前往编辑页面。');
                });
            }
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
        
        // 更新标签云
        updateTagsCloud();
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
            date: new Date().toISOString(),
            tags: [] // 新笔记默认没有标签
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
    function updateNote(id, title, content, tags = []) {
        const notes = JSON.parse(localStorage.getItem('notes'));
        const noteIndex = notes.findIndex(note => note.id === id);
        
        if (noteIndex !== -1) {
            notes[noteIndex].title = title.trim() || "未命名笔记";
            notes[noteIndex].content = content;
            notes[noteIndex].tags = Array.isArray(tags) ? tags : [];
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
            note.content.toLowerCase().includes(query.toLowerCase()) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );
        
        renderNotes(filteredNotes);
    }
    
    // 导入笔记功能
    function importNotes() {
        importNotesInput.click(); // 触发隐藏的文件选择输入框
    }
    
    // 处理文件导入
    importNotesInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const fileType = file.name.split('.').pop().toLowerCase();
        
        if (fileType === 'json') {
            // 处理JSON文件导入
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedNotes = JSON.parse(event.target.result);
                    
                    // 验证导入的数据格式
                    if (!Array.isArray(importedNotes)) {
                        throw new Error('无效的JSON格式，应为数组');
                    }
                    
                    // 验证每条笔记是否有必要的属性
                    for (const note of importedNotes) {
                        if (typeof note !== 'object' || !note.hasOwnProperty('id') || 
                            !note.hasOwnProperty('title') || !note.hasOwnProperty('content')) {
                            throw new Error('JSON格式错误，笔记缺少必要属性');
                        }
                    }
                    
                    // 确认导入
                    const confirmed = confirm(`确定要导入 ${importedNotes.length} 条笔记吗？\n注意：这可能会覆盖现有笔记（相同ID）`);
                    if (confirmed) {
                        let existingNotes = JSON.parse(localStorage.getItem('notes')) || [];
                        
                        // 合并导入的笔记，如果ID冲突则更新
                        importedNotes.forEach(importedNote => {
                            // 确保导入的笔记包含tags字段
                            if (!importedNote.hasOwnProperty('tags')) {
                                importedNote.tags = [];
                            }
                            
                            const existingIndex = existingNotes.findIndex(note => note.id === importedNote.id);
                            if (existingIndex !== -1) {
                                // 更新现有笔记
                                existingNotes[existingIndex] = importedNote;
                            } else {
                                // 添加新笔记
                                existingNotes.push(importedNote);
                            }
                        });
                        
                        localStorage.setItem('notes', JSON.stringify(existingNotes));
                        renderNotes();
                        alert(`成功导入 ${importedNotes.length} 条笔记！`);
                    }
                } catch (error) {
                    alert(`导入失败：${error.message}`);
                    console.error('导入JSON文件时出错：', error);
                }
            };
            reader.readAsText(file);
        } else if (fileType === 'zip') {
            // 处理ZIP文件导入
            const reader = new FileReader();
            reader.onload = function(event) {
                JSZip.loadAsync(event.target.result).then(function(zip) {
                    // 获取所有文件
                    const filePromises = [];
                    
                    Object.keys(zip.files).forEach(function(filename) {
                        // 检查是否是markdown文件
                        if (filename.endsWith('.md')) {
                            filePromises.push(
                                zip.file(filename).async("text").then(function(content) {
                                    // 从markdown内容中提取标题（第一行是#标题）
                                    const lines = content.split('\n');
                                    let title = '未命名笔记';
                                    
                                    // 查找第一个标题作为笔记标题
                                    for (const line of lines) {
                                        if (line.startsWith('# ')) {
                                            title = line.substring(2).trim();
                                            break;
                                        }
                                    }
                                    
                                    // 移除第一行的标题和创建时间，提取实际内容
                                    let noteContent = content;
                                    for (let i = 0; i < lines.length; i++) {
                                        const line = lines[i];
                                        if (line.startsWith('# ') || line.startsWith('创建时间:')) {
                                            continue; // 跳过标题行和时间行
                                        } else {
                                            noteContent = lines.slice(i).join('\n');
                                            break;
                                        }
                                    }
                                    
                                    // 检查是否有图片需要处理
                                    const imageRegex = /\.(\/images\/)/g;
                                    if (imageRegex.test(noteContent)) {
                                        // 获取图片文件夹中的图片
                                        const imageFiles = {};
                                        
                                        Object.keys(zip.files).forEach(function(imgFilename) {
                                            if (imgFilename.includes('/images/') && 
                                                (imgFilename.endsWith('.png') || 
                                                 imgFilename.endsWith('.jpg') || 
                                                 imgFilename.endsWith('.jpeg') || 
                                                 imgFilename.endsWith('.gif') || 
                                                 imgFilename.endsWith('.bmp'))) {
                                                // 提取图片文件名
                                                const imgName = imgFilename.split('/').pop();
                                                imageFiles[imgName] = imgFilename;
                                            }
                                        });
                                        
                                        // 将图片转换为base64并替换内容中的图片路径
                                        const replaceImagesPromises = [];
                                        
                                        Object.keys(imageFiles).forEach(function(imgName) {
                                            replaceImagesPromises.push(
                                                zip.file(imageFiles[imgName]).async("base64").then(function(base64Data) {
                                                    const extension = imgName.split('.').pop();
                                                    const dataUrl = `data:image/${extension};base64,${base64Data}`;
                                                    noteContent = noteContent.replace(new RegExp(`\\.\\/images\\/${imgName}`, 'g'), dataUrl);
                                                })
                                            );
                                        });
                                        
                                        // 等待所有图片替换完成
                                        return Promise.all(replaceImagesPromises).then(function() {
                                            // 创建笔记对象
                                            return {
                                                id: Date.now() + Math.floor(Math.random() * 1000000), // 避免ID冲突
                                                title: title,
                                                content: noteContent,
                                                date: new Date().toISOString(),
                                                tags: [] // ZIP导入的笔记默认无标签
                                            };
                                        });
                                    } else {
                                        // 没有图片，直接创建笔记对象
                                        return {
                                            id: Date.now() + Math.floor(Math.random() * 1000000), // 避免ID冲突
                                            title: title,
                                            content: noteContent,
                                            date: new Date().toISOString(),
                                            tags: [] // ZIP导入的笔记默认无标签
                                        };
                                    }
                                })
                            );
                        }
                    });
                    
                    Promise.all(filePromises).then(function(results) {
                        // 过滤掉可能的非Promise结果
                        const importedNotes = results.filter(result => result !== undefined);
                        
                        if (importedNotes.length === 0) {
                            alert('ZIP文件中没有找到Markdown格式的笔记文件');
                            return;
                        }
                        
                        // 确保所有导入完成后再继续
                        Promise.all(importedNotes).then(function(finalNotes) {
                            // 确认导入
                            const confirmed = confirm(`确定要导入 ${finalNotes.length} 条笔记吗？\n注意：这可能会覆盖现有笔记（相同ID）`);
                            if (confirmed) {
                                let existingNotes = JSON.parse(localStorage.getItem('notes')) || [];
                                
                                // 合并导入的笔记，如果ID冲突则更新
                                finalNotes.forEach(importedNote => {
                                    const existingIndex = existingNotes.findIndex(note => note.id === importedNote.id);
                                    if (existingIndex !== -1) {
                                        // 更新现有笔记
                                        existingNotes[existingIndex] = importedNote;
                                    } else {
                                        // 添加新笔记
                                        existingNotes.push(importedNote);
                                    }
                                });
                                
                                localStorage.setItem('notes', JSON.stringify(existingNotes));
                                renderNotes();
                                alert(`成功导入 ${finalNotes.length} 条笔记，包含图片已处理！`);
                            }
                        }).catch(function(error) {
                            console.error('处理导入笔记时出错：', error);
                            alert('处理导入内容时出错，请查看控制台了解详情');
                        });
                    }).catch(function(err) {
                        alert('读取ZIP文件中的Markdown内容时出错');
                        console.error('读取ZIP文件出错：', err);
                    });
                }).catch(function(err) {
                    alert('加载ZIP文件时出错');
                    console.error('加载ZIP文件出错：', err);
                });
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('不支持的文件格式，请选择.json或.zip文件');
        }
        
        // 重置文件输入框
        e.target.value = '';
    });
    
    // 全局函数，用于标签过滤
    window.filterByTag = function(tag) {
        currentTagFilter = currentTagFilter === tag ? '' : tag;
        renderNotes();
    };
    
    // 更新标签云的函数
    window.updateTagsCloud = function() {
        // 获取所有笔记的标签
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const allTags = new Set();
        
        // 收集所有标签
        notes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => {
                    if (tag.trim()) {
                        allTags.add(tag.trim());
                    }
                });
            }
        });
        
        // 获取标签云显示元素
        const tagsListElement = document.getElementById('tagsList');
        
        if (!tagsListElement) return; // 如果页面没有标签云元素，则不处理
        
        if (allTags.size === 0) {
            tagsListElement.textContent = '暂无标签';
            return;
        }
        
        // 创建标签云HTML
        const tagsArray = Array.from(allTags);
        const tagsHtml = tagsArray.map(tag => {
            // 高亮当前被过滤的标签
            const activeClass = currentTagFilter === tag ? ' tag-active' : '';
            return `<span class="tag${activeClass}" onclick="filterByTag('${tag}')">${tag}</span>`;
        }).join(' ');
        
        tagsListElement.innerHTML = tagsHtml;
    };
    
    // 事件监听器
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', createNote);
    } else {
        console.error('找不到新建笔记按钮，请检查HTML中是否有id为"newNote"的按钮');
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchNotes(this.value);
        });
    }
    
    if (importNotesBtn) {
        importNotesBtn.addEventListener('click', importNotes);
    }
    
    // 初始渲染
    renderNotes();
});