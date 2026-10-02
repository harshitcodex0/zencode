import { code } from "../dedent";
import type { ProblemSpec } from "../types";
import { designInput } from "./helpers";

export const queueProblems: ProblemSpec[] = [
    {
        kind: "design",
        slug: "implement-queue-using-stacks",
        title: "Implement Queue using Stacks",
        difficulty: "EASY",
        tags: ["Queue", "Stack", "Design"],
        statement:
            "Implement a first-in-first-out (FIFO) queue using only two stacks.\n\nImplement the class MyQueue:\n- MyQueue(): initialise the queue.\n- push(x): push element x to the back of the queue.\n- pop(): remove the element from the front of the queue and return it.\n- peek(): return the element at the front of the queue.\n- empty(): return true if the queue is empty, false otherwise.\n\npop and peek are only called on a non-empty queue.",
        constraints: "1 <= x <= 9\nAt most 100 calls to push, pop, peek and empty.\nUse only standard stack operations (push, pop, peek/top of the stack, size, is-empty).",
        hints: "A stack reverses order. Pushing everything through a second stack reverses it twice, which restores the FIFO order. Only move elements when the output stack is empty.",
        editorial:
            "Keep an input stack and an output stack. push goes onto input. For pop/peek, if output is empty move every element from input to output (this reverses their order, so the oldest element ends on top). Each element is moved at most once, so all operations are amortised O(1).",
        examples: [
            { input: "MyQueue(), push(1), push(2), peek(), pop(), empty()", output: "1 1 false", explanation: "peek and pop return the oldest element 1; element 2 is still queued." },
            { input: "MyQueue(), push(1), pop(), empty()", output: "1 true", explanation: "After removing the only element the queue is empty." },
            { input: "MyQueue(), push(1), push(2), push(3), pop(), push(4), pop(), pop(), pop(), empty()", output: "1 2 3 4 true", explanation: "Elements come out in the order they went in." },
        ],
        testCases: [
            { input: designInput("", ["push 1", "push 2", "peek", "pop", "empty"]), output: "1 1 false" },
            { input: designInput("", ["push 1", "pop", "empty"]), output: "1 true" },
            {
                input: designInput("", ["push 1", "push 2", "push 3", "pop", "push 4", "pop", "pop", "pop", "empty"]),
                output: "1 2 3 4 true",
            },
            { input: designInput("", ["empty"]), output: "true" },
            { input: designInput("", ["push 5", "push 6", "peek", "push 7", "peek", "pop", "peek"]), output: "5 5 5 6" },
        ],
        design: {
            className: "MyQueue",
            ctorParams: [],
            methods: [
                { name: "push", params: ["x"], returns: "void" },
                { name: "pop", params: [], returns: "int" },
                { name: "peek", params: [], returns: "int" },
                { name: "empty", params: [], returns: "bool" },
            ],
        },
        solutions: {
            JAVASCRIPT: code`
                class MyQueue {
                  constructor() {
                    this.input = [];
                    this.output = [];
                  }

                  push(x) {
                    this.input.push(x);
                  }

                  _shift() {
                    if (this.output.length === 0) {
                      while (this.input.length > 0) this.output.push(this.input.pop());
                    }
                  }

                  pop() {
                    this._shift();
                    return this.output.pop();
                  }

                  peek() {
                    this._shift();
                    return this.output[this.output.length - 1];
                  }

                  empty() {
                    return this.input.length === 0 && this.output.length === 0;
                  }
                }`,
            PYTHON: code`
                class MyQueue:
                    def __init__(self):
                        self.input = []
                        self.output = []

                    def push(self, x: int) -> None:
                        self.input.append(x)

                    def _shift(self) -> None:
                        if not self.output:
                            while self.input:
                                self.output.append(self.input.pop())

                    def pop(self) -> int:
                        self._shift()
                        return self.output.pop()

                    def peek(self) -> int:
                        self._shift()
                        return self.output[-1]

                    def empty(self) -> bool:
                        return not self.input and not self.output`,
            JAVA: code`
                class MyQueue {
                    private final Deque<Integer> input = new ArrayDeque<>();
                    private final Deque<Integer> output = new ArrayDeque<>();

                    public MyQueue() {
                    }

                    public void push(int x) {
                        input.push(x);
                    }

                    private void shift() {
                        if (output.isEmpty()) {
                            while (!input.isEmpty()) output.push(input.pop());
                        }
                    }

                    public int pop() {
                        shift();
                        return output.pop();
                    }

                    public int peek() {
                        shift();
                        return output.peek();
                    }

                    public boolean empty() {
                        return input.isEmpty() && output.isEmpty();
                    }
                }`,
        },
        wrong: code`
            class MyQueue:
                def __init__(self):
                    self.data = []

                def push(self, x: int) -> None:
                    self.data.append(x)

                def pop(self) -> int:
                    return self.data.pop()

                def peek(self) -> int:
                    return self.data[-1]

                def empty(self) -> bool:
                    return not self.data`,
    },
    {
        kind: "design",
        slug: "number-of-recent-calls",
        title: "Number of Recent Calls",
        difficulty: "EASY",
        tags: ["Queue", "Design"],
        statement:
            "Implement the class RecentCounter that counts the number of recent requests within a certain time frame.\n\n- RecentCounter(): initialise the counter with zero requests.\n- ping(t): add a new request at time t (in milliseconds) and return the number of requests that happened in the inclusive range [t - 3000, t], including this new request.\n\nIt is guaranteed that every call to ping uses a strictly larger value of t than the previous call.",
        constraints: "1 <= t <= 10^9\nEach call to ping uses a strictly larger t than the previous one.\nAt most 10^4 calls to ping.",
        hints: "Requests arrive in increasing time order, so the oldest request is always the first to expire. A queue models that perfectly.",
        editorial:
            "Append t to a queue, then remove from the front while the front is older than t - 3000 (strictly smaller; a request exactly 3000 ms old is still inside the inclusive window). The queue size is the answer. Each request is added and removed once: amortised O(1).",
        examples: [
            { input: "RecentCounter(), ping(1), ping(100), ping(3001), ping(3002)", output: "1 2 3 3", explanation: "At t = 3002 the window is [2, 3002], so the request at t = 1 has expired." },
            { input: "RecentCounter(), ping(100), ping(200), ping(300)", output: "1 2 3", explanation: "All three requests are within 3000 ms." },
            { input: "RecentCounter(), ping(1), ping(3001), ping(3002), ping(6002)", output: "1 2 2 2", explanation: "The request at t = 1 is still counted at t = 3001 because 3001 - 3000 = 1 is inclusive." },
        ],
        testCases: [
            { input: designInput("", ["ping 1", "ping 100", "ping 3001", "ping 3002"]), output: "1 2 3 3" },
            { input: designInput("", ["ping 1", "ping 3001", "ping 3002", "ping 6002"]), output: "1 2 2 2" },
            { input: designInput("", ["ping 100", "ping 200", "ping 300"]), output: "1 2 3" },
            { input: designInput("", ["ping 5"]), output: "1" },
            { input: designInput("", ["ping 1", "ping 2", "ping 3", "ping 3003", "ping 3004"]), output: "1 2 3 2 2" },
        ],
        design: {
            className: "RecentCounter",
            ctorParams: [],
            methods: [{ name: "ping", params: ["t"], returns: "int" }],
        },
        solutions: {
            JAVASCRIPT: code`
                class RecentCounter {
                  constructor() {
                    this.queue = [];
                    this.head = 0;
                  }

                  ping(t) {
                    this.queue.push(t);
                    while (this.queue[this.head] < t - 3000) this.head++;
                    return this.queue.length - this.head;
                  }
                }`,
            PYTHON: code`
                from collections import deque


                class RecentCounter:
                    def __init__(self):
                        self.queue = deque()

                    def ping(self, t: int) -> int:
                        self.queue.append(t)
                        while self.queue[0] < t - 3000:
                            self.queue.popleft()
                        return len(self.queue)`,
            JAVA: code`
                class RecentCounter {
                    private final Deque<Integer> queue = new ArrayDeque<>();

                    public RecentCounter() {
                    }

                    public int ping(int t) {
                        queue.offer(t);
                        while (queue.peek() < t - 3000) queue.poll();
                        return queue.size();
                    }
                }`,
        },
        wrong: code`
            from collections import deque


            class RecentCounter:
                def __init__(self):
                    self.queue = deque()

                def ping(self, t: int) -> int:
                    self.queue.append(t)
                    while self.queue[0] <= t - 3000:
                        self.queue.popleft()
                    return len(self.queue)`,
    },
    {
        kind: "design",
        slug: "design-circular-queue",
        title: "Design Circular Queue",
        difficulty: "MEDIUM",
        tags: ["Queue", "Design", "Array"],
        statement:
            "Design a circular queue with a fixed capacity. A circular queue is a FIFO structure whose last position is connected back to the first, so freed space at the front can be reused.\n\nImplement the class MyCircularQueue:\n- MyCircularQueue(k): initialise the queue with a capacity of k.\n- Front(): return the front item, or -1 if the queue is empty.\n- Rear(): return the last item, or -1 if the queue is empty.\n- enQueue(value): insert an element; return true if it succeeded, false if the queue is full.\n- deQueue(): delete an element; return true if it succeeded, false if the queue is empty.\n- isEmpty(): return true if the queue is empty.\n- isFull(): return true if the queue is full.\n\nDo not use a built-in queue library.",
        constraints: "1 <= k <= 1000\n0 <= value <= 1000\nAt most 3000 calls to the methods.",
        hints: "Store the items in an array of size k and keep a head index and a size. The tail position is (head + size) % k - the modulo is what makes the queue circular.",
        editorial:
            "Keep data[k], head and size. enQueue writes at (head + size) % k and increments size; deQueue advances head = (head + 1) % k and decrements size; Front is data[head]; Rear is data[(head + size - 1) % k]. Every operation is O(1). A queue that never reuses the freed front slots wrongly reports full.",
        examples: [
            { input: "MyCircularQueue(3), enQueue(1), enQueue(2), enQueue(3), enQueue(4), Rear(), isFull(), deQueue(), enQueue(4), Rear()", output: "true true true false 3 true true true 4", explanation: "The 4th insert fails (full). After one deQueue there is space again, so enQueue(4) succeeds and Rear is 4." },
            { input: "MyCircularQueue(1), isEmpty(), Front(), Rear(), enQueue(7), Front(), isFull(), deQueue(), isEmpty()", output: "true -1 -1 true 7 true true true", explanation: "Front and Rear return -1 for an empty queue." },
            { input: "MyCircularQueue(2), enQueue(5), enQueue(6), enQueue(7), Front(), Rear(), deQueue(), Front(), Rear()", output: "true true false 5 6 true 6 6", explanation: "After removing 5, both Front and Rear are 6." },
        ],
        testCases: [
            {
                input: designInput("3", ["enQueue 1", "enQueue 2", "enQueue 3", "enQueue 4", "Rear", "isFull", "deQueue", "enQueue 4", "Rear"]),
                output: "true true true false 3 true true true 4",
            },
            {
                input: designInput("1", ["isEmpty", "Front", "Rear", "enQueue 7", "Front", "isFull", "deQueue", "isEmpty"]),
                output: "true -1 -1 true 7 true true true",
            },
            { input: designInput("2", ["enQueue 1", "enQueue 2", "deQueue", "deQueue", "deQueue", "Front"]), output: "true true true true false -1" },
            {
                input: designInput("3", ["enQueue 1", "enQueue 2", "enQueue 3", "deQueue", "deQueue", "enQueue 4", "enQueue 5", "Front", "Rear", "isFull"]),
                output: "true true true true true true true 3 5 true",
            },
            {
                input: designInput("2", ["enQueue 5", "enQueue 6", "enQueue 7", "Front", "Rear", "deQueue", "Front", "Rear"]),
                output: "true true false 5 6 true 6 6",
            },
        ],
        design: {
            className: "MyCircularQueue",
            ctorParams: ["k"],
            methods: [
                { name: "enQueue", params: ["value"], returns: "bool" },
                { name: "deQueue", params: [], returns: "bool" },
                { name: "Front", params: [], returns: "int" },
                { name: "Rear", params: [], returns: "int" },
                { name: "isEmpty", params: [], returns: "bool" },
                { name: "isFull", params: [], returns: "bool" },
            ],
        },
        solutions: {
            JAVASCRIPT: code`
                class MyCircularQueue {
                  constructor(k) {
                    this.data = new Array(k).fill(0);
                    this.capacity = k;
                    this.head = 0;
                    this.size = 0;
                  }

                  enQueue(value) {
                    if (this.isFull()) return false;
                    this.data[(this.head + this.size) % this.capacity] = value;
                    this.size++;
                    return true;
                  }

                  deQueue() {
                    if (this.isEmpty()) return false;
                    this.head = (this.head + 1) % this.capacity;
                    this.size--;
                    return true;
                  }

                  Front() {
                    return this.isEmpty() ? -1 : this.data[this.head];
                  }

                  Rear() {
                    return this.isEmpty() ? -1 : this.data[(this.head + this.size - 1) % this.capacity];
                  }

                  isEmpty() {
                    return this.size === 0;
                  }

                  isFull() {
                    return this.size === this.capacity;
                  }
                }`,
            PYTHON: code`
                class MyCircularQueue:
                    def __init__(self, k: int):
                        self.data = [0] * k
                        self.capacity = k
                        self.head = 0
                        self.size = 0

                    def enQueue(self, value: int) -> bool:
                        if self.isFull():
                            return False
                        self.data[(self.head + self.size) % self.capacity] = value
                        self.size += 1
                        return True

                    def deQueue(self) -> bool:
                        if self.isEmpty():
                            return False
                        self.head = (self.head + 1) % self.capacity
                        self.size -= 1
                        return True

                    def Front(self) -> int:
                        return -1 if self.isEmpty() else self.data[self.head]

                    def Rear(self) -> int:
                        return -1 if self.isEmpty() else self.data[(self.head + self.size - 1) % self.capacity]

                    def isEmpty(self) -> bool:
                        return self.size == 0

                    def isFull(self) -> bool:
                        return self.size == self.capacity`,
            JAVA: code`
                class MyCircularQueue {
                    private final int[] data;
                    private final int capacity;
                    private int head = 0;
                    private int size = 0;

                    public MyCircularQueue(int k) {
                        this.data = new int[k];
                        this.capacity = k;
                    }

                    public boolean enQueue(int value) {
                        if (isFull()) return false;
                        data[(head + size) % capacity] = value;
                        size++;
                        return true;
                    }

                    public boolean deQueue() {
                        if (isEmpty()) return false;
                        head = (head + 1) % capacity;
                        size--;
                        return true;
                    }

                    public int Front() {
                        return isEmpty() ? -1 : data[head];
                    }

                    public int Rear() {
                        return isEmpty() ? -1 : data[(head + size - 1) % capacity];
                    }

                    public boolean isEmpty() {
                        return size == 0;
                    }

                    public boolean isFull() {
                        return size == capacity;
                    }
                }`,
        },
        wrong: code`
            class MyCircularQueue:
                def __init__(self, k: int):
                    self.k = k
                    self.data = []
                    self.head = 0

                def enQueue(self, value: int) -> bool:
                    if len(self.data) >= self.k:
                        return False
                    self.data.append(value)
                    return True

                def deQueue(self) -> bool:
                    if self.head >= len(self.data):
                        return False
                    self.head += 1
                    return True

                def Front(self) -> int:
                    return self.data[self.head] if self.head < len(self.data) else -1

                def Rear(self) -> int:
                    return self.data[-1] if self.head < len(self.data) else -1

                def isEmpty(self) -> bool:
                    return self.head >= len(self.data)

                def isFull(self) -> bool:
                    return len(self.data) >= self.k`,
    },
    {
        kind: "function",
        slug: "rotting-oranges",
        title: "Rotting Oranges",
        difficulty: "MEDIUM",
        tags: ["Queue", "Graph", "2D Array", "BFS"],
        statement:
            "You are given an m x n grid where each cell is:\n- 0: an empty cell,\n- 1: a fresh orange,\n- 2: a rotten orange.\n\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.",
        constraints: "m == grid.length\nn == grid[i].length\n1 <= m, n <= 10\ngrid[i][j] is 0, 1 or 2.",
        hints: "All rotten oranges spread at the same time, which is exactly what a multi-source BFS models. Process the queue level by level - each level is one minute.",
        editorial:
            "Put every initially rotten orange in a queue and count the fresh ones. Run BFS level by level: each level rots the adjacent fresh oranges, decrements the fresh counter and takes one minute. When the queue is exhausted, the answer is the number of levels if no fresh orange remains, otherwise -1. Time O(m * n).",
        examples: [
            { input: "grid = [[2,1,1],[1,1,0],[0,1,1]]", output: "4", explanation: "The rot spreads outward from the top-left corner in 4 minutes." },
            { input: "grid = [[2,1,1],[0,1,1],[1,0,1]]", output: "-1", explanation: "The orange at the bottom-left is never adjacent to a rotten one." },
            { input: "grid = [[0,2]]", output: "0", explanation: "There are no fresh oranges, so no time has to pass." },
        ],
        testCases: [
            { input: "3 3\n2 1 1\n1 1 0\n0 1 1", output: "4" },
            { input: "3 3\n2 1 1\n0 1 1\n1 0 1", output: "-1" },
            { input: "1 1\n0", output: "0" },
            { input: "1 2\n0 2", output: "0" },
            { input: "1 3\n2 1 1", output: "2" },
            { input: "2 2\n1 1\n1 2", output: "2" },
            { input: "2 2\n2 1\n1 2", output: "1" },
            { input: "1 1\n1", output: "-1" },
        ],
        fn: { name: "orangesRotting", params: [{ name: "grid", type: "int[][]" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const m = grid.length;
                    const n = grid[0].length;
                    const queue = [];
                    let fresh = 0;
                    for (let i = 0; i < m; i++) {
                      for (let j = 0; j < n; j++) {
                        if (grid[i][j] === 2) queue.push([i, j]);
                        else if (grid[i][j] === 1) fresh++;
                      }
                    }
                    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                    let minutes = 0;
                    let head = 0;
                    while (head < queue.length && fresh > 0) {
                      const levelEnd = queue.length;
                      while (head < levelEnd) {
                        const [i, j] = queue[head++];
                        for (const [di, dj] of dirs) {
                          const ni = i + di;
                          const nj = j + dj;
                          if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] === 1) {
                            grid[ni][nj] = 2;
                            fresh--;
                            queue.push([ni, nj]);
                          }
                        }
                      }
                      minutes++;
                    }
                    return fresh === 0 ? minutes : -1;`,
            },
            PYTHON: {
                body: code`
                    from collections import deque

                    m, n = len(grid), len(grid[0])
                    queue = deque()
                    fresh = 0
                    for i in range(m):
                        for j in range(n):
                            if grid[i][j] == 2:
                                queue.append((i, j))
                            elif grid[i][j] == 1:
                                fresh += 1
                    minutes = 0
                    while queue and fresh > 0:
                        for _ in range(len(queue)):
                            i, j = queue.popleft()
                            for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                                ni, nj = i + di, j + dj
                                if 0 <= ni < m and 0 <= nj < n and grid[ni][nj] == 1:
                                    grid[ni][nj] = 2
                                    fresh -= 1
                                    queue.append((ni, nj))
                        minutes += 1
                    return minutes if fresh == 0 else -1`,
            },
            JAVA: {
                body: code`
                    int m = grid.length;
                    int n = grid[0].length;
                    Deque<int[]> queue = new ArrayDeque<>();
                    int fresh = 0;
                    for (int i = 0; i < m; i++) {
                        for (int j = 0; j < n; j++) {
                            if (grid[i][j] == 2) queue.offer(new int[] {i, j});
                            else if (grid[i][j] == 1) fresh++;
                        }
                    }
                    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
                    int minutes = 0;
                    while (!queue.isEmpty() && fresh > 0) {
                        int size = queue.size();
                        for (int s = 0; s < size; s++) {
                            int[] cell = queue.poll();
                            for (int[] d : dirs) {
                                int ni = cell[0] + d[0];
                                int nj = cell[1] + d[1];
                                if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] == 1) {
                                    grid[ni][nj] = 2;
                                    fresh--;
                                    queue.offer(new int[] {ni, nj});
                                }
                            }
                        }
                        minutes++;
                    }
                    return fresh == 0 ? minutes : -1;`,
            },
        },
        wrong: {
            body: code`
                from collections import deque

                m, n = len(grid), len(grid[0])
                queue = deque((i, j) for i in range(m) for j in range(n) if grid[i][j] == 2)
                minutes = 0
                while queue:
                    for _ in range(len(queue)):
                        i, j = queue.popleft()
                        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                            ni, nj = i + di, j + dj
                            if 0 <= ni < m and 0 <= nj < n and grid[ni][nj] == 1:
                                grid[ni][nj] = 2
                                queue.append((ni, nj))
                    minutes += 1
                return max(minutes - 1, 0)`,
        },
    },
    {
        kind: "function",
        slug: "shortest-subarray-with-sum-at-least-k",
        title: "Shortest Subarray with Sum at Least K",
        difficulty: "HARD",
        tags: ["Queue", "Array", "Monotonic Deque", "Prefix Sum"],
        statement:
            "Given an integer array nums (which may contain negative numbers) and an integer k, return the length of the shortest non-empty contiguous subarray of nums with a sum of at least k.\n\nIf there is no such subarray, return -1.",
        constraints: "1 <= nums.length <= 10^5\n-10^5 <= nums[i] <= 10^5\n1 <= k <= 10^9",
        hints: "A plain two-pointer window fails because shrinking a window can increase its sum when negatives exist. Work with prefix sums instead and keep candidate start positions in a deque.",
        editorial:
            "Let prefix[i] be the sum of the first i numbers. We want the smallest j - i with prefix[j] - prefix[i] >= k. Keep a deque of indices with increasing prefix values: pop from the front while prefix[j] - prefix[front] >= k (record the length, that start can never give a shorter answer later), and pop from the back while prefix[back] >= prefix[j] (a later, smaller prefix is always a better start). Time O(n).",
        examples: [
            { input: "nums = [1], k = 1", output: "1", explanation: "The single element reaches k." },
            { input: "nums = [1,2], k = 4", output: "-1", explanation: "The total sum 3 is below k." },
            { input: "nums = [2,-1,2], k = 3", output: "3", explanation: "Only the whole array reaches 3: 2 - 1 + 2 = 3." },
        ],
        testCases: [
            { input: "1\n1", output: "1" },
            { input: "1 2\n4", output: "-1" },
            { input: "2 -1 2\n3", output: "3" },
            { input: "84 -37 32 40 95\n167", output: "3" },
            { input: "17 85 93 -45 -21\n150", output: "2" },
            { input: "-28 81 -20 28 -29\n89", output: "3" },
            { input: "5 4 3\n3", output: "1" },
        ],
        fn: {
            name: "shortestSubarray",
            params: [
                { name: "nums", type: "int[]" },
                { name: "k", type: "int" },
            ],
            returns: "int",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const n = nums.length;
                    const prefix = new Array(n + 1).fill(0);
                    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
                    let best = n + 1;
                    const dq = [];
                    let head = 0;
                    for (let i = 0; i <= n; i++) {
                      while (dq.length > head && prefix[i] - prefix[dq[head]] >= k) {
                        best = Math.min(best, i - dq[head]);
                        head++;
                      }
                      while (dq.length > head && prefix[dq[dq.length - 1]] >= prefix[i]) dq.pop();
                      dq.push(i);
                    }
                    return best === n + 1 ? -1 : best;`,
            },
            PYTHON: {
                body: code`
                    from collections import deque

                    n = len(nums)
                    prefix = [0] * (n + 1)
                    for i in range(n):
                        prefix[i + 1] = prefix[i] + nums[i]
                    best = n + 1
                    dq = deque()
                    for i in range(n + 1):
                        while dq and prefix[i] - prefix[dq[0]] >= k:
                            best = min(best, i - dq.popleft())
                        while dq and prefix[dq[-1]] >= prefix[i]:
                            dq.pop()
                        dq.append(i)
                    return -1 if best == n + 1 else best`,
            },
            JAVA: {
                body: code`
                    int n = nums.length;
                    long[] prefix = new long[n + 1];
                    for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
                    int best = n + 1;
                    Deque<Integer> dq = new ArrayDeque<>();
                    for (int i = 0; i <= n; i++) {
                        while (!dq.isEmpty() && prefix[i] - prefix[dq.peekFirst()] >= k) {
                            best = Math.min(best, i - dq.pollFirst());
                        }
                        while (!dq.isEmpty() && prefix[dq.peekLast()] >= prefix[i]) dq.pollLast();
                        dq.offerLast(i);
                    }
                    return best == n + 1 ? -1 : best;`,
            },
        },
        wrong: {
            body: code`
                left = 0
                total = 0
                best = len(nums) + 1
                for right, x in enumerate(nums):
                    total += x
                    while total >= k and left <= right:
                        best = min(best, right - left + 1)
                        total -= nums[left]
                        left += 1
                return -1 if best == len(nums) + 1 else best`,
        },
    },
];
