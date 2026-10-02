import { code } from "../dedent";
import type { ProblemSpec } from "../types";

const repeat = (ch: string, n: number) => ch.repeat(n);

export const stringProblems: ProblemSpec[] = [
    {
        kind: "function",
        slug: "valid-anagram",
        title: "Valid Anagram",
        difficulty: "EASY",
        tags: ["String", "Hash Table", "Sorting"],
        statement:
            "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn anagram is a word formed by rearranging the letters of another word, using every original letter exactly once.",
        constraints: "1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.",
        hints: "Sorting both strings works in O(n log n). Can you do it in O(n) by counting how often each letter occurs?",
        editorial:
            "If the lengths differ the answer is false. Otherwise keep 26 counters: add one for every letter of s and subtract one for every letter of t. The strings are anagrams exactly when all counters end at zero. Time O(n), space O(1).",
        examples: [
            { input: 's = "anagram", t = "nagaram"', output: "true", explanation: "Both words use a:3, n:1, g:1, r:1, m:1." },
            { input: 's = "rat", t = "car"', output: "false", explanation: "'t' and 'c' differ, so the letter counts do not match." },
            { input: 's = "listen", t = "silent"', output: "true", explanation: "The same six letters in a different order." },
        ],
        testCases: [
            { input: "anagram\nnagaram", output: "true" },
            { input: "rat\ncar", output: "false" },
            { input: "a\nab", output: "false" },
            { input: "listen\nsilent", output: "true" },
            { input: "aacc\nccac", output: "false" },
            { input: "zzzz\nzzzz", output: "true" },
            { input: "abcdefghijklmnopqrstuvwxyz\nzyxwvutsrqponmlkjihgfedcba", output: "true" },
        ],
        fn: {
            name: "isAnagram",
            params: [
                { name: "s", type: "str" },
                { name: "t", type: "str" },
            ],
            returns: "bool",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    if (s.length !== t.length) return false;
                    const count = new Array(26).fill(0);
                    for (let i = 0; i < s.length; i++) {
                      count[s.charCodeAt(i) - 97]++;
                      count[t.charCodeAt(i) - 97]--;
                    }
                    return count.every((c) => c === 0);`,
            },
            PYTHON: {
                body: code`
                    if len(s) != len(t):
                        return False
                    count = [0] * 26
                    for a, b in zip(s, t):
                        count[ord(a) - 97] += 1
                        count[ord(b) - 97] -= 1
                    return all(c == 0 for c in count)`,
            },
            JAVA: {
                body: code`
                    if (s.length() != t.length()) return false;
                    int[] count = new int[26];
                    for (int i = 0; i < s.length(); i++) {
                        count[s.charAt(i) - 'a']++;
                        count[t.charAt(i) - 'a']--;
                    }
                    for (int c : count) {
                        if (c != 0) return false;
                    }
                    return true;`,
            },
        },
        wrong: { body: "return set(s) == set(t)" },
    },
    {
        kind: "function",
        slug: "longest-common-prefix",
        title: "Longest Common Prefix",
        difficulty: "EASY",
        tags: ["String"],
        statement:
            "Given a list of strings strs, find the longest common prefix shared by all of them.\n\nIf there is no common prefix, the answer is the empty string.",
        constraints: "1 <= strs.length <= 200\n1 <= strs[i].length <= 200\nstrs[i] consists of lowercase English letters only.",
        hints: "Start with the first word as the candidate prefix and shorten it until every other word starts with it.",
        editorial:
            "Take strs[0] as the prefix. For every word, trim the last character of the prefix while the word does not start with it. The prefix can only get shorter, so the total work is O(total characters).",
        examples: [
            { input: 'strs = ["flower","flow","flight"]', output: '"fl"', explanation: '"fl" is the longest prefix shared by all three words.' },
            { input: 'strs = ["dog","racecar","car"]', output: '""', explanation: "There is no common prefix, so the answer is the empty string." },
            { input: 'strs = ["interview","internet","internal","interval"]', output: '"inter"', explanation: "All four words start with \"inter\" but differ at the sixth letter." },
        ],
        testCases: [
            { input: "flower flow flight", output: '"fl"' },
            { input: "dog racecar car", output: '""' },
            { input: "interview internet internal interval", output: '"inter"' },
            { input: "a", output: '"a"' },
            { input: "abc abc abc", output: '"abc"' },
            { input: "ab a", output: '"a"' },
            { input: "prefix", output: '"prefix"' },
            { input: "cir car", output: '"c"' },
        ],
        fn: { name: "longestCommonPrefix", params: [{ name: "strs", type: "str[]" }], returns: "qstr" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let prefix = strs[0];
                    for (const word of strs) {
                      while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
                    }
                    return prefix;`,
            },
            PYTHON: {
                body: code`
                    prefix = strs[0]
                    for word in strs:
                        while not word.startswith(prefix):
                            prefix = prefix[:-1]
                    return prefix`,
            },
            JAVA: {
                body: code`
                    String prefix = strs[0];
                    for (String word : strs) {
                        while (!word.startsWith(prefix)) prefix = prefix.substring(0, prefix.length() - 1);
                    }
                    return prefix;`,
            },
        },
        wrong: {
            body: code`
                a, b = strs[0], strs[1] if len(strs) > 1 else strs[0]
                i = 0
                while i < min(len(a), len(b)) and a[i] == b[i]:
                    i += 1
                return a[:i]`,
        },
    },
    {
        kind: "function",
        slug: "string-compression",
        title: "String Compression",
        difficulty: "EASY",
        tags: ["String", "Two Pointers"],
        statement:
            "Compress a string using run-length encoding. For every run of the same repeated character, write the character followed by the length of the run, but only when the run length is greater than 1.\n\nFor example \"aabcccccaaa\" becomes \"a2bc5a3\". Return the compressed string.",
        constraints: "1 <= s.length <= 10^5\ns consists of lowercase English letters.",
        hints: "Walk through the string with two indices: one at the start of a run, one that scans to the end of the run.",
        editorial:
            "Scan runs left to right. For a run starting at i and ending before j, append s[i] and, if j - i > 1, the decimal length j - i. Use a StringBuilder / list instead of repeated concatenation. Time O(n).",
        examples: [
            { input: 's = "aabcccccaaa"', output: '"a2bc5a3"', explanation: "aa -> a2, b stays b, ccccc -> c5, aaa -> a3." },
            { input: 's = "abc"', output: '"abc"', explanation: "No character repeats, so nothing is compressed." },
            { input: 's = "aabb"', output: '"a2b2"', explanation: "Two runs of length 2." },
        ],
        testCases: [
            { input: "aabcccccaaa", output: '"a2bc5a3"' },
            { input: "abc", output: '"abc"' },
            { input: repeat("a", 12), output: '"a12"' },
            { input: "a", output: '"a"' },
            { input: "aabb", output: '"a2b2"' },
            { input: "a" + repeat("b", 12) + "c", output: '"ab12c"' },
        ],
        fn: { name: "compress", params: [{ name: "s", type: "str" }], returns: "qstr" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let out = "";
                    let i = 0;
                    while (i < s.length) {
                      let j = i;
                      while (j < s.length && s[j] === s[i]) j++;
                      out += s[i];
                      if (j - i > 1) out += String(j - i);
                      i = j;
                    }
                    return out;`,
            },
            PYTHON: {
                body: code`
                    out = []
                    i = 0
                    while i < len(s):
                        j = i
                        while j < len(s) and s[j] == s[i]:
                            j += 1
                        out.append(s[i])
                        if j - i > 1:
                            out.append(str(j - i))
                        i = j
                    return "".join(out)`,
            },
            JAVA: {
                body: code`
                    StringBuilder out = new StringBuilder();
                    int i = 0;
                    while (i < s.length()) {
                        int j = i;
                        while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
                        out.append(s.charAt(i));
                        if (j - i > 1) out.append(j - i);
                        i = j;
                    }
                    return out.toString();`,
            },
        },
        wrong: {
            body: code`
                out = []
                i = 0
                while i < len(s):
                    j = i
                    while j < len(s) and s[j] == s[i]:
                        j += 1
                    out.append(s[i] + str(j - i))
                    i = j
                return "".join(out)`,
        },
    },
    {
        kind: "function",
        slug: "reverse-words-in-a-string",
        title: "Reverse Words in a String",
        difficulty: "MEDIUM",
        tags: ["String", "Two Pointers"],
        statement:
            "Given an input string s, reverse the order of the words.\n\nA word is a sequence of non-space characters. Words in s are separated by at least one space. Return a string of the words in reverse order joined by a single space, with no leading or trailing spaces.",
        constraints: "1 <= s.length <= 10^4\ns contains English letters, digits and spaces.\nThere is at least one word in s.",
        hints: "Split on runs of whitespace (ignoring empty pieces), reverse the list of words and join with one space.",
        editorial:
            "Trim the string, split it into words on whitespace, reverse the words and join them with a single space. For an O(1)-extra-space version, reverse the whole character array and then reverse each word in place.",
        examples: [
            { input: 's = "the sky is blue"', output: '"blue is sky the"', explanation: "The words appear in reverse order." },
            { input: 's = "  hello world  "', output: '"world hello"', explanation: "Leading and trailing spaces are removed." },
            { input: 's = "a good   example"', output: '"example good a"', explanation: "Multiple spaces between words are reduced to a single space." },
        ],
        testCases: [
            { input: "the sky is blue", output: '"blue is sky the"' },
            { input: "  hello world  ", output: '"world hello"' },
            { input: "a good   example", output: '"example good a"' },
            { input: "single", output: '"single"' },
            { input: "  one   two   three  ", output: '"three two one"' },
            { input: "x y", output: '"y x"' },
        ],
        fn: { name: "reverseWords", params: [{ name: "s", type: "str" }], returns: "qstr" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    return s.trim().split(/\s+/).reverse().join(" ");`,
            },
            PYTHON: {
                body: code`
                    return " ".join(reversed(s.split()))`,
            },
            JAVA: {
                body: code`
                    String[] words = s.trim().split("\\s+");
                    StringBuilder sb = new StringBuilder();
                    for (int i = words.length - 1; i >= 0; i--) {
                        sb.append(words[i]);
                        if (i > 0) sb.append(' ');
                    }
                    return sb.toString();`,
            },
        },
        wrong: { body: 'return " ".join(s.split(" ")[::-1])' },
    },
    {
        kind: "function",
        slug: "count-palindromic-substrings",
        title: "Count Palindromic Substrings",
        difficulty: "MEDIUM",
        tags: ["String", "Dynamic Programming", "Two Pointers"],
        statement:
            "Given a string s, return the number of palindromic substrings in it.\n\nA substring is a contiguous sequence of characters. Substrings with different start or end positions are counted separately even if they consist of the same characters.",
        constraints: "1 <= s.length <= 1000\ns consists of lowercase English letters.",
        hints: "Checking every substring costs O(n^3). Every palindrome grows outward from a centre - how many centres are there?",
        editorial:
            "Expand around each of the 2n - 1 centres (n single-character centres for odd length and n - 1 gaps for even length). Each successful expansion step is one palindromic substring. Time O(n^2), space O(1).",
        examples: [
            { input: 's = "abc"', output: "3", explanation: 'Three palindromes: "a", "b", "c".' },
            { input: 's = "aaa"', output: "6", explanation: 'Six palindromes: "a" x3, "aa" x2, "aaa" x1.' },
            { input: 's = "abba"', output: "6", explanation: '"a", "b", "b", "a", "bb" and "abba".' },
        ],
        testCases: [
            { input: "abc", output: "3" },
            { input: "aaa", output: "6" },
            { input: "aabaa", output: "9" },
            { input: "a", output: "1" },
            { input: "abba", output: "6" },
            { input: "racecar", output: "10" },
            { input: "abcba", output: "7" },
        ],
        fn: { name: "countSubstrings", params: [{ name: "s", type: "str" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    let count = 0;
                    const expand = (left, right) => {
                      while (left >= 0 && right < s.length && s[left] === s[right]) {
                        count++;
                        left--;
                        right++;
                      }
                    };
                    for (let center = 0; center < s.length; center++) {
                      expand(center, center);
                      expand(center, center + 1);
                    }
                    return count;`,
            },
            PYTHON: {
                body: code`
                    n = len(s)

                    def expand(left, right):
                        total = 0
                        while left >= 0 and right < n and s[left] == s[right]:
                            total += 1
                            left -= 1
                            right += 1
                        return total

                    count = 0
                    for center in range(n):
                        count += expand(center, center)
                        count += expand(center, center + 1)
                    return count`,
            },
            JAVA: {
                body: code`
                    int count = 0;
                    for (int center = 0; center < s.length(); center++) {
                        count += expand(s, center, center);
                        count += expand(s, center, center + 1);
                    }
                    return count;`,
                helpers: code`
                    static int expand(String s, int left, int right) {
                        int count = 0;
                        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
                            count++;
                            left--;
                            right++;
                        }
                        return count;
                    }`,
            },
        },
        wrong: {
            body: code`
                n = len(s)
                count = 0
                for center in range(n):
                    left = right = center
                    while left >= 0 and right < n and s[left] == s[right]:
                        count += 1
                        left -= 1
                        right += 1
                return count`,
        },
    },
];
