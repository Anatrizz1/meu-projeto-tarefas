// Obtém referências aos elementos HTML
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const API_URL = 'http://127.0.0.1:5000/tasks';

// Função para buscar e exibir as tarefas no Front-End
async function fetchAndRenderTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        
        // Limpa a lista antes de renderizar
        taskList.innerHTML = ''; 
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.taskId = task.id;
            
            // Adiciona a classe 'completed' se a tarefa estiver concluída
            if (task.completed) {
                li.classList.add('completed');
            }

            li.innerHTML = `
                <span>${task.name} - ${task.date} às ${task.time}</span>
                <div class="task-actions">
                    <button class="complete-btn">${task.completed ? 'Desfazer' : 'Concluir'}</button>
                    <button class="edit-btn">Editar</button>
                    <button class="delete-btn">Excluir</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
    }
}

// Evento de envio do formulário
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const taskName = document.getElementById('task-name').value;
    const taskDate = document.getElementById('task-date').value;
    const taskTime = document.getElementById('task-time').value;

    const newTask = {
        name: taskName,
        date: taskDate,
        time: taskTime
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });
        
        fetchAndRenderTasks();
        taskForm.reset();
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
    }
});

// Evento de clique na lista para concluir, editar ou excluir
taskList.addEventListener('click', async (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const taskId = li.dataset.taskId;

    // Lógica para marcar/desmarcar como concluída
    if (e.target.classList.contains('complete-btn')) {
        const isCompleted = li.classList.contains('completed');
        try {
            await fetch(`${API_URL}/${taskId}`, {
                method: 'PATCH', // Usamos PATCH para atualizar parcialmente
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: isCompleted ? 0 : 1 })
            });
            fetchAndRenderTasks();
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
        }
    }
    
    // Lógica para editar a tarefa
    else if (e.target.classList.contains('edit-btn')) {
        const newName = prompt('Digite o novo nome da tarefa:');
        if (newName) {
            try {
                await fetch(`${API_URL}/${taskId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName })
                });
                fetchAndRenderTasks();
            } catch (error) {
                console.error('Erro ao editar tarefa:', error);
            }
        }
    }
    
    // Lógica para excluir a tarefa
    else if (e.target.classList.contains('delete-btn')) {
        try {
            await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
            li.remove();
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
        }
    }
});

// Chama a função para carregar as tarefas quando a página é carregada
fetchAndRenderTasks();