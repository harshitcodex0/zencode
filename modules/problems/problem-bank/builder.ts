import { code } from "./dedent";
import type {
    DesignMethod,
    DesignSpec,
    FunctionSpec,
    Lang,
    ParamType,
    ProblemRecord,
    ProblemSpec,
    ReturnType,
    Solution,
} from "./types";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const indent = (text: string, spaces: number) =>
    text
        .split("\n")
        .map((line) => (line.trim() === "" ? "" : " ".repeat(spaces) + line))
        .join("\n");

const usedTypes = (spec: FunctionSpec): Set<ReturnType> =>
    new Set<ReturnType>([...spec.fn.params.map((p) => p.type), spec.fn.returns]);

const needsInts = (types: Set<ReturnType>) =>
    ["int[]", "int[][]", "list", "dlist"].some((t) => types.has(t as ReturnType));

// ---------------------------------------------------------------------------
// Type tables
// ---------------------------------------------------------------------------

const JS_DOC: Record<ReturnType, string> = {
    int: "number",
    str: "string",
    qstr: "string",
    bool: "boolean",
    "int[]": "number[]",
    "str[]": "string[]",
    "int[][]": "number[][]",
    list: "ListNode|null",
    dlist: "DListNode|null",
};

const PY_TYPE: Record<ReturnType, string> = {
    int: "int",
    str: "str",
    qstr: "str",
    bool: "bool",
    "int[]": "List[int]",
    "str[]": "List[str]",
    "int[][]": "List[List[int]]",
    list: "Optional[ListNode]",
    dlist: "Optional[DListNode]",
};

const JAVA_TYPE: Record<ReturnType, string> = {
    int: "int",
    str: "String",
    qstr: "String",
    bool: "boolean",
    "int[]": "int[]",
    "str[]": "String[]",
    "int[][]": "int[][]",
    list: "ListNode",
    dlist: "DListNode",
};

const JAVA_DEFAULT: Record<ReturnType, string> = {
    int: "0",
    str: '""',
    qstr: '""',
    bool: "false",
    "int[]": "new int[0]",
    "str[]": "new String[0]",
    "int[][]": "new int[0][]",
    list: "null",
    dlist: "null",
};

// ---------------------------------------------------------------------------
// JavaScript
// ---------------------------------------------------------------------------

const JS_NODES = {
    list: code`
        class ListNode {
          constructor(val, next = null) {
            this.val = val;
            this.next = next;
          }
        }`,
    dlist: code`
        class DListNode {
          constructor(val, prev = null, next = null) {
            this.val = val;
            this.prev = prev;
            this.next = next;
          }
        }`,
};

const JS_PRELUDE = code`
    const __lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.replace(/\r$/, ""));
    let __pos = 0;
    const __nextLine = () => (__pos < __lines.length ? __lines[__pos++] : "");`;

const JS_TO_INTS = `const __toInts = (s) => (s.trim() === "" ? [] : s.trim().split(/\\s+/).map(Number));`;

const JS_READERS: Record<ParamType, string> = {
    int: `const __readInt = () => parseInt(__nextLine().trim(), 10);`,
    str: `const __readStr = () => __nextLine();`,
    "int[]": `const __readInts = () => __toInts(__nextLine());`,
    "str[]": `const __readStrs = () => {\n  const s = __nextLine().trim();\n  return s === "" ? [] : s.split(/\\s+/);\n};`,
    "int[][]": code`
        const __readMatrix = () => {
          const rows = __toInts(__nextLine())[0] || 0;
          const matrix = [];
          for (let i = 0; i < rows; i++) matrix.push(__toInts(__nextLine()));
          return matrix;
        };`,
    list: code`
        const __readList = () => {
          const dummy = new ListNode(0);
          let tail = dummy;
          for (const v of __toInts(__nextLine())) {
            tail.next = new ListNode(v);
            tail = tail.next;
          }
          return dummy.next;
        };`,
    dlist: code`
        const __readDList = () => {
          let head = null;
          let tail = null;
          for (const v of __toInts(__nextLine())) {
            const node = new DListNode(v);
            if (tail) {
              tail.next = node;
              node.prev = tail;
            } else {
              head = node;
            }
            tail = node;
          }
          return head;
        };`,
};

const JS_READ_CALL: Record<ParamType, string> = {
    int: "__readInt()",
    str: "__readStr()",
    "int[]": "__readInts()",
    "str[]": "__readStrs()",
    "int[][]": "__readMatrix()",
    list: "__readList()",
    dlist: "__readDList()",
};

const JS_FORMATTERS: Record<ReturnType, string> = {
    int: `const __format = (r) => String(r);`,
    str: `const __format = (r) => String(r);`,
    bool: `const __format = (r) => String(r);`,
    qstr: `const __format = (r) => '"' + r + '"';`,
    "int[]": `const __format = (r) => "[" + r.join(",") + "]";`,
    "str[]": `const __format = (r) => "[" + r.map((x) => '"' + x + '"').join(",") + "]";`,
    "int[][]": `const __format = (r) => "[" + r.map((row) => "[" + row.join(",") + "]").join(",") + "]";`,
    list: code`
        const __format = (head) => {
          const out = [];
          for (let n = head, guard = 0; n && guard < 100000; n = n.next, guard++) out.push(n.val);
          return "[" + out.join(",") + "]";
        };`,
    dlist: code`
        const __format = (head) => {
          const forward = [];
          let tail = null;
          for (let n = head, guard = 0; n && guard < 100000; n = n.next, guard++) {
            forward.push(n.val);
            tail = n;
          }
          const backward = [];
          for (let n = tail, guard = 0; n && guard < 100000; n = n.prev, guard++) backward.push(n.val);
          return "[" + forward.join(",") + "]\n[" + backward.join(",") + "]";
        };`,
};

function jsFunctionSource(spec: FunctionSpec, solution: Solution | null): string {
    const { fn } = spec;
    const types = usedTypes(spec);
    const parts: string[] = [];

    if (types.has("list")) parts.push(JS_NODES.list);
    if (types.has("dlist")) parts.push(JS_NODES.dlist);

    const doc = [
        "/**",
        ...fn.params.map((p) => ` * @param {${JS_DOC[p.type]}} ${p.name}`),
        ` * @return {${JS_DOC[fn.returns]}}`,
        " */",
    ].join("\n");
    const body = solution ? solution.body : "// Write your code here";
    let main = `${doc}\nfunction ${fn.name}(${fn.params.map((p) => p.name).join(", ")}) {\n${indent(body, 2)}\n}`;
    if (solution?.helpers) main += `\n\n${solution.helpers}`;
    parts.push(main);

    const harness: string[] = [JS_PRELUDE];
    if (needsInts(types)) harness.push(JS_TO_INTS);
    for (const type of new Set(fn.params.map((p) => p.type))) harness.push(JS_READERS[type]);
    harness.push(JS_FORMATTERS[fn.returns]);
    harness.push(
        [
            "{",
            ...fn.params.map((p) => `  const ${p.name} = ${JS_READ_CALL[p.type]};`),
            `  console.log(__format(${fn.name}(${fn.params.map((p) => p.name).join(", ")})));`,
            "}",
        ].join("\n"),
    );
    parts.push(`// ---- Input / output handling (do not modify) ----\n${harness.join("\n")}`);

    return parts.join("\n\n") + "\n";
}

function jsDesignSource(spec: DesignSpec, solution: string | null): string {
    const { design } = spec;
    const returns = design.methods.map((m) => `${JSON.stringify(m.name)}: ${JSON.stringify(m.returns)}`).join(", ");
    const classSource = solution ?? jsDesignStub(spec);

    const harness = code`
        const __lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.replace(/\r$/, ""));
        const __toInts = (s) => (s.trim() === "" ? [] : s.trim().split(/\s+/).map(Number));
        {
          const ctorArgs = __toInts(__lines[0] || "");
          const count = parseInt((__lines[1] || "0").trim(), 10);
          const obj = new ${design.className}(...ctorArgs);
          const returns = { ${returns} };
          const out = [];
          for (let i = 0; i < count; i++) {
            const parts = (__lines[2 + i] || "").trim().split(/\s+/);
            const result = obj[parts[0]](...parts.slice(1).map(Number));
            if (returns[parts[0]] !== "void") out.push(String(result));
          }
          console.log(out.join(" "));
        }`;

    return `${classSource}\n\n// ---- Input / output handling (do not modify) ----\n${harness}\n`;
}

function jsDesignStub(spec: DesignSpec): string {
    const { design } = spec;
    const lines: string[] = [`class ${design.className} {`];
    const method = (name: string, params: string[], ret: string | null) => {
        lines.push("  /**");
        for (const p of params) lines.push(`   * @param {number} ${p}`);
        if (ret) lines.push(`   * @return {${ret}}`);
        lines.push("   */");
        lines.push(`  ${name}(${params.join(", ")}) {`);
        lines.push("    // Write your code here");
        lines.push("  }");
    };
    method("constructor", design.ctorParams, null);
    for (const m of design.methods) {
        lines.push("");
        method(m.name, m.params, m.returns === "void" ? null : m.returns === "int" ? "number" : "boolean");
    }
    lines.push("}");
    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Python
// ---------------------------------------------------------------------------

const PY_NODES = {
    list: code`
        class ListNode:
            def __init__(self, val=0, next=None):
                self.val = val
                self.next = next`,
    dlist: code`
        class DListNode:
            def __init__(self, val=0, prev=None, next=None):
                self.val = val
                self.prev = prev
                self.next = next`,
};

const PY_PRELUDE = code`
    _lines = []
    _pos = 0


    def _next_line():
        global _pos
        line = _lines[_pos] if _pos < len(_lines) else ""
        _pos += 1
        return line.rstrip("\r")`;

const PY_READERS: Record<ParamType, string> = {
    int: code`
        def _read_int():
            return int(_next_line().strip())`,
    str: code`
        def _read_str():
            return _next_line()`,
    "int[]": code`
        def _read_ints():
            return [int(x) for x in _next_line().split()]`,
    "str[]": code`
        def _read_strs():
            return _next_line().split()`,
    "int[][]": code`
        def _read_matrix():
            rows = int(_next_line().split()[0])
            return [[int(x) for x in _next_line().split()] for _ in range(rows)]`,
    list: code`
        def _read_list():
            dummy = ListNode(0)
            tail = dummy
            for x in _next_line().split():
                tail.next = ListNode(int(x))
                tail = tail.next
            return dummy.next`,
    dlist: code`
        def _read_dlist():
            head = None
            tail = None
            for x in _next_line().split():
                node = DListNode(int(x))
                if tail is None:
                    head = node
                else:
                    tail.next = node
                    node.prev = tail
                tail = node
            return head`,
};

const PY_READ_CALL: Record<ParamType, string> = {
    int: "_read_int()",
    str: "_read_str()",
    "int[]": "_read_ints()",
    "str[]": "_read_strs()",
    "int[][]": "_read_matrix()",
    list: "_read_list()",
    dlist: "_read_dlist()",
};

const PY_FORMATTERS: Record<ReturnType, string> = {
    int: code`
        def _format(r):
            return str(r)`,
    str: code`
        def _format(r):
            return str(r)`,
    bool: code`
        def _format(r):
            return str(r).lower()`,
    qstr: code`
        def _format(r):
            return '"' + r + '"'`,
    "int[]": code`
        def _format(r):
            return "[" + ",".join(str(x) for x in r) + "]"`,
    "str[]": code`
        def _format(r):
            return "[" + ",".join('"' + x + '"' for x in r) + "]"`,
    "int[][]": code`
        def _format(r):
            return "[" + ",".join("[" + ",".join(str(x) for x in row) + "]" for row in r) + "]"`,
    list: code`
        def _format(head):
            out = []
            guard = 0
            while head is not None and guard < 100000:
                out.append(str(head.val))
                head = head.next
                guard += 1
            return "[" + ",".join(out) + "]"`,
    dlist: code`
        def _format(head):
            forward = []
            tail = None
            guard = 0
            node = head
            while node is not None and guard < 100000:
                forward.append(str(node.val))
                tail = node
                node = node.next
                guard += 1
            backward = []
            guard = 0
            node = tail
            while node is not None and guard < 100000:
                backward.append(str(node.val))
                node = node.prev
                guard += 1
            return "[" + ",".join(forward) + "]\n[" + ",".join(backward) + "]"`,
};

function pyFunctionSource(spec: FunctionSpec, solution: Solution | null): string {
    const { fn } = spec;
    const types = usedTypes(spec);
    const parts: string[] = ["from typing import List, Optional"];

    if (types.has("list")) parts.push(PY_NODES.list);
    if (types.has("dlist")) parts.push(PY_NODES.dlist);

    const params = ["self", ...fn.params.map((p) => `${p.name}: ${PY_TYPE[p.type]}`)].join(", ");
    const body = solution ? solution.body : "# Write your code here\npass";
    let cls = `class Solution:\n    def ${fn.name}(${params}) -> ${PY_TYPE[fn.returns]}:\n${indent(body, 8)}`;
    if (solution?.helpers) cls += `\n\n${indent(solution.helpers, 4)}`;
    parts.push(cls);

    const harness: string[] = [PY_PRELUDE];
    for (const type of new Set(fn.params.map((p) => p.type))) harness.push(PY_READERS[type]);
    harness.push(PY_FORMATTERS[fn.returns]);
    const main = [
        'if __name__ == "__main__":',
        "    import sys",
        "",
        '    _lines = sys.stdin.read().split("\\n")',
        ...fn.params.map((p) => `    ${p.name} = ${PY_READ_CALL[p.type]}`),
        `    print(_format(Solution().${fn.name}(${fn.params.map((p) => p.name).join(", ")})))`,
    ].join("\n");
    parts.push(`# ---- Input / output handling (do not modify) ----\n${harness.join("\n\n\n")}\n\n\n${main}`);

    return parts.join("\n\n\n") + "\n";
}

function pyDesignSource(spec: DesignSpec, solution: string | null): string {
    const { design } = spec;
    const returns = design.methods.map((m) => `${JSON.stringify(m.name)}: ${JSON.stringify(m.returns)}`).join(", ");
    const classSource = solution ?? pyDesignStub(spec);

    const harness = code`
        if __name__ == "__main__":
            import sys

            lines = sys.stdin.read().split("\n")
            ctor_args = [int(x) for x in lines[0].split()]
            count = int(lines[1].strip())
            obj = ${design.className}(*ctor_args)
            returns = { ${returns} }
            out = []
            for i in range(count):
                parts = lines[2 + i].split()
                result = getattr(obj, parts[0])(*[int(x) for x in parts[1:]])
                kind = returns[parts[0]]
                if kind == "int":
                    out.append(str(result))
                elif kind == "bool":
                    out.append(str(result).lower())
            print(" ".join(out))`;

    return `${classSource}\n\n\n# ---- Input / output handling (do not modify) ----\n${harness}\n`;
}

function pyDesignStub(spec: DesignSpec): string {
    const { design } = spec;
    const lines: string[] = [`class ${design.className}:`];
    lines.push(`    def __init__(${["self", ...design.ctorParams.map((p) => `${p}: int`)].join(", ")}):`);
    lines.push("        # Write your code here");
    lines.push("        pass");
    for (const m of design.methods) {
        const ret = m.returns === "void" ? "None" : m.returns === "int" ? "int" : "bool";
        lines.push("");
        lines.push(`    def ${m.name}(${["self", ...m.params.map((p) => `${p}: int`)].join(", ")}) -> ${ret}:`);
        lines.push("        # Write your code here");
        lines.push("        pass");
    }
    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Java
// ---------------------------------------------------------------------------

const JAVA_NODES = {
    list: code`
        static class ListNode {
            int val;
            ListNode next;

            ListNode(int val) {
                this.val = val;
            }

            ListNode(int val, ListNode next) {
                this.val = val;
                this.next = next;
            }
        }`,
    dlist: code`
        static class DListNode {
            int val;
            DListNode prev;
            DListNode next;

            DListNode(int val) {
                this.val = val;
            }
        }`,
};

const JAVA_PRELUDE = code`
    static final List<String> __lines = new ArrayList<>();
    static int __pos = 0;

    static String __nextLine() {
        return __pos < __lines.size() ? __lines.get(__pos++) : "";
    }`;

const JAVA_TO_INTS = code`
    static int[] __toInts(String s) {
        s = s.trim();
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split("\\s+");
        int[] result = new int[parts.length];
        for (int i = 0; i < parts.length; i++) result[i] = Integer.parseInt(parts[i]);
        return result;
    }`;

const JAVA_READERS: Record<ParamType, string> = {
    int: code`
        static int __readInt() {
            return Integer.parseInt(__nextLine().trim());
        }`,
    str: code`
        static String __readStr() {
            return __nextLine();
        }`,
    "int[]": code`
        static int[] __readInts() {
            return __toInts(__nextLine());
        }`,
    "str[]": code`
        static String[] __readStrs() {
            String s = __nextLine().trim();
            return s.isEmpty() ? new String[0] : s.split("\\s+");
        }`,
    "int[][]": code`
        static int[][] __readMatrix() {
            int rows = __toInts(__nextLine())[0];
            int[][] matrix = new int[rows][];
            for (int i = 0; i < rows; i++) matrix[i] = __toInts(__nextLine());
            return matrix;
        }`,
    list: code`
        static ListNode __readList() {
            ListNode dummy = new ListNode(0);
            ListNode tail = dummy;
            for (int v : __toInts(__nextLine())) {
                tail.next = new ListNode(v);
                tail = tail.next;
            }
            return dummy.next;
        }`,
    dlist: code`
        static DListNode __readDList() {
            DListNode head = null;
            DListNode tail = null;
            for (int v : __toInts(__nextLine())) {
                DListNode node = new DListNode(v);
                if (tail == null) {
                    head = node;
                } else {
                    tail.next = node;
                    node.prev = tail;
                }
                tail = node;
            }
            return head;
        }`,
};

const JAVA_READ_CALL: Record<ParamType, string> = {
    int: "__readInt()",
    str: "__readStr()",
    "int[]": "__readInts()",
    "str[]": "__readStrs()",
    "int[][]": "__readMatrix()",
    list: "__readList()",
    dlist: "__readDList()",
};

const JAVA_FORMATTERS: Partial<Record<ReturnType, string>> = {
    "int[]": code`
        static String __format(int[] r) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < r.length; i++) {
                if (i > 0) sb.append(',');
                sb.append(r[i]);
            }
            return sb.append(']').toString();
        }`,
    "str[]": code`
        static String __format(String[] r) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < r.length; i++) {
                if (i > 0) sb.append(',');
                sb.append('"').append(r[i]).append('"');
            }
            return sb.append(']').toString();
        }`,
    "int[][]": code`
        static String __format(int[][] r) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < r.length; i++) {
                if (i > 0) sb.append(',');
                sb.append('[');
                for (int j = 0; j < r[i].length; j++) {
                    if (j > 0) sb.append(',');
                    sb.append(r[i][j]);
                }
                sb.append(']');
            }
            return sb.append(']').toString();
        }`,
    list: code`
        static String __format(ListNode head) {
            StringBuilder sb = new StringBuilder("[");
            int guard = 0;
            for (ListNode n = head; n != null && guard < 100000; n = n.next, guard++) {
                if (n != head) sb.append(',');
                sb.append(n.val);
            }
            return sb.append(']').toString();
        }`,
    dlist: code`
        static String __format(DListNode head) {
            StringBuilder forward = new StringBuilder("[");
            DListNode tail = null;
            int guard = 0;
            for (DListNode n = head; n != null && guard < 100000; n = n.next, guard++) {
                if (n != head) forward.append(',');
                forward.append(n.val);
                tail = n;
            }
            forward.append(']');
            StringBuilder backward = new StringBuilder("[");
            guard = 0;
            for (DListNode n = tail; n != null && guard < 100000; n = n.prev, guard++) {
                if (n != tail) backward.append(',');
                backward.append(n.val);
            }
            backward.append(']');
            return forward + "\n" + backward;
        }`,
};

function javaFunctionSource(spec: FunctionSpec, solution: Solution | null): string {
    const { fn } = spec;
    const types = usedTypes(spec);
    const members: string[] = [];

    if (types.has("list")) members.push(JAVA_NODES.list);
    if (types.has("dlist")) members.push(JAVA_NODES.dlist);

    const params = fn.params.map((p) => `${JAVA_TYPE[p.type]} ${p.name}`).join(", ");
    const body = solution ? solution.body : `// Write your code here\nreturn ${JAVA_DEFAULT[fn.returns]};`;
    members.push(`public static ${JAVA_TYPE[fn.returns]} ${fn.name}(${params}) {\n${indent(body, 4)}\n}`);
    if (solution?.helpers) members.push(solution.helpers);

    const io: string[] = [JAVA_PRELUDE];
    if (needsInts(types)) io.push(JAVA_TO_INTS);
    for (const type of new Set(fn.params.map((p) => p.type))) io.push(JAVA_READERS[type]);
    const formatter = JAVA_FORMATTERS[fn.returns];
    if (formatter) io.push(formatter);

    let print: string;
    if (fn.returns === "qstr") print = `System.out.println("\\"" + result + "\\"");`;
    else if (formatter) print = "System.out.println(__format(result));";
    else print = "System.out.println(result);";

    const main = [
        "public static void main(String[] args) throws IOException {",
        "    BufferedReader __br = new BufferedReader(new InputStreamReader(System.in));",
        "    String __line;",
        "    while ((__line = __br.readLine()) != null) __lines.add(__line);",
        ...fn.params.map((p) => `    ${JAVA_TYPE[p.type]} ${p.name} = ${JAVA_READ_CALL[p.type]};`),
        `    ${JAVA_TYPE[fn.returns]} result = ${fn.name}(${fn.params.map((p) => p.name).join(", ")});`,
        `    ${print}`,
        "}",
    ].join("\n");
    io.push(main);

    return (
        "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n" +
        indent(members.join("\n\n"), 4) +
        "\n\n    // ---- Input / output handling (do not modify) ----\n" +
        indent(io.join("\n\n"), 4) +
        "\n}\n"
    );
}

function javaDesignStub(spec: DesignSpec): string {
    const { design } = spec;
    const lines: string[] = [`class ${design.className} {`];
    lines.push(`    public ${design.className}(${design.ctorParams.map((p) => `int ${p}`).join(", ")}) {`);
    lines.push("        // Write your code here");
    lines.push("    }");
    for (const m of design.methods) {
        const ret = m.returns === "void" ? "void" : m.returns === "int" ? "int" : "boolean";
        lines.push("");
        lines.push(`    public ${ret} ${m.name}(${m.params.map((p) => `int ${p}`).join(", ")}) {`);
        lines.push("        // Write your code here");
        if (m.returns === "int") lines.push("        return 0;");
        if (m.returns === "bool") lines.push("        return false;");
        lines.push("    }");
    }
    lines.push("}");
    return lines.join("\n");
}

function javaDesignCase(m: DesignMethod): string {
    const args = m.params.map((_, i) => `Integer.parseInt(t[${i + 1}])`).join(", ");
    const call = `obj.${m.name}(${args})`;
    if (m.returns === "void") return `                case "${m.name}": ${call}; break;`;
    return `                case "${m.name}": out.add(String.valueOf(${call})); break;`;
}

function javaDesignSource(spec: DesignSpec, solution: string | null): string {
    const { design } = spec;
    const classSource = solution ?? javaDesignStub(spec);
    const ctorArgs = design.ctorParams.map((_, i) => `Integer.parseInt(c[${i}])`).join(", ");

    const harness = [
        "public class Main {",
        "    public static void main(String[] args) throws IOException {",
        "        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));",
        "        List<String> lines = new ArrayList<>();",
        "        String line;",
        "        while ((line = br.readLine()) != null) lines.add(line);",
        '        String first = lines.size() > 0 ? lines.get(0).trim() : "";',
        '        String[] c = first.isEmpty() ? new String[0] : first.split("\\\\s+");',
        "        int count = Integer.parseInt(lines.get(1).trim());",
        `        ${design.className} obj = new ${design.className}(${ctorArgs});`,
        "        List<String> out = new ArrayList<>();",
        "        for (int i = 0; i < count; i++) {",
        '            String[] t = lines.get(2 + i).trim().split("\\\\s+");',
        "            switch (t[0]) {",
        ...design.methods.map(javaDesignCase),
        "                default: throw new IllegalStateException(\"Unknown operation \" + t[0]);",
        "            }",
        "        }",
        '        System.out.println(String.join(" ", out));',
        "    }",
        "}",
    ].join("\n");

    return `import java.io.*;\nimport java.util.*;\n\n${classSource}\n\n// ---- Input / output handling (do not modify) ----\n${harness}\n`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Source for `lang`. With `solution` null the starter template (stub) is produced. */
export function buildSource(spec: ProblemSpec, lang: Lang, useSolution: boolean): string {
    if (spec.kind === "design") {
        const solution = useSolution ? spec.solutions[lang] : null;
        if (lang === "JAVASCRIPT") return jsDesignSource(spec, solution);
        if (lang === "PYTHON") return pyDesignSource(spec, solution);
        return javaDesignSource(spec, solution);
    }

    const solution = useSolution ? spec.solutions[lang] : null;
    if (lang === "JAVASCRIPT") return jsFunctionSource(spec, solution);
    if (lang === "PYTHON") return pyFunctionSource(spec, solution);
    return javaFunctionSource(spec, solution);
}

/** The deliberately wrong Python submission used to prove the tests reject bad code. */
export function buildWrongPython(spec: ProblemSpec): string {
    return spec.kind === "design" ? pyDesignSource(spec, spec.wrong) : pyFunctionSource(spec, spec.wrong);
}

function describeParam(name: string, type: ParamType): string {
    switch (type) {
        case "int":
            return `- \`${name}\`: one line containing an integer.`;
        case "str":
            return `- \`${name}\`: one line containing the string (it may contain spaces).`;
        case "int[]":
            return `- \`${name}\`: one line of space-separated integers (an empty line means an empty array).`;
        case "str[]":
            return `- \`${name}\`: one line of space-separated words.`;
        case "int[][]":
            return `- \`${name}\`: a line "R C" (number of rows and columns) followed by R lines of C space-separated integers.`;
        case "list":
            return `- \`${name}\`: one line with the node values of the linked list, space-separated (an empty line means an empty list).`;
        case "dlist":
            return `- \`${name}\`: one line with the node values of the doubly linked list from head to tail, space-separated (an empty line means an empty list).`;
    }
}

function describeReturn(type: ReturnType): string {
    switch (type) {
        case "int":
            return "Print the returned integer.";
        case "str":
            return "Print the returned string.";
        case "qstr":
            return 'Print the returned string wrapped in double quotes (an empty string is printed as "").';
        case "bool":
            return "Print true or false.";
        case "int[]":
            return "Print the returned array as [a,b,c] with no spaces ([] for an empty array).";
        case "str[]":
            return 'Print the returned words as ["a","b"] with no spaces.';
        case "int[][]":
            return "Print the returned matrix as [[a,b],[c,d]] with no spaces.";
        case "list":
            return "Print the node values of the returned list as [a,b,c] ([] for an empty list).";
        case "dlist":
            return "Print two lines: the values from head to tail following next pointers, then the values from tail to head following prev pointers, e.g.\n[1,2,3]\n[3,2,1]";
    }
}

function describeDesign(spec: DesignSpec): { input: string; output: string } {
    const { design } = spec;
    const methods = design.methods.map((m) => `${m.name}(${m.params.join(", ")})`).join(", ");
    return {
        input: [
            `- Line 1: the arguments of the ${design.className} constructor${
                design.ctorParams.length ? ` (${design.ctorParams.join(", ")})` : " (empty, it takes none)"
            }.`,
            "- Line 2: q, the number of operations.",
            `- Next q lines: an operation written as \`methodName arg1 arg2 ...\`. Available methods: ${methods}.`,
        ].join("\n"),
        output: "For every operation that returns a value, print the value (true/false for booleans) in order, separated by single spaces on one line. Operations that return nothing print nothing.",
    };
}

export function buildDescription(spec: ProblemSpec): string {
    const io =
        spec.kind === "design"
            ? describeDesign(spec)
            : {
                  input: spec.fn.params.map((p) => describeParam(p.name, p.type)).join("\n"),
                  output: describeReturn(spec.fn.returns),
              };
    return `${spec.statement}\n\nInput Format\n${io.input}\n\nOutput Format\n${io.output}`;
}

export function buildProblemRecord(spec: ProblemSpec): ProblemRecord {
    const sources = (useSolution: boolean) => ({
        JAVASCRIPT: buildSource(spec, "JAVASCRIPT", useSolution),
        PYTHON: buildSource(spec, "PYTHON", useSolution),
        JAVA: buildSource(spec, "JAVA", useSolution),
    });

    return {
        title: spec.title,
        description: buildDescription(spec),
        difficulty: spec.difficulty,
        tags: spec.tags,
        examples: {
            JAVASCRIPT: spec.examples[0],
            PYTHON: spec.examples[1],
            JAVA: spec.examples[2],
        },
        constraints: spec.constraints,
        hints: spec.hints,
        editorial: spec.editorial,
        testCases: spec.testCases,
        codeSnippets: sources(false),
        referenceSolutions: sources(true),
    };
}
