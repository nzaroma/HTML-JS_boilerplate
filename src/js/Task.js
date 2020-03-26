

export class Task {
	constructor(text, creationDate, state=true, dueDate, id) { 
		this.text = text;
		this.creationDate = creationDate ? creationDate : new Date();
		this.state = state;  //open = true, done = false
		this.dueDate = dueDate ? dueDate : null;
		this.id = id ? id : Math.random().toString(36).replace('0.', "id" || '');
	}
}

export class TodoList {
	constructor(list) {
		this.list = [];
	}
}

export class Service {
	constructor() {
		this.todoList = new TodoList();
		this.storageService = new StorageService();	
	}
	
	getAllTasks() {
		this.getList();
		const tasks = this.todoList.list.map(e => new Task(e.text, e.creationDate, e.state, e.dueDate, e.id));
		return tasks;
	}

	createTask(text) {
		const newTask = new Task(text);
		return newTask;
	}

	getList() {
		this.storageService.loadList(this.todoList);
	}

	addTaskToList(task) {
		this.todoList.list.push(task);		
		this.storageService.saveList(this.todoList);
	}

	createAndAddToList(text) {
		const task = this.createTask(text);
		this.addTaskToList(task);
		return task;
	}

	updateTaskText(id, text) {
		if(text) {
			const task = this.todoList.list.find( e => e.id === id);
			task.text = text;
			this.storageService.saveList(this.todoList);
		}
	}

	changeTaskState(id, state) {
		const task = this.todoList.list.find( e => e.id === id);
		task.state = state;
		if(!state) {
			task.dueDate = new Date();
		} else {
			task.dueDate = null;
		}
		this.storageService.saveList(this.todoList);
		return task;
	}

	removeTask(id) {
		this.todoList.list = this.todoList.list.filter( e => e.id !== id);
		this.storageService.saveList(this.todoList);
	}
}

export class StorageService {
	saveList(todoList) {
		const list = JSON.stringify(todoList.list);
		localStorage.setItem('todoList', list);
	}

	loadList(todoList) {
		let list = localStorage.getItem('todoList');
		if(!list) todoList.list = [];
		else todoList.list = JSON.parse(list);
		todoList.list.forEach(e => {
			e.creationDate = e.creationDate ? new Date(e.creationDate) : null;
			e.dueDate = e.dueDate ? new Date(e.dueDate) : null;
		})
	}

	saveSort(type ,value) {
		localStorage.setItem(type, value);
	}

	restoreSort(type) {
		return localStorage.getItem(type);
	}

}