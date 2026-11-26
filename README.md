# RHIA design system

## Open Storybook

**Easiest:** double-click **Open Storybook.command** in this folder. A Terminal window opens and Storybook appears in your browser at http://localhost:6006. Close the Terminal window to stop it.

**From Terminal:**

```bash
cd ~/Documents/RHIA/rhia-design-system
npm run storybook
```

Other commands:

| Command | What it does |
|---|---|
| `npm run tokens` | Rebuild the token CSS/TS from `src/tokens/*.tokens.json` |
| `npm run build` | Type-check everything |
| `npm run build-storybook` | Build a static Storybook into `storybook-static/` |
| `npm install` | Only needed the first time, or after dependencies change |
