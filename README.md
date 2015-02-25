Harnocode (Гарнокод)
====================

Reformats (and rewrites) javascript code to look like beautiful ASCII-art
picture.

Great thing about it is that code stays fully valid and functional after the
transformation.


### How it works:

1. You upload _your_ javascript code (preferrably minified, but non-minified is okay too).
2. You upload _your_ favorite image -- not too big and icon-like images work the best.
3. You get back beautifully looking code (**harnocode**!).  It remains valid
   and functional, so go ahead and deploy it!  


### Examples:

I took jquery.min.js and formatted it as these pictures:

* [Hearty jQuery](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/jquery-01.js)
* [Ukrainian partiotic jQuery](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/jquery-02.js)
* [Apple's fan jQuery](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/jquery-05.js)
* [陰陽 jQuery](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/jquery-03.js)
* [Revolution jQuery](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/jquery-04.js)
* [PTN HCK OFF jQuery](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/jquery-06.js)


TODO: Examples above are not functional jquery, because I trimmed long tail
that I though would be boring and wasteful to store.  However, now I think that
it would be much better to include fully functional harnocoded jquery.
Now comes the actual TODO: re-do examples.

### Building and developing

```sh

    $ lein bower install
    $ lein figwheel
```

Project now served at http://localhost:3449/ 

If you want to see it in action but don't want to install Clojure/ClojureScript
stack, wait a little -- hosted version is on the way.


### About

**Harnocode** was written in 24 hours on DOU Hackathon, held on 21-22 Feb 2015
in Kyiv, Ukraine.  It grabbed a prize there.

Though hackathon is over, I'm planning to add more cool features, and there
will be hosted version soon, so stay tuned! 

