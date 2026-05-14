# AI Agent Global Guide

Welcome! This document is the primary entry point for AI Agents working on the **Dynamic Status Node Calculator** project.

## 🎯 Project Mission

Build a flexible, WYSIWYG node-based calculator to visualize and compute complex status additions (e.g., RPG stats, buffs, logic gates).

## 🗺️ Project Map

- **Frontend**: `/frontend` (React Flow + Zustand)
- **Backend**: `/backend` (Node.js + Express + MongoDB)
- **Shared Types**: `/shared` (Source of truth for TS interfaces)
- **AI Documentation**: `/ai_docs` (Detailed technical guides)

## 📚 Technical Index (Refer to /ai_docs)

1. [Technical Stack & Docker](./ai_docs/01_technical_stack_and_docker.md): Detailed infrastructure, containerization, and networking info.
2. _[Upcoming] Business Logic_: Documentation on calculation algorithms.
3. _[Upcoming] Database Schema_: Detailed MongoDB models and relations.

## 🛠️ Essential Commands

- `npm run init`: Initialize the entire project environment.
- `npm run doctor`: Check if your environment meets the requirements.
- `npm run dev`: Start local development (Hybrid mode).
- `npm run docker:dev`: Start full-stack development in Docker.

## 🚨 Development Rules

1. **Strict Typing**: Never use `any`. Modify types in `/shared` first.
2. **Atomic Commits**: Keep changes focused and well-documented.
3. **Environment Integrity**: Ensure changes work in both local and Docker environments.
4. **Agent History**: Check `ai_docs` for past technical decisions before refactoring core systems.

---

_Last Updated: 2026-05-14 by Antigravity_
