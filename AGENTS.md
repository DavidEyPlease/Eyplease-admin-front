# AGENTS.md

Guidelines for AI agents and contributors working in this repository.

## Package manager: pnpm only

This project uses **pnpm**. Never use `npm` or `yarn` — they create a conflicting
`package-lock.json` / `yarn.lock` and desync `pnpm-lock.yaml`.

Always use the pnpm equivalents:

| Task                | Use                          | Do NOT use                |
| ------------------- | ---------------------------- | ------------------------- |
| Install all deps    | `pnpm install`               | `npm install`             |
| Add a dependency    | `pnpm add <pkg>`             | `npm install <pkg>`       |
| Add a dev dependency| `pnpm add -D <pkg>`          | `npm install -D <pkg>`    |
| Remove a dependency | `pnpm remove <pkg>`          | `npm uninstall <pkg>`     |
| Run a script        | `pnpm <script>` / `pnpm run` | `npm run <script>`        |
| Run a binary        | `pnpm exec <bin>` / `pnpm dlx`| `npx <bin>`              |

The only committed lockfile is `pnpm-lock.yaml`. If a `package-lock.json` ever
appears, delete it and re-run `pnpm install`.
