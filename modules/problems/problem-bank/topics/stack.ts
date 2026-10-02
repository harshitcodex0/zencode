import { code } from "../dedent";
import type { ProblemSpec } from "../types";
import { designInput } from "./helpers";

export const stackProblems: ProblemSpec[] = [
    {
        kind: "function",
        slug: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "EASY",
        tags: ["Stack", "String"],
        statement:
            "Given a string s containing only the characters '(', ')', '{', '}', '[' and ']', determine whether the input string is valid.\n\nA string is valid when every open bracket is closed by a bracket of the same type, and open brackets are closed in the correct order.",
        constraints: "1 <= s.length <= 10^4\ns consists only of the characters ()[]{}",
        hints: "The most recently opened bracket must be the first one closed. Which data structure gives you the most recent item first?",
        editorial:
            "Push every opening bracket on a stack. For a closing bracket, the stack must be non-empty and its top must be the matching opening bracket, which is then popped. The string is valid when the stack is empty at the end. Counting brackets alone is not enough because it ignores order. Time O(n), space O(n).",
        examples: [
            { input: 's = "()[]{}"', output: "true", explanation: "Every bracket is closed by its own type in order." },
            { input: 's = "(]"', output: "false", explanation: "A ']' cannot close '('." },
            { input: 's = "([)]"', output: "false", explanation: "The brackets are balanced in number but interleaved incorrectly." },
        ],
        testCases: [
            { input: "()", output: "true" },
            { input: "()[]{}", output: "true" },
            { input: "(]", output: "false" },
            { input: "([)]", output: "false" },
            { input: "{[]}", output: "true" },
            { input: "((", output: "false" },
            { input: "]", output: "false" },
            { input: "([{}])", output: "true" },
            { input: "(((())))", output: "true" },
            { input: "(()", output: "false" },
        ],
        fn: { name: "isValid", params: [{ name: "s", type: "str" }], returns: "bool" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const pairs = { ")": "(", "]": "[", "}": "{" };
                    const stack = [];
                    for (const ch of s) {
                      if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
                      else if (stack.pop() !== pairs[ch]) return false;
                    }
                    return stack.length === 0;`,
            },
            PYTHON: {
                body: code`
                    pairs = {")": "(", "]": "[", "}": "{"}
                    stack = []
                    for ch in s:
                        if ch in "([{":
                            stack.append(ch)
                        elif not stack or stack.pop() != pairs[ch]:
                            return False
                    return not stack`,
            },
            JAVA: {
                body: code`
                    Deque<Character> stack = new ArrayDeque<>();
                    for (char ch : s.toCharArray()) {
                        if (ch == '(' || ch == '[' || ch == '{') {
                            stack.push(ch);
                        } else {
                            if (stack.isEmpty()) return false;
                            char open = stack.pop();
                            if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{')) {
                                return false;
                            }
                        }
                    }
                    return stack.isEmpty();`,
            },
        },
        wrong: {
            body: code`
                return (
                    s.count("(") == s.count(")")
                    and s.count("[") == s.count("]")
                    and s.count("{") == s.count("}")
                )`,
        },
    },
    {
        kind: "design",
        slug: "min-stack",
        title: "Min Stack",
        difficulty: "MEDIUM",
        tags: ["Stack", "Design"],
        statement:
            "Design a stack that supports push, pop, top and retrieving the minimum element, all in constant time.\n\nImplement the class MinStack:\n- MinStack(): initialise an empty stack.\n- push(val): push val onto the stack.\n- pop(): remove the element on top of the stack.\n- top(): return the top element.\n- getMin(): return the minimum element currently in the stack.\n\npop, top and getMin are only called on a non-empty stack.",
        constraints: "-2^31 <= val <= 2^31 - 1\nAt most 3 * 10^4 calls to push, pop, top and getMin.",
        hints: "Remembering a single 'current minimum' breaks as soon as that element is popped. What if every stack entry also remembered the minimum at the time it was pushed?",
        editorial:
            "Keep a second stack (or store pairs) where mins[i] is the minimum of the first i + 1 elements. push appends min(val, previous min); pop removes from both stacks; getMin reads the top of mins. All operations are O(1).",
        examples: [
            { input: "MinStack(), push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()", output: "-3 0 -2", explanation: "The minimum is -3; after popping it the top is 0 and the minimum is -2 again." },
            { input: "MinStack(), push(42), top(), getMin()", output: "42 42", explanation: "A single element is both the top and the minimum." },
            { input: "MinStack(), push(2), push(2), push(1), getMin(), pop(), getMin()", output: "1 2", explanation: "Duplicate minimums must both be tracked." },
        ],
        testCases: [
            { input: designInput("", ["push -2", "push 0", "push -3", "getMin", "pop", "top", "getMin"]), output: "-3 0 -2" },
            {
                input: designInput("", ["push 5", "getMin", "push 3", "getMin", "push 7", "getMin", "pop", "getMin", "pop", "getMin", "top"]),
                output: "5 3 3 3 5 5",
            },
            { input: designInput("", ["push 2", "push 2", "push 1", "getMin", "pop", "getMin", "pop", "getMin", "top"]), output: "1 2 2 2" },
            { input: designInput("", ["push 42", "top", "getMin"]), output: "42 42" },
            { input: designInput("", ["push 3", "push 2", "push 1", "pop", "getMin", "pop", "getMin", "top"]), output: "2 3 3" },
            { input: designInput("", ["push -1", "push -1", "getMin", "pop", "getMin"]), output: "-1 -1" },
        ],
        design: {
            className: "MinStack",
            ctorParams: [],
            methods: [
                { name: "push", params: ["val"], returns: "void" },
                { name: "pop", params: [], returns: "void" },
                { name: "top", params: [], returns: "int" },
                { name: "getMin", params: [], returns: "int" },
            ],
        },
        solutions: {
            JAVASCRIPT: code`
                class MinStack {
                  constructor() {
                    this.stack = [];
                    this.mins = [];
                  }

                  push(val) {
                    this.stack.push(val);
                    const currentMin = this.mins.length === 0 ? val : Math.min(val, this.mins[this.mins.length - 1]);
                    this.mins.push(currentMin);
                  }

                  pop() {
                    this.stack.pop();
                    this.mins.pop();
                  }

                  top() {
                    return this.stack[this.stack.length - 1];
                  }

                  getMin() {
                    return this.mins[this.mins.length - 1];
                  }
                }`,
            PYTHON: code`
                class MinStack:
                    def __init__(self):
                        self.stack = []
                        self.mins = []

                    def push(self, val: int) -> None:
                        self.stack.append(val)
                        self.mins.append(val if not self.mins else min(val, self.mins[-1]))

                    def pop(self) -> None:
                        self.stack.pop()
                        self.mins.pop()

                    def top(self) -> int:
                        return self.stack[-1]

                    def getMin(self) -> int:
                        return self.mins[-1]`,
            JAVA: code`
                class MinStack {
                    private final Deque<Integer> stack = new ArrayDeque<>();
                    private final Deque<Integer> mins = new ArrayDeque<>();

                    public MinStack() {
                    }

                    public void push(int val) {
                        stack.push(val);
                        mins.push(mins.isEmpty() ? val : Math.min(val, mins.peek()));
                    }

                    public void pop() {
                        stack.pop();
                        mins.pop();
                    }

                    public int top() {
                        return stack.peek();
                    }

                    public int getMin() {
                        return mins.peek();
                    }
                }`,
        },
        wrong: code`
            class MinStack:
                def __init__(self):
                    self.stack = []
                    self.min = None

                def push(self, val: int) -> None:
                    self.stack.append(val)
                    if self.min is None or val < self.min:
                        self.min = val

                def pop(self) -> None:
                    self.stack.pop()

                def top(self) -> int:
                    return self.stack[-1]

                def getMin(self) -> int:
                    return self.min`,
    },
    {
        kind: "function",
        slug: "daily-temperatures",
        title: "Daily Temperatures",
        difficulty: "MEDIUM",
        tags: ["Stack", "Array", "Monotonic Stack"],
        statement:
            "Given an array temperatures of daily temperatures, return an array answer where answer[i] is the number of days you have to wait after day i to get a warmer (strictly higher) temperature.\n\nIf there is no future day with a warmer temperature, answer[i] is 0.",
        constraints: "1 <= temperatures.length <= 10^5\n30 <= temperatures[i] <= 100",
        hints: "Checking every later day is O(n^2). Keep the indices of days still waiting for a warmer day; a new warmer day resolves all colder waiting days at once.",
        editorial:
            "Maintain a stack of indices with non-increasing temperatures. For each day i, while the temperature at the top index is strictly lower than temperatures[i], pop it and set answer[top] = i - top. Then push i. Every index is pushed and popped once: O(n).",
        examples: [
            { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]", explanation: "Day 2 (75) waits 4 days for 76." },
            { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]", explanation: "Each day is followed immediately by a warmer one." },
            { input: "temperatures = [55,55,55]", output: "[0,0,0]", explanation: "Equal temperatures are not warmer." },
        ],
        testCases: [
            { input: "73 74 75 71 69 72 76 73", output: "[1,1,4,2,1,1,0,0]" },
            { input: "30 40 50 60", output: "[1,1,1,0]" },
            { input: "30 60 90", output: "[1,1,0]" },
            { input: "90 80 70", output: "[0,0,0]" },
            { input: "50", output: "[0]" },
            { input: "55 55 55", output: "[0,0,0]" },
            { input: "60 50 55 52 70", output: "[4,1,2,1,0]" },
        ],
        fn: { name: "dailyTemperatures", params: [{ name: "temperatures", type: "int[]" }], returns: "int[]" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const n = temperatures.length;
                    const answer = new Array(n).fill(0);
                    const stack = [];
                    for (let i = 0; i < n; i++) {
                      while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
                        const j = stack.pop();
                        answer[j] = i - j;
                      }
                      stack.push(i);
                    }
                    return answer;`,
            },
            PYTHON: {
                body: code`
                    n = len(temperatures)
                    answer = [0] * n
                    stack = []
                    for i in range(n):
                        while stack and temperatures[stack[-1]] < temperatures[i]:
                            j = stack.pop()
                            answer[j] = i - j
                        stack.append(i)
                    return answer`,
            },
            JAVA: {
                body: code`
                    int n = temperatures.length;
                    int[] answer = new int[n];
                    Deque<Integer> stack = new ArrayDeque<>();
                    for (int i = 0; i < n; i++) {
                        while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                            int j = stack.pop();
                            answer[j] = i - j;
                        }
                        stack.push(i);
                    }
                    return answer;`,
            },
        },
        wrong: {
            body: code`
                n = len(temperatures)
                answer = [0] * n
                stack = []
                for i in range(n):
                    while stack and temperatures[stack[-1]] <= temperatures[i]:
                        j = stack.pop()
                        answer[j] = i - j
                    stack.append(i)
                return answer`,
        },
    },
    {
        kind: "function",
        slug: "evaluate-reverse-polish-notation",
        title: "Evaluate Reverse Polish Notation",
        difficulty: "MEDIUM",
        tags: ["Stack", "Math"],
        statement:
            "You are given an array of strings tokens that represents an arithmetic expression in Reverse Polish Notation. Evaluate the expression and return the resulting integer.\n\nValid operators are +, -, * and /. Each operand is an integer (possibly negative, like -11). Division between two integers always truncates toward zero, there is no division by zero, and every intermediate result fits in a 32-bit integer.",
        constraints: "1 <= tokens.length <= 10^4\ntokens[i] is an operator (+, -, *, /) or an integer in the range [-200, 200].\nThe expression is always valid.",
        hints: "Read the tokens left to right. Numbers are pushed; an operator pops the two most recent operands. Mind the operand order for - and /, and the rounding direction of negative division.",
        editorial:
            "Use a stack of operands. For an operator pop b, then a, compute a op b and push the result. Integer division must truncate toward zero (Math.trunc in JavaScript, int(a / b) in Python, plain / in Java), not floor. The answer is the single value left on the stack. Time O(n).",
        examples: [
            { input: 'tokens = ["2","1","+","3","*"]', output: "9", explanation: "(2 + 1) * 3 = 9." },
            { input: 'tokens = ["4","13","5","/","+"]', output: "6", explanation: "4 + (13 / 5) = 4 + 2 = 6." },
            { input: 'tokens = ["7","-3","/"]', output: "-2", explanation: "7 / -3 = -2.33..., truncated toward zero gives -2." },
        ],
        testCases: [
            { input: "2 1 + 3 *", output: "9" },
            { input: "4 13 5 / +", output: "6" },
            { input: "10 6 9 3 + -11 * / * 17 + 5 +", output: "22" },
            { input: "3 4 -", output: "-1" },
            { input: "7 -3 /", output: "-2" },
            { input: "-7 2 /", output: "-3" },
            { input: "5", output: "5" },
            { input: "15 7 1 1 + - / 3 * 2 1 1 + + -", output: "5" },
        ],
        fn: { name: "evalRPN", params: [{ name: "tokens", type: "str[]" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const stack = [];
                    for (const token of tokens) {
                      if (token === "+" || token === "-" || token === "*" || token === "/") {
                        const b = stack.pop();
                        const a = stack.pop();
                        if (token === "+") stack.push(a + b);
                        else if (token === "-") stack.push(a - b);
                        else if (token === "*") stack.push(a * b);
                        else stack.push(Math.trunc(a / b));
                      } else {
                        stack.push(parseInt(token, 10));
                      }
                    }
                    return stack.pop();`,
            },
            PYTHON: {
                body: code`
                    stack = []
                    for token in tokens:
                        if token in ("+", "-", "*", "/"):
                            b = stack.pop()
                            a = stack.pop()
                            if token == "+":
                                stack.append(a + b)
                            elif token == "-":
                                stack.append(a - b)
                            elif token == "*":
                                stack.append(a * b)
                            else:
                                stack.append(int(a / b))
                        else:
                            stack.append(int(token))
                    return stack.pop()`,
            },
            JAVA: {
                body: code`
                    Deque<Integer> stack = new ArrayDeque<>();
                    for (String token : tokens) {
                        if (token.equals("+") || token.equals("-") || token.equals("*") || token.equals("/")) {
                            int b = stack.pop();
                            int a = stack.pop();
                            if (token.equals("+")) stack.push(a + b);
                            else if (token.equals("-")) stack.push(a - b);
                            else if (token.equals("*")) stack.push(a * b);
                            else stack.push(a / b);
                        } else {
                            stack.push(Integer.parseInt(token));
                        }
                    }
                    return stack.pop();`,
            },
        },
        wrong: {
            body: code`
                stack = []
                for token in tokens:
                    if token in ("+", "-", "*", "/"):
                        b = stack.pop()
                        a = stack.pop()
                        if token == "+":
                            stack.append(a + b)
                        elif token == "-":
                            stack.append(a - b)
                        elif token == "*":
                            stack.append(a * b)
                        else:
                            stack.append(a // b)
                    else:
                        stack.append(int(token))
                return stack.pop()`,
        },
    },
    {
        kind: "function",
        slug: "largest-rectangle-in-histogram",
        title: "Largest Rectangle in Histogram",
        difficulty: "HARD",
        tags: ["Stack", "Array", "Monotonic Stack"],
        statement:
            "Given an array heights representing the bar heights of a histogram where every bar has width 1, return the area of the largest rectangle that fits inside the histogram.",
        constraints: "1 <= heights.length <= 10^5\n0 <= heights[i] <= 10^4",
        hints: "For each bar, the widest rectangle using it as the shortest bar extends to the nearest shorter bar on both sides. A stack of increasing heights finds those boundaries in one pass.",
        editorial:
            "Keep a stack of indices with increasing heights. When a bar with height h arrives and the top bar is >= h, pop it: its height is the rectangle height, its right boundary is the current index and its left boundary is the new stack top (or -1). Append a final sentinel bar of height 0 to flush the stack. Time O(n).",
        examples: [
            { input: "heights = [2,1,5,6,2,3]", output: "10", explanation: "The bars of height 5 and 6 form a rectangle of area 5 * 2 = 10." },
            { input: "heights = [2,4]", output: "4", explanation: "Either the single bar of height 4, or both bars at height 2 (area 4)." },
            { input: "heights = [5,4,3,2,1]", output: "9", explanation: "Using the first three bars at height 3 gives 3 * 3 = 9." },
        ],
        testCases: [
            { input: "2 1 5 6 2 3", output: "10" },
            { input: "2 4", output: "4" },
            { input: "1", output: "1" },
            { input: "6 2 5 4 5 1 6", output: "12" },
            { input: "1 1 1 1", output: "4" },
            { input: "5 4 3 2 1", output: "9" },
            { input: "2 1 2", output: "3" },
            { input: "0 9", output: "9" },
        ],
        fn: { name: "largestRectangleArea", params: [{ name: "heights", type: "int[]" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const stack = [];
                    let best = 0;
                    for (let i = 0; i <= heights.length; i++) {
                      const h = i === heights.length ? 0 : heights[i];
                      while (stack.length && heights[stack[stack.length - 1]] >= h) {
                        const height = heights[stack.pop()];
                        const left = stack.length ? stack[stack.length - 1] : -1;
                        best = Math.max(best, height * (i - left - 1));
                      }
                      stack.push(i);
                    }
                    return best;`,
            },
            PYTHON: {
                body: code`
                    stack = []
                    best = 0
                    for i in range(len(heights) + 1):
                        h = 0 if i == len(heights) else heights[i]
                        while stack and heights[stack[-1]] >= h:
                            height = heights[stack.pop()]
                            left = stack[-1] if stack else -1
                            best = max(best, height * (i - left - 1))
                        stack.append(i)
                    return best`,
            },
            JAVA: {
                body: code`
                    Deque<Integer> stack = new ArrayDeque<>();
                    int best = 0;
                    for (int i = 0; i <= heights.length; i++) {
                        int h = (i == heights.length) ? 0 : heights[i];
                        while (!stack.isEmpty() && heights[stack.peek()] >= h) {
                            int height = heights[stack.pop()];
                            int left = stack.isEmpty() ? -1 : stack.peek();
                            best = Math.max(best, height * (i - left - 1));
                        }
                        stack.push(i);
                    }
                    return best;`,
            },
        },
        wrong: { body: "return max(heights)" },
    },
];
