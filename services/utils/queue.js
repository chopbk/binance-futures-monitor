class Queue {
    constructor() {
        this.q = [];
    }
    send(item) {
        this.q.push(item);
    }
    receive() {
        return this.q.shift();
    }
    isEmpty() {
        return this.q.length === 0;
    }
}
module.exports = Queue;
