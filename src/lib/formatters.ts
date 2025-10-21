import { Constants } from "#utils/constants";

// This is a helper function to format dates into a human-readable format (e.g. January 1, 2021)
export function formatDate(
  input: string | number | Date,
  withTime: boolean = false
): string {
  const date = new Date(input);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(withTime && {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }),
  });
}

// This is a helper function to format prices into a currency format (e.g. 1999 = $19.99)
export function formatPrice(
  price: number | string,
  notation: "compact" | "engineering" | "scientific" | "standard" = "standard"
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: Constants.currency,
    notation,
    maximumFractionDigits: 2,
  }).format(Number(price) / 100); // Assuming amounts are stored in micro-units
}

// This is a helper function to format numbers into a human-readable format (e.g. 1,000)
export function formatNumber(
  number: number | string,
  notation: "compact" | "engineering" | "scientific" | "standard" = "standard"
) {
  return new Intl.NumberFormat("en-US", {
    notation,
    maximumFractionDigits: 2,
  }).format(Number(number));
}

// This is a helper function to format bytes into a human-readable format (e.g. 1.00 KB)
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k: number = 1024;
  const dm: number = decimals < 0 ? 0 : decimals;
  const sizes: string[] = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
    "PB",
    "EB",
    "ZB",
    "YB",
  ];

  const i: number = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
