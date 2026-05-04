---
name: latex-pdf
description: Use this skill when the user asks to generate, compile, fix, or export a PDF using LaTeX. This skill should create clean LaTeX source files, compile them into PDF, and verify that the PDF was generated successfully.
---

# LaTeX PDF Generation Skill

When asked to generate a PDF using LaTeX, follow this workflow.

## 1. Create the LaTeX source

Create a `.tex` file, usually named `main.tex`.

Use a professional structure:

- `\documentclass[12pt]{article}` for reports or assignments
- `\usepackage[margin=1in]{geometry}`
- `\usepackage{graphicx}`
- `\usepackage{booktabs}`
- `\usepackage{longtable}` if tables are long
- `\usepackage{hyperref}`
- `\usepackage{xcolor}`
- `\usepackage{amsmath}` if equations are needed

Use clear headings, tables, figure captions, and references when needed.

## 2. Compile the PDF

Prefer this command:

```bash
latexmk -pdf -interaction=nonstopmode main.tex
```

If `latexmk` is not available, use:

```bash
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex
```

Run compilation from the folder containing `main.tex`.

## 3. Check for errors

After compiling:

- Confirm that `main.pdf` exists.
- Check the terminal output for LaTeX errors.
- If compilation fails, inspect the `.log` file.
- Fix missing packages, broken syntax, unescaped characters, or image path issues.
- Recompile until the PDF is produced successfully.

## 4. Common LaTeX fixes

Escape special characters in normal text:

- `&` should be `\&`
- `%` should be `\%`
- `_` should be `\_`
- `#` should be `\#`

For Arabic text, use XeLaTeX instead of pdfLaTeX.

For Arabic documents, use this command:

```bash
xelatex -interaction=nonstopmode main.tex
xelatex -interaction=nonstopmode main.tex
```

## 5. Final output

When finished, report:

- The `.tex` file created.
- The generated `.pdf` file.
- Any assumptions made.
- Whether the PDF compiled successfully.
