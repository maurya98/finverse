# 📦 React Application Folder Structure Guide

This document explains the purpose, rules, and expected usage of each
folder inside the `src` directory.
It is intended for both developers and AI agents to correctly organize
files and maintain scalability.

---

# 📁 Root Structure

    src/

The `src` folder contains all application source code.

---

# 🖼 assets/

## Purpose

Stores static resources used across the application.

## Allowed Files

- Images (png, jpg, svg, webp)
- Fonts
- Global CSS / SCSS files
- Icons
- Static media

## Rules

- Use for shared static content
- Do NOT place components or logic here

---

# 🧩 components/

## Purpose

Stores globally reusable UI components.

## Allowed Files

- Buttons
- Form inputs
- Modals
- Cards
- UI widgets used across multiple features

## Rules

- Must be reusable
- Must NOT contain feature-specific business logic
- Do NOT directly call APIs here

---

# 🚀 features/

## Purpose

Contains feature-based modules. Each feature should be self-contained.

Each feature may include: - UI components - Hooks - Services (API
calls) - State management - Feature pages

---

## 🔐 features/auth/

Handles authentication logic.

    auth/
     ├── components/
     ├── hooks/
     ├── services/
     ├── authSlice.js / authContext.js
     └── index.js

### Rules

- Keep auth logic isolated
- Auth API must be inside services

---

## 📊 features/dashboard/

Handles dashboard functionality.

    dashboard/
     ├── components/
     ├── pages/
     ├── hooks/
     └── services/

---

# 🪝 hooks/

## Purpose

Stores global reusable custom hooks.

## Rules

- Hook must be reusable across features
- Feature-specific hooks must stay inside feature folders

---

# 🧱 layouts/

## Purpose

Contains layout components that wrap pages.

### Examples

- Navbar
- Sidebar
- Footer
- Page layout templates

## Rules

- Only structural UI
- No business logic

---

# 📄 pages/

## Purpose

Contains route-level page components.

## Responsibilities

- Combines layout + feature components
- Represents application routes

## Rules

- Pages orchestrate UI
- Avoid complex business logic here

---

# 🧭 routes/

## Purpose

Defines routing configuration.

---

# 🌐 services/

## Purpose

Contains global API and external service logic.

## Responsibilities

- API clients
- Third-party integrations
- Shared network utilities

## Rules

- Use for shared APIs
- Feature-specific APIs must go inside feature services

---

# 🗃 store/

## Purpose

Global state management configuration.

## Includes

- Redux store
- Zustand store
- Middleware setup

## Rules

- Store setup only
- Feature slices should live inside feature folder

---

# 🧮 utils/

## Purpose

Helper functions and pure utilities.

## Rules

- Must be stateless
- No React components

---

# 📌 constants/

## Purpose

Stores application constants.

---

# 🌍 context/

## Purpose

Global React Context providers.

---

# ⚙ config/

## Purpose

Application configuration files.

---

# 🧠 App.jsx

## Purpose

Main application component.

## Responsibilities

- Loads routes
- Loads global providers
- Defines root layout

---

# 🚪 main.jsx / index.jsx

## Purpose

Application entry point.

## Responsibilities

- React root rendering
- Mounts App component

---

# 📏 File Placement Rules

## Components

- Reusable UI → components/
- Feature UI → features/`<feature>`{=html}/components/
- Layout UI → layouts/

## Hooks

- Global reusable → hooks/
- Feature-specific → features/`<feature>`{=html}/hooks/

## APIs

- Shared APIs → services/
- Feature APIs → features/`<feature>`{=html}/services/

## State

- Global Store Setup → store/
- Feature State → features/`<feature>`{=html}/

---

# 🎯 Architecture Principles

- Feature Driven Design
- Separation of Concerns
- High Reusability
- Scalable Structure
- Clear Ownership

---

# 🏁 Conclusion

This folder structure ensures scalability, maintainability, and clear
file ownership.
