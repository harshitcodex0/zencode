/** Strips the common leading indentation and surrounding blank lines of a multi-line string. */
export function dedent(text: string): string {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    while (lines.length && lines[0].trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

    const indents = lines
        .filter((line) => line.trim() !== "")
        .map((line) => (line.match(/^ */) as RegExpMatchArray)[0].length);
    const min = indents.length ? Math.min(...indents) : 0;

    return lines.map((line) => line.slice(min)).join("\n");
}

/**
 * Template tag for embedding source code in the problem bank. Backslashes are
 * kept verbatim (so `\n` or `\\s+` can be written exactly as in the target
 * language) and the result is dedented.
 */
export function code(strings: TemplateStringsArray, ...values: unknown[]): string {
    return dedent(String.raw(strings, ...values));
}
