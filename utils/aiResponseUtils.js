function cleanJSON(text) {
  // Remove ```json or ``` at start and ``` at end (with optional whitespace)
  return text
    .trim()
    .replace(/^```json\s*/, "")
    .replace(/^```\s*/, "")
    .replace(/```$/, "")
    .trim();
}

module.exports = { cleanJSON };