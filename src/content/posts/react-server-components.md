---
title: "Understanding React Server Components"
subtitle: "A deep dive into how RSCs change the mental model of React development."
date: "2025-11-15"
description: "React Server Components are the biggest shift in the React ecosystem since Hooks. Here is what you need to know about the server-client boundary."
tags: ["React", "Web Dev", "Architecture"]
image: "/placeholder.svg"
---

# The Server-Client Boundary

Traditionally, we thought of the "backend" and "frontend" as two separate applications that talk over JSON.

With **React Server Components (RSC)**, that line blurs.

## Why it matters
1. **Zero Bundle Size**: Components that only run on the server don't add to the JS bundle.
2. **Direct Database Access**: You can `await db.query()` directly in your component.

## The Mental Model

Think of your app as a tree. The root is on the server. The branches can choose to "become interactive" (client components) at the leaves.

> [!NOTE]
> This is a simplified view, but helpful for beginners.

This changes everything about how we fetch data.
