ALL = harnocode.dna.js harnocode.heart.js harnocode.ubuntu.js harnocode.apple.js harnocode.ukraine.js harnocode.yin-yang.js

all: $(ALL)

clean:
	rm -rf $(ALL)

harnocode.dna.js:
	harnocode --mask ../masks/dna.txt --repeat --split-long-strings --skip-validation ../harnocode.js > $@

harnocode.heart.js:
	harnocode --mask ../masks/heart.txt ../harnocode.js > $@

harnocode.ubuntu.js:
	harnocode --mask ../masks/ubuntu.txt --repeat ../harnocode.js > $@

harnocode.apple.js:
	harnocode --mask ../masks/apple.txt ../harnocode.js > $@

harnocode.ukraine.js:
	harnocode --mask ../masks/ukraine.txt --split-long-strings --skip-validation ../harnocode.js > $@

harnocode.yin-yang.js:
	harnocode --mask ../masks/yin-yang.txt ../harnocode.js > $@
