# Git & GitHub Contribution Workflow

## 1. Our Team Rule

Our repository strictly follows a protected branch workflow. The core flow is:

`main`
↓
Protected branch
↓
No direct pushes
↓
All work through feature branches
↓
Pull Request
↓
Owner/Admin review
↓
Approval
↓
Squash merge
↓
`main`

**Crucial Rule:** Contributors should **NEVER** run `git push origin main` and should **never** use a force push on `main`. All code changes must go through a Pull Request to ensure quality, security, and stability.

---

## 2. First-Time Setup

If you are new to the team, here is how to get your environment ready:

1. **Install Git**: Download and install Git from [git-scm.com](https://git-scm.com/).
2. **Verify Git installation**:
   ```bash
   git --version
   ```
3. **Configure Git username and email**:
   ```bash
   git config --global user.name "YOUR NAME"
   git config --global user.email "YOUR EMAIL"
   ```
4. **Accept the GitHub repository invitation** sent to your email.
5. **Clone the repository**:
   ```bash
   git clone https://github.com/SudarshanSingh1/DR-Screening-System.git
   cd DR-Screening-System
   ```
6. **Verify your setup**:
   ```bash
   git remote -v
   git branch
   git status
   ```

---

## 3. Before Starting Any New Work

You should always start new work from the latest version of the `main` branch. This prevents you from writing code based on outdated files.

Execute the exact safe workflow:
```bash
git switch main
git pull origin main
```

Once you are synced with the latest `main`, create a **feature branch** for your specific task:
```bash
git switch -c feature/short-description
```

**Good Branch Naming Examples:**
- `feature/login-fix`
- `feature/patient-dashboard`
- `feature/doctor-profile`
- `feature/api-validation`
- `fix/upload-error`
- `docs/git-workflow`

---

## 4. Working on Your Feature

- Make all your changes in the feature branch you just created.
- **Do not work directly on main.**
- You can always check which branch you are currently on by running:
  ```bash
  git branch --show-current
  ```
  *(The output should be your feature branch, not `main`)*.

To inspect which files you have changed, added, or deleted, run:
```bash
git status
```

---

## 5. Commit Your Changes

When you have completed a logical chunk of work, it's time to commit.

First, check your changes:
```bash
git status
```
Stage all your intended changes:
```bash
git add .
```
Verify they are staged correctly:
```bash
git status
```
Commit the changes with a short, meaningful message:
```bash
git commit -m "feat: add patient search"
```

**Good commit messages with examples:**
- `feat: add patient search`
- `fix: resolve screening upload error`
- `docs: add Git workflow`
- `refactor: simplify authentication service`

**DO NOT use meaningless messages such as:**
- `update`
- `changes`
- `test`
- `final`
- `done`

---

## 6. Push the Feature Branch

When you are ready to share your code or open a Pull Request, you need to push your feature branch to GitHub.

For the **first push** of a new branch, run:
```bash
git push -u origin feature/your-branch-name
```
After the first push, future pushes to this branch can normally just use:
```bash
git push
```

**Concrete Example:**
```bash
git switch -c feature/patient-search
# ... make code changes ...
git add .
git commit -m "feat: add patient search"
git push -u origin feature/patient-search
```

Pushing a feature branch is fully allowed and expected, while pushing directly to `main` is intentionally blocked.

---

## 7. Create a Pull Request

Follow these steps using the GitHub UI:

1. Open the repository on GitHub.
2. GitHub will usually show a green **"Compare & pull request"** button after a new branch is pushed.
3. Click it.
4. Ensure the **Base branch** is `main`.
5. Ensure the **Compare branch** is your feature branch.
6. Add a clear, descriptive PR title.
7. Fill out the PR description: explain what was changed and how it was tested.
8. Click **Create pull request**.

**Professional PR Template Example:**

```text
Title: feat: add patient search

Description:

## What changed
- Added patient search UI component
- Added patient ID lookup API route
- Added frontend input validation

## Testing
- Tested locally
- Existing tests pass

## Notes
- No database schema changes
```

---

## 8. Review Process

The workflow follows this cycle:

Contributor creates PR
↓
Owner/Admin reviews
↓
Changes requested OR approved
↓
**If changes are requested:**
Contributor makes changes on the SAME feature branch locally
↓
`git add .`
`git commit -m "fix: address review comments"`
`git push`
↓
GitHub automatically updates the existing PR
↓
Owner/Admin reviews again
↓
Approval
↓
Squash merge into `main`

**Note:** Contributors should NOT create a second, new PR for every review comment unless specifically requested by the admin. Just commit to your existing branch and push!

---

## 9. Important: Approval Rules

Our repository `main` branch is protected by strict rules:

- **At least 1 approval is required** before merging.
- A contributor's own approval does not replace an independent admin approval.
- If new commits are pushed after an approval is granted, **stale approvals are automatically dismissed**.
- The latest reviewable push must receive a fresh approval.
- Unresolved review conversations prevent merging.
- Direct pushes to `main` are blocked.
- Force pushes to `main` are blocked.
- Main branch deletion is restricted.

---

## 10. Keeping Your Feature Branch Updated

If `main` has moved forward while you were working, you should update your feature branch.

**The recommended safe method:**

First, sync your local `main`:
```bash
git switch main
git pull origin main
```
Then return to your feature branch:
```bash
git switch feature/your-branch-name
```
Update it by merging `main` into it:
```bash
git merge main
```
*(If there are conflicts, Git will tell you which files need attention. See the next section.)*

**Alternative method:**
```bash
git fetch origin
git merge origin/main
```
*(Note: `main` refers to your local copy, while `origin/main` refers to the remote server's copy. For beginners, the first method is safest as it keeps everything in sync).*

---

## 11. Handling Merge Conflicts

Conflicts happen when two people change the exact same lines of code differently. 

If you see a conflict, type:
```bash
git status
```
This will list the conflicted files. Open those files in your code editor. You will see markers like this:

```text
<<<<<<< HEAD
your changes
=======
changes from main
>>>>>>> main
```

**To resolve:** You must manually decide what the final code should be. Edit the file to the correct final state, and completely delete the `<<<<<<<`, `=======`, and `>>>>>>>` markers. Do not blindly choose "Accept Current" or "Accept Incoming" without understanding the code.

Once resolved, mark them as resolved by adding and committing:
```bash
git add <resolved-file>
git commit -m "fix: resolve merge conflict"
git push
```
Your PR will automatically update!

---

## 12. After the PR Is Merged

Once your PR is successfully merged into `main`, you no longer need your feature branch.

Synchronize your local environment:
```bash
git switch main
git pull origin main
```
If the remote feature branch was deleted on GitHub, clean up your local references:
```bash
git fetch --prune
```
Optionally, delete your local feature branch safely:
```bash
git branch -d feature/your-branch-name
```
*(`-d` is safer than a force deletion `-D`, as it ensures the branch is fully merged before deleting).*

---

## 13. Starting the Next Task

The complete cycle starts over for your next task:

```bash
git switch main
git pull origin main
git switch -c feature/new-task

# ... make changes ...

git add .
git commit -m "feat: some new work"
git push -u origin feature/new-task
```
Then create your next PR.

---

## 14. Common Mistakes

| Mistake | Correct approach |
|---|---|
| Working directly on main | Create a feature branch |
| `git push origin main` | Push your feature branch |
| Starting from old main | `git switch main && git pull origin main` |
| Huge unclear commits | Small meaningful commits |
| Force pushing main | **Never do it** |
| Ignoring review comments | Resolve them, commit, and push again |
| Creating a new PR for every review change | Update the existing PR |
| Pulling while on the wrong branch | Check `git branch --show-current` |
| Committing `.env` | **Never commit secrets** |
| Committing uploads/reports | Follow repository `.gitignore` |

---

## 15. Emergency: "I Accidentally Committed on Main"

If you accidentally created local commits on `main` but have NOT successfully pushed them, **do not panic and do not delete your work.**

Check your status and recent commits:
```bash
git status
git log origin/main..main --oneline
```
Create a new feature branch containing these commits:
```bash
git switch -c feature/recover-my-work
```
Push the new branch to save your work safely to GitHub:
```bash
git push -u origin feature/recover-my-work
```
Return to `main` and reset it to match the remote server:
```bash
git switch main
git fetch origin
git reset --hard origin/main
```
*⚠️ **WARNING**: `git reset --hard` will permanently discard uncommitted changes in your working directory. Always verify your work is safely pushed to your feature branch before running this command.* 

If you are unsure, contact the repository owner before guessing.

---

## 16. Emergency: "My Push to Main Was Rejected"

If you see an error like `[remote rejected] main -> main (protected branch hook declined)`, this is **EXPECTED**.

You attempted to `git push origin main`, but `main` is protected.
- Do **not** disable the ruleset.
- Do **not** force push.

Instead, your local commits are perfectly fine, they just need to be on a feature branch. Use the exact safe recovery procedure outlined in **Section 15** to move them to a feature branch, push that branch, and open a PR.

---

## 17. Never Commit Secrets

Never commit sensitive data to the repository:

- `.env`
- `backend/.env`
- `frontend/.env`
- API keys
- passwords
- database URLs containing credentials
- SMTP passwords
- private keys
- tokens
- cloud credentials

Before committing, always check:
```bash
git status
git diff --cached
```
While our `.gitignore` should protect common secret/local files (like `uploads/` and `.env`), contributors are personally responsible for verifying what they are staging.

---

## 18. Useful Git Commands Cheat Sheet

- `git status` : Check what files are modified or staged.
- `git branch` : List local branches.
- `git branch --show-current` : Show the branch you are actively on.
- `git switch main` : Switch to the main branch.
- `git pull origin main` : Pull latest changes from remote main.
- `git switch -c feature/name` : Create and switch to a new branch.
- `git add .` : Stage all changed files.
- `git commit -m "message"` : Commit staged files with a message.
- `git push -u origin feature/name` : Push a new branch for the first time.
- `git push` : Push updates to an existing remote branch.
- `git fetch` : Download remote history without merging.
- `git merge main` : Merge main into your current branch.
- `git log --oneline --decorate -10` : Show a compact view of the last 10 commits.
- `git diff` : See unstaged code changes.
- `git diff --cached` : See staged code changes.
- `git fetch --prune` : Remove local references to deleted remote branches.
- `git branch -d feature/name` : Safely delete a local branch.

---

## 19. Complete Copy-Paste Workflow

```bash
# Start Work
git switch main
git pull origin main
git switch -c feature/your-feature

# Work on your code locally...

# Stage, commit, and push
git status
git add .
git commit -m "feat: describe your change"
git push -u origin feature/your-feature

# -> Open GitHub
# -> Create Pull Request into main
# -> Wait for review
# -> Fix review comments if required by committing and pushing again

# After PR is successfully merged
git switch main
git pull origin main
git fetch --prune
```

---

## 20. Golden Rules

1. `main` is protected.
2. Never directly push to `main`.
3. Always create a feature branch.
4. Always pull the latest `main` before starting new work.
5. Commit small, meaningful changes.
6. Push your feature branch.
7. Create a Pull Request into `main`.
8. Respond to review comments.
9. Never commit secrets.
10. Only merge after the required review/approval checks pass.
11. Keep your local `main` synchronized after merges.
12. When unsure, stop and ask the repository owner rather than using force/reset commands blindly.
