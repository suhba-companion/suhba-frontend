#!/bin/bash
# suhba-dev.sh — Automated agentic development loop for Suhba
# Usage: ./suhba-dev.sh [feature]
# Example: ./suhba-dev.sh prayer-times
# Run all:  ./suhba-dev.sh

set -e

# ── Config ────────────────────────────────────────────────────────────────────
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$PROJECT_ROOT/.dev-logs"
mkdir -p "$LOG_DIR"

# Build order — edit to skip completed features
FEATURES=(
  "design-system"
  "prayer-times"
  "mosques"
  "prayer-spots"
  "halal-directory"
  "events"
  "pwa"
  "i18n"
)

# ── Colours ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────
log()     { echo -e "${BLUE}[suhba]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
error()   { echo -e "${RED}[✗]${NC} $1"; }

require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    error "'$1' is not installed or not in PATH."
    exit 1
  fi
}

# ── Preflight ─────────────────────────────────────────────────────────────────
preflight() {
  log "Running preflight checks..."
  require_cmd claude
  require_cmd npm
  require_cmd node

  if [ ! -f "$PROJECT_ROOT/CLAUDE.md" ]; then
    error "CLAUDE.md not found in $PROJECT_ROOT"
    exit 1
  fi

  if [ ! -f "$PROJECT_ROOT/PRD.md" ]; then
    error "PRD.md not found in $PROJECT_ROOT"
    exit 1
  fi

  if [ ! -f "$PROJECT_ROOT/.env" ]; then
    warn ".env file not found — create it with VITE_MASJIDI_API_KEY etc."
  fi

  success "Preflight passed"
}

# ── Quality gate ──────────────────────────────────────────────────────────────
run_quality_gate() {
  local feature=$1
  log "Running quality gate for: $feature"

  local failed=0

  echo "→ TypeScript..."
  if ! npm run typecheck --silent 2>&1; then
    error "TypeScript errors found"
    failed=1
  fi

  echo "→ ESLint..."
  if ! npm run lint --silent 2>&1; then
    error "Lint errors found"
    failed=1
  fi

  echo "→ Tests..."
  if ! npm run test --silent 2>&1; then
    error "Tests failed"
    failed=1
  fi

  if [ $failed -eq 1 ]; then
    error "Quality gate FAILED for $feature"
    return 1
  fi

  success "Quality gate PASSED for $feature"
  return 0
}

# ── Build single feature ──────────────────────────────────────────────────────
build_feature() {
  local feature=$1
  local log_file="$LOG_DIR/$feature.log"

  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "Feature: $feature"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Check if already done
  if [ -f "$LOG_DIR/$feature.done" ]; then
    success "$feature already complete — skipping"
    return 0
  fi

  # Step 1: Plan
  log "Step 1/3: Planning $feature..."

  local plan_prompt="Read CLAUDE.md and PRD_SUHBA.md.

Task: implement the '$feature' feature as described in PRD.md.
Scope: only create/modify files in src/features/$feature and src/services/ if a new service is needed.
Do not install new packages without listing them first and stopping.

Output a numbered plan:
- Files you will create (with path)
- Files you will modify (with path)
- Any packages needed (none if possible)

Do not write any code yet. Plan only."

  echo "$plan_prompt" | claude -p --output-format text > "$log_file.plan" 2>&1

  cat "$log_file.plan"
  echo ""

  # Ask for plan approval
  warn "Review the plan above."
  read -rp "$(echo -e "${YELLOW}Approve plan and execute? [y/n/skip]: ${NC}")" answer

  case $answer in
    y|Y)
      log "Plan approved. Executing..."
      ;;
    skip|s|S)
      warn "Skipping $feature"
      touch "$LOG_DIR/$feature.done"
      return 0
      ;;
    *)
      error "Plan rejected. Fix your PRD or CLAUDE.md then rerun."
      exit 1
      ;;
  esac

  # Step 2: Execute
  log "Step 2/3: Executing $feature..."

  local execute_prompt="Execute the plan you just outlined for the '$feature' feature.

Rules:
- Run 'npm run typecheck' after each file you create or modify
- Fix any TypeScript errors before moving to the next file
- Only touch files in src/features/$feature and src/services/
- All user-facing strings must use i18next (t('key'))
- Handle loading, error, and empty states in every component
- No console.log

When done, output: FEATURE COMPLETE"

  echo "$execute_prompt" | claude -p --output-format text > "$log_file.execute" 2>&1
  cat "$log_file.execute"

  # Step 3: Quality gate
  log "Step 3/3: Quality gate..."

  local attempts=0
  local max_attempts=3

  while [ $attempts -lt $max_attempts ]; do
    if run_quality_gate "$feature"; then
      break
    fi

    attempts=$((attempts + 1))

    if [ $attempts -ge $max_attempts ]; then
      error "Quality gate failed after $max_attempts attempts. Manual fix needed."
      error "Check logs: $log_file.execute"
      exit 1
    fi

    warn "Attempt $attempts/$max_attempts — asking Claude to fix..."

    local fix_prompt="The quality gate failed. Run 'npm run typecheck && npm run lint && npm run test' and fix ALL errors.
Do not add new features. Only fix what's broken.
When everything passes, output: ALL FIXED"

    echo "$fix_prompt" | claude -p --output-format text >> "$log_file.execute" 2>&1
  done

  # Mark done
  touch "$LOG_DIR/$feature.done"
  success "$feature complete ✓"
  echo ""
}

# ── Status ────────────────────────────────────────────────────────────────────
show_status() {
  log "Build status:"
  for feature in "${FEATURES[@]}"; do
    if [ -f "$LOG_DIR/$feature.done" ]; then
      echo -e "  ${GREEN}✓${NC} $feature"
    else
      echo -e "  ${YELLOW}○${NC} $feature"
    fi
  done
}

# ── Reset ─────────────────────────────────────────────────────────────────────
reset_feature() {
  local feature=$1
  rm -f "$LOG_DIR/$feature.done"
  warn "Reset $feature — will rebuild on next run"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  local target=$1

  case $target in
    status)
      show_status
      exit 0
      ;;
    reset)
      reset_feature "$2"
      exit 0
      ;;
    "")
      # Build all features in order
      preflight
      log "Starting full Suhba build..."
      echo ""
      for feature in "${FEATURES[@]}"; do
        build_feature "$feature"
      done
      echo ""
      success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      success "All features complete!"
      success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      show_status
      ;;
    *)
      # Build specific feature
      preflight
      build_feature "$target"
      ;;
  esac
}

main "$@"
