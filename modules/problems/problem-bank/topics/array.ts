import { code } from "../dedent";
import type { ProblemSpec } from "../types";

export const arrayProblems: ProblemSpec[] = [
    {
        kind: "function",
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "EASY",
        tags: ["Array", "Hash Table"],
        statement:
            "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\n\nExactly one valid pair exists, and you may not use the same element twice. Return the two indices in ascending order.",
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nExactly one valid answer exists.",
        hints: "The brute force checks every pair in O(n^2). For each number, the partner you need is target - nums[i]: can you look it up in O(1) while scanning?",
        editorial:
            "Scan the array once and keep a hash map from value to index. For every element x, check whether target - x was already seen; if so the pair is (seen index, current index). Otherwise store x. Time O(n), space O(n).",
        examples: [
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9." },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "nums[1] + nums[2] = 2 + 4 = 6." },
            { input: "nums = [3,3], target = 6", output: "[0,1]", explanation: "The same value may appear twice as long as the indices differ." },
        ],
        testCases: [
            { input: "2 7 11 15\n9", output: "[0,1]" },
            { input: "3 2 4\n6", output: "[1,2]" },
            { input: "3 3\n6", output: "[0,1]" },
            { input: "-1 -2 -3 -4 -5\n-8", output: "[2,4]" },
            { input: "1 5 6 7 9\n10", output: "[0,4]" },
            { input: "0 4 3 0\n0", output: "[0,3]" },
        ],
        fn: {
            name: "twoSum",
            params: [
                { name: "nums", type: "int[]" },
                { name: "target", type: "int" },
            ],
            returns: "int[]",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const seen = new Map();
                    for (let i = 0; i < nums.length; i++) {
                      const need = target - nums[i];
                      if (seen.has(need)) return [seen.get(need), i];
                      seen.set(nums[i], i);
                    }
                    return [];`,
            },
            PYTHON: {
                body: code`
                    seen = {}
                    for i, x in enumerate(nums):
                        need = target - x
                        if need in seen:
                            return [seen[need], i]
                        seen[x] = i
                    return []`,
            },
            JAVA: {
                body: code`
                    Map<Integer, Integer> seen = new HashMap<>();
                    for (int i = 0; i < nums.length; i++) {
                        int need = target - nums[i];
                        if (seen.containsKey(need)) return new int[] {seen.get(need), i};
                        seen.put(nums[i], i);
                    }
                    return new int[0];`,
            },
        },
        wrong: {
            body: code`
                seen = {}
                for i, x in enumerate(nums):
                    need = target - x
                    if need in seen:
                        return [need, x]
                    seen[x] = i
                return []`,
        },
    },
    {
        kind: "function",
        slug: "move-zeroes",
        title: "Move Zeroes",
        difficulty: "EASY",
        tags: ["Array", "Two Pointers"],
        statement:
            "Given an integer array nums, move all 0's to the end of it while keeping the relative order of the non-zero elements. Return the resulting array.",
        constraints: "1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1",
        hints: "Sorting would break the relative order. Use a write pointer that marks where the next non-zero value belongs.",
        editorial:
            "Walk through the array once; every non-zero value is copied to the write position, which then advances. After the scan, fill the rest of the array with zeros. Time O(n), extra space O(1).",
        examples: [
            { input: "nums = [0,1,0,3,12]", output: "[1,3,12,0,0]", explanation: "Non-zero values keep their order, zeros move to the end." },
            { input: "nums = [0]", output: "[0]", explanation: "A single zero stays where it is." },
            { input: "nums = [4,0,5,0,0,6]", output: "[4,5,6,0,0,0]", explanation: "Three zeros are pushed to the end." },
        ],
        testCases: [
            { input: "0 1 0 3 12", output: "[1,3,12,0,0]" },
            { input: "0", output: "[0]" },
            { input: "1 2 3", output: "[1,2,3]" },
            { input: "0 0 1", output: "[1,0,0]" },
            { input: "4 0 5 0 0 6", output: "[4,5,6,0,0,0]" },
            { input: "0 0 0", output: "[0,0,0]" },
        ],
        fn: { name: "moveZeroes", params: [{ name: "nums", type: "int[]" }], returns: "int[]" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let write = 0;
                    for (let i = 0; i < nums.length; i++) {
                      if (nums[i] !== 0) nums[write++] = nums[i];
                    }
                    while (write < nums.length) nums[write++] = 0;
                    return nums;`,
            },
            PYTHON: {
                body: code`
                    write = 0
                    for i in range(len(nums)):
                        if nums[i] != 0:
                            nums[write] = nums[i]
                            write += 1
                    while write < len(nums):
                        nums[write] = 0
                        write += 1
                    return nums`,
            },
            JAVA: {
                body: code`
                    int write = 0;
                    for (int i = 0; i < nums.length; i++) {
                        if (nums[i] != 0) nums[write++] = nums[i];
                    }
                    while (write < nums.length) nums[write++] = 0;
                    return nums;`,
            },
        },
        wrong: { body: "return sorted(nums, reverse=True)" },
    },
    {
        kind: "function",
        slug: "maximum-subarray",
        title: "Maximum Subarray",
        difficulty: "MEDIUM",
        tags: ["Array", "Dynamic Programming"],
        statement:
            "Given an integer array nums, find the contiguous subarray (containing at least one number) that has the largest sum, and return that sum.",
        constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
        hints: "Trying every subarray is O(n^2). At each index, the best subarray ending here either extends the previous best or starts fresh.",
        editorial:
            "Kadane's algorithm: keep cur = max(nums[i], cur + nums[i]) as the best sum of a subarray ending at i, and best = max(best, cur). Start both from nums[0] so all-negative arrays work. Time O(n), space O(1).",
        examples: [
            { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
            { input: "nums = [1]", output: "1", explanation: "The only subarray is [1]." },
            { input: "nums = [-3,-2,-1]", output: "-1", explanation: "When every number is negative the answer is the largest single element." },
        ],
        testCases: [
            { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6" },
            { input: "1", output: "1" },
            { input: "5 4 -1 7 8", output: "23" },
            { input: "-3 -2 -1", output: "-1" },
            { input: "-2 -1", output: "-1" },
            { input: "8 -19 5 -4 20", output: "21" },
            { input: "2 -1 2 -1 2", output: "4" },
        ],
        fn: { name: "maxSubArray", params: [{ name: "nums", type: "int[]" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let best = nums[0];
                    let cur = nums[0];
                    for (let i = 1; i < nums.length; i++) {
                      cur = Math.max(nums[i], cur + nums[i]);
                      best = Math.max(best, cur);
                    }
                    return best;`,
            },
            PYTHON: {
                body: code`
                    best = cur = nums[0]
                    for x in nums[1:]:
                        cur = max(x, cur + x)
                        best = max(best, cur)
                    return best`,
            },
            JAVA: {
                body: code`
                    int best = nums[0];
                    int cur = nums[0];
                    for (int i = 1; i < nums.length; i++) {
                        cur = Math.max(nums[i], cur + nums[i]);
                        best = Math.max(best, cur);
                    }
                    return best;`,
            },
        },
        wrong: {
            body: code`
                best = cur = 0
                for x in nums:
                    cur = max(0, cur + x)
                    best = max(best, cur)
                return best`,
        },
    },
    {
        kind: "function",
        slug: "product-of-array-except-self",
        title: "Product of Array Except Self",
        difficulty: "MEDIUM",
        tags: ["Array", "Prefix Sum"],
        statement:
            "Given an integer array nums, return an array answer such that answer[i] is the product of all the elements of nums except nums[i].\n\nYou must solve it without using the division operator and in O(n) time.",
        constraints: "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30\nThe product of any prefix or suffix fits in a 32-bit integer.",
        hints: "Division fails when the array contains zeros. answer[i] = (product of everything to the left) * (product of everything to the right).",
        editorial:
            "Fill answer with prefix products in a left-to-right pass, then multiply by a running suffix product in a right-to-left pass. Time O(n), extra space O(1) beyond the output.",
        examples: [
            { input: "nums = [1,2,3,4]", output: "[24,12,8,6]", explanation: "For index 0: 2 * 3 * 4 = 24, and so on." },
            { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]", explanation: "Only index 2 (the zero) has a non-zero product." },
            { input: "nums = [2,3]", output: "[3,2]", explanation: "Each position is the product of the single other element." },
        ],
        testCases: [
            { input: "1 2 3 4", output: "[24,12,8,6]" },
            { input: "-1 1 0 -3 3", output: "[0,0,9,0,0]" },
            { input: "2 3", output: "[3,2]" },
            { input: "0 0 2", output: "[0,0,0]" },
            { input: "5 1 1 2", output: "[2,10,10,5]" },
            { input: "-2 -3 4", output: "[-12,-8,6]" },
        ],
        fn: { name: "productExceptSelf", params: [{ name: "nums", type: "int[]" }], returns: "int[]" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const n = nums.length;
                    const answer = new Array(n).fill(1);
                    let prefix = 1;
                    for (let i = 0; i < n; i++) {
                      answer[i] = prefix;
                      prefix *= nums[i];
                    }
                    let suffix = 1;
                    for (let i = n - 1; i >= 0; i--) {
                      answer[i] *= suffix;
                      suffix *= nums[i];
                    }
                    return answer;`,
            },
            PYTHON: {
                body: code`
                    n = len(nums)
                    answer = [1] * n
                    prefix = 1
                    for i in range(n):
                        answer[i] = prefix
                        prefix *= nums[i]
                    suffix = 1
                    for i in range(n - 1, -1, -1):
                        answer[i] *= suffix
                        suffix *= nums[i]
                    return answer`,
            },
            JAVA: {
                body: code`
                    int n = nums.length;
                    int[] answer = new int[n];
                    int prefix = 1;
                    for (int i = 0; i < n; i++) {
                        answer[i] = prefix;
                        prefix *= nums[i];
                    }
                    int suffix = 1;
                    for (int i = n - 1; i >= 0; i--) {
                        answer[i] *= suffix;
                        suffix *= nums[i];
                    }
                    return answer;`,
            },
        },
        wrong: {
            body: code`
                total = 1
                for x in nums:
                    total *= x
                return [total // x if x != 0 else 0 for x in nums]`,
        },
    },
    {
        kind: "function",
        slug: "first-missing-positive",
        title: "First Missing Positive",
        difficulty: "HARD",
        tags: ["Array", "Hash Table"],
        statement:
            "Given an unsorted integer array nums, return the smallest positive integer that is not present in nums.\n\nTry to run in O(n) time using O(1) auxiliary space.",
        constraints: "1 <= nums.length <= 10^5\n-2^31 <= nums[i] <= 2^31 - 1",
        hints: "The answer is always in the range [1, n + 1]. Try placing every value v in 1..n at index v - 1.",
        editorial:
            "Cyclic sort: for each index, while nums[i] is in [1, n] and not already at its home position, swap it there. Afterwards the first index i where nums[i] != i + 1 gives the answer i + 1; if all match the answer is n + 1. Time O(n), space O(1).",
        examples: [
            { input: "nums = [1,2,0]", output: "3", explanation: "1 and 2 are present, so 3 is the first missing positive." },
            { input: "nums = [3,4,-1,1]", output: "2", explanation: "1 is present but 2 is missing." },
            { input: "nums = [7,8,9,11,12]", output: "1", explanation: "1 is not in the array." },
        ],
        testCases: [
            { input: "1 2 0", output: "3" },
            { input: "3 4 -1 1", output: "2" },
            { input: "7 8 9 11 12", output: "1" },
            { input: "1 2 3", output: "4" },
            { input: "2 1", output: "3" },
            { input: "1", output: "2" },
            { input: "2", output: "1" },
            { input: "1 1 2 2", output: "3" },
            { input: "-1 -2", output: "1" },
        ],
        fn: { name: "firstMissingPositive", params: [{ name: "nums", type: "int[]" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const n = nums.length;
                    for (let i = 0; i < n; i++) {
                      while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
                        const j = nums[i] - 1;
                        const tmp = nums[j];
                        nums[j] = nums[i];
                        nums[i] = tmp;
                      }
                    }
                    for (let i = 0; i < n; i++) {
                      if (nums[i] !== i + 1) return i + 1;
                    }
                    return n + 1;`,
            },
            PYTHON: {
                body: code`
                    n = len(nums)
                    for i in range(n):
                        while 0 < nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                            j = nums[i] - 1
                            nums[i], nums[j] = nums[j], nums[i]
                    for i in range(n):
                        if nums[i] != i + 1:
                            return i + 1
                    return n + 1`,
            },
            JAVA: {
                body: code`
                    int n = nums.length;
                    for (int i = 0; i < n; i++) {
                        while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                            int j = nums[i] - 1;
                            int tmp = nums[j];
                            nums[j] = nums[i];
                            nums[i] = tmp;
                        }
                    }
                    for (int i = 0; i < n; i++) {
                        if (nums[i] != i + 1) return i + 1;
                    }
                    return n + 1;`,
            },
        },
        wrong: {
            body: code`
                top = max(nums)
                return top + 1 if top > 0 else 1`,
        },
    },
];
