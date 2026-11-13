import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const databaseId = args.find((arg) => !arg.startsWith('--'))
if (
  !databaseId ||
  args.some((arg) => arg.startsWith('--') && arg !== '--local')
) {
  console.error('Usage: npm run db:migrate -- <D1_DATABASE_ID> [--local]')
  process.exit(1)
}
const migrations = fileURLToPath(new URL('../migrations', import.meta.url))
const cli = fileURLToPath(new URL('../node_modules/cf/bin/cf', import.meta.url))
const result = spawnSync(
  process.execPath,
  [
    cli,
    'd1',
    'migrations',
    'apply',
    databaseId,
    '--dir',
    migrations,
    ...(args.includes('--local') ? ['--local'] : []),
  ],
  { stdio: 'inherit' },
)
if (result.error) console.error(result.error.message)
process.exit(result.status ?? 1)
