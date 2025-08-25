from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

# Inicializa o aplicativo Flask
app = Flask(__name__)
# Permite que o Front-End se conecte ao Back-End
CORS(app)

# Conecta ao banco de dados (o arquivo 'tasks.db' será criado automaticamente)
def get_db_connection():
    conn = sqlite3.connect('tasks.db')
    conn.row_factory = sqlite3.Row  # Permite acessar as colunas como dicionário
    return conn

# Cria a tabela de tarefas se ela não existir
# A coluna 'completed' já é adicionada aqui, tornando a solução mais robusta
def create_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

# Executa a criação da tabela quando o servidor iniciar
create_table()

# Rota para adicionar uma nova tarefa
@app.route('/tasks', methods=['POST'])
def add_task():
    new_task = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO tasks (name, date, time) VALUES (?, ?, ?)',
                   (new_task['name'], new_task['date'], new_task['time']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Tarefa adicionada com sucesso!'}), 201

# Rota para listar todas as tarefas
@app.route('/tasks', methods=['GET'])
def get_tasks():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks ORDER BY date, time')
    tasks = cursor.fetchall()
    conn.close()
    # Transforma os dados em uma lista de dicionários para o Front-End
    tasks_list = [dict(row) for row in tasks]
    return jsonify(tasks_list)

# Rota para atualizar uma tarefa (marcar como concluída ou editar)
@app.route('/tasks/<int:task_id>', methods=['PUT', 'PATCH'])
def update_task(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    data = request.get_json()
    
    # Lógica para marcar como concluída
    if 'completed' in data:
        cursor.execute('UPDATE tasks SET completed = ? WHERE id = ?',
                       (data['completed'], task_id))
    
    # Lógica para editar o nome da tarefa
    elif 'name' in data:
        cursor.execute('UPDATE tasks SET name = ? WHERE id = ?',
                       (data['name'], task_id))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Tarefa atualizada com sucesso!'})

# Rota para excluir uma tarefa
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Tarefa excluída com sucesso!'})

# Inicia o servidor na porta 5000
if __name__ == '__main__':
    app.run(debug=True, port=5000)