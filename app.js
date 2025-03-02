let totalTasks = 0;
    let completedTasks = 0;
    const tasks = []; // Array to hold tasks

    function updateCheckmark(checkmarkId) {
        const input = document.getElementById(checkmarkId.replace('-check', ''));
        const checkmark = document.getElementById(checkmarkId);
        
        if (input.value) {
            checkmark.style.display = 'inline';
            setTimeout(() => {
                checkmark.classList.add('visible');
            }, 10);
        } else {
            checkmark.classList.remove('visible');
            setTimeout(() => {
                checkmark.style.display = 'none';
            }, 500);
        }
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (message) {
            errorElement.innerHTML = `<span class="close-btn" onclick="dismissError('${elementId}')">✖</span>${message}`;
        }
        errorElement.classList.add('show');
    }

    function dismissError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.classList.remove('show');
    }

    function updateProgress() {
        const percentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
        document.querySelector('.progress-bar').style.width = `${percentage}%`;
        
        // Update counts
        document.getElementById('total-tasks-count').innerText = `Total Tasks: ${totalTasks}`;
        document.getElementById('completed-count').innerText = `Completed Tasks: ${completedTasks}`;
        
        // Check completion and show congratulations if needed
        if (completedTasks > 0 && completedTasks === totalTasks) {
            showCongratulations(100);
        } else if (completedTasks > 0) {
            const completionPercentage = (completedTasks / totalTasks) * 100;
            if (completionPercentage % 25 === 0) { // Show message at 25%, 50%, 75%
                showCongratulations(completionPercentage);
            }
        }
    }

    function showCongratulations(percentage) {
        const modal = document.getElementById('congratulations-modal');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');

        let className, titleText, messageText;

        if (percentage === 100) {
            className = 'modal-excellent';
            titleText = '🎉 Outstanding Achievement! 🎉';
            messageText = 'Incredible work! You\'ve completed all tasks. You\'re absolutely crushing it!';
        } else if (percentage >= 75) {
            className = 'modal-excellent';
            titleText = '🌟 Amazing Progress! 🌟';
            messageText = 'You\'re so close to the finish line! Keep up the fantastic work!';
        } else if (percentage >= 50) {
            className = 'modal-good';
            titleText = '👏 Halfway There! 👏';
            messageText = 'You\'ve completed half of your tasks. You\'re building great momentum!';
        } else {
            className = 'modal-moderate';
            titleText = '🌱 Great Start! 🌱';
            messageText = 'You\'re making progress! Every completed task is a step forward.';
        }

        modal.className = className;
        title.textContent = titleText;
        message.textContent = messageText;
        modal.style.display = 'block';

        // Auto-close after 5 seconds
        setTimeout(closeModal, 5000);
    }

    function closeModal() {
        document.getElementById('congratulations-modal').style.display = 'none';
    }

    function deleteTask(taskRow, taskIndex) {
        taskRow.style.animation = 'taskAppear 0.5s ease-out reverse';
        setTimeout(() => {
            taskRow.remove();
            tasks.splice(taskIndex, 1);
            totalTasks--;
            if (tasks[taskIndex].completed) {
                completedTasks--;
            }
            updateProgress();
        }, 500);
    }

    function addTask() {
        const taskInput = document.getElementById('task');
        const startTimeInput = document.getElementById('start-time');
        const endTimeInput = document.getElementById('end-time');
        const taskListBody = document.getElementById('task-list-body');

        // Reset error messages
        dismissError('error-message');
        dismissError('duplicate-error-message');

        // Validate inputs
        let validationMessages = [];
        if (taskInput.value === '') {
            validationMessages.push('Activity is required.');
        }
        if (startTimeInput.value === '') {
            validationMessages.push('Start Time is required.');
        }

        if (validationMessages.length > 0) {
            showError('error-message', validationMessages.join(' '));
            return;
        }

        // Check for duplicate start time
        const duplicateTask = tasks.find(t => t.startTime === startTimeInput.value);
        if (duplicateTask) {
            showError('duplicate-error-message', `At this time, you are doing: ${duplicateTask.activity}`);
            return;
        }

        const taskRow = document.createElement('tr');
        taskRow.className = 'task';

        const taskContent = document.createElement('td');
        taskContent.innerText = taskInput.value;
        taskRow.appendChild(taskContent);

        const startTimeContent = document.createElement('td');
        startTimeContent.innerText = startTimeInput.value;
        taskRow.appendChild(startTimeContent);

        const endTimeContent = document.createElement('td');
        endTimeContent.innerText = endTimeInput.value || 'Not specified';
        taskRow.appendChild(endTimeContent);

        const statusCell = document.createElement('td');
        statusCell.className = 'status-cell';
        statusCell.setAttribute('title', 'Click to mark as completed');
        
        const tickSpan = document.createElement('span');
        tickSpan.innerHTML = '&#10003;'; // Checkmark symbol
        tickSpan.className = 'tick';
        statusCell.appendChild(tickSpan);
        
        statusCell.onclick = function() {
            toggleComplete(taskRow, tickSpan);
        };
        
        taskRow.appendChild(statusCell);

        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions-cell';
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '🗑️';
        deleteButton.onclick = () => deleteTask(taskRow, tasks.length);
        
        actionsCell.appendChild(deleteButton);
        taskRow.appendChild(actionsCell);
        
        taskListBody.appendChild(taskRow);

        totalTasks++;
        updateProgress();

        // Add task to the tasks array
        tasks.push({ 
            activity: taskInput.value, 
            startTime: startTimeInput.value,
            endTime: endTimeInput.value || 'Not specified',
            completed: false
        });

        // Clear inputs and hide checkmarks
        taskInput.value = '';
        startTimeInput.value = '';
        endTimeInput.value = '';
        
        // Reset checkmarks with animation
        document.querySelectorAll('.checkmark').forEach(mark => {
            mark.classList.remove('visible');
            setTimeout(() => {
                mark.style.display = 'none';
            }, 500);
        });
    }

    function toggleComplete(taskRow, tickSpan) {
        const activityText = taskRow.cells[0].innerText;
        const startTime = taskRow.cells[1].innerText;
        
        // Find the task in our array
        const taskIndex = tasks.findIndex(t => 
            t.activity === activityText && t.startTime === startTime
        );
        
        if (taskIndex !== -1) {
            // Toggle completed state
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            
            if (tasks[taskIndex].completed) {
                // Mark as completed
                taskRow.classList.add('completed');
                tickSpan.classList.add('tick-checked');
                completedTasks++;
            } else {
                // Mark as not completed
                taskRow.classList.remove('completed');
                tickSpan.classList.remove('tick-checked');
                completedTasks--;
            }
            
            // Update the completed count display
            document.getElementById('completed-count').innerText = `Completed Tasks: ${completedTasks}`;
            
            // Show/hide delete button based on completed tasks
            document.getElementById('delete-button').style.display = 
                completedTasks > 0 ? 'block' : 'none';
        }
        
        updateProgress();
    }

    function deleteCompletedTasks() {
        const taskListBody = document.getElementById('task-list-body');
        const completedRows = document.querySelectorAll('.task.completed');
        
        completedRows.forEach(row => {
            taskListBody.removeChild(row);
        });
        
        // Remove completed tasks from the tasks array
        const activeTasks = tasks.filter(task => !task.completed);
        tasks.length = 0; // Clear the array
        tasks.push(...activeTasks); // Add back only active tasks
        
        // Reset completed count
        completedTasks = 0;
        document.getElementById('completed-count').innerText = `Completed Tasks: ${completedTasks}`;
        document.getElementById('delete-button').style.display = 'none';
        updateProgress();
    }

    // Initialize - hide error messages
    document.addEventListener('DOMContentLoaded', function() {
        dismissError('error-message');
        dismissError('duplicate-error-message');
        updateProgress();
    });