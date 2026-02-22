import * as https from "https";
import * as zlib from "zlib";
import { XMLParser } from "fast-xml-parser";
import { Vendor, VendorProduct } from "../types";

const PRICEFULL_LIST_URL =
  "https://prices.shufersal.co.il/FileObject/UpdateCategory?catID=2&storeId=0";

function fetchUrl(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location).then(resolve, reject);
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

function gunzip(buf: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gunzip(buf, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

/** Scrape the first PriceFull .gz URL from the Shufersal prices site. */
async function findPriceFullUrl(): Promise<string> {
  const html = (await fetchUrl(PRICEFULL_LIST_URL)).toString("utf8");
  // URLs look like: https://pricesprodpublic.blob.core.windows.net/pricefull/PriceFull...gz?...
  const match = html.match(
    /https:\/\/pricesprodpublic\.blob\.core\.windows\.net\/pricefull\/PriceFull[^"'\s<>]+/
  );
  if (!match) {
    throw new Error("Could not find a PriceFull URL on the Shufersal prices site");
  }
  // HTML-decode &amp; → &
  return match[0].replace(/&amp;/g, "&");
}

function parseItems(xml: string): VendorProduct[] {
  const parser = new XMLParser();
  const doc = parser.parse(xml);

  const items: any[] = doc?.root?.Items?.Item;
  if (!Array.isArray(items)) {
    throw new Error("Unexpected XML structure: no Items/Item array found");
  }

  return items
    .filter((item) => item.ItemPrice != null && item.ItemName)
    .map((item) => ({
      productName: String(item.ItemName).trim(),
      price: Number(item.ItemPrice),
      inStock: String(item.ItemStatus) !== "0",
    }));
}

export async function fetchShufersalData(): Promise<Vendor> {
  console.log("Fetching Shufersal price list...");

  const url = await findPriceFullUrl();
  const gzBuf = await fetchUrl(url);
  const xmlBuf = await gunzip(gzBuf);
  const xml = xmlBuf.toString("utf8");
  const catalog = parseItems(xml);

  console.log(`Loaded ${catalog.length} products from Shufersal.`);

  return { name: "Shufersal", catalog };
}
