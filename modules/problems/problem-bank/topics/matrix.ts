import { code } from "../dedent";
import type { ProblemSpec } from "../types";

export const matrixProblems: ProblemSpec[] = [
    {
        kind: "function",
        slug: "transpose-matrix",
        title: "Transpose Matrix",
        difficulty: "EASY",
        tags: ["2D Array", "Matrix"],
        statement:
            "Given a 2D integer array matrix, return its transpose.\n\nThe transpose of a matrix flips it over its main diagonal, swapping the row and column indices: element (i, j) moves to (j, i).",
        constraints: "1 <= rows, cols <= 100\n-10^9 <= matrix[i][j] <= 10^9",
        hints: "The result has cols rows and rows columns. Which source cell feeds result[j][i]?",
        editorial:
            "Allocate a cols x rows matrix and copy matrix[i][j] into result[j][i] for every cell. This works for non-square matrices too, which is why an in-place swap is only valid for square inputs. Time O(rows * cols).",
        examples: [
            { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[1,4,7],[2,5,8],[3,6,9]]", explanation: "Rows become columns on a square matrix." },
            { input: "matrix = [[1,2,3],[4,5,6]]", output: "[[1,4],[2,5],[3,6]]", explanation: "A 2x3 matrix becomes 3x2." },
            { input: "matrix = [[1,2,3,4]]", output: "[[1],[2],[3],[4]]", explanation: "A single row becomes a single column." },
        ],
        testCases: [
            { input: "3 3\n1 2 3\n4 5 6\n7 8 9", output: "[[1,4,7],[2,5,8],[3,6,9]]" },
            { input: "2 3\n1 2 3\n4 5 6", output: "[[1,4],[2,5],[3,6]]" },
            { input: "1 1\n7", output: "[[7]]" },
            { input: "1 4\n1 2 3 4", output: "[[1],[2],[3],[4]]" },
            { input: "3 1\n9\n8\n7", output: "[[9,8,7]]" },
            { input: "2 2\n-1 0\n5 -6", output: "[[-1,5],[0,-6]]" },
        ],
        fn: { name: "transpose", params: [{ name: "matrix", type: "int[][]" }], returns: "int[][]" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const rows = matrix.length;
                    const cols = matrix[0].length;
                    const result = [];
                    for (let j = 0; j < cols; j++) {
                      const row = [];
                      for (let i = 0; i < rows; i++) row.push(matrix[i][j]);
                      result.push(row);
                    }
                    return result;`,
            },
            PYTHON: {
                body: code`
                    rows, cols = len(matrix), len(matrix[0])
                    return [[matrix[i][j] for i in range(rows)] for j in range(cols)]`,
            },
            JAVA: {
                body: code`
                    int rows = matrix.length;
                    int cols = matrix[0].length;
                    int[][] result = new int[cols][rows];
                    for (int i = 0; i < rows; i++) {
                        for (int j = 0; j < cols; j++) {
                            result[j][i] = matrix[i][j];
                        }
                    }
                    return result;`,
            },
        },
        wrong: { body: "return [row[:] for row in matrix]" },
    },
    {
        kind: "function",
        slug: "rotate-image",
        title: "Rotate Image",
        difficulty: "MEDIUM",
        tags: ["2D Array", "Matrix"],
        statement:
            "You are given an n x n 2D matrix representing an image. Rotate the image by 90 degrees clockwise and return the rotated matrix.",
        constraints: "n == matrix.length == matrix[i].length\n1 <= n <= 20\n-1000 <= matrix[i][j] <= 1000",
        hints: "Where does the top-left corner end up after a clockwise rotation? Generalise: matrix[i][j] moves to row j, column n - 1 - i.",
        editorial:
            "A clockwise rotation maps cell (i, j) to (j, n - 1 - i). Build a new matrix with that rule, or rotate in place by transposing and then reversing every row. Time O(n^2).",
        examples: [
            { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]", explanation: "The first column read bottom-to-top becomes the first row." },
            { input: "matrix = [[1,2],[3,4]]", output: "[[3,1],[4,2]]", explanation: "A 2x2 rotation." },
            { input: "matrix = [[1,0,0],[0,0,0],[0,0,0]]", output: "[[0,0,1],[0,0,0],[0,0,0]]", explanation: "The top-left corner moves to the top-right corner." },
        ],
        testCases: [
            { input: "3 3\n1 2 3\n4 5 6\n7 8 9", output: "[[7,4,1],[8,5,2],[9,6,3]]" },
            { input: "4 4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16", output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]" },
            { input: "1 1\n1", output: "[[1]]" },
            { input: "2 2\n1 2\n3 4", output: "[[3,1],[4,2]]" },
            { input: "3 3\n1 0 0\n0 0 0\n0 0 0", output: "[[0,0,1],[0,0,0],[0,0,0]]" },
        ],
        fn: { name: "rotate", params: [{ name: "matrix", type: "int[][]" }], returns: "int[][]" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const n = matrix.length;
                    const result = Array.from({ length: n }, () => new Array(n).fill(0));
                    for (let i = 0; i < n; i++) {
                      for (let j = 0; j < n; j++) {
                        result[j][n - 1 - i] = matrix[i][j];
                      }
                    }
                    return result;`,
            },
            PYTHON: {
                body: code`
                    n = len(matrix)
                    result = [[0] * n for _ in range(n)]
                    for i in range(n):
                        for j in range(n):
                            result[j][n - 1 - i] = matrix[i][j]
                    return result`,
            },
            JAVA: {
                body: code`
                    int n = matrix.length;
                    int[][] result = new int[n][n];
                    for (int i = 0; i < n; i++) {
                        for (int j = 0; j < n; j++) {
                            result[j][n - 1 - i] = matrix[i][j];
                        }
                    }
                    return result;`,
            },
        },
        wrong: {
            body: code`
                n = len(matrix)
                result = [[0] * n for _ in range(n)]
                for i in range(n):
                    for j in range(n):
                        result[n - 1 - j][i] = matrix[i][j]
                return result`,
        },
    },
    {
        kind: "function",
        slug: "spiral-matrix",
        title: "Spiral Matrix",
        difficulty: "MEDIUM",
        tags: ["2D Array", "Matrix", "Simulation"],
        statement:
            "Given an m x n matrix, return all of its elements in spiral order: start at the top-left corner, go right, then down, then left, then up, and keep spiralling inwards.",
        constraints: "m == matrix.length\nn == matrix[i].length\n1 <= m, n <= 10\n-100 <= matrix[i][j] <= 100",
        hints: "Keep four boundaries (top, bottom, left, right) and shrink them after finishing each side. Beware of the last row or column of a thin matrix being walked twice.",
        editorial:
            "Walk the top row left-to-right then top++, the right column top-to-bottom then right--, and only if rows remain the bottom row right-to-left then bottom--, and only if columns remain the left column bottom-to-top then left++. Repeat while top <= bottom and left <= right. Time O(m * n).",
        examples: [
            { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]", explanation: "Right along the top, down the right side, left along the bottom, up and finish in the middle." },
            { input: "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]", output: "[1,2,3,4,8,12,11,10,9,5,6,7]", explanation: "A 3x4 matrix." },
            { input: "matrix = [[1,2,3,4]]", output: "[1,2,3,4]", explanation: "A single row is visited once, left to right." },
        ],
        testCases: [
            { input: "3 3\n1 2 3\n4 5 6\n7 8 9", output: "[1,2,3,6,9,8,7,4,5]" },
            { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12", output: "[1,2,3,4,8,12,11,10,9,5,6,7]" },
            { input: "1 1\n1", output: "[1]" },
            { input: "1 4\n1 2 3 4", output: "[1,2,3,4]" },
            { input: "4 1\n1\n2\n3\n4", output: "[1,2,3,4]" },
            { input: "2 3\n1 2 3\n4 5 6", output: "[1,2,3,6,5,4]" },
            { input: "4 3\n1 2 3\n4 5 6\n7 8 9\n10 11 12", output: "[1,2,3,6,9,12,11,10,7,4,5,8]" },
        ],
        fn: { name: "spiralOrder", params: [{ name: "matrix", type: "int[][]" }], returns: "int[]" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const result = [];
                    let top = 0;
                    let bottom = matrix.length - 1;
                    let left = 0;
                    let right = matrix[0].length - 1;
                    while (top <= bottom && left <= right) {
                      for (let j = left; j <= right; j++) result.push(matrix[top][j]);
                      top++;
                      for (let i = top; i <= bottom; i++) result.push(matrix[i][right]);
                      right--;
                      if (top <= bottom) {
                        for (let j = right; j >= left; j--) result.push(matrix[bottom][j]);
                        bottom--;
                      }
                      if (left <= right) {
                        for (let i = bottom; i >= top; i--) result.push(matrix[i][left]);
                        left++;
                      }
                    }
                    return result;`,
            },
            PYTHON: {
                body: code`
                    result = []
                    top, bottom = 0, len(matrix) - 1
                    left, right = 0, len(matrix[0]) - 1
                    while top <= bottom and left <= right:
                        for j in range(left, right + 1):
                            result.append(matrix[top][j])
                        top += 1
                        for i in range(top, bottom + 1):
                            result.append(matrix[i][right])
                        right -= 1
                        if top <= bottom:
                            for j in range(right, left - 1, -1):
                                result.append(matrix[bottom][j])
                            bottom -= 1
                        if left <= right:
                            for i in range(bottom, top - 1, -1):
                                result.append(matrix[i][left])
                            left += 1
                    return result`,
            },
            JAVA: {
                body: code`
                    int rows = matrix.length;
                    int cols = matrix[0].length;
                    int[] result = new int[rows * cols];
                    int index = 0;
                    int top = 0, bottom = rows - 1, left = 0, right = cols - 1;
                    while (top <= bottom && left <= right) {
                        for (int j = left; j <= right; j++) result[index++] = matrix[top][j];
                        top++;
                        for (int i = top; i <= bottom; i++) result[index++] = matrix[i][right];
                        right--;
                        if (top <= bottom) {
                            for (int j = right; j >= left; j--) result[index++] = matrix[bottom][j];
                            bottom--;
                        }
                        if (left <= right) {
                            for (int i = bottom; i >= top; i--) result[index++] = matrix[i][left];
                            left++;
                        }
                    }
                    return result;`,
            },
        },
        wrong: {
            body: code`
                result = []
                top, bottom = 0, len(matrix) - 1
                left, right = 0, len(matrix[0]) - 1
                while top <= bottom and left <= right:
                    for j in range(left, right + 1):
                        result.append(matrix[top][j])
                    top += 1
                    for i in range(top, bottom + 1):
                        result.append(matrix[i][right])
                    right -= 1
                    for j in range(right, left - 1, -1):
                        result.append(matrix[bottom][j])
                    bottom -= 1
                    for i in range(bottom, top - 1, -1):
                        result.append(matrix[i][left])
                    left += 1
                return result`,
        },
    },
    {
        kind: "function",
        slug: "set-matrix-zeroes",
        title: "Set Matrix Zeroes",
        difficulty: "MEDIUM",
        tags: ["2D Array", "Matrix", "Hash Table"],
        statement:
            "Given an m x n integer matrix, if an element is 0 then set its entire row and its entire column to 0. Return the resulting matrix.\n\nThe zeroes that appear because of this rule must not cause further rows or columns to be zeroed: decide using the ORIGINAL matrix.",
        constraints: "m == matrix.length\nn == matrix[0].length\n1 <= m, n <= 200\n-2^31 <= matrix[i][j] <= 2^31 - 1",
        hints: "If you zero cells while scanning, you cannot tell original zeroes from new ones. First record which rows and columns must be cleared, then clear them.",
        editorial:
            "Pass 1: remember every row index and column index that contains a zero. Pass 2: set a cell to 0 when its row or its column was recorded. Time O(m * n), extra space O(m + n) (an O(1)-space version stores the flags in the first row and column).",
        examples: [
            { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]", explanation: "The zero at (1,1) clears row 1 and column 1." },
            { input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]", explanation: "Zeroes in columns 0 and 3 clear those columns and row 0." },
            { input: "matrix = [[1,2],[3,4]]", output: "[[1,2],[3,4]]", explanation: "No zeroes: nothing changes." },
        ],
        testCases: [
            { input: "3 3\n1 1 1\n1 0 1\n1 1 1", output: "[[1,0,1],[0,0,0],[1,0,1]]" },
            { input: "3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]" },
            { input: "1 1\n5", output: "[[5]]" },
            { input: "1 3\n1 0 3", output: "[[0,0,0]]" },
            { input: "2 2\n1 2\n3 4", output: "[[1,2],[3,4]]" },
            { input: "3 2\n1 2\n0 4\n5 6", output: "[[0,2],[0,0],[0,6]]" },
        ],
        fn: { name: "setZeroes", params: [{ name: "matrix", type: "int[][]" }], returns: "int[][]" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const rows = new Set();
                    const cols = new Set();
                    for (let i = 0; i < matrix.length; i++) {
                      for (let j = 0; j < matrix[0].length; j++) {
                        if (matrix[i][j] === 0) {
                          rows.add(i);
                          cols.add(j);
                        }
                      }
                    }
                    for (let i = 0; i < matrix.length; i++) {
                      for (let j = 0; j < matrix[0].length; j++) {
                        if (rows.has(i) || cols.has(j)) matrix[i][j] = 0;
                      }
                    }
                    return matrix;`,
            },
            PYTHON: {
                body: code`
                    rows, cols = set(), set()
                    for i in range(len(matrix)):
                        for j in range(len(matrix[0])):
                            if matrix[i][j] == 0:
                                rows.add(i)
                                cols.add(j)
                    for i in range(len(matrix)):
                        for j in range(len(matrix[0])):
                            if i in rows or j in cols:
                                matrix[i][j] = 0
                    return matrix`,
            },
            JAVA: {
                body: code`
                    int m = matrix.length;
                    int n = matrix[0].length;
                    boolean[] zeroRow = new boolean[m];
                    boolean[] zeroCol = new boolean[n];
                    for (int i = 0; i < m; i++) {
                        for (int j = 0; j < n; j++) {
                            if (matrix[i][j] == 0) {
                                zeroRow[i] = true;
                                zeroCol[j] = true;
                            }
                        }
                    }
                    for (int i = 0; i < m; i++) {
                        for (int j = 0; j < n; j++) {
                            if (zeroRow[i] || zeroCol[j]) matrix[i][j] = 0;
                        }
                    }
                    return matrix;`,
            },
        },
        wrong: {
            body: code`
                for i in range(len(matrix)):
                    for j in range(len(matrix[0])):
                        if matrix[i][j] == 0:
                            for k in range(len(matrix[0])):
                                matrix[i][k] = 0
                            for k in range(len(matrix)):
                                matrix[k][j] = 0
                return matrix`,
        },
    },
    {
        kind: "function",
        slug: "longest-increasing-path-in-a-matrix",
        title: "Longest Increasing Path in a Matrix",
        difficulty: "HARD",
        tags: ["2D Array", "Matrix", "Dynamic Programming", "Graph"],
        statement:
            "Given an m x n integer matrix, return the length of the longest strictly increasing path in it.\n\nFrom each cell you may move up, down, left or right (not diagonally, and not outside the matrix). Every step must go to a cell with a strictly larger value.",
        constraints: "1 <= m, n <= 50\n0 <= matrix[i][j] <= 2^31 - 1",
        hints: "A DFS from every cell repeats a lot of work. The longest path starting at a cell only depends on its strictly larger neighbours - process cells from largest to smallest value, or memoise.",
        editorial:
            "Sort all cells by value ascending. For each cell, dp = 1 + max(dp of neighbours with a strictly smaller value). Because smaller values are processed first, every needed dp is final. The answer is the maximum dp. Time O(mn log(mn)).",
        examples: [
            { input: "matrix = [[9,9,4],[6,6,8],[2,1,1]]", output: "4", explanation: "The longest path is 1 -> 2 -> 6 -> 9." },
            { input: "matrix = [[3,4,5],[3,2,6],[2,2,1]]", output: "4", explanation: "The longest path is 3 -> 4 -> 5 -> 6." },
            { input: "matrix = [[1,1,1],[1,1,1]]", output: "1", explanation: "Equal neighbours are not strictly increasing, so each cell is its own path." },
        ],
        testCases: [
            { input: "3 3\n9 9 4\n6 6 8\n2 1 1", output: "4" },
            { input: "3 3\n3 4 5\n3 2 6\n2 2 1", output: "4" },
            { input: "1 1\n1", output: "1" },
            { input: "2 2\n1 2\n4 3", output: "4" },
            { input: "2 3\n1 1 1\n1 1 1", output: "1" },
            { input: "3 3\n1 2 3\n6 5 4\n7 8 9", output: "9" },
        ],
        fn: { name: "longestIncreasingPath", params: [{ name: "matrix", type: "int[][]" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const m = matrix.length;
                    const n = matrix[0].length;
                    const cells = [];
                    for (let i = 0; i < m; i++) {
                      for (let j = 0; j < n; j++) cells.push([i, j]);
                    }
                    cells.sort((a, b) => matrix[a[0]][a[1]] - matrix[b[0]][b[1]]);
                    const dp = Array.from({ length: m }, () => new Array(n).fill(1));
                    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                    let best = 1;
                    for (const [i, j] of cells) {
                      for (const [di, dj] of dirs) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] < matrix[i][j]) {
                          dp[i][j] = Math.max(dp[i][j], dp[ni][nj] + 1);
                        }
                      }
                      best = Math.max(best, dp[i][j]);
                    }
                    return best;`,
            },
            PYTHON: {
                body: code`
                    m, n = len(matrix), len(matrix[0])
                    cells = sorted(((i, j) for i in range(m) for j in range(n)), key=lambda c: matrix[c[0]][c[1]])
                    dp = [[1] * n for _ in range(m)]
                    best = 1
                    for i, j in cells:
                        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                            ni, nj = i + di, j + dj
                            if 0 <= ni < m and 0 <= nj < n and matrix[ni][nj] < matrix[i][j]:
                                dp[i][j] = max(dp[i][j], dp[ni][nj] + 1)
                        best = max(best, dp[i][j])
                    return best`,
            },
            JAVA: {
                body: code`
                    int m = matrix.length;
                    int n = matrix[0].length;
                    Integer[] order = new Integer[m * n];
                    for (int k = 0; k < m * n; k++) order[k] = k;
                    Arrays.sort(order, (a, b) -> Integer.compare(matrix[a / n][a % n], matrix[b / n][b % n]));
                    int[][] dp = new int[m][n];
                    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
                    int best = 1;
                    for (int k : order) {
                        int i = k / n;
                        int j = k % n;
                        dp[i][j] = 1;
                        for (int[] d : dirs) {
                            int ni = i + d[0];
                            int nj = j + d[1];
                            if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] < matrix[i][j]) {
                                dp[i][j] = Math.max(dp[i][j], dp[ni][nj] + 1);
                            }
                        }
                        best = Math.max(best, dp[i][j]);
                    }
                    return best;`,
            },
        },
        wrong: {
            body: code`
                best = 1
                for row in matrix:
                    run = 1
                    for j in range(1, len(row)):
                        run = run + 1 if row[j] > row[j - 1] else 1
                        best = max(best, run)
                return best`,
        },
    },
];
