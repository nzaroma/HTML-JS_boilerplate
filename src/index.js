import './style.css';
import {Service, StorageService} from './js/Task.js';

const service = new Service();
const storageService = new StorageService();

const addTaskButton = document.getElementById("createTaskButton");
addTaskButton.addEventListener("click", createNewTask);
const clearOpenTasksButton = document.getElementById("openTasksClear");
clearOpenTasksButton.addEventListener('click', clearTasks);
const clearDoneTasksButton = document.getElementById("doneTasksClear");
clearDoneTasksButton.addEventListener('click', clearTasks);
const sortOpentTasksButton = document.getElementById("openTasksSort");
sortOpentTasksButton.addEventListener('change', sortOnEvent);
const sortDoneTasksButton = document.getElementById("doneTasksSort");
sortDoneTasksButton.addEventListener('change', sortOnEvent);
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keyup', search);

const tasks = service.getAllTasks();
for(const t of tasks) {
	const div = createNewTaskElement(t);
	if(t.state) {
		const openTasksElement = document.getElementById("openTasksList");
		openTasksElement.appendChild(div);
	} else {
		const doneTasksList = document.getElementById("doneTasksList");
		doneTasksList.appendChild(div);
	}
}

restoreSort();

function restoreSort() {
	const openSort = storageService.restoreSort("openTasksSort");
	const doneSort = storageService.restoreSort("doneTasksSort");
	sort("openTasksList", openSort);
	sort("doneTasksList", doneSort);
	sortOpentTasksButton.value = openSort;
	sortDoneTasksButton.value = doneSort;
}

function createNewTask() {
	const taskInput = document.getElementById("createTaskInput")
	const taskName = taskInput.value;
	const task = service.createAndAddToList(taskName);
	taskInput.value = "";
	attachNewTask(task);
}

function attachNewTask(task) {
	const openTasksElement = document.getElementById("openTasksList");

	const newTaskElement = createNewTaskElement(task);
	openTasksElement.appendChild(newTaskElement);
	sort("openTasksList", document.getElementById("openTasksSort").value)
}
 
function createNewTaskElement(task) {
	const taskContainer = document.createElement('div');
	taskContainer.id = task.id;
	taskContainer.className = 'taskItem';

	//checkbox
	const checkboxElement = document.createElement('input');
	checkboxElement.type = "checkbox";
	checkboxElement.id = "taskCheckbox";
	if(!task.state) checkboxElement.checked = true;
	checkboxElement.addEventListener("change", changeTaskState)
	taskContainer.appendChild(checkboxElement);

	//text
	const taskValueElement = document.createElement('span');
	taskValueElement.textContent = task.text;
	taskValueElement.className = 'value';
	taskValueElement.addEventListener("dblclick", editTask);
	taskContainer.appendChild(taskValueElement);

	//input
	const inputElement = document.createElement('input')
	inputElement.type = "text";
	inputElement.id = "taskInput";
	inputElement.style.display = 'none';
	taskContainer.appendChild(inputElement);

	//div date
	const dateDivElement = document.createElement('div');
	dateDivElement.className = 'dateDiv';
	taskContainer.appendChild(dateDivElement);
	//create date
	const creationDateElement = document.createElement('span');
	const options={hour: "2-digit", minute: "2-digit"}
	const date = task.creationDate;
	creationDateElement.textContent = formatAMPM(date);
	creationDateElement.className = 'date';
	dateDivElement.appendChild(creationDateElement);

	//create due date
	const dueDateElement = document.createElement('span');
	dueDateElement.className = 'date';
	const dueDate = task.dueDate;
	dueDateElement.textContent = formatAMPM(dueDate);
	dateDivElement.appendChild(dueDateElement);

	const removeImgElement = document.createElement('img');
	removeImgElement.src = 'https://cdn4.iconfinder.com/data/icons/devine_icons/Black/PNG/Folder%20and%20Places/Trash-Recyclebin-Empty-Closed.png';
	removeImgElement.className = 'removeImg';
	removeImgElement.width = 20; 
	removeImgElement.style.display = 'none';
	removeImgElement.addEventListener('click', removeTask);
	taskContainer.addEventListener('mouseenter', showRemoveImg);
	taskContainer.addEventListener('mouseleave', hideRemoveImg);
	taskContainer.appendChild(removeImgElement);
	//fragments might be used here
	
	return taskContainer;
}

function formatAMPM(date) {
	if(!date) return "";
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function editTask(event) {
	const span = event.target;
	const div = event.target.closest('div');
	
	const input = div.querySelector('input[type="text"]');
	input.value = span.textContent;
	
	span.style.display = 'none';
	input.style.display = 'block';

	input.addEventListener("keydown", saveTaskEdition);
}

function saveTaskEdition(event) {
	if (event.key !== "Enter" && event.key !=="Escape") return;
	const input = event.target;
	const div = event.target.closest('div');
	const span = div.querySelector('span[class="value"]');

	if (event.key === "Enter") {
		span.textContent = input.value;
		const id = div.id;
		service.updateTaskText(id, input.value);
	} 
	span.style.display = 'block';
	input.style.display = 'none';
}

function changeTaskState(event) {
	const div = event.target.closest('div');
	const id = div.id;
	const checkbox = event.target;
	const currentState = !checkbox.checked;
	const task = service.changeTaskState(id, currentState);
	if(currentState === false) {
		const dueDate = div.querySelectorAll('span')[2];
		const date = task.dueDate;
		dueDate.textContent = formatAMPM(date);
		//show due date		
	} else {
		const dueDate = div.querySelectorAll('span')[2];
		dueDate.textContent = task.dueDate;
		
	}
	switchList(div);
	sort(div.parentNode.id, div.parentNode.parentNode.querySelector('select[class="sort"]').value);
}

function switchList(container) {
	const currentParentId = container.parentNode.id;
	let newParentId;
	if(currentParentId === "openTasksList") newParentId = "doneTasksList";
	else newParentId = "openTasksList";
	document.getElementById(newParentId).appendChild(container);
}

function clearTasks(event) {
	const a = event.target;
	const taskContainer = a.parentNode.parentNode
	const taskList = taskContainer.querySelector('div[class="taskList"]');
	const children = taskList.children;
	
	for(let i= children.length - 1; i>=0; --i ) {
		const id = children[i].id;
		service.removeTask(id);
		children[i].remove();
	}
}

function removeTask(event) {
	const target = event.target.parentNode;
	const id = target.id;
	service.removeTask(id);
	target.remove();
}

function sortOnEvent(event) {
	const sortType = event.target.value;
	const target = event.target
	let taskListId;
	if(target.id === 'openTasksSort') taskListId = 'openTasksList';
	else taskListId = 'doneTasksList';
	sort(taskListId, sortType);
	storageService.saveSort(target.id, sortType);
}

function sort(taskListId, sortType) {
	const taskList = document.getElementById(taskListId);
	const children = taskList.children;
	const sortedTasks = Array.prototype.slice.call(children, 0);

	switch(sortType) {
		case 'Date creation (Asc)': {
			sortedTasks.sort(function (a, b) {
				const left = a.querySelector('span[class="date"]').textContent.toLowerCase();
				const right = b.querySelector('span[class="date"]').textContent.toLowerCase();
				if(right > left) return -1;
				if(right < left) return 1;
				return 0;
			});
			break;

		}			
		case 'Date creation (Desc)': {
			sortedTasks.sort(function (a, b) {
				const left = a.querySelector('span[class="date"]').textContent.toLowerCase();
				const right = b.querySelector('span[class="date"]').textContent.toLowerCase();
				if(right > left) return 1;
				if(right < left) return -1;
				return 0;
			});
			break;
		} 
		case 'Text (Asc)': {
			sortedTasks.sort(function (a, b) {
				const right = b.querySelector("span").textContent.toLowerCase();
				const left = a.querySelector("span").textContent.toLowerCase();
				if(right > left) return -1;
				if(right < left) return 1;
				return 0;
			});
			break;
		}
		case 'Text (Desc)': {
			sortedTasks.sort(function (a, b) {
				const right = b.querySelector("span").textContent.toLowerCase();
				const left = a.querySelector("span").textContent.toLowerCase();
				if(right > left) return 1;
				if(right < left) return -1;
				return 0;
			});
			break;
		}
		case 'Due date creation (Asc)': {
			sortedTasks.sort(function (a, b) {
				const left = a.querySelectorAll('span')[2].textContent.toLowerCase();
				const right = b.querySelectorAll('span')[2].textContent.toLowerCase();
				if(right > left) return -1;
				if(right < left) return 1;
				return 0;
			});
			break;

		}			
		case 'Due date creation (Desc)': {
			sortedTasks.sort(function (a, b) {
				const left = a.querySelectorAll('span')[2].textContent.toLowerCase();
				const right = b.querySelectorAll('span')[2].textContent.toLowerCase();
				if(right > left) return 1;
				if(right < left) return -1;
				return 0;
			});
			break;
		} 
		

	}
	for(const e of sortedTasks) {
		taskList.appendChild(e);
	}
}

function search(event) {
	const value = event.target.value;
	const openTasks = document.getElementById('openTasksList').children;
	const doneTasks = document.getElementById('doneTasksList').children;
	if(value === '') {
		return removeFilter(openTasks, doneTasks);
	}
	for(const e of openTasks) {
		const text = e.querySelector('span').textContent;
		if(text.includes(value)) e.style.display = 'flex';
		else e.style.display = 'none';
	}
	for(const e of doneTasks) {
		const text = e.querySelector('span').textContent;
		if(text.includes(value)) e.style.display = 'flex';
		else e.style.display = 'none';
	}
}

function removeFilter(openTasks, doneTasks) {
	for(const e of openTasks) {
		e.style.display = 'flex';
	}
	for(const e of doneTasks) {
		e.style.display = 'flex';
	}
}

function showRemoveImg(event) {
	const img = event.target.querySelector('img');;
	img.style.display = 'block';
}

function hideRemoveImg(event) {
	const img = event.target.querySelector('img');
	img.style.display = 'none';
}

