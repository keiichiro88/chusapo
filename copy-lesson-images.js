const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'クイズレッスン画像');
const destDir = path.join(__dirname, 'public');

const mappings = [
  { src: ' Lesson１.png', dest: 'quiz-lesson1-eyecatch.png' },
  { src: ' Lesson２.png', dest: 'quiz-lesson2-eyecatch.png' },
  { src: ' Lesson３.png', dest: 'quiz-lesson3-eyecatch.png' },
  { src: ' Lesson４.png', dest: 'quiz-lesson4-eyecatch.png' },
  { src: ' Lesson５.png', dest: 'quiz-lesson5-eyecatch.png' },
  { src: ' Lesson６.png', dest: 'quiz-lesson6-eyecatch.png' },
  { src: ' Lesson７.png', dest: 'quiz-lesson7-eyecatch.png' },
  { src: ' Lesson８.png', dest: 'quiz-lesson8-eyecatch.png' },
  { src: ' Lesson９.png', dest: 'quiz-lesson9-eyecatch.png' },
  { src: ' Lesson１０.png', dest: 'quiz-lesson10-eyecatch.png' },
  { src: ' Lesson１１.png', dest: 'quiz-lesson11-eyecatch.png' },
];

mappings.forEach(({ src, dest }) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);
  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${dest}`);
  } catch (err) {
    console.error(`Failed to copy ${src}: ${err.message}`);
  }
});

console.log('Done!');




