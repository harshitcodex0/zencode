import { code } from "../dedent";
import type { ProblemSpec } from "../types";

export const linkedListProblems: ProblemSpec[] = [
    {
        kind: "function",
        slug: "reverse-linked-list",
        title: "Reverse Linked List",
        difficulty: "EASY",
        tags: ["Linked List"],
        statement:
            "Given the head of a singly linked list, reverse the list and return the new head.\n\nA ListNode has two fields: val and next (null at the end of the list).",
        constraints: "0 <= number of nodes <= 5000\n-5000 <= Node.val <= 5000",
        hints: "Walk the list once. Before redirecting a node's next pointer, remember its old next node so you do not lose the rest of the list.",
        editorial:
            "Iterate with three references: prev (starts null), cur (starts at head) and next. For each node: save next = cur.next, point cur.next at prev, then advance prev = cur and cur = next. When cur becomes null, prev is the new head. Time O(n), space O(1).",
        examples: [
            { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "Every next pointer is flipped." },
            { input: "head = [1,2]", output: "[2,1]", explanation: "Two nodes swap places." },
            { input: "head = []", output: "[]", explanation: "An empty list stays empty (the input line is blank)." },
        ],
        testCases: [
            { input: "1 2 3 4 5", output: "[5,4,3,2,1]" },
            { input: "1 2", output: "[2,1]" },
            { input: "\n", output: "[]" },
            { input: "7", output: "[7]" },
            { input: "-1 0 1", output: "[1,0,-1]" },
            { input: "1 1 2 2", output: "[2,2,1,1]" },
        ],
        fn: { name: "reverseList", params: [{ name: "head", type: "list" }], returns: "list" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let prev = null;
                    let cur = head;
                    while (cur) {
                      const next = cur.next;
                      cur.next = prev;
                      prev = cur;
                      cur = next;
                    }
                    return prev;`,
            },
            PYTHON: {
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
            JAVA: {
                body: code`
                    ListNode prev = null;
                    ListNode cur = head;
                    while (cur != null) {
                        ListNode next = cur.next;
                        cur.next = prev;
                        prev = cur;
                        cur = next;
                    }
                    return prev;`,
            },
        },
        wrong: { body: "return head" },
    },
    {
        kind: "function",
        slug: "middle-of-the-linked-list",
        title: "Middle of the Linked List",
        difficulty: "EASY",
        tags: ["Linked List", "Two Pointers"],
        statement:
            "Given the head of a singly linked list, return the middle node of the list. The returned node (and every node after it) is printed.\n\nIf the list has two middle nodes, return the second one.",
        constraints: "1 <= number of nodes <= 100\n1 <= Node.val <= 100",
        hints: "You do not need to count the nodes first. If one pointer moves twice as fast as another, where is the slow pointer when the fast one reaches the end?",
        editorial:
            "Use slow and fast pointers starting at head. While fast and fast.next exist, move slow one step and fast two steps. When fast runs off the end, slow is at the middle (the second middle for even lengths). Time O(n), space O(1).",
        examples: [
            { input: "head = [1,2,3,4,5]", output: "[3,4,5]", explanation: "The middle node is 3." },
            { input: "head = [1,2,3,4,5,6]", output: "[4,5,6]", explanation: "Two middles (3 and 4): return the second one." },
            { input: "head = [1]", output: "[1]", explanation: "A single node is its own middle." },
        ],
        testCases: [
            { input: "1 2 3 4 5", output: "[3,4,5]" },
            { input: "1 2 3 4 5 6", output: "[4,5,6]" },
            { input: "1", output: "[1]" },
            { input: "1 2", output: "[2]" },
            { input: "10 20 30", output: "[20,30]" },
            { input: "1 2 3 4", output: "[3,4]" },
        ],
        fn: { name: "middleNode", params: [{ name: "head", type: "list" }], returns: "list" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let slow = head;
                    let fast = head;
                    while (fast && fast.next) {
                      slow = slow.next;
                      fast = fast.next.next;
                    }
                    return slow;`,
            },
            PYTHON: {
                body: code`
                    slow = fast = head
                    while fast and fast.next:
                        slow = slow.next
                        fast = fast.next.next
                    return slow`,
            },
            JAVA: {
                body: code`
                    ListNode slow = head;
                    ListNode fast = head;
                    while (fast != null && fast.next != null) {
                        slow = slow.next;
                        fast = fast.next.next;
                    }
                    return slow;`,
            },
        },
        wrong: {
            body: code`
                slow = head
                fast = head.next
                while fast and fast.next:
                    slow = slow.next
                    fast = fast.next.next
                return slow`,
        },
    },
    {
        kind: "function",
        slug: "merge-two-sorted-lists",
        title: "Merge Two Sorted Lists",
        difficulty: "EASY",
        tags: ["Linked List", "Two Pointers"],
        statement:
            "You are given the heads of two sorted linked lists, list1 and list2.\n\nMerge them into one sorted list by splicing together the nodes of the two lists, and return the head of the merged list.",
        constraints: "0 <= length of each list <= 50\n-100 <= Node.val <= 100\nBoth lists are sorted in non-decreasing order.",
        hints: "A dummy head node removes the special case of choosing the first node. Repeatedly attach the smaller front node.",
        editorial:
            "Keep a dummy node and a tail pointer. While both lists have nodes, append the one with the smaller value and advance in that list. When one list runs out, attach the remainder of the other. Time O(n + m), space O(1).",
        examples: [
            { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Nodes are interleaved in sorted order." },
            { input: "list1 = [], list2 = []", output: "[]", explanation: "Merging two empty lists gives an empty list." },
            { input: "list1 = [], list2 = [0]", output: "[0]", explanation: "One empty list: the result is the other list." },
        ],
        testCases: [
            { input: "1 2 4\n1 3 4", output: "[1,1,2,3,4,4]" },
            { input: "\n", output: "[]" },
            { input: "\n0", output: "[0]" },
            { input: "5 6 7\n1 2 3", output: "[1,2,3,5,6,7]" },
            { input: "1 3 5\n2", output: "[1,2,3,5]" },
            { input: "-5 -1 4\n-3 0 4 9", output: "[-5,-3,-1,0,4,4,9]" },
            { input: "1 1 1\n1 1", output: "[1,1,1,1,1]" },
        ],
        fn: {
            name: "mergeTwoLists",
            params: [
                { name: "list1", type: "list" },
                { name: "list2", type: "list" },
            ],
            returns: "list",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const dummy = new ListNode(0);
                    let tail = dummy;
                    let a = list1;
                    let b = list2;
                    while (a && b) {
                      if (a.val <= b.val) {
                        tail.next = a;
                        a = a.next;
                      } else {
                        tail.next = b;
                        b = b.next;
                      }
                      tail = tail.next;
                    }
                    tail.next = a || b;
                    return dummy.next;`,
            },
            PYTHON: {
                body: code`
                    dummy = ListNode(0)
                    tail = dummy
                    a, b = list1, list2
                    while a and b:
                        if a.val <= b.val:
                            tail.next = a
                            a = a.next
                        else:
                            tail.next = b
                            b = b.next
                        tail = tail.next
                    tail.next = a or b
                    return dummy.next`,
            },
            JAVA: {
                body: code`
                    ListNode dummy = new ListNode(0);
                    ListNode tail = dummy;
                    ListNode a = list1;
                    ListNode b = list2;
                    while (a != null && b != null) {
                        if (a.val <= b.val) {
                            tail.next = a;
                            a = a.next;
                        } else {
                            tail.next = b;
                            b = b.next;
                        }
                        tail = tail.next;
                    }
                    tail.next = (a != null) ? a : b;
                    return dummy.next;`,
            },
        },
        wrong: {
            body: code`
                if list1 is None:
                    return list2
                tail = list1
                while tail.next:
                    tail = tail.next
                tail.next = list2
                return list1`,
        },
    },
    {
        kind: "function",
        slug: "remove-nth-node-from-end-of-list",
        title: "Remove Nth Node From End of List",
        difficulty: "MEDIUM",
        tags: ["Linked List", "Two Pointers"],
        statement:
            "Given the head of a linked list and an integer n, remove the n-th node from the END of the list and return the head of the resulting list.",
        constraints: "1 <= number of nodes <= 30\n0 <= Node.val <= 100\n1 <= n <= number of nodes",
        hints: "Counting the length first takes two passes. Can two pointers that are n nodes apart find the target in a single pass?",
        editorial:
            "Add a dummy node before head (so removing the head is not special). Advance fast n steps ahead of slow, then move both until fast reaches the last node. slow.next is the node to delete: set slow.next = slow.next.next. Time O(L), space O(1).",
        examples: [
            { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]", explanation: "The 2nd node from the end is 4." },
            { input: "head = [1], n = 1", output: "[]", explanation: "Removing the only node leaves an empty list." },
            { input: "head = [1,2], n = 2", output: "[2]", explanation: "The head itself is the 2nd node from the end." },
        ],
        testCases: [
            { input: "1 2 3 4 5\n2", output: "[1,2,3,5]" },
            { input: "1\n1", output: "[]" },
            { input: "1 2\n1", output: "[1]" },
            { input: "1 2\n2", output: "[2]" },
            { input: "1 2 3\n3", output: "[2,3]" },
            { input: "10 20 30 40\n4", output: "[20,30,40]" },
            { input: "1 2 3 4 5 6\n3", output: "[1,2,3,5,6]" },
        ],
        fn: {
            name: "removeNthFromEnd",
            params: [
                { name: "head", type: "list" },
                { name: "n", type: "int" },
            ],
            returns: "list",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const dummy = new ListNode(0, head);
                    let fast = dummy;
                    let slow = dummy;
                    for (let i = 0; i < n; i++) fast = fast.next;
                    while (fast.next) {
                      fast = fast.next;
                      slow = slow.next;
                    }
                    slow.next = slow.next.next;
                    return dummy.next;`,
            },
            PYTHON: {
                body: code`
                    dummy = ListNode(0, head)
                    fast = slow = dummy
                    for _ in range(n):
                        fast = fast.next
                    while fast.next:
                        fast = fast.next
                        slow = slow.next
                    slow.next = slow.next.next
                    return dummy.next`,
            },
            JAVA: {
                body: code`
                    ListNode dummy = new ListNode(0, head);
                    ListNode fast = dummy;
                    ListNode slow = dummy;
                    for (int i = 0; i < n; i++) fast = fast.next;
                    while (fast.next != null) {
                        fast = fast.next;
                        slow = slow.next;
                    }
                    slow.next = slow.next.next;
                    return dummy.next;`,
            },
        },
        wrong: {
            body: code`
                dummy = ListNode(0, head)
                cur = dummy
                for _ in range(n - 1):
                    cur = cur.next
                cur.next = cur.next.next
                return dummy.next`,
        },
    },
    {
        kind: "function",
        slug: "reverse-nodes-in-k-group",
        title: "Reverse Nodes in k-Group",
        difficulty: "HARD",
        tags: ["Linked List"],
        statement:
            "Given the head of a linked list, reverse the nodes of the list k at a time and return the modified list.\n\nk is a positive integer. If the number of nodes is not a multiple of k, the left-out nodes at the end stay as they are (so if k is larger than the length of the list, nothing changes). You may only change next pointers, not node values.",
        constraints: "1 <= number of nodes <= 5000\n0 <= Node.val <= 1000\n1 <= k <= 5000",
        hints: "First check that k nodes are available for the current group. Reverse exactly that group, then reconnect it to the part before and after.",
        editorial:
            "Use a dummy node and a groupPrev pointer. For each group, find the k-th node; if it does not exist, stop. Reverse the k nodes between groupPrev and kth.next, re-link groupPrev to the new group head, and move groupPrev to the old first node (now the group's tail). Time O(n), space O(1).",
        examples: [
            { input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]", explanation: "Groups [1,2] and [3,4] are reversed; the leftover 5 stays." },
            { input: "head = [1,2,3,4,5], k = 3", output: "[3,2,1,4,5]", explanation: "Only the first group of three is complete." },
            { input: "head = [1,2,3], k = 4", output: "[1,2,3]", explanation: "Fewer than k nodes: no change." },
        ],
        testCases: [
            { input: "1 2 3 4 5\n2", output: "[2,1,4,3,5]" },
            { input: "1 2 3 4 5\n3", output: "[3,2,1,4,5]" },
            { input: "1 2 3 4 5 6\n3", output: "[3,2,1,6,5,4]" },
            { input: "1\n1", output: "[1]" },
            { input: "1 2 3 4\n1", output: "[1,2,3,4]" },
            { input: "1 2 3 4 5 6 7\n7", output: "[7,6,5,4,3,2,1]" },
            { input: "1 2 3\n4", output: "[1,2,3]" },
            { input: "1 2 3 4 5 6 7 8\n4", output: "[4,3,2,1,8,7,6,5]" },
        ],
        fn: {
            name: "reverseKGroup",
            params: [
                { name: "head", type: "list" },
                { name: "k", type: "int" },
            ],
            returns: "list",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const dummy = new ListNode(0, head);
                    let groupPrev = dummy;
                    while (true) {
                      let kth = groupPrev;
                      for (let i = 0; i < k && kth; i++) kth = kth.next;
                      if (!kth) break;
                      const groupNext = kth.next;
                      let prev = groupNext;
                      let cur = groupPrev.next;
                      while (cur !== groupNext) {
                        const next = cur.next;
                        cur.next = prev;
                        prev = cur;
                        cur = next;
                      }
                      const oldFirst = groupPrev.next;
                      groupPrev.next = kth;
                      groupPrev = oldFirst;
                    }
                    return dummy.next;`,
            },
            PYTHON: {
                body: code`
                    dummy = ListNode(0, head)
                    group_prev = dummy
                    while True:
                        kth = group_prev
                        for _ in range(k):
                            if kth is None:
                                break
                            kth = kth.next
                        if kth is None:
                            break
                        group_next = kth.next
                        prev, cur = group_next, group_prev.next
                        while cur is not group_next:
                            nxt = cur.next
                            cur.next = prev
                            prev = cur
                            cur = nxt
                        old_first = group_prev.next
                        group_prev.next = kth
                        group_prev = old_first
                    return dummy.next`,
            },
            JAVA: {
                body: code`
                    ListNode dummy = new ListNode(0, head);
                    ListNode groupPrev = dummy;
                    while (true) {
                        ListNode kth = groupPrev;
                        for (int i = 0; i < k && kth != null; i++) kth = kth.next;
                        if (kth == null) break;
                        ListNode groupNext = kth.next;
                        ListNode prev = groupNext;
                        ListNode cur = groupPrev.next;
                        while (cur != groupNext) {
                            ListNode next = cur.next;
                            cur.next = prev;
                            prev = cur;
                            cur = next;
                        }
                        ListNode oldFirst = groupPrev.next;
                        groupPrev.next = kth;
                        groupPrev = oldFirst;
                    }
                    return dummy.next;`,
            },
        },
        wrong: {
            body: code`
                vals = []
                cur = head
                while cur:
                    vals.append(cur.val)
                    cur = cur.next
                out = []
                for i in range(0, len(vals), k):
                    out.extend(reversed(vals[i:i + k]))
                dummy = ListNode(0)
                tail = dummy
                for v in out:
                    tail.next = ListNode(v)
                    tail = tail.next
                return dummy.next`,
        },
    },
];
