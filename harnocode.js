const esprima = require("esprima");
const escodegen = require("escodegen");
const fs = require("fs");

/**
 * Format JavaScript code as an ASCII-art image.
 *
 * @param {String} code     JavaScript code to format
 * @param {String} mask     Image mask containing " " and "x" chars
 * @param {object} options  Additional options
 *
 * Options:
 *
 *  splitStrings:  If true, long string literals could be splitted into
 *                 concatenation of substrings for nicer image.
 *                 For example, "hello world" could be split into
 *                 "hello" + " world". This lets code fit
 *                 the image more nicely. However, the resulting
 *                 AST will be different from the original, so there
 *                 will be no way to validate that the resulting
 *                 code matches original.
 *
 *
 * @return {String} formatted code
 */
exports.harnocode = function (code, mask, options) {
  options = options ?? {};
  // Regenerating code from AST will inserting omitted semicolons.
  // We need it for safer manipulations later on
  const format = {
    safeConcatenation: true,
    escapeless: true,
    semicolons: true,
    renumber: true,
    quotes: "single",
  }
  code = escodegen.generate(esprima.parse(code), {format: format});
  const tokens = tokenize(code);
  const lines = splitMaskToGroups(mask);
  let tokenIndex = 0;
  let groupIndex = 0;
  let result = [];
  let splitStrings = options.splitStrings ?? false;
  let safe = options.safe ?? true;

  function processMask() {
    return lines.map(groups => {
      let lineResult = [];
      let offset = 0;
      if (tokenIndex >= tokens.length)
        return;
      groups.forEach((group, i) => {
        let groupWidth = group[0].length;
        let isBeforeNewline = (i == groups.length-1);
        if (group.index < offset) {
          // Happens when we overflow preceeding groups
          // In this case we should shrink current group
          // or skip it entirely
          groupWidth -= (offset - group.index);
          if (groupWidth <= 0)
            return;
        }

        let groupTokens = takeTokens(tokens, groupWidth, tokenIndex,
          {isBeforeNewline, safe, splitStrings});

        // TODO: remove dummy space tokens
        let groupTokensJustified = justify(groupTokens, groupWidth);
        let padding = " ".repeat(Math.max(0, group.index - offset));
        offset += padding.length + groupTokensJustified.length;
        tokenIndex += groupTokens.length;
        lineResult.push(padding);
        lineResult.push(groupTokensJustified);
      });
      return lineResult.join("");
    });
  }

  do {
    result = result.concat(processMask());
  } while (tokenIndex < tokens.length && options.repeat);


  // Add remaining tokens if mask is shorter than code
  let remainder = tokens.slice(tokenIndex).join("");
  result.push(remainder);
  //let resultStr = result.join("\n") // TODO .trimEnd(); ???
  let resultStr = result.join("\n").trimEnd();

  return resultStr;
}

function tokenize(code)
{
  const tokens = esprima.tokenize(code);
  let result = [];
  const isPunct = (token) => token.type == "Punctuator";
  const isString = (token) => token.type == "String";

  for (var i = 0; i < tokens.length - 1; i++) {
    let t1 = tokens[i];
    let t2 = tokens[i + 1];

    result.push(t1.value);

    if (needSpace(t1, t2))
      result.push(" ");
  }

  if (tokens.length > 0)
    result.push(tokens.at(-1).value);

  return result;
}

/**
 * Splits string literal in concatenation of two literals.
 */
function splitStringLiteral(str, size, options)
{
  options = options || {};
  if (str.length < size + 3)
    return [str];

  // TODO: check for escapes
  size = size || 5;
  let quote = str[0];
  str = str.slice(1, -1);  // remove quotes
  let result = [
    quote + str.slice(0, size) + quote,
    '+',
    quote + str.slice(size) + quote,
  ]

  if (options.safe) {
    result.unshift('(');
    result.push(')')
  }

  return result;
}

function needSpace(token1, token2)
{
    // we don't need space between non-punct and punct
    // we need space in all other cases
    /**
    let noSpace = ((isPunct(t1) && !isPunct(t2)) ||
                   (isPunct(t2) && !isPunct(t1)));
    let needSpace = ((isPunct(t1) && isPunct(t2)) ||
                     (!isPunct(t1) && !isPunct(t2)));
    **/

    // This is an easy (but slow) way to ensure we don't break tokenization
    // by not inserting space between tokens.
    // If it's too slow, replace with a bunch of rules like in harnocode v1
    try {
      let tokens = esprima.tokenize(token1.value + token2.value);
      // TODO: tokenization should not change tokens
      if (tokens.length != 2) return true;
      if (tokens[0].value != token1.value) return true;
      if (tokens[1].value != token2.value) return true;
    } catch (error) {
      return true;
    }
  return false;
}

function validate(code1, code2)
{
  try  {
    var original = escodegen.generate(esprima.parse(code1));
    var harnified = escodegen.generate(esprima.parse(code2));
  } catch (error) {
    process.stderr.write(`Error parsing harnified code: \n  ${error}`);
    return false;
  }

  if (original != harnified) {
    process.stderr.write(`Broken AST!`);
    const LineDiff = require("line-diff");
    process.stderr.write(new LineDiff(original, harnified).toString());
    return false;
  }

  return true;
}



function splitMaskToGroups(mask) {
  if (mask.trim().length == 0)
    return [];
  return mask.split("\n").map(splitLineToGroups);
}


function splitLineToGroups(line) {
  return [...line.matchAll(/x+/g)];
}


function takeTokens(tokens, groupLength, tokenIndex, options)
{
  options = options ?? {};
  let isBeforeNewline = options.isBeforeNewline ?? false;
  let splitStrings = options.splitStrings ?? true;
  let safe = options.safe ?? false;
  let toTake = [];
  let toTakeLength = 0;
  let specialTokens = ["var", "do", "while", "continue", "break", "return", "throw"];
  const isStringLiteral = (s) => (s.startsWith("'") && s.endsWith("'"));
  const isLongStringLiteral = (s) => isStringLiteral(s) && s.length >= 10;

  while (tokenIndex < tokens.length) {
    let token = tokens[tokenIndex];
    let canTake = (toTakeLength + token.length) <= groupLength;
    if (toTakeLength == 0)
      canTake = true;
    let toTakeNext = canTake? 1 : 0;

    if (isBeforeNewline && !canTake) {
      // prevent inserting newline after special tokens as it may affect AST
      if (specialTokens.includes(toTake.at(-1)))
        toTakeNext = 1;
      if (specialTokens.includes(toTake.at(-2))) // because of dummy space tokens
        toTakeNext = 1;

      // Can't start newline with the following tokens (TODO more? refactor!)
      if (["++", "--"].includes(tokens.at(tokenIndex + 0)))
        toTakeNext = 1;
      if (["++", "--"].includes(tokens.at(tokenIndex + 1)))
        toTakeNext = 2;
      if (["++", "--"].includes(tokens.at(tokenIndex + 2)))
        toTakeNext = 3;
    }

    // If we haven't reach the desired group width yet
    // and we're about to discard a long string literal,
    // don't do it. Take the string literal and split it later.
    if (!toTakeNext && splitStrings) {
      const underflow = groupLength - toTakeLength;
      if (underflow > 5 && isLongStringLiteral(token))
        toTakeNext = 1;
    }

    if (!toTakeNext)
      break;

    while (toTakeNext) {
      toTake.push(tokens[tokenIndex]);
      toTakeLength += tokens[tokenIndex].length;
      tokenIndex += 1;
      toTakeNext -= 1;
    }
  }

  // If the group ends with a long dangling string literal, split it
  const lastToken = toTake.at(-1);
  const overflow = toTakeLength - groupLength;
  if (splitStrings && overflow > 5 && isStringLiteral(lastToken) && lastToken.length > 5) {
    let splitSize = lastToken.length - overflow - 1 - 2; // account for quotes and '('
    splitSize = Math.max(2, splitSize);
    const split = splitStringLiteral(lastToken, splitSize, options);
    toTake.splice(-1, 1, ...split.slice(0, 2));
    tokens.splice(tokenIndex - 1, 1, ...split);
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

  let result = tokens.map((token, i) => token + " ".repeat(Math.max(0, toInsertAfter[i])));
  return result.join("");
}


exports.formatFile = function (path, mask, options) {
  var program = fs.readFileSync(path).toString();
  var rest = "";

  if (options.bryntum) {
    options['skip-validation'] = true;
    let index = program.indexOf(';');
    rest = program.slice(index);
    program = program.slice(0, index);
  }

  let result = exports.harnocode(program, mask, options);

  if (!options['skip-validation'])
    if (!validate(program, result))
      process.exit(1);

  if (options.bryntum) {
    result = result + "\n" + rest;
  }

  process.stdout.write(result);
}
