import { code } from "../dedent";
import type { ProblemSpec } from "../types";

export const graphProblems: ProblemSpec[] = [
    {
        kind: "function",
        slug: "find-if-path-exists-in-graph",
        title: "Find if Path Exists in Graph",
        difficulty: "EASY",
        tags: ["Graph", "BFS", "DFS", "Union Find"],
        statement:
            "There is a bi-directional graph with n vertices labelled from 0 to n - 1. The edges are given as a 2D array edges, where edges[i] = [u, v] is an edge between u and v.\n\nReturn true if there is a valid path from source to destination, otherwise return false.",
        constraints: "1 <= n <= 2 * 10^5\n0 <= edges.length <= 2 * 10^5\n0 <= u, v, source, destination <= n - 1\nThere are no self-loops or repeated edges.",
        hints: "Build an adjacency list (remember the graph is undirected, so every edge goes both ways), then explore outward from source.",
        editorial:
            "Build adjacency lists with both directions of every edge. Run BFS (or DFS) from source marking visited vertices, and return true as soon as destination is reached. If the search ends without finding it, return false. Time O(n + e), space O(n + e).",
        examples: [
            { input: "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2", output: "true", explanation: "Two paths exist: 0 -> 1 -> 2 and 0 -> 2." },
            { input: "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5", output: "false", explanation: "Vertices {0,1,2} and {3,4,5} are in different components." },
            { input: "n = 2, edges = [[0,1]], source = 1, destination = 0", output: "true", explanation: "Edges are bi-directional, so 1 -> 0 works." },
        ],
        testCases: [
            { input: "3\n3 2\n0 1\n1 2\n2 0\n0\n2", output: "true" },
            { input: "6\n5 2\n0 1\n0 2\n3 5\n5 4\n4 3\n0\n5", output: "false" },
            { input: "1\n0 2\n0\n0", output: "true" },
            { input: "5\n4 2\n0 1\n1 2\n2 3\n3 4\n0\n4", output: "true" },
            { input: "4\n2 2\n0 1\n2 3\n1\n2", output: "false" },
            { input: "2\n1 2\n0 1\n1\n0", output: "true" },
            { input: "5\n4 2\n0 1\n0 2\n0 3\n0 4\n3\n4", output: "true" },
        ],
        fn: {
            name: "validPath",
            params: [
                { name: "n", type: "int" },
                { name: "edges", type: "int[][]" },
                { name: "source", type: "int" },
                { name: "destination", type: "int" },
            ],
            returns: "bool",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const adj = Array.from({ length: n }, () => []);
                    for (const [u, v] of edges) {
                      adj[u].push(v);
                      adj[v].push(u);
                    }
                    const seen = new Array(n).fill(false);
                    const queue = [source];
                    seen[source] = true;
                    for (let head = 0; head < queue.length; head++) {
                      const node = queue[head];
                      if (node === destination) return true;
                      for (const next of adj[node]) {
                        if (!seen[next]) {
                          seen[next] = true;
                          queue.push(next);
                        }
                      }
                    }
                    return false;`,
            },
            PYTHON: {
                body: code`
                    from collections import deque

                    adj = [[] for _ in range(n)]
                    for u, v in edges:
                        adj[u].append(v)
                        adj[v].append(u)
                    seen = [False] * n
                    seen[source] = True
                    queue = deque([source])
                    while queue:
                        node = queue.popleft()
                        if node == destination:
                            return True
                        for nxt in adj[node]:
                            if not seen[nxt]:
                                seen[nxt] = True
                                queue.append(nxt)
                    return False`,
            },
            JAVA: {
                body: code`
                    List<List<Integer>> adj = new ArrayList<>();
                    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
                    for (int[] e : edges) {
                        adj.get(e[0]).add(e[1]);
                        adj.get(e[1]).add(e[0]);
                    }
                    boolean[] seen = new boolean[n];
                    Deque<Integer> queue = new ArrayDeque<>();
                    queue.offer(source);
                    seen[source] = true;
                    while (!queue.isEmpty()) {
                        int node = queue.poll();
                        if (node == destination) return true;
                        for (int next : adj.get(node)) {
                            if (!seen[next]) {
                                seen[next] = true;
                                queue.offer(next);
                            }
                        }
                    }
                    return false;`,
            },
        },
        wrong: {
            body: code`
                from collections import deque

                adj = [[] for _ in range(n)]
                for u, v in edges:
                    adj[u].append(v)
                seen = [False] * n
                seen[source] = True
                queue = deque([source])
                while queue:
                    node = queue.popleft()
                    if node == destination:
                        return True
                    for nxt in adj[node]:
                        if not seen[nxt]:
                            seen[nxt] = True
                            queue.append(nxt)
                return False`,
        },
    },
    {
        kind: "function",
        slug: "number-of-islands",
        title: "Number of Islands",
        difficulty: "MEDIUM",
        tags: ["Graph", "DFS", "BFS", "2D Array", "Matrix"],
        statement:
            "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically (diagonal cells are NOT connected). You may assume all four edges of the grid are surrounded by water.",
        constraints: "1 <= m, n <= 100\ngrid[i][j] is 0 or 1.",
        hints: "Treat every land cell as a graph vertex with up to four neighbours. Each time you meet unvisited land, you found a new island: flood-fill it so it is never counted again.",
        editorial:
            "Scan the grid. When a land cell is found, increment the island count and flood-fill (DFS with an explicit stack, or BFS) turning every connected land cell into water. Using an explicit stack avoids deep recursion on large islands. Time O(m * n).",
        examples: [
            { input: "grid = [[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]", output: "1", explanation: "All land cells are connected." },
            { input: "grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]", output: "3", explanation: "Three separate islands." },
            { input: "grid = [[1,0,1],[0,1,0],[1,0,1]]", output: "5", explanation: "Diagonal neighbours are not connected, so every land cell is its own island." },
        ],
        testCases: [
            { input: "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", output: "1" },
            { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", output: "3" },
            { input: "1 1\n1", output: "1" },
            { input: "1 1\n0", output: "0" },
            { input: "3 3\n1 0 1\n0 1 0\n1 0 1", output: "5" },
            { input: "2 4\n1 0 1 1\n1 0 0 1", output: "2" },
            { input: "3 4\n1 1 0 1\n0 1 0 1\n1 0 1 1", output: "3" },
        ],
        fn: { name: "numIslands", params: [{ name: "grid", type: "int[][]" }], returns: "int" },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const m = grid.length;
                    const n = grid[0].length;
                    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                    let count = 0;
                    for (let i = 0; i < m; i++) {
                      for (let j = 0; j < n; j++) {
                        if (grid[i][j] !== 1) continue;
                        count++;
                        grid[i][j] = 0;
                        const stack = [[i, j]];
                        while (stack.length) {
                          const [r, c] = stack.pop();
                          for (const [dr, dc] of dirs) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 1) {
                              grid[nr][nc] = 0;
                              stack.push([nr, nc]);
                            }
                          }
                        }
                      }
                    }
                    return count;`,
            },
            PYTHON: {
                body: code`
                    m, n = len(grid), len(grid[0])
                    count = 0
                    for i in range(m):
                        for j in range(n):
                            if grid[i][j] != 1:
                                continue
                            count += 1
                            grid[i][j] = 0
                            stack = [(i, j)]
                            while stack:
                                r, c = stack.pop()
                                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                                    nr, nc = r + dr, c + dc
                                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                                        grid[nr][nc] = 0
                                        stack.append((nr, nc))
                    return count`,
            },
            JAVA: {
                body: code`
                    int m = grid.length;
                    int n = grid[0].length;
                    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
                    int count = 0;
                    for (int i = 0; i < m; i++) {
                        for (int j = 0; j < n; j++) {
                            if (grid[i][j] != 1) continue;
                            count++;
                            grid[i][j] = 0;
                            Deque<int[]> stack = new ArrayDeque<>();
                            stack.push(new int[] {i, j});
                            while (!stack.isEmpty()) {
                                int[] cell = stack.pop();
                                for (int[] d : dirs) {
                                    int nr = cell[0] + d[0];
                                    int nc = cell[1] + d[1];
                                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                                        grid[nr][nc] = 0;
                                        stack.push(new int[] {nr, nc});
                                    }
                                }
                            }
                        }
                    }
                    return count;`,
            },
        },
        wrong: {
            body: code`
                m, n = len(grid), len(grid[0])
                count = 0
                for i in range(m):
                    for j in range(n):
                        if grid[i][j] != 1:
                            continue
                        count += 1
                        grid[i][j] = 0
                        stack = [(i, j)]
                        while stack:
                            r, c = stack.pop()
                            for dr in (-1, 0, 1):
                                for dc in (-1, 0, 1):
                                    nr, nc = r + dr, c + dc
                                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                                        grid[nr][nc] = 0
                                        stack.append((nr, nc))
                return count`,
        },
    },
    {
        kind: "function",
        slug: "course-schedule",
        title: "Course Schedule",
        difficulty: "MEDIUM",
        tags: ["Graph", "Topological Sort", "BFS", "DFS"],
        statement:
            "There are numCourses courses labelled 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a, b] means you must take course b before course a.\n\nReturn true if you can finish all courses, otherwise return false.",
        constraints: "1 <= numCourses <= 2000\n0 <= prerequisites.length <= 5000\nprerequisites[i].length == 2\n0 <= a, b < numCourses",
        hints: "Model courses as a directed graph b -> a. You can finish all courses exactly when the graph has no cycle. Try repeatedly removing courses that have no unmet prerequisites (Kahn's algorithm).",
        editorial:
            "Compute the in-degree of every course and push all courses with in-degree 0 into a queue. Pop a course, count it as taken, and decrement the in-degree of its dependents, enqueueing those that reach 0. If all courses were taken the graph is acyclic (true); leftover courses mean a cycle (false). Time O(V + E).",
        examples: [
            { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "Take course 0 and then course 1." },
            { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", explanation: "Each course requires the other: a cycle." },
            { input: "numCourses = 3, prerequisites = [[0,1],[1,2],[2,0]]", output: "false", explanation: "A cycle of length 3 can never be satisfied." },
        ],
        testCases: [
            { input: "2\n1 2\n1 0", output: "true" },
            { input: "2\n2 2\n1 0\n0 1", output: "false" },
            { input: "4\n4 2\n1 0\n2 0\n3 1\n3 2", output: "true" },
            { input: "3\n3 2\n0 1\n1 2\n2 0", output: "false" },
            { input: "1\n0 2", output: "true" },
            { input: "5\n5 2\n1 0\n2 1\n3 2\n4 3\n2 4", output: "false" },
            { input: "3\n2 2\n1 0\n1 2", output: "true" },
            { input: "3\n1 2\n1 1", output: "false" },
        ],
        fn: {
            name: "canFinish",
            params: [
                { name: "numCourses", type: "int" },
                { name: "prerequisites", type: "int[][]" },
            ],
            returns: "bool",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const adj = Array.from({ length: numCourses }, () => []);
                    const indegree = new Array(numCourses).fill(0);
                    for (const [course, pre] of prerequisites) {
                      adj[pre].push(course);
                      indegree[course]++;
                    }
                    const queue = [];
                    for (let i = 0; i < numCourses; i++) {
                      if (indegree[i] === 0) queue.push(i);
                    }
                    let taken = 0;
                    for (let head = 0; head < queue.length; head++) {
                      const node = queue[head];
                      taken++;
                      for (const next of adj[node]) {
                        indegree[next]--;
                        if (indegree[next] === 0) queue.push(next);
                      }
                    }
                    return taken === numCourses;`,
            },
            PYTHON: {
                body: code`
                    from collections import deque

                    adj = [[] for _ in range(numCourses)]
                    indegree = [0] * numCourses
                    for course, pre in prerequisites:
                        adj[pre].append(course)
                        indegree[course] += 1
                    queue = deque(i for i in range(numCourses) if indegree[i] == 0)
                    taken = 0
                    while queue:
                        node = queue.popleft()
                        taken += 1
                        for nxt in adj[node]:
                            indegree[nxt] -= 1
                            if indegree[nxt] == 0:
                                queue.append(nxt)
                    return taken == numCourses`,
            },
            JAVA: {
                body: code`
                    List<List<Integer>> adj = new ArrayList<>();
                    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
                    int[] indegree = new int[numCourses];
                    for (int[] p : prerequisites) {
                        adj.get(p[1]).add(p[0]);
                        indegree[p[0]]++;
                    }
                    Deque<Integer> queue = new ArrayDeque<>();
                    for (int i = 0; i < numCourses; i++) {
                        if (indegree[i] == 0) queue.offer(i);
                    }
                    int taken = 0;
                    while (!queue.isEmpty()) {
                        int node = queue.poll();
                        taken++;
                        for (int next : adj.get(node)) {
                            indegree[next]--;
                            if (indegree[next] == 0) queue.offer(next);
                        }
                    }
                    return taken == numCourses;`,
            },
        },
        wrong: {
            body: code`
                pairs = {(a, b) for a, b in prerequisites}
                return not any((b, a) in pairs for a, b in prerequisites)`,
        },
    },
    {
        kind: "function",
        slug: "network-delay-time",
        title: "Network Delay Time",
        difficulty: "MEDIUM",
        tags: ["Graph", "Shortest Path", "Dijkstra"],
        statement:
            "You are given a network of n nodes labelled 1 to n and a list of directed, weighted edges times, where times[i] = [u, v, w] means a signal travels from u to v in w time units.\n\nA signal is sent from node k. Return the minimum time it takes for all n nodes to receive it. If it is impossible for every node to receive the signal, return -1.",
        constraints: "1 <= k <= n <= 100\n0 <= times.length <= 6000\ntimes[i].length == 3\n1 <= u, v <= n, u != v\n0 <= w <= 100\nAll (u, v) pairs are unique.",
        hints: "The signal reaches each node by its shortest path. The answer is the largest shortest-path distance, or -1 if some node is unreachable. Weights are non-negative.",
        editorial:
            "Run Dijkstra from k: repeatedly pick the unfinished node with the smallest tentative distance, mark it done and relax its outgoing edges. With n <= 100 an O(n^2 + n * E) scan is plenty fast. If any node keeps an infinite distance return -1, otherwise return the maximum distance.",
        examples: [
            { input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", output: "2", explanation: "Node 4 is reached last at time 2 (2 -> 3 -> 4)." },
            { input: "times = [[1,2,1]], n = 2, k = 2", output: "-1", explanation: "The edge only goes 1 -> 2, so node 1 never receives the signal." },
            { input: "times = [[1,2,1],[2,3,2],[1,3,4]], n = 3, k = 1", output: "3", explanation: "Node 3 is reached faster via 1 -> 2 -> 3 (cost 3) than directly (cost 4)." },
        ],
        testCases: [
            { input: "4\n3 3\n2 1 1\n2 3 1\n3 4 1\n2", output: "2" },
            { input: "2\n1 3\n1 2 1\n1", output: "1" },
            { input: "2\n1 3\n1 2 1\n2", output: "-1" },
            { input: "5\n9 3\n1 2 9\n1 4 2\n2 5 1\n4 2 4\n4 5 6\n3 2 3\n3 1 5\n5 3 7\n5 1 6\n1", output: "14" },
            { input: "3\n3 3\n1 2 1\n2 3 2\n1 3 4\n1", output: "3" },
            { input: "3\n1 3\n1 2 1\n1", output: "-1" },
            { input: "1\n0 3\n1", output: "0" },
        ],
        fn: {
            name: "networkDelayTime",
            params: [
                { name: "n", type: "int" },
                { name: "times", type: "int[][]" },
                { name: "k", type: "int" },
            ],
            returns: "int",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const INF = Number.MAX_SAFE_INTEGER;
                    const dist = new Array(n + 1).fill(INF);
                    const done = new Array(n + 1).fill(false);
                    dist[k] = 0;
                    for (let step = 0; step < n; step++) {
                      let u = -1;
                      for (let v = 1; v <= n; v++) {
                        if (!done[v] && (u === -1 || dist[v] < dist[u])) u = v;
                      }
                      if (u === -1 || dist[u] === INF) break;
                      done[u] = true;
                      for (const [a, b, w] of times) {
                        if (a === u && dist[u] + w < dist[b]) dist[b] = dist[u] + w;
                      }
                    }
                    let best = 0;
                    for (let v = 1; v <= n; v++) {
                      if (dist[v] === INF) return -1;
                      best = Math.max(best, dist[v]);
                    }
                    return best;`,
            },
            PYTHON: {
                body: code`
                    INF = float("inf")
                    dist = [INF] * (n + 1)
                    done = [False] * (n + 1)
                    dist[k] = 0
                    for _ in range(n):
                        u = -1
                        for v in range(1, n + 1):
                            if not done[v] and (u == -1 or dist[v] < dist[u]):
                                u = v
                        if u == -1 or dist[u] == INF:
                            break
                        done[u] = True
                        for a, b, w in times:
                            if a == u and dist[u] + w < dist[b]:
                                dist[b] = dist[u] + w
                    best = 0
                    for v in range(1, n + 1):
                        if dist[v] == INF:
                            return -1
                        best = max(best, dist[v])
                    return best`,
            },
            JAVA: {
                body: code`
                    final int INF = Integer.MAX_VALUE / 2;
                    int[] dist = new int[n + 1];
                    Arrays.fill(dist, INF);
                    boolean[] done = new boolean[n + 1];
                    dist[k] = 0;
                    for (int step = 0; step < n; step++) {
                        int u = -1;
                        for (int v = 1; v <= n; v++) {
                            if (!done[v] && (u == -1 || dist[v] < dist[u])) u = v;
                        }
                        if (u == -1 || dist[u] == INF) break;
                        done[u] = true;
                        for (int[] t : times) {
                            if (t[0] == u && dist[u] + t[2] < dist[t[1]]) dist[t[1]] = dist[u] + t[2];
                        }
                    }
                    int best = 0;
                    for (int v = 1; v <= n; v++) {
                        if (dist[v] == INF) return -1;
                        best = Math.max(best, dist[v]);
                    }
                    return best;`,
            },
        },
        wrong: {
            body: code`
                from collections import deque

                adj = {i: [] for i in range(1, n + 1)}
                for u, v, w in times:
                    adj[u].append(v)
                dist = {k: 0}
                queue = deque([k])
                while queue:
                    u = queue.popleft()
                    for v in adj[u]:
                        if v not in dist:
                            dist[v] = dist[u] + 1
                            queue.append(v)
                return max(dist.values()) if len(dist) == n else -1`,
        },
    },
    {
        kind: "function",
        slug: "word-ladder",
        title: "Word Ladder",
        difficulty: "HARD",
        tags: ["Graph", "BFS", "String", "Hash Table"],
        statement:
            "A transformation sequence from beginWord to endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:\n- every adjacent pair of words differs by exactly one letter,\n- every si (1 <= i <= k) is in wordList (beginWord does not need to be in it),\n- sk == endWord.\n\nReturn the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
        constraints: "1 <= beginWord.length <= 10\nendWord.length == beginWord.length\n1 <= wordList.length <= 500\nAll words have the same length and consist of lowercase English letters.\nbeginWord != endWord, and all words in wordList are unique.",
        hints: "Think of every word as a vertex and connect words that differ by one letter. The shortest sequence is then a shortest path in an unweighted graph - BFS. If endWord is not in the list the answer is 0.",
        editorial:
            "Put the dictionary in a set. BFS from beginWord level by level; to find a word's neighbours try replacing each position with each letter a-z and keep candidates that are in the dictionary and not yet visited. The level at which endWord is reached is the answer (counting words, so beginWord is level 1). Time O(N * L * 26) with N words of length L.",
        examples: [
            { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", explanation: '"hit" -> "hot" -> "dot" -> "dog" -> "cog" has 5 words.' },
            { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: "0", explanation: 'The end word "cog" is not in the dictionary.' },
            { input: 'beginWord = "red", endWord = "tax", wordList = ["ted","tex","red","tax","tad","den","rex","pee"]', output: "4", explanation: '"red" -> "ted" -> "tad" -> "tax".' },
        ],
        testCases: [
            { input: "hit\ncog\nhot dot dog lot log cog", output: "5" },
            { input: "hit\ncog\nhot dot dog lot log", output: "0" },
            { input: "a\nc\na b c", output: "2" },
            { input: "hot\ndog\nhot dog dot", output: "3" },
            { input: "lost\ncost\ncost", output: "2" },
            { input: "red\ntax\nted tex red tax tad den rex pee", output: "4" },
            { input: "cat\ndog\ncot cog dot", output: "0" },
        ],
        fn: {
            name: "ladderLength",
            params: [
                { name: "beginWord", type: "str" },
                { name: "endWord", type: "str" },
                { name: "wordList", type: "str[]" },
            ],
            returns: "int",
        },
        solutions: {
            JAVASCRIPT: {
                body: code`
                    const words = new Set(wordList);
                    if (!words.has(endWord)) return 0;
                    let queue = [beginWord];
                    const visited = new Set([beginWord]);
                    let steps = 1;
                    while (queue.length) {
                      const next = [];
                      for (const word of queue) {
                        if (word === endWord) return steps;
                        for (let i = 0; i < word.length; i++) {
                          for (let c = 97; c <= 122; c++) {
                            const candidate = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
                            if (words.has(candidate) && !visited.has(candidate)) {
                              visited.add(candidate);
                              next.push(candidate);
                            }
                          }
                        }
                      }
                      queue = next;
                      steps++;
                    }
                    return 0;`,
            },
            PYTHON: {
                body: code`
                    words = set(wordList)
                    if endWord not in words:
                        return 0
                    queue = [beginWord]
                    visited = {beginWord}
                    steps = 1
                    while queue:
                        nxt = []
                        for word in queue:
                            if word == endWord:
                                return steps
                            for i in range(len(word)):
                                for c in "abcdefghijklmnopqrstuvwxyz":
                                    candidate = word[:i] + c + word[i + 1:]
                                    if candidate in words and candidate not in visited:
                                        visited.add(candidate)
                                        nxt.append(candidate)
                        queue = nxt
                        steps += 1
                    return 0`,
            },
            JAVA: {
                body: code`
                    Set<String> words = new HashSet<>(Arrays.asList(wordList));
                    if (!words.contains(endWord)) return 0;
                    List<String> queue = new ArrayList<>();
                    queue.add(beginWord);
                    Set<String> visited = new HashSet<>();
                    visited.add(beginWord);
                    int steps = 1;
                    while (!queue.isEmpty()) {
                        List<String> next = new ArrayList<>();
                        for (String word : queue) {
                            if (word.equals(endWord)) return steps;
                            char[] chars = word.toCharArray();
                            for (int i = 0; i < chars.length; i++) {
                                char original = chars[i];
                                for (char c = 'a'; c <= 'z'; c++) {
                                    chars[i] = c;
                                    String candidate = new String(chars);
                                    if (words.contains(candidate) && visited.add(candidate)) next.add(candidate);
                                }
                                chars[i] = original;
                            }
                        }
                        queue = next;
                        steps++;
                    }
                    return 0;`,
            },
        },
        wrong: {
            body: code`
                from collections import deque

                queue = deque([(beginWord, 1)])
                seen = {beginWord}
                while queue:
                    word, steps = queue.popleft()
                    if word == endWord:
                        return steps
                    for i in range(len(word)):
                        for c in "abcdefghijklmnopqrstuvwxyz":
                            candidate = word[:i] + c + word[i + 1:]
                            if candidate not in seen:
                                seen.add(candidate)
                                queue.append((candidate, steps + 1))
                return 0`,
        },
    },
];
