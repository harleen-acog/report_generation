# Author-cli

A simple and powerful CLI to explore authors and generate AI-powered book summaries.

---

## Features

* Search books by author
* List top books (filtered + cleaned)
* Generate summaries using AI
* Choose summary style (Normal, Haiku, Pirate, Shakespeare, etc.)

---

## Installation

### Run instantly

```bash
npx author-cli author "Jane Austen"
```

---

### Install globally

```bash
npm install -g author-cli
```

Then:

```bash
author-cli author "Jane Austen"
```

---

## Usage

### 1. List books by author

```bash
author-cli author "Jane Austen"
```

This will:

* Show author summary  and list top books
* Let you select a book
* Ask for summary style
* Generate AI summary

---

### 2. Generate summary directly

You can directly search for a book summary by giving the title The author name and style are optional flags.

```bash
author-cli summary --title "Pride and Prejudice" --author "Jane Austen" --style pirate
```

---

## Available Styles

* Normal (default)
* Haiku
* Pirate
* Shakespeare
* Academic

---

## Options

### `author` command

```bash
author-cli author <author-name>
```

---

### `summary` command

```bash
author-cli summary --title <title> --author <author> --style <style>
```

| Option     | Description   |
| ---------- | ------------- |
| `--title`  | Book title    |
| `--author` | Author name (Optional)   |
| `--style`  | Summary style (Optional) |

---

## Development

```bash
# Install dependencies
bun install

# Run in dev mode
bun run dev

# Build CLI
bun run build
```

---

## Tech Stack

* Node.js + TypeScript
* Commander (CLI framework)
* Inquirer (interactive prompts)
* Google Generative AI (via AI SDK)

---

## Project Structure

```
author-cli/
├── dist/                     # compiled output (published)
│
├── src/
│   ├── cli/                 # entry point (Commander, Inquirer)
│   │   └── summarize.ts
│
│   ├── services/            # business logic
│   │   ├── author_service.ts
│   │   └── book_summary_service.ts
│
│   ├── data/                # external API clients
│   │   └── openlibrary_client.ts
│
│   ├── domain/              # types/interfaces
│   │   ├── book.ts
│   │   └── author.ts
│
│   ├── llm/                 # LLM abstraction
│   │   ├── gemini_client.ts
│   │   ├── provider_factory.ts
│   │   └── llm_types.ts
│
│   ├── prompts/             # prompt templates
│   │   ├── author_overview.prompt.md
│   │   └── book_summary.prompt.md
│
│── env.ts
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md

```

---

## Requirements

* Node.js 18+
* API key for Google Generative AI

---

## Environment Variables

Create a `.env` file:

```
LLM_PROVIDER=gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

---

## Contributing

Feel free to open issues or submit PRs.

---

## License

ISC

---

## Author

Harleen Kaur
