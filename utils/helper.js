
const validateCSV = (rows) => {
  for (const row of rows) {
    if (!row["S. No."] || !row["Product Name"] || !row["Input Image Urls"]) {
      return false;
    }
    // Validate URLs format
    const urls = row["Input Image Urls"].split(",").map((url) => url.trim());
    for (const url of urls) {
      try {
        new URL(url);
      } catch {
        return false;
      }
    }
  }
  return true;
};

export { validateCSV };
