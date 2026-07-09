# Working on this repo

## Active plan

Plans live in `.claude/plans/*.md`. At the start of any session:

1. Scan `.claude/plans/` for a plan file that has at least one unchecked
   `- [ ]` task. If more than one qualifies, prefer the one matching the
   current git branch name, otherwise ask the user which to continue.
2. Read that file to find the first unchecked `- [ ]` task.
3. Keep working through tasks in order — don't skip ahead or batch multiple
   tasks together.
4. Before starting a task, restate its required work as a short checklist
   (what file(s) to touch, what the task needs to do) so it's clear and easy
   to follow.
5. Once a task's commit lands, edit that plan file: change its `- [ ]` to
   `- [x]` and append the commit hash in backticks, e.g.:
   `- [x] Task 9 — Blog listing page (\`a1b2c3d\`)`
6. Don't mark a task complete until its commit actually exists (check with
   `git log --oneline -1`).
