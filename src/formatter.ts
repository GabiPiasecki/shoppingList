import { ComparisonResult } from "./types";

const HAS_HEBREW = /[\u0590-\u05FF]/;

function fixRtl(str: string): string {
  if (!HAS_HEBREW.test(str)) return str;
  // Reverse the string so Hebrew reads correctly in LTR terminals
  return [...str].reverse().join("");
}

function pad(str: string, len: number): string {
  return str.padEnd(len);
}

function formatPrice(price: number): string {
  return `₪${price.toFixed(2)}`;
}

function divider(len: number): string {
  return "-".repeat(len);
}

export function formatResults(result: ComparisonResult): string {
  const lines: string[] = [];
  const { bestSingleStore, bestSplit } = result;

  // Single store section
  lines.push("");
  lines.push("=== BEST SINGLE STORE ===");
  lines.push(`Store: ${bestSingleStore.vendor}`);
  lines.push("");

  const col1 = 20;
  const col2 = 10;
  lines.push(`  ${pad("Item", col1)} ${pad("Price", col2)}`);
  lines.push(`  ${divider(col1)} ${divider(col2)}`);

  for (const item of bestSingleStore.items) {
    lines.push(`  ${pad(fixRtl(item.product), col1)} ${pad(formatPrice(item.price), col2)}`);
  }

  lines.push(`  ${divider(col1)} ${divider(col2)}`);
  lines.push(`  ${pad("TOTAL", col1)} ${pad(formatPrice(bestSingleStore.total), col2)}`);

  if (bestSingleStore.missing.length > 0) {
    lines.push("");
    lines.push(`  Not available: ${bestSingleStore.missing.map(fixRtl).join(", ")}`);
  }

  // Split order section
  lines.push("");
  lines.push("=== BEST SPLIT ACROSS STORES ===");
  lines.push("");

  const col3 = 15;
  lines.push(`  ${pad("Item", col1)} ${pad("Store", col3)} ${pad("Price", col2)}`);
  lines.push(`  ${divider(col1)} ${divider(col3)} ${divider(col2)}`);

  for (const item of bestSplit.items) {
    lines.push(
      `  ${pad(fixRtl(item.product), col1)} ${pad(item.vendor, col3)} ${pad(formatPrice(item.price), col2)}`
    );
  }

  lines.push(`  ${divider(col1)} ${divider(col3)} ${divider(col2)}`);
  lines.push(
    `  ${pad("TOTAL", col1)} ${pad("", col3)} ${pad(formatPrice(bestSplit.total), col2)}`
  );

  if (bestSplit.missing.length > 0) {
    lines.push("");
    lines.push(`  Not available anywhere: ${bestSplit.missing.map(fixRtl).join(", ")}`);
  }

  // Savings summary
  lines.push("");
  const savings = bestSingleStore.total - bestSplit.total;
  if (savings > 0) {
    lines.push(
      `Splitting saves you ${formatPrice(savings)} compared to shopping at ${bestSingleStore.vendor} alone.`
    );
  } else {
    lines.push(
      `${bestSingleStore.vendor} is already the cheapest option — no savings from splitting.`
    );
  }
  lines.push("");

  return lines.join("\n");
}
