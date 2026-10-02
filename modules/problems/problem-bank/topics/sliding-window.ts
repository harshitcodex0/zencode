import { code } from "../dedent";
import type { ProblemSpec } from "../types";

export const slidingWindowProblems: ProblemSpec[] = [
    {
        kind: "function",
        slug: "maximum-sum-subarray-of-size-k",
        title: "Maximum Sum Subarray of Size K",
        difficulty: "EASY",
        tags: ["Sliding Window", "Array"],
        statement:
            "Given an integer array nums and an integer k, return the maximum sum of any contiguous subarray of exactly k elements.",
        constraints: "1 <= k <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
        hints: "Recomputing every window sum costs O(n * k). When the window slides one step, only two elements change.",
        editorial:
            "Compute the sum of the first k elements, then slide: add the element entering the window and subtract the one leaving it, tracking the maximum. Start the maximum from the first window (not 0) so all-negative arrays work. Time O(n), space O(1).",
        examples: [
            { input: "nums = [2,1,5,1,3,2], k = 3", output: "9", explanation: "The window [5,1,3] has the largest sum 9." },
            { input: "nums = [-1,-2,-3,-4], k = 2", output: "-3", explanation: "Every window is negative; the best is [-1,-2] = -3." },
            { input: "nums = [5], k = 1", output: "5", explanation: "A single window containing the only element." },
        ],
        testCases: [
            { input: "2 1 5 1 3 2\n3", output: "9" },
            { input: "1 2 3 4 5\n2", output: "9" },
            { input: "-1 -2 -3 -4\n2", output: "-3" },
            { input: "5\n1", output: "5" },
            { input: "4 2 1 7 8 1 2 8 1 0\n3", output: "16" },
            { input: "3 3 3 3\n4", output: "12" },
        ],
        fn: {
            name: "maxSumSubarray",
            params: [
                { name: "nums", type: "int[]" },
                { name: "k", type: "int" },
            ],
            returns: "int",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let sum = 0;
                    for (let i = 0; i < k; i++) sum += nums[i];
                    let best = sum;
                    for (let i = k; i < nums.length; i++) {
                      sum += nums[i] - nums[i - k];
                      best = Math.max(best, sum);
                    }
                    return best;`,
            },
            PYTHON: {
                body: code`
                    window = sum(nums[:k])
                    best = window
                    for i in range(k, len(nums)):
                        window += nums[i] - nums[i - k]
                        best = max(best, window)
                    return best`,
            },
            JAVA: {
                body: code`
                    int sum = 0;
                    for (int i = 0; i < k; i++) sum += nums[i];
                    int best = sum;
                    for (int i = k; i < nums.length; i++) {
                        sum += nums[i] - nums[i - k];
                        best = Math.max(best, sum);
                    }
                    return best;`,
            },
        },
        wrong: {
            body: code`
                best = float("-inf")
                for i in range(len(nums) - k + 1):
                    best = max(best, sum(nums[i:i + k - 1]))
                return best`,
        },
    },
    {
        kind: "function",
        slug: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "MEDIUM",
        tags: ["Sliding Window", "String", "Hash Table"],
        statement:
            "Given a string s, return the length of the longest substring that contains no repeated characters.",
        constraints: "1 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
        hints: "Keep a window [left, right] with all-distinct characters. When s[right] already occurs inside the window, move left just past its previous occurrence.",
        editorial:
            "Store the last index of every character. For each right, if the character was last seen at or after left, jump left to last + 1. The window length right - left + 1 is a candidate answer. Never move left backwards (the \"abba\" trap). Time O(n).",
        examples: [
            { input: 's = "abcabcbb"', output: "3", explanation: 'The longest is "abc" with length 3.' },
            { input: 's = "bbbbb"', output: "1", explanation: 'The longest is "b" with length 1.' },
            { input: 's = "pwwkew"', output: "3", explanation: 'The longest is "wke" with length 3 ("pwke" is a subsequence, not a substring).' },
        ],
        testCases: [
            { input: "abcabcbb", output: "3" },
            { input: "bbbbb", output: "1" },
            { input: "pwwkew", output: "3" },
            { input: "a", output: "1" },
            { input: "abba", output: "2" },
            { input: "dvdf", output: "3" },
            { input: "tmmzuxt", output: "5" },
            { input: "abcdefg", output: "7" },
        ],
        fn: { name: "lengthOfLongestSubstring", params: [{ name: "s", type: "str" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const last = new Map();
                    let best = 0;
                    let left = 0;
                    for (let right = 0; right < s.length; right++) {
                      const ch = s[right];
                      if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
                      last.set(ch, right);
                      best = Math.max(best, right - left + 1);
                    }
                    return best;`,
            },
            PYTHON: {
                body: code`
                    last = {}
                    best = 0
                    left = 0
                    for right, ch in enumerate(s):
                        if ch in last and last[ch] >= left:
                            left = last[ch] + 1
                        last[ch] = right
                        best = max(best, right - left + 1)
                    return best`,
            },
            JAVA: {
                body: code`
                    Map<Character, Integer> last = new HashMap<>();
                    int best = 0;
                    int left = 0;
                    for (int right = 0; right < s.length(); right++) {
                        char ch = s.charAt(right);
                        if (last.containsKey(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
                        last.put(ch, right);
                        best = Math.max(best, right - left + 1);
                    }
                    return best;`,
            },
        },
        wrong: { body: "return len(set(s))" },
    },
    {
        kind: "function",
        slug: "minimum-size-subarray-sum",
        title: "Minimum Size Subarray Sum",
        difficulty: "MEDIUM",
        tags: ["Sliding Window", "Array", "Two Pointers"],
        statement:
            "Given an array of positive integers nums and a positive integer target, return the minimal length of a contiguous subarray whose sum is greater than or equal to target.\n\nIf there is no such subarray, return 0.",
        constraints: "1 <= target <= 10^9\n1 <= nums.length <= 10^5\n1 <= nums[i] <= 10^4",
        hints: "All numbers are positive, so growing the window increases the sum and shrinking it decreases the sum. That lets two pointers replace checking every subarray.",
        editorial:
            "Expand right adding nums[right] to the running sum. While the sum is at least target, record right - left + 1 and shrink from the left. Each index enters and leaves the window once: O(n) time, O(1) space.",
        examples: [
            { input: "target = 7, nums = [2,3,1,2,4,3]", output: "2", explanation: "The subarray [4,3] has sum 7 and is the shortest." },
            { input: "target = 4, nums = [1,4,4]", output: "1", explanation: "The single element [4] already reaches the target." },
            { input: "target = 11, nums = [1,1,1,1,1,1,1,1]", output: "0", explanation: "The total sum is 8, which is less than 11." },
        ],
        testCases: [
            { input: "7\n2 3 1 2 4 3", output: "2" },
            { input: "4\n1 4 4", output: "1" },
            { input: "11\n1 1 1 1 1 1 1 1", output: "0" },
            { input: "15\n1 2 3 4 5", output: "5" },
            { input: "100\n50 50", output: "2" },
            { input: "3\n1 1", output: "0" },
            { input: "11\n1 2 3 4 5", output: "3" },
        ],
        fn: {
            name: "minSubArrayLen",
            params: [
                { name: "target", type: "int" },
                { name: "nums", type: "int[]" },
            ],
            returns: "int",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let left = 0;
                    let sum = 0;
                    let best = Infinity;
                    for (let right = 0; right < nums.length; right++) {
                      sum += nums[right];
                      while (sum >= target) {
                        best = Math.min(best, right - left + 1);
                        sum -= nums[left++];
                      }
                    }
                    return best === Infinity ? 0 : best;`,
            },
            PYTHON: {
                body: code`
                    left = 0
                    total = 0
                    best = float("inf")
                    for right, x in enumerate(nums):
                        total += x
                        while total >= target:
                            best = min(best, right - left + 1)
                            total -= nums[left]
                            left += 1
                    return 0 if best == float("inf") else best`,
            },
            JAVA: {
                body: code`
                    int left = 0;
                    int sum = 0;
                    int best = Integer.MAX_VALUE;
                    for (int right = 0; right < nums.length; right++) {
                        sum += nums[right];
                        while (sum >= target) {
                            best = Math.min(best, right - left + 1);
                            sum -= nums[left++];
                        }
                    }
                    return best == Integer.MAX_VALUE ? 0 : best;`,
            },
        },
        wrong: {
            body: code`
                return len(nums) if sum(nums) >= target else 0`,
        },
    },
    {
        kind: "function",
        slug: "max-consecutive-ones-iii",
        title: "Max Consecutive Ones III",
        difficulty: "MEDIUM",
        tags: ["Sliding Window", "Array"],
        statement:
            "Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k zeroes to 1.",
        constraints: "1 <= nums.length <= 10^5\nnums[i] is either 0 or 1.\n0 <= k <= nums.length",
        hints: "Rephrase the task: find the longest window that contains at most k zeroes.",
        editorial:
            "Grow the window to the right counting zeroes. When the count exceeds k, advance the left edge until a zero leaves the window. The longest valid window seen is the answer. Time O(n), space O(1).",
        examples: [
            { input: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", output: "6", explanation: "Flip two zeroes to get [1,1,1,1,1,1] at indices 5 to 10." },
            { input: "nums = [1,1,1], k = 0", output: "3", explanation: "No flips needed: the whole array is already ones." },
            { input: "nums = [0,0,0], k = 2", output: "2", explanation: "Only two zeroes may be flipped." },
        ],
        testCases: [
            { input: "1 1 1 0 0 0 1 1 1 1 0\n2", output: "6" },
            { input: "0 0 1 1 0 0 1 1 1 0 1 1 0 0 0 1 1 1 1\n3", output: "10" },
            { input: "0 0 0\n0", output: "0" },
            { input: "1 1 1\n0", output: "3" },
            { input: "0 0 0\n2", output: "2" },
            { input: "1 0 1 0 1\n1", output: "3" },
            { input: "0\n1", output: "1" },
        ],
        fn: {
            name: "longestOnes",
            params: [
                { name: "nums", type: "int[]" },
                { name: "k", type: "int" },
            ],
            returns: "int",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let left = 0;
                    let zeros = 0;
                    let best = 0;
                    for (let right = 0; right < nums.length; right++) {
                      if (nums[right] === 0) zeros++;
                      while (zeros > k) {
                        if (nums[left] === 0) zeros--;
                        left++;
                      }
                      best = Math.max(best, right - left + 1);
                    }
                    return best;`,
            },
            PYTHON: {
                body: code`
                    left = 0
                    zeros = 0
                    best = 0
                    for right, x in enumerate(nums):
                        if x == 0:
                            zeros += 1
                        while zeros > k:
                            if nums[left] == 0:
                                zeros -= 1
                            left += 1
                        best = max(best, right - left + 1)
                    return best`,
            },
            JAVA: {
                body: code`
                    int left = 0;
                    int zeros = 0;
                    int best = 0;
                    for (int right = 0; right < nums.length; right++) {
                        if (nums[right] == 0) zeros++;
                        while (zeros > k) {
                            if (nums[left] == 0) zeros--;
                            left++;
                        }
                        best = Math.max(best, right - left + 1);
                    }
                    return best;`,
            },
        },
        wrong: {
            body: code`
                best = run = 0
                for x in nums:
                    run = run + 1 if x == 1 else 0
                    best = max(best, run)
                return best`,
        },
    },
    {
        kind: "function",
        slug: "sliding-window-maximum",
        title: "Sliding Window Maximum",
        difficulty: "HARD",
        tags: ["Sliding Window", "Array", "Queue", "Monotonic Deque"],
        statement:
            "You are given an integer array nums and a window size k. The window slides from the very left of the array to the very right, moving one position at a time.\n\nReturn an array containing the maximum value of every window position.",
        constraints: "1 <= k <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
        hints: "Scanning each window costs O(n * k). Keep a deque of indices whose values are in decreasing order: the front is always the current maximum.",
        editorial:
            "Maintain a deque of indices. Before pushing i, pop indices from the back while their value is <= nums[i] (they can never be a maximum again), and pop the front if it fell out of the window (index <= i - k). The front is the answer for the window ending at i. Every index enters and leaves once: O(n).",
        examples: [
            { input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]", explanation: "Windows: [1,3,-1]->3, [3,-1,-3]->3, [-1,-3,5]->5, [-3,5,3]->5, [5,3,6]->6, [3,6,7]->7." },
            { input: "nums = [1], k = 1", output: "[1]", explanation: "A single window." },
            { input: "nums = [4,3,2,1], k = 2", output: "[4,3,2]", explanation: "A decreasing array: each window's maximum is its first element." },
        ],
        testCases: [
            { input: "1 3 -1 -3 5 3 6 7\n3", output: "[3,3,5,5,6,7]" },
            { input: "1\n1", output: "[1]" },
            { input: "9 11\n2", output: "[11]" },
            { input: "4 3 2 1\n2", output: "[4,3,2]" },
            { input: "1 2 3 4 5\n3", output: "[3,4,5]" },
            { input: "-7 -8 7 5 7 1 6 0\n4", output: "[7,7,7,7,7]" },
            { input: "5 5 5 5\n2", output: "[5,5,5]" },
        ],
        fn: {
            name: "maxSlidingWindow",
            params: [
                { name: "nums", type: "int[]" },
                { name: "k", type: "int" },
            ],
            returns: "int[]",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const result = [];
                    const dq = [];
                    let head = 0;
                    for (let i = 0; i < nums.length; i++) {
                      while (dq.length > head && dq[head] <= i - k) head++;
                      while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
                      dq.push(i);
                      if (i >= k - 1) result.push(nums[dq[head]]);
                    }
                    return result;`,
            },
            PYTHON: {
                body: code`
                    from collections import deque

                    result = []
                    dq = deque()
                    for i, x in enumerate(nums):
                        while dq and dq[0] <= i - k:
                            dq.popleft()
                        while dq and nums[dq[-1]] <= x:
                            dq.pop()
                        dq.append(i)
                        if i >= k - 1:
                            result.append(nums[dq[0]])
                    return result`,
            },
            JAVA: {
                body: code`
                    int n = nums.length;
                    int[] result = new int[n - k + 1];
                    Deque<Integer> dq = new ArrayDeque<>();
                    for (int i = 0; i < n; i++) {
                        while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
                        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
                        dq.offerLast(i);
                        if (i >= k - 1) result[i - k + 1] = nums[dq.peekFirst()];
                    }
                    return result;`,
            },
        },
        wrong: {
            body: code`
                return [max(nums[i:i + k - 1]) for i in range(len(nums) - k + 1)]`,
        },
    },
];
