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

    static if(value: boolean, trueActionOrTask?: Function | Task, falseActionOrTask?: Function | Task) {
        return Task.startNew().if(value, trueActionOrTask, falseActionOrTask);
    }

    static for(startIndex: number, end: number, increment, actionOrTask?: Function | Task) {
        return Task.startNew(actionOrTask).for(startIndex, end, increment);
    }

    static setValue(value: any) {
        return Task.startNew().setValue(value);
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
        let task: Task;
        if (actionOrTask instanceof Task) {
            task = actionOrTask;
        }
        else if (actionOrTask instanceof Function) {
            task = new Task(actionOrTask);
        }
        else {
            return;
        }

        if (!this.tasks) {
            this.tasks = [];
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

    if(value: boolean, trueActionOrTask?: Function | Task, falseActionOrTask?: Function | Task) {
        if (value) {
            this.next(trueActionOrTask);
        }
        else {
            this.next(falseActionOrTask);
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

    value: any;

    setValue(value: any) {
        this.next(() => {
            this.value = value;
        });
        return this;
    }

    getValue() {
        return this.value;
    }

    assignTo(array: any[], index: number) {
        this.next(() => {
            array[index] = this.value;
        });
        return this;
    }
}

// Hello world
const log = Task.startNew(console.log);
log.run("Hello").run("World");

// For loop
Task.for(0, 10, 1, log.startNew()).run();

// Bubble sort
const exchange = Task.startNew((array: [], i: number, j: number) => {
    Task.if(array[i] < array[j], Task.setValue(array[i]).next(Task.setValue(array[j]).assignTo(array, i)).assignTo(array, j)).run();
});

const bubble = Task.startNew((array: []) => {
    Task.for(0, array.length, 1, Task.for(0, array.length, 1, exchange.startNew().next(log))).next(() => log.run("最终结果：")).next(log).run(array);
});

bubble.run([4, 0, 1, 5, 3, 2]);