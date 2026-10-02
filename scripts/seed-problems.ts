/**
 * Inserts the problem bank (modules/problems/problem-bank) directly into the database.
 *
 *   pnpm seed:problems                    # dry run: shows what would happen, writes nothing
 *   pnpm seed:problems -- --yes           # really write to the database in DATABASE_URL
 *   pnpm seed:problems -- --yes --update  # also overwrite problems that already exist (matched by title)
 *   pnpm seed:problems -- --yes --author=you@example.com
 *
 * Existing problems are skipped by default, so the script is safe to re-run. This bypasses the
 * Judge0 validation of /api/create-problem; run `pnpm verify:problems` first, it proves every
 * reference solution is accepted and every wrong/empty solution is rejected.
 */
import { prisma } from "../lib/db";
import { buildAllProblemRecords } from "../modules/problems/problem-bank";

const args = process.argv.slice(2);
const confirmed = args.includes("--yes");
const update = args.includes("--update");
const authorEmail = args.find((a) => a.startsWith("--author="))?.slice("--author=".length);

function describeTarget(): string {
    const url = process.env.DATABASE_URL;
    if (!url) return "(DATABASE_URL is not set)";
    try {
        const parsed = new URL(url);
        return `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}${parsed.pathname}`;
    } catch {
        return "(unparseable DATABASE_URL)";
    }
}

async function main() {
    const records = buildAllProblemRecords();
    const topics = new Map<string, number>();
    for (const r of records) topics.set(r.tags[0], (topics.get(r.tags[0]) ?? 0) + 1);

    console.log(`Problem bank: ${records.length} problems`);
    for (const [topic, count] of topics) console.log(`  ${topic.padEnd(20)} ${count}`);
    console.log(`Target database: ${describeTarget()}`);

    if (!confirmed) {
        console.log("\nDry run - nothing was written. Re-run with --yes to insert these problems.");
        return;
    }

    const author = authorEmail
        ? await prisma.user.findUnique({ where: { email: authorEmail } })
        : await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });

    if (!author) {
        throw new Error(
            authorEmail
                ? `No user with email ${authorEmail} exists.`
                : "No ADMIN user found. Sign in once, set that user's role to ADMIN, or pass --author=<email>.",
        );
    }
    console.log(`Author of the new problems: ${author.email}`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const record of records) {
        const existing = await prisma.problem.findFirst({ where: { title: record.title }, select: { id: true } });

        if (existing && !update) {
            skipped++;
            console.log(`  skip    ${record.title} (already exists)`);
            continue;
        }

        if (existing) {
            await prisma.problem.update({ where: { id: existing.id }, data: record });
            updated++;
            console.log(`  update  ${record.title}`);
        } else {
            await prisma.problem.create({ data: { ...record, userId: author.id } });
            created++;
            console.log(`  create  ${record.title}`);
        }
    }

    console.log(`\nDone: ${created} created, ${updated} updated, ${skipped} skipped.`);
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(process.exitCode ?? 0);
    });
