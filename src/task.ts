class Task {
    action?: Function;
    tasks?: Task[];

    static startNew(actionOrTask?: Function | Task) {
        if (actionOrTask instanceof Task) {
            return actionOrTask.startNew();
        }
        else {
            return new Task(actionOrTask);
        }
    }

    static run(task: Task, ...args: any[]) {
        task.run(...args);
        return task;
    }

    static for(startIndex: number, end: number, increment, actionOrTask?: Function | Task) {
        return Task.startNew(actionOrTask).for(startIndex, end, increment);
    }

    constructor(action?: Function) {
        this.action = action;
    }

    startNew() {
        const task = new Task(this.action);
        if (this.tasks) {
            task.tasks = [...this.tasks];
        }
        return task;
    }

    run(...args: any[]) {
        if (this.tasks && this.tasks.length > 0) {
            this.tasks.forEach(v => v.run(...args));
        }
        else {
            this.action && this.action(...args);
        }
        return this;
    }

    next(actionOrTask: Function | Task) {
        if (!this.tasks) {
            this.tasks = [];
        }

        let task: Task;
        if (actionOrTask instanceof Task) {
            task = actionOrTask;
        }
        else {
            task = new Task(actionOrTask);
        }

        if (this.tasks.length === 0) {
            this.tasks.push(new Task(this.action));
            this.tasks.push(task);
        }
        else {
            this.tasks.push(task);
        }
        return this;
    }

    for(startIndex: number, end: number, increment) {
        if (this.tasks && this.tasks.length > 0) {
            const tasks = [...this.tasks];
            this.tasks = [];
            for (let index = startIndex; index < end; index += increment) {
                this.next((...args) => {
                    tasks.forEach(v => v.run(...args, index));
                });
            }
        }
        else {
            for (let index = startIndex; index < end; index += increment) {
                this.next((...args) => {
                    this.action && this.action(...args, index);
                });
            }
            this.tasks.shift();
        }
        return this;
    }

}

// Hello world
const log = Task.startNew((...args) => {
    console.log(...args);
});
log.run("Hello").run("World");

// For loop
Task.for(0, 10, 1, log.startNew().next(log.startNew())).run();

// Bubble sort
const exchange = Task.startNew((array: [], i: number, j: number) => {
    if (array[i] < array[j]) {
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
});

const bubble = Task.startNew((array: []) => {
    Task.for(0, array.length, 1, Task.for(0, array.length, 1, exchange.startNew().next(log))).next(log).run(array);
});
bubble.run([0, 2, 1, 5, 3, 4]);