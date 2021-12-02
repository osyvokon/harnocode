const esprima = require("esprima");
const fs = require("fs");

exports.harnocode = function (code, mask) {
  const tokensFull = esprima.tokenize(code);
  const tokens = tokensFull.map((t) => t.value);
  const lines = splitMaskToGroups(mask);
  let tokenIndex = 0;
  let groupIndex = 0;
  let result = [];

  lines.map(groups => {
    let lineResult = [];
    let offset = 0;
    if (tokenIndex >= tokens.length)
      return;
    groups.forEach(group => {
      let groupWidth = group[0].length;
      if (group.index < offset) {
        // Happens when we overflow preceeding groups
        // In this case we should shrink current group
        // or skip it entirely
        groupWidth -= (offset - group.index);
        if (groupWidth <= 0)
          return;
      }

      let groupTokens = takeTokens(tokens, groupWidth, tokenIndex);
      let groupTokensJustified = justify(groupTokens, groupWidth);
      let padding = " ".repeat(Math.max(0, group.index - offset));
      offset += padding.length + groupTokensJustified.length;
      tokenIndex += groupTokens.length;
      lineResult.push(padding);
      lineResult.push(groupTokensJustified);
    });
    result.push(lineResult.join(""));

  });

  // Add remaining tokens if mask is shorter than code
  let remainder = tokens.slice(tokenIndex).join("");  // TODO: space is needed sometimes
  result.push(remainder);
  let resultStr = result.join("\n");

  // Make sure we don't break the code
  validate(code, resultStr);

  return resultStr;
}

function validate(code1, code2)
{
  let tokens1 = esprima.tokenize(code1, {loc: true});
  let tokens2 = esprima.tokenize(code2, {loc: true});

  tokens1.forEach((t1, i) => {
    let t2 = tokens2[i];
    if (t1.value != t2.value) {
      process.stderr.write("Tokens mismatch:\n");
      process.stderr.write(`  line:     ${t1.loc.start.line}\n`);
      process.stderr.write(`  expected: ${t1.value}\n`);
      process.stderr.write(`  actual:   ${t2.value}\n`);
      process.exit(1);
    }
  });
}



function splitMaskToGroups(mask) {
  if (mask.trim().length == 0)
    return [];
  return mask.split("\n").map(splitLineToGroups);
}


function splitLineToGroups(line) {
  return [...line.matchAll(/x+/g)];
}


function takeTokens(tokens, groupLength, tokenIndex)
{
  let toTake = [];
  let toTakeLength = 0;
  while (tokenIndex < tokens.length) {
    let token = tokens[tokenIndex];
    let canTake = (toTakeLength + token.length) <= groupLength;
    if (toTakeLength == 0)
      canTake = true;
    if (!canTake)
      break;
    toTake.push(tokens[tokenIndex]);
    toTakeLength += tokens[tokenIndex].length;
    tokenIndex += 1;
  }
  return toTake;
}

function justify(tokens, width) {
  if (tokens.length == 0)
    return " ".repeat(width);

  let tokensWidth = tokens.reduce((a, b) => a + b.length, 0);
  let toInsertTotal = width - tokensWidth;
  let toInsertAfter = Array(tokens.length - 1).fill(0);
  let insertedActual = 0;
  for (let i = 0; i < toInsertAfter.length; i++) {
    let expectedRunningInserted = Math.round(toInsertTotal * (i / toInsertAfter.length));
    toInsertAfter[i] = Math.max(0, expectedRunningInserted - insertedActual);
    insertedActual += toInsertAfter[i];
  }
  toInsertAfter[0] += (toInsertTotal - insertedActual);

  let result = tokens.map((token, i) => token + " ".repeat(toInsertAfter[i]));
  return result.join("");
}


exports.formatFile = function (path) {
  var program = fs.readFileSync("./gantt.module.js").toString();
  var program = fs.readFileSync("harnocode.js").toString();
  let mask = `\
xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
 xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
  xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
   xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
    xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
     xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
      xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
       xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
       xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
      xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
     xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
    xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
   xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
  xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
 xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
`.repeat(100);

  let result = exports.harnocode(program, mask);
  process.stdout.write(result);
}
