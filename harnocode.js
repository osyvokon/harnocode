const esprima = require("esprima");
const fs = require("fs");

exports.harnocode = function (code, mask) {
  const tokensFull = esprima.tokenize(code);
  const tokens = tokensFull.map((t) => t.value);
  const lines = splitMaskToGroups(mask);
  console.log(lines);
  let tokenIndex = 0;
  let groupIndex = 0;
  let result = [];

  lines.map(groups => {
    let lineResult = [];
    let offset = 0;
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
      console.log(`"${padding}"${groupTokensJustified}`);
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
  console.log(result);
  return result.join("\n");
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
  // TODO
  return tokens.join("");
}


exports.formatFile = function (path) {
  var program = fs.readFileSync("./gantt.module.js").toString();
  var program = fs.readFileSync("harnocode.js").toString();
  console.log(program.length);

  var tokens = esprima.tokenize(program);
  console.log(tokens.length);
  console.log(tokens);
  console.log(`{tokens.length} world`)
}
