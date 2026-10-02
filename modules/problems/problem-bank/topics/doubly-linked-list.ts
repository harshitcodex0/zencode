import { code } from "../dedent";
import type { ProblemSpec } from "../types";
import { designInput, dlistOutput } from "./helpers";

export const doublyLinkedListProblems: ProblemSpec[] = [
    {
        kind: "function",
        slug: "reverse-doubly-linked-list",
        title: "Reverse a Doubly Linked List",
        difficulty: "EASY",
        tags: ["Doubly Linked List", "Linked List"],
        statement:
            "Given the head of a doubly linked list, reverse the list and return the new head.\n\nA DListNode has three fields: val, prev and next. Both pointers must be correct after the reversal: the judge walks the result forward through next and backward through prev.",
        constraints: "0 <= number of nodes <= 5000\n-10^4 <= Node.val <= 10^4",
        hints: "In a singly linked list you only flip next. Here every node has to swap its prev and next pointers.",
        editorial:
            "Visit every node once. Save the old next, then swap the node's prev and next pointers. Remember the node as the new head and continue with the saved next. When the loop ends, the last visited node (the old tail) is the new head. Time O(n), space O(1).",
        examples: [
            { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]\n[1,2,3,4,5]", explanation: "Forward: 5,4,3,2,1. Following prev from the new tail gives 1,2,3,4,5." },
            { input: "head = [10,20]", output: "[20,10]\n[10,20]", explanation: "Two nodes swap places." },
            { input: "head = []", output: "[]\n[]", explanation: "An empty list stays empty." },
        ],
        testCases: [
            { input: "1 2 3 4 5", output: dlistOutput([5, 4, 3, 2, 1]) },
            { input: "1", output: dlistOutput([1]) },
            { input: "10 20", output: dlistOutput([20, 10]) },
            { input: "\n", output: dlistOutput([]) },
            { input: "3 1 4 1 5 9", output: dlistOutput([9, 5, 1, 4, 1, 3]) },
            { input: "-1 0 1", output: dlistOutput([1, 0, -1]) },
        ],
        fn: { name: "reverseDoublyList", params: [{ name: "head", type: "dlist" }], returns: "dlist" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let cur = head;
                    let newHead = null;
                    while (cur) {
                      const next = cur.next;
                      cur.next = cur.prev;
                      cur.prev = next;
                      newHead = cur;
                      cur = next;
                    }
                    return newHead;`,
            },
            PYTHON: {
                body: code`
                    cur = head
                    new_head = None
                    while cur:
                        nxt = cur.next
                        cur.next = cur.prev
                        cur.prev = nxt
                        new_head = cur
                        cur = nxt
                    return new_head`,
            },
            JAVA: {
                body: code`
                    DListNode cur = head;
                    DListNode newHead = null;
                    while (cur != null) {
                        DListNode next = cur.next;
                        cur.next = cur.prev;
                        cur.prev = next;
                        newHead = cur;
                        cur = next;
                    }
                    return newHead;`,
            },
        },
        wrong: {
            body: code`
                prev = None
                cur = head
                while cur:
                    nxt = cur.next
                    cur.next = prev
                    prev = cur
                    cur = nxt
                return prev`,
        },
    },
    {
        kind: "function",
        slug: "delete-node-at-position-in-doubly-linked-list",
        title: "Delete Node at Position in a Doubly Linked List",
        difficulty: "EASY",
        tags: ["Doubly Linked List", "Linked List"],
        statement:
            "Given the head of a doubly linked list and a 0-indexed position pos, delete the node at that position and return the head of the list.\n\nIf pos is outside the list (pos >= length), the list is returned unchanged. Both next and prev pointers of the neighbouring nodes must be updated.",
        constraints: "0 <= number of nodes <= 5000\n-10^4 <= Node.val <= 10^4\n0 <= pos <= 10^9",
        hints: "Deleting the head, a middle node and the tail are three different situations. A node in the middle has two neighbours that both need to be re-linked.",
        editorial:
            "If pos is 0, the new head is head.next and its prev must be set to null. Otherwise walk to the node at pos (stop if the list ends). Link node.prev.next to node.next and, if node.next exists, node.next.prev to node.prev. Time O(pos), space O(1).",
        examples: [
            { input: "head = [1,2,3,4,5], pos = 2", output: "[1,2,4,5]\n[5,4,2,1]", explanation: "Node 3 is removed; walking back via prev skips it too." },
            { input: "head = [7], pos = 0", output: "[]\n[]", explanation: "Deleting the only node empties the list." },
            { input: "head = [1,2,3], pos = 5", output: "[1,2,3]\n[3,2,1]", explanation: "Position 5 does not exist: the list is unchanged." },
        ],
        testCases: [
            { input: "1 2 3 4 5\n0", output: dlistOutput([2, 3, 4, 5]) },
            { input: "1 2 3 4 5\n2", output: dlistOutput([1, 2, 4, 5]) },
            { input: "1 2 3 4 5\n4", output: dlistOutput([1, 2, 3, 4]) },
            { input: "7\n0", output: dlistOutput([]) },
            { input: "1 2 3\n5", output: dlistOutput([1, 2, 3]) },
            { input: "1 2\n1", output: dlistOutput([1]) },
            { input: "1 2 3\n3", output: dlistOutput([1, 2, 3]) },
        ],
        fn: {
            name: "deleteAtPosition",
            params: [
                { name: "head", type: "dlist" },
                { name: "pos", type: "int" },
            ],
            returns: "dlist",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    if (!head) return head;
                    if (pos === 0) {
                      const next = head.next;
                      if (next) next.prev = null;
                      return next;
                    }
                    let cur = head;
                    for (let i = 0; i < pos && cur; i++) cur = cur.next;
                    if (!cur) return head;
                    cur.prev.next = cur.next;
                    if (cur.next) cur.next.prev = cur.prev;
                    return head;`,
            },
            PYTHON: {
                body: code`
                    if head is None:
                        return head
                    if pos == 0:
                        nxt = head.next
                        if nxt:
                            nxt.prev = None
                        return nxt
                    cur = head
                    i = 0
                    while cur and i < pos:
                        cur = cur.next
                        i += 1
                    if cur is None:
                        return head
                    cur.prev.next = cur.next
                    if cur.next:
                        cur.next.prev = cur.prev
                    return head`,
            },
            JAVA: {
                body: code`
                    if (head == null) return head;
                    if (pos == 0) {
                        DListNode next = head.next;
                        if (next != null) next.prev = null;
                        return next;
                    }
                    DListNode cur = head;
                    for (int i = 0; i < pos && cur != null; i++) cur = cur.next;
                    if (cur == null) return head;
                    cur.prev.next = cur.next;
                    if (cur.next != null) cur.next.prev = cur.prev;
                    return head;`,
            },
        },
        wrong: {
            body: code`
                if head is None:
                    return head
                if pos == 0:
                    return head.next
                cur = head
                i = 0
                while cur and i < pos:
                    cur = cur.next
                    i += 1
                if cur is None:
                    return head
                cur.prev.next = cur.next
                return head`,
        },
    },
    {
        kind: "function",
        slug: "insert-into-sorted-doubly-linked-list",
        title: "Insert into a Sorted Doubly Linked List",
        difficulty: "MEDIUM",
        tags: ["Doubly Linked List", "Linked List"],
        statement:
            "You are given the head of a doubly linked list whose values are sorted in non-decreasing order, and an integer x.\n\nInsert a new node with value x so the list stays sorted (if equal values exist, insert after them), and return the head of the updated list.",
        constraints: "0 <= number of nodes <= 5000\n-10^4 <= Node.val, x <= 10^4\nThe list is sorted in non-decreasing order.",
        hints: "There are three cases: empty list / insert before the head, insert in the middle, insert at the end. Remember to set both prev and next of the new node and of its neighbours.",
        editorial:
            "If the list is empty or x is smaller than the head value, the new node becomes the head. Otherwise advance cur while cur.next.val <= x and splice the new node between cur and cur.next, fixing four pointers (node.prev, node.next, cur.next, and next.prev when next exists). Time O(n), space O(1).",
        examples: [
            { input: "head = [1,3,5,7], x = 4", output: "[1,3,4,5,7]\n[7,5,4,3,1]", explanation: "4 goes between 3 and 5." },
            { input: "head = [2,4,6], x = 1", output: "[1,2,4,6]\n[6,4,2,1]", explanation: "1 becomes the new head." },
            { input: "head = [], x = 5", output: "[5]\n[5]", explanation: "Inserting into an empty list creates a single node." },
        ],
        testCases: [
            { input: "1 3 5 7\n4", output: dlistOutput([1, 3, 4, 5, 7]) },
            { input: "2 4 6\n1", output: dlistOutput([1, 2, 4, 6]) },
            { input: "2 4 6\n9", output: dlistOutput([2, 4, 6, 9]) },
            { input: "\n5", output: dlistOutput([5]) },
            { input: "1 2 2 3\n2", output: dlistOutput([1, 2, 2, 2, 3]) },
            { input: "5\n5", output: dlistOutput([5, 5]) },
            { input: "10 20\n15", output: dlistOutput([10, 15, 20]) },
        ],
        fn: {
            name: "insertSorted",
            params: [
                { name: "head", type: "dlist" },
                { name: "x", type: "int" },
            ],
            returns: "dlist",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const node = new DListNode(x);
                    if (!head) return node;
                    if (x < head.val) {
                      node.next = head;
                      head.prev = node;
                      return node;
                    }
                    let cur = head;
                    while (cur.next && cur.next.val <= x) cur = cur.next;
                    node.next = cur.next;
                    node.prev = cur;
                    if (cur.next) cur.next.prev = node;
                    cur.next = node;
                    return head;`,
            },
            PYTHON: {
                body: code`
                    node = DListNode(x)
                    if head is None:
                        return node
                    if x < head.val:
                        node.next = head
                        head.prev = node
                        return node
                    cur = head
                    while cur.next and cur.next.val <= x:
                        cur = cur.next
                    node.next = cur.next
                    node.prev = cur
                    if cur.next:
                        cur.next.prev = node
                    cur.next = node
                    return head`,
            },
            JAVA: {
                body: code`
                    DListNode node = new DListNode(x);
                    if (head == null) return node;
                    if (x < head.val) {
                        node.next = head;
                        head.prev = node;
                        return node;
                    }
                    DListNode cur = head;
                    while (cur.next != null && cur.next.val <= x) cur = cur.next;
                    node.next = cur.next;
                    node.prev = cur;
                    if (cur.next != null) cur.next.prev = node;
                    cur.next = node;
                    return head;`,
            },
        },
        wrong: {
            body: code`
                node = DListNode(x)
                if head is None:
                    return node
                cur = head
                while cur.next:
                    cur = cur.next
                cur.next = node
                node.prev = cur
                return head`,
        },
    },
    {
        kind: "function",
        slug: "rotate-doubly-linked-list",
        title: "Rotate a Doubly Linked List",
        difficulty: "MEDIUM",
        tags: ["Doubly Linked List", "Linked List"],
        statement:
            "Given the head of a doubly linked list and an integer k, rotate the list to the LEFT by k positions: the first k nodes move to the end of the list, keeping their order. Return the new head.\n\nk can be larger than the length of the list.",
        constraints: "0 <= number of nodes <= 5000\n-10^4 <= Node.val <= 10^4\n0 <= k <= 10^9",
        hints: "Rotating by the length of the list changes nothing, so only k mod length matters. Find the new tail (the k-th node), the new head (its next) and the old tail.",
        editorial:
            "Walk to the old tail while counting the length n. Let k = k mod n; if it is 0 return head. The k-th node becomes the new tail and its next the new head. Link old tail <-> old head, then cut the list: newTail.next = null and newHead.prev = null. Time O(n), space O(1).",
        examples: [
            { input: "head = [1,2,3,4,5], k = 2", output: "[3,4,5,1,2]\n[2,1,5,4,3]", explanation: "1 and 2 move behind 5." },
            { input: "head = [1,2,3,4,5], k = 7", output: "[3,4,5,1,2]\n[2,1,5,4,3]", explanation: "7 mod 5 = 2, so it is the same as k = 2." },
            { input: "head = [10,20,30], k = 0", output: "[10,20,30]\n[30,20,10]", explanation: "Zero rotation leaves the list unchanged." },
        ],
        testCases: [
            { input: "1 2 3 4 5\n2", output: dlistOutput([3, 4, 5, 1, 2]) },
            { input: "1 2 3 4 5\n5", output: dlistOutput([1, 2, 3, 4, 5]) },
            { input: "1 2 3 4 5\n7", output: dlistOutput([3, 4, 5, 1, 2]) },
            { input: "1\n10", output: dlistOutput([1]) },
            { input: "\n3", output: dlistOutput([]) },
            { input: "10 20 30\n0", output: dlistOutput([10, 20, 30]) },
            { input: "1 2 3 4\n1", output: dlistOutput([2, 3, 4, 1]) },
        ],
        fn: {
            name: "rotateLeft",
            params: [
                { name: "head", type: "dlist" },
                { name: "k", type: "int" },
            ],
            returns: "dlist",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    if (!head || !head.next) return head;
                    let length = 1;
                    let tail = head;
                    while (tail.next) {
                      tail = tail.next;
                      length++;
                    }
                    k %= length;
                    if (k === 0) return head;
                    let newTail = head;
                    for (let i = 1; i < k; i++) newTail = newTail.next;
                    const newHead = newTail.next;
                    tail.next = head;
                    head.prev = tail;
                    newTail.next = null;
                    newHead.prev = null;
                    return newHead;`,
            },
            PYTHON: {
                body: code`
                    if head is None or head.next is None:
                        return head
                    length = 1
                    tail = head
                    while tail.next:
                        tail = tail.next
                        length += 1
                    k %= length
                    if k == 0:
                        return head
                    new_tail = head
                    for _ in range(k - 1):
                        new_tail = new_tail.next
                    new_head = new_tail.next
                    tail.next = head
                    head.prev = tail
                    new_tail.next = None
                    new_head.prev = None
                    return new_head`,
            },
            JAVA: {
                body: code`
                    if (head == null || head.next == null) return head;
                    int length = 1;
                    DListNode tail = head;
                    while (tail.next != null) {
                        tail = tail.next;
                        length++;
                    }
                    k %= length;
                    if (k == 0) return head;
                    DListNode newTail = head;
                    for (int i = 1; i < k; i++) newTail = newTail.next;
                    DListNode newHead = newTail.next;
                    tail.next = head;
                    head.prev = tail;
                    newTail.next = null;
                    newHead.prev = null;
                    return newHead;`,
            },
        },
        wrong: {
            body: code`
                if head is None or head.next is None:
                    return head
                length = 1
                tail = head
                while tail.next:
                    tail = tail.next
                    length += 1
                k %= length
                if k == 0:
                    return head
                new_tail = head
                for _ in range(length - k - 1):
                    new_tail = new_tail.next
                new_head = new_tail.next
                tail.next = head
                head.prev = tail
                new_tail.next = None
                new_head.prev = None
                return new_head`,
        },
    },
    {
        kind: "design",
        slug: "lru-cache",
        title: "LRU Cache",
        difficulty: "MEDIUM",
        tags: ["Doubly Linked List", "Hash Table", "Design"],
        statement:
            "Design a data structure for a Least Recently Used (LRU) cache.\n\nImplement the class LRUCache:\n- LRUCache(capacity): create the cache with a positive size capacity.\n- get(key): return the value of the key if it exists, otherwise -1. A successful get makes the key the most recently used.\n- put(key, value): insert or update the value of the key. If the number of keys would exceed the capacity, evict the least recently used key first. Inserting or updating also makes the key the most recently used.\n\nBoth get and put must run in O(1) average time. (Hint: a hash map plus a doubly linked list.)",
        constraints: "1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5\nAt most 2 * 10^5 calls to get and put.",
        hints: "A hash map finds a node in O(1); a doubly linked list moves a node to the front and removes the tail node in O(1) - exactly what a singly linked list cannot do. Sentinel head/tail nodes remove the edge cases.",
        editorial:
            "Keep a map key -> node and a doubly linked list ordered from most to least recently used with two sentinel nodes. get: unlink the node and re-insert it right after the head sentinel. put: update and move to front when the key exists; otherwise evict tail.prev if the cache is full, then insert a new node at the front. All operations are O(1).",
        examples: [
            { input: "LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)", output: "1 -1", explanation: "get(1) returns 1; put(3,3) evicts key 2, so get(2) is -1." },
            { input: "LRUCache(1), put(2,1), get(2), put(3,2), get(2), get(3)", output: "1 -1 2", explanation: "Capacity 1: adding key 3 evicts key 2." },
            { input: "LRUCache(2), put(1,1), put(2,2), put(1,10), put(3,3), get(2), get(1)", output: "-1 10", explanation: "Updating key 1 refreshes it, so key 2 is evicted by put(3,3)." },
        ],
        testCases: [
            {
                input: designInput("2", ["put 1 1", "put 2 2", "get 1", "put 3 3", "get 2", "put 4 4", "get 1", "get 3", "get 4"]),
                output: "1 -1 -1 3 4",
            },
            { input: designInput("1", ["put 2 1", "get 2", "put 3 2", "get 2", "get 3"]), output: "1 -1 2" },
            { input: designInput("2", ["put 1 1", "put 2 2", "put 1 10", "put 3 3", "get 2", "get 1", "get 3"]), output: "-1 10 3" },
            {
                input: designInput("3", ["put 1 1", "put 2 2", "put 3 3", "get 1", "put 4 4", "get 2", "get 3", "get 4", "get 1"]),
                output: "1 -1 3 4 1",
            },
            {
                input: designInput("2", ["get 5", "put 5 50", "get 5", "put 6 60", "put 7 70", "get 5", "get 6", "get 7"]),
                output: "-1 50 -1 60 70",
            },
            { input: designInput("2", ["put 1 1", "put 2 2", "get 1", "put 3 3", "get 2", "get 1", "get 3"]), output: "1 -1 1 3" },
        ],
        design: {
            className: "LRUCache",
            ctorParams: ["capacity"],
            methods: [
                { name: "get", params: ["key"], returns: "int" },
                { name: "put", params: ["key", "value"], returns: "void" },
            ],
        },
        solutions: {
            JAVASCRIPT: code`
                class LRUCache {
                  constructor(capacity) {
                    this.capacity = capacity;
                    this.map = new Map();
                    this.head = { key: 0, val: 0, prev: null, next: null };
                    this.tail = { key: 0, val: 0, prev: null, next: null };
                    this.head.next = this.tail;
                    this.tail.prev = this.head;
                  }

                  _remove(node) {
                    node.prev.next = node.next;
                    node.next.prev = node.prev;
                  }

                  _addFront(node) {
                    node.next = this.head.next;
                    node.prev = this.head;
                    this.head.next.prev = node;
                    this.head.next = node;
                  }

                  get(key) {
                    const node = this.map.get(key);
                    if (!node) return -1;
                    this._remove(node);
                    this._addFront(node);
                    return node.val;
                  }

                  put(key, value) {
                    const existing = this.map.get(key);
                    if (existing) {
                      existing.val = value;
                      this._remove(existing);
                      this._addFront(existing);
                      return;
                    }
                    if (this.map.size === this.capacity) {
                      const lru = this.tail.prev;
                      this._remove(lru);
                      this.map.delete(lru.key);
                    }
                    const node = { key, val: value, prev: null, next: null };
                    this.map.set(key, node);
                    this._addFront(node);
                  }
                }`,
            PYTHON: code`
                class Node:
                    def __init__(self, key=0, val=0):
                        self.key = key
                        self.val = val
                        self.prev = None
                        self.next = None


                class LRUCache:
                    def __init__(self, capacity: int):
                        self.capacity = capacity
                        self.map = {}
                        self.head = Node()
                        self.tail = Node()
                        self.head.next = self.tail
                        self.tail.prev = self.head

                    def _remove(self, node):
                        node.prev.next = node.next
                        node.next.prev = node.prev

                    def _add_front(self, node):
                        node.next = self.head.next
                        node.prev = self.head
                        self.head.next.prev = node
                        self.head.next = node

                    def get(self, key: int) -> int:
                        node = self.map.get(key)
                        if node is None:
                            return -1
                        self._remove(node)
                        self._add_front(node)
                        return node.val

                    def put(self, key: int, value: int) -> None:
                        node = self.map.get(key)
                        if node is not None:
                            node.val = value
                            self._remove(node)
                            self._add_front(node)
                            return
                        if len(self.map) == self.capacity:
                            lru = self.tail.prev
                            self._remove(lru)
                            del self.map[lru.key]
                        node = Node(key, value)
                        self.map[key] = node
                        self._add_front(node)`,
            JAVA: code`
                class LRUCache {
                    private static class Node {
                        int key;
                        int val;
                        Node prev;
                        Node next;

                        Node(int key, int val) {
                            this.key = key;
                            this.val = val;
                        }
                    }

                    private final int capacity;
                    private final Map<Integer, Node> map = new HashMap<>();
                    private final Node head = new Node(0, 0);
                    private final Node tail = new Node(0, 0);

                    public LRUCache(int capacity) {
                        this.capacity = capacity;
                        head.next = tail;
                        tail.prev = head;
                    }

                    private void remove(Node node) {
                        node.prev.next = node.next;
                        node.next.prev = node.prev;
                    }

                    private void addFront(Node node) {
                        node.next = head.next;
                        node.prev = head;
                        head.next.prev = node;
                        head.next = node;
                    }

                    public int get(int key) {
                        Node node = map.get(key);
                        if (node == null) return -1;
                        remove(node);
                        addFront(node);
                        return node.val;
                    }

                    public void put(int key, int value) {
                        Node node = map.get(key);
                        if (node != null) {
                            node.val = value;
                            remove(node);
                            addFront(node);
                            return;
                        }
                        if (map.size() == capacity) {
                            Node lru = tail.prev;
                            remove(lru);
                            map.remove(lru.key);
                        }
                        node = new Node(key, value);
                        map.put(key, node);
                        addFront(node);
                    }
                }`,
        },
        wrong: code`
            class LRUCache:
                def __init__(self, capacity: int):
                    self.capacity = capacity
                    self.data = {}

                def get(self, key: int) -> int:
                    return self.data.get(key, -1)

                def put(self, key: int, value: int) -> None:
                    if key not in self.data and len(self.data) == self.capacity:
                        del self.data[next(iter(self.data))]
                    self.data[key] = value`,
    },
];
