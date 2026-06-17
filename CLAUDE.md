# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Build:** `npm run build` (runs `tsc`, outputs to `dist/`)
- **Run:** `node dist/index.js`

## Architecture

Minimal TypeScript project skeleton. Entry point is `src/index.ts`, compiled to `dist/index.js`. TypeScript targets ES2016 with CommonJS modules and strict mode enabled. No test framework or linter is configured yet.
