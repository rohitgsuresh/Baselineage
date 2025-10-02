### Baselineage

Baselineage enhances the Web Platform Baseline
 by turning its guidelines into an interactive developer tool. It helps developers quickly understand which web features are safe to use, highlights non-baseline features in real time, and compares adoption timelines across browsers.

## 🔗 Live Demo: https://baselineage.vercel.app

# ✨ Features

Search Features → Find whether a web feature is Baseline-supported across major browsers.

Compare Features → Side-by-side comparison of browser adoption timelines.

Code Checker (Linter) → Paste or type code, and automatically highlight non-baseline features in red, baseline features in green.

Coverage Score (Planned) → Get a percentage score of baseline coverage for your code.

Timeline Visualization → Animated bars showing when browsers adopted each feature.

# 🚀 Inspiration

Developers often struggle with inconsistent browser support and unclear feature stability. Baseline provides trusted information about stable features, but we wanted to go further. Baselineage brings this data into the development workflow — making it interactive, actionable, and real-time.

# 🛠️ Built With

Frontend Framework: React + TypeScript

Styling: TailwindCSS

Editor: CodeMirror 6 with custom linter extension

Search: Fuzzy search with fastest-levenshtein

Deployment: Vercel

Data: Custom curated features.json dataset (Baseline + experimental features)

# ⚡ Challenges

Handling case-sensitive imports for Vercel deployment.

Cleaning and validating large JSON datasets (baseline + non-baseline features).

Implementing a CodeMirror extension to highlight baseline vs non-baseline usage in real time.

# 🏆 Accomplishments

Built a live linter that detects unsupported features directly in code.

Created an interactive comparison tool for browser adoption timelines.

Packaged Baseline’s static guidelines into a tool that actively saves developer time.

# 📚 What We Learned

How to extend CodeMirror with custom syntax highlighting and tooltips.

The importance of strict JSON validation for deployment.

How to merge documentation data into usable, developer-friendly features.

# 🔮 What’s Next

Coverage scoring system to quantify baseline adoption in any codebase.

Larger, enriched dataset (80+ features with MDN links, specs, polyfills).

GitHub Action / VS Code extension for baseline linting in real projects.
