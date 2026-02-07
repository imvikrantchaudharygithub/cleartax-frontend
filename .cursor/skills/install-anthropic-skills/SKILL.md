---
name: install-anthropic-skills
description: Installs or reinstalls skills from Anthropic's public skills repository (https://github.com/anthropics/skills) via the npx skills CLI. Use when the user asks to install a skill from Anthropic's repo, add the frontend-design skill, or run "npx skills add" for this project.
---

# Install Anthropic Skills for This Project

This skill documents how to install skills from [Anthropic's skills repository](https://github.com/anthropics/skills) so they are available in Cursor for this project.

## Quick install

From the project root, run:

```bash
npx skills add https://github.com/anthropics/skills --skill <skill-name> --yes
```

Use `--yes` (or `-y`) to skip interactive prompts and install to all supported agents (including Cursor).

## Install frontend-design

To install the **frontend-design** skill (distinctive, production-grade frontend UI guidance):

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design --yes
```

The CLI installs to `.agents/skills/` and symlinks for Cursor and other agents. For Cursor to load the skill in this project, ensure the skill also exists under `.cursor/skills/<skill-name>/` (copy or symlink from `.agents/skills/<skill-name>/` if needed).

## Other skills from the repo

List of skills available from Anthropic's repo (run the CLI without `--skill` to see the current list):

- `frontend-design` – Frontend UI design and aesthetics
- Plus others (browse https://github.com/anthropics/skills/tree/main/skills)

To install a different skill, replace `<skill-name>` in the command above.

## Optional flags

- `--yes` / `-y` – Non-interactive; install without prompts
- `--global` / `-g` – Install globally (user-wide) instead of project-only

## Verification

After installing, confirm the skill is present:

- **Agent Skills (multi-agent)**: `.agents/skills/<skill-name>/`
- **Cursor (this project)**: `.cursor/skills/<skill-name>/SKILL.md`

If the skill was installed only to `.agents/skills/`, copy the skill folder into `.cursor/skills/` so Cursor picks it up.
