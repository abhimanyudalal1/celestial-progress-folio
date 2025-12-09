# How to Add Content to Your Blog

Your blog system is split into two layers. Here is how to add content to each.

## 1. Adding a Daily Log (Research Stream)
These are your raw notes, accessible via the "Research Stream" drawer on any blog post page.

1.  Navigate to `src/content/daily`.
2.  Create a new file named with the current date: `YYYY-MM-DD.md`.
    *   Example: `2025-12-10.md`
3.  Add your content in Markdown.

**Example File (`src/content/daily/2025-12-10.md`):**
```markdown
---
tags: ["Debug", "CSS"]
---

### Fixed the Z-Index Issue

Today I spent 2 hours fighting with `z-index`. Turns out the starfield overlay needs `pointer-events: none` to let clicks pass through to the planets.

Snippet:
\`\`\`css
.stars {
  pointer-events: none;
  z-index: 0;
}
\`\`\`
```

---

## 2. Adding a Formal Blog Post
These are the polished articles that appear on the main `/blogs` page.

1.  Navigate to `src/content/posts`.
2.  Create a new file with a descriptive slug: `my-post-title.md`.
3.  **Crucial**: You must include the "Frontmatter" (metadata) at the top of the file between `---`.

**Example File (`src/content/posts/my-new-feature.md`):**
```markdown
---
title: "Building the Physics Engine"
subtitle: "How I used GSAP to model orbital mechanics."
date: "2025-12-10"
description: "A deep dive into the math behind the planet animations and why I chose SVG paths over Canvas."
tags: ["GSAP", "Animation", "Math"]
image: "/placeholder.svg" 
---

# Introduction

Here is the start of my blog post...
```

### Metadata Fields
-   `title`: (Required) Main headline.
-   `date`: (Required) Format YYYY-MM-DD. Used for sorting.
-   `description`: (Required) Displayed on the card preview.
-   `tags`: (Optional) List of topics ["React", "AI"].
-   `subtitle`: (Optional) Smaller text under the title.
-   `image`: (Optional) Path to an image in the `public` folder (e.g., `/planet1.svg`).
