# How to Add Content to Your Blog

Your blog system is split into two layers. Here is how to add content to each.

## 1. Adding a Daily Log (Research Stream)
Daily logs are **specific to each blog post**. They track your progress on that particular project/topic and are accessible via the "Research Stream" drawer on that blog post's page.

### Steps:
1.  Navigate to `src/content/daily/`.
2.  Create a folder with the **same name as your blog post slug** (the filename without `.md`).
    *   Example: If your blog is `mate.md`, create folder `daily/mate/`
3.  Inside that folder, create files named with dates: `YYYY-MM-DD.md`.
    *   Example: `src/content/daily/mate/2025-12-28.md`
4.  Add your content in Markdown.

### Folder Structure Example:
```
src/content/
├── posts/
│   ├── mate.md                    # Blog post
│   └── react-server-components.md # Another blog post
└── daily/
    ├── mate/                      # Daily logs for "mate" blog
    │   ├── 2025-12-28.md
    │   └── 2025-12-29.md
    └── react-server-components/   # Daily logs for RSC blog
        └── 2025-12-08.md
```

### Example Daily Log (`src/content/daily/mate/2025-12-28.md`):
```markdown
---
tags: ["Debug", "Architecture"]
---

### Set up the audio pipeline

Today I worked on getting Whisper running locally. Turns out the `tiny` model is fast but not accurate enough for my needs.

#### Code snippet:
\`\`\`python
import whisper
model = whisper.load_model("base")
result = model.transcribe("audio.mp3")
\`\`\`

#### Next steps:
- Test the `small` model for better accuracy
- Look into wake word detection
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
