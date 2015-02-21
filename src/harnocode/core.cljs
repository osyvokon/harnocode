(ns ^:figwheel-always harnocode.core
  (:require [goog.dom :as dom]
            [goog.events :as events]
            [clojure.string :as string]
            [figwheel.client :as fw]))

;; TODO: make spacing more even
(enable-console-print!)

(defn to-clj-array [js-col]
  (-> (clj->js [])
      (.-slice)
      (.call js-col)
      (js->clj)))

;; define your app data so that it doesn't get over-written on reload

(defonce app-state (atom {:text "Hello world!"}))

(defn show-harnocode! [harnocode]
  (let [output-area (dom/getElement "output")]
    (when output-area (set! (.-value output-area) harnocode))))

;; Ugly, but have no time to find a better way
(defn insert [v pos item] 
  (let [[h t] (split-at pos v)]
    (vec (concat h [item] t))))

;; Insert spaces between terms so they occupy exactly l chars
;; TODO: make spacing more even
(defn insert-spaces [terms l]
  (let [terms-interleaved (butlast (interleave terms (cycle " "))) ;; TODO: need better interleave that would work as string.join (without last space)
        spaces-needed (- l (apply + (map count terms-interleaved)))
        f (fn [terms _] (insert terms (inc (rand-int (- (count terms) 1))) " "))]
    (string/join (reduce f terms-interleaved (range spaces-needed)))))

;; Best try on filling "column" of l subsequent ones with one or more tokens
(defn fill-column [ts l]
  (let [f (fn [terms-so-far term]
            (if (>= (apply + (map #(+ 1 (count %)) terms-so-far)) l)
              (reduced terms-so-far)
              (conj terms-so-far term)))
        terms-that-fit (reduce f [(first ts)] (rest ts))
        ts-rest (drop (count terms-that-fit) ts)]
   [(insert-spaces terms-that-fit l) ts-rest]))


(defmulti fill-group
  (fn [[result tokens] group]
    (first group)))

(defmethod fill-group 0 [[result tokens] group]
  [(conj result (string/join (repeat (count group) " "))) tokens])

(defmethod fill-group 1 [[result tokens] group]
      (let [[column rest-ts] (fill-column tokens (count group))]
        [(conj result column) rest-ts]))

(defn arrange-tokens-line [ts line]
  (let [groups (partition-by identity line)
        [this-line-tokens ts-rest] (reduce fill-group [[] ts] groups)]
    [(string/join this-line-tokens) ts-rest]))

(defn arrange-tokens [ts img]
  (if (empty? img)
    []
    (let [[line ts-rest] (arrange-tokens-line ts (first img))]
      (conj (arrange-tokens ts-rest (rest img)) line))))


;; Tries hard to make piece of code look like img
;; code -- string
;; img  -- 2d matrix of 0's and 1's
;; w    -- int, width of output, in chars
(defn harnify [code img w]
  (let [tokens (js->clj (js/esprima.tokenize code) :keywordize-keys true)
        ts (map :value tokens)]
    (comment apply str (interleave ts (repeat " ")))
    (string/join "\n" (reverse (arrange-tokens ts img)))              ; img must be resized by now, no need in w
    ))
    

(let [code      "function skipComment() {
        var ch, start;

        start = (index === 0);
        while (index < length) {
            ch = source.charCodeAt(index);

            if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                start = true;
            } else if (ch === 0x2F) { // U+002F is '/'
                ch = source.charCodeAt(index + 1);
                if (ch === 0x2F) {
                    ++index;
                    ++index;
                    skipSingleLineComment(2);
                    start = true;
                } else if (ch === 0x2A) {  // U+002A is '*'
                    ++index;
                    ++index;
                    skipMultiLineComment();
                } else {
                    break;
                }
            } else if (start && ch === 0x2D) { // U+002D is '-'
                // U+003E is '>'
                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
                    // '-->' is a single-line comment
                    index += 3;
                    skipSingleLineComment(3);
                } else {
                    break;
                }
            } else if (ch === 0x3C) { // U+003C is '<'
                if (source.slice(index + 1, index + 4) === '!--') {
                    ++index; // `<`
                    ++index; // `!`
                    ++index; // `-`
                    ++index; // `-`
                    skipSingleLineComment(4);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }"
      img       [[0 0 0 0 0 0 0 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]]
      width     (count (first img))
      harnocode (harnify code img width)]
  (show-harnocode! harnocode))



(fw/start {
           :load-warninged-code true
           })

;document.getElementById('pixels').innerHTML = '';
;                                               var image = new Image();
;image.src = reader.result;
;image.onload = function() {
;                           canvas.width = image.width;
;                                          canvas.height = image.height;
;                           context.drawImage(image, 0, 0);
;                           var pixels = blackAndWhite(context, canvas);
;                                                     var s = '';
;                                                              for (var i = 0; i < pixels.length; i++) {
;                                                                       var row = pixels[i];
;                                                                       for (var j = 0; j < row.length; j++) {
;                                                                                var symbol = row[j];
;                                                                                s += (symbol == 1 ? symbol: "&nbsp;&nbsp;");
;                           }
;s += '<br/>';
;
;document.getElementById('pixels').innerHTML = s;

(defn black-and-white [context canvas]
  [])

(defn on-image-load [event]
  (let [image (.-target event)
        canvas (dom/getElement "viewport")
        context (.getContext canvas "2d")]
    (set! (.-width canvas) (.-width image))
    (set! (.-height canvas) (.-height image))
    (.drawImage context image 0 0)
    (let [pixels (black-and-white context canvas)]
      (print pixels))
    )
  )

(defn on-reader-load [event]
  (let [pixels-div (dom/getElement "pixels")
        image (js/Image.)
        src (.-result (.-target event))]
    (events/listen image (.-LOAD events/EventType) on-image-load)
    (set! (.-src image) src)
    (set! (.-innerHTML pixels-div) "")
    )
  (print "onreaderload")
  )

(defn handle-files [event]
  {:pre [(not (nil? (.-files (.-target event))))]}
  (let [f (nth (to-clj-array (.-files (.-target event))) 0)
        reader (js/FileReader.)]
    (set! (.-onloadend reader) on-reader-load)
    (.readAsDataURL reader f))
  )

(defn on-dom-loaded []
  (let [file-upload (dom/getElement "fileInput")]
    (when file-upload
      (print file-upload)
      (events/listen file-upload "change" handle-files)))
  (print "domready"))

(def w (dom/getWindow))
(events/listen w (.-DOMCONTENTLOADED events/EventType) on-dom-loaded)

