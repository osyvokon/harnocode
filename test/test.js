var rewire = require('rewire');
var assert = require('assert');
var { harnocode, __get__ } = rewire('../harnocode.js');

describe('harnocode', function() {
  describe('#harnocode()', function() {
    it('should return the code unchanged when no mask is given', function() {
      const code = "console.log('Hello!');";
      const mask = "";
      assert.equal(harnocode(code, mask), code);
    });

    it('should format code according to the given mask', function() {
      const code = "console.log('Hello!');";
      const mask = `\
xxxxxx
x  xxx
xxxxxxxxx
x    x`;
      const expected = `\
console
.  log
('Hello!'
)    ;
`;
      assert.equal(harnocode(code, mask), expected);
    });

  });

  describe("#takeTokens()", function() {
    const takeTokens = __get__("takeTokens");
    let tokens = ["console", ".", "log"];

    // The following group can fit two tokens fully:
    //             console.log
    let groupLength = "console.lo".length;
    let tokenIndex = 0;
    it("should stop taking tokens before their length exceed group's length", () => {
      let groupTokens = takeTokens(tokens, groupLength, tokenIndex);
      assert.deepEqual(groupTokens, ["console", "."]);
    });

    it("should take at least one token per group", () => {
      let groupLength = 1;
      let groupTokens = takeTokens(tokens, groupLength, tokenIndex);
      assert.deepEqual(groupTokens, ["console"]);
    });

    it("should start from given tokenIndex", () => {
      let tokenIndex = 1;
      let groupTokens = takeTokens(tokens, groupLength, tokenIndex);
      assert.deepEqual(groupTokens, [".", "log"]);
    });
  });

  describe("#justify()", function() {
    const justify = __get__("justify");
    it("should add spaces evenly", () => {
      let tokens = ["a", "b", "c"];
      let width = 10;
      let result = justify(tokens, width);
      assert.equal(result.length, width);
      assert.equal(result, "a   b    c");
    });
    it("should handle empty input correctly", () => {
      let tokens = [];
      let width = 3;
      assert.equal(justify(tokens, width), "   ");
    });
  });
});



/*
 * Mask: 6 1 (2) 3 6 1 (4) 1
 * Code: 7 * 1 * 3 1 8 1 1
 *
 * Add to group
 * Start new group
 * Pad group
 *
 *
 * for each group in groups:
 *  tokens = take tokens so that len(tokens) <= len(group)
 *  if not tokens:
 *      tokens = first token
 *  distribute tokens in group justified
 *  move to the next group that is not yet covered
 *
 */
