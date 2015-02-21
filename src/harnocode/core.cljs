(ns ^:figwheel-always harnocode.core
  (:require [goog.dom :as dom]
            [goog.events :as events]
            [goog.object :as obj]
            [clojure.string :as string]
            [figwheel.client :as fw]))

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

;; Best try on filling "column" of l subsequent ones with one or more tokens
(defn fill-column [ts l]
  [(first ts) (rest ts)])

(defn fill-group [[result tokens] group]
  (if (== (first group) 0)
    [(string/join result (repeat (count group) "_")) tokens]
    (let [[column rest-ts] (fill-column tokens (count group))]
      [(string/join result column) rest-ts])))

(defn arrange-tokens-line [ts line]
  (let [groups (partition-by identity line)]
    (first (reduce fill-group ["" ts] groups))))

(defn arrange-tokens [ts img]
  (map #(arrange-tokens-line ts %) img))


;; Tries hard to make piece of code look like img
;; code -- string
;; img  -- 2d matrix of 0's and 1's
;; w    -- int, width of output, in chars
(defn harnify [code img w]
  (let [tokens (js->clj (js/esprima.tokenize code) :keywordize-keys true)
        ts (map :value tokens)]
    (comment apply str (interleave ts (repeat " ")))
    (string/join "\n" (arrange-tokens ts img))              ; img must be resized by now, no need in w
    ))


(let [code "var answer = 42;"
      img [[0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
           [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
           [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
           [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
           [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
           [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
           [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
           [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
           [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]]
      width (count (first img))
      harnocode (harnify code img width)]
  (show-harnocode! harnocode))



(fw/start {
           :load-warninged-code true
           })

(defn get-pixels [context canvas]
  (let [w (.-width canvas)
        h (.-height canvas)
        img-data (.getImageData context 0 0 w h)
        pixels (.-data img-data)
        result (atom [])]
    (obj/forEach pixels
                 (fn [val]
                   (swap! result conj val)))
    @result))

(defn black-and-white [context canvas]
  (let [pixels (get-pixels context canvas)
        greyscale (fn[r g b alpha](
                             (let [grey (+ (* r 0.3) (* g 0.59) (* b 0.11))]
                               (if (> grey (/ 255 2)) 255 0))))]
    ;; TODO
    (reduce greyscale [] pixels)))


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

