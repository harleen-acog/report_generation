#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import inquirer from "inquirer";
import { getApiKey, setApiKey, clearApiKey } from "../config/store.js";

import { getAuthorOverview } from "../services/author_service.js";
import { getBookSummary } from "../services/book_summary_service.js";

const program = new Command();

const STYLES = ["normal", "haiku", "pirate", "shakespeare", "academic"];

program
  .name("author-cli")
  .description("Search authors and generate book summaries")
  .version("1.0.0");

program
  .command("config:set")
  .description("Set Gemini API key")
  .argument("<apiKey>", "API key")
  .action((apiKey) => {
    setApiKey(apiKey);
    console.log("API key saved");
  });

program
  .command("config:get")
  .description("Check if API key is set")
  .action(() => {
    const key = getApiKey();
    if (!key) {
      console.log("No API key found");
    } else {
      const masked = key.slice(0, 4) + "****";
      console.log(`API key is set: ${masked}`);
    }
  });

program
  .command("config:clear")
  .description("Remove stored API key")
  .action(() => {
    clearApiKey();
    console.log("🗑️ API key removed");
  });

// 🔹 COMMAND 1: List books by author
program
  .command("author")
  .description("List books for an author and optionally generate summary")
  .argument("<author>", "Author name")
  .action(async (author) => {
    const overview = await getAuthorOverview(author);

    if (!overview.books || overview.books.length === 0) {
      console.log("No books found. Check author name.");
      return;
    }

    console.log("\nAuthor Summary:\n");
    console.log(overview.author_summary);

    console.log("\nBooks:\n");

    overview.books.forEach((b, i) => {
      console.log(`${i + 1}. ${b.title} \n${b.description}\n`);
    });

    //  Select book via inquirer
    const { selectedIndex } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedIndex",
        message: "Select a book:",
        choices: overview.books.map((b, i) => ({
          name: b.title,
          value: i,
        })),
      },
    ]);

    const selected = overview.books[selectedIndex - 1];

    //  Select style
    const { style } = await inquirer.prompt([
      {
        type: "list",
        name: "style",
        message: "Choose summary style:",
        choices: STYLES,
        default: "normal",
      },
    ]);

    const result = await getBookSummary({
      title: selected.title,
      author,
      description: selected.description,
      style,
    });

    console.log("\nSummary:\n");
    console.log(result);
  });

// 🔹 COMMAND 2: Direct summary via flags
program
  .command("summary")
  .description(
    `Generate summary for any book, by giving the title, author (if known) and summary style\nExample usage: author-cli summary --title "Harry Potter" --style "poem" --depth "short" --author "J.K. Rowling"` ,
  )
  .option("--title <title>", "Book title")
  .option("--author <author>", "Author name")
  .option(
    "--depth <depth>",
  `Summary depth:
short → concise overview (~80 words)
medium → balanced summary (~150 words)
detailed → rich thematic summary (~300-400 words)
academic → analytical and literary tone with deeper interpretation`,
    "medium",
  )
  .option("--style <style>", "Summary style", "normal")
  .action(async (options) => {
    let { title, author, style, depth } = options;

    if (!title) {
      console.log("Please provide the book title using --title");
      return;
    }
    if (!author) {
      author = "Not known";
    }
    const result = await getBookSummary({
      title,
      author,
      style,
      description: "",
    });

    console.log("\nSummary:\n");
    console.log(result);
  });

// Run program
program.parse();
