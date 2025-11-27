const fs = require("fs");
const path = require("path");

const inputFolder = path.join(__dirname, "bible");
const outputFile = path.join(__dirname, "bible-data.js");

// filename → proper book name mapping
const fileToBookName = {
  // Old Testament
  "genesis.json": "Genesis",
  "exodus.json": "Exodus",
  "leviticus.json": "Leviticus",
  "numbers.json": "Numbers",
  "deuteronomy.json": "Deuteronomy",
  "joshua.json": "Joshua",
  "judges.json": "Judges",
  "ruth.json": "Ruth",
  "1samuel.json": "1 Samuel",
  "2samuel.json": "2 Samuel",
  "1kings.json": "1 Kings",
  "2kings.json": "2 Kings",
  "1chronicles.json": "1 Chronicles",
  "2chronicles.json": "2 Chronicles",
  "ezra.json": "Ezra",
  "nehemiah.json": "Nehemiah",
  "esther.json": "Esther",
  "job.json": "Job",
  "psalms.json": "Psalms",
  "proverbs.json": "Proverbs",
  "ecclesiastes.json": "Ecclesiastes",
  "songofsolomon.json": "Song of Solomon",
  "isaiah.json": "Isaiah",
  "jeremiah.json": "Jeremiah",
  "lamentations.json": "Lamentations",
  "ezekiel.json": "Ezekiel",
  "daniel.json": "Daniel",
  "hosea.json": "Hosea",
  "joel.json": "Joel",
  "amos.json": "Amos",
  "obadiah.json": "Obadiah",
  "jonah.json": "Jonah",
  "micah.json": "Micah",
  "nahum.json": "Nahum",
  "habakkuk.json": "Habakkuk",
  "zephaniah.json": "Zephaniah",
  "haggai.json": "Haggai",
  "zechariah.json": "Zechariah",
  "malachi.json": "Malachi",

  // New Testament
  "matthew.json": "Matthew",
  "mark.json": "Mark",
  "luke.json": "Luke",
  "john.json": "John",
  "acts.json": "Acts",
  "romans.json": "Romans",
  "1corinthians.json": "1 Corinthians",
  "2corinthians.json": "2 Corinthians",
  "galatians.json": "Galatians",
  "ephesians.json": "Ephesians",
  "philippians.json": "Philippians",
  "colossians.json": "Colossians",
  "1thessalonians.json": "1 Thessalonians",
  "2thessalonians.json": "2 Thessalonians",
  "1timothy.json": "1 Timothy",
  "2timothy.json": "2 Timothy",
  "titus.json": "Titus",
  "philemon.json": "Philemon",
  "hebrews.json": "Hebrews",
  "james.json": "James",
  "1peter.json": "1 Peter",
  "2peter.json": "2 Peter",
  "1john.json": "1 John",
  "2john.json": "2 John",
  "3john.json": "3 John",
  "jude.json": "Jude",
  "revelation.json": "Revelation"
};


let bibleData = {};
const files = fs.readdirSync(inputFolder);

files.forEach(fileName => {
  const bookName = fileToBookName[fileName];
  if (!bookName) {
    console.log("Unknown file:", fileName);
    return;
  }

  const filePath = path.join(inputFolder, fileName);
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Convert WEB structured array → chapter/verse object
  let chapters = {};

 raw.forEach(item => {
  // skip items with no verse/chapter
  if (!item.chapterNumber || !item.verseNumber || !item.value) return;

  const c = item.chapterNumber.toString();
  const v = item.verseNumber.toString();

  if (!chapters[c]) chapters[c] = {};
  if (!chapters[c][v]) chapters[c][v] = "";

  chapters[c][v] += item.value.trim() + " ";
});


  // trim spaces
  Object.keys(chapters).forEach(c => {
    Object.keys(chapters[c]).forEach(v => {
      chapters[c][v] = chapters[c][v].trim();
    });
  });

  bibleData[bookName] = chapters;
});

// output file
const output = `const bibleData = ${JSON.stringify(bibleData, null, 2)};`;
fs.writeFileSync(outputFile, output);

console.log("DONE! bible-data.js rewritten cleanly.");

