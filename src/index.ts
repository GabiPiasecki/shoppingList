import { vendors } from "./data/vendors";
import { compare } from "./compare";
import { formatResults } from "./formatter";

const input = process.argv[2];

if (!input) {
  console.log("Usage: npx ts-node src/index.ts \"milk, eggs, bread, rice\"");
  process.exit(1);
}

const shoppingList = input.split(",").map((s) => s.trim()).filter(Boolean);

if (shoppingList.length === 0) {
  console.log("Error: shopping list is empty.");
  process.exit(1);
}

console.log(`Shopping list: ${shoppingList.join(", ")}`);

const result = compare(shoppingList, vendors);
console.log(formatResults(result));
