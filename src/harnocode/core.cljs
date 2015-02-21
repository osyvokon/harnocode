(ns ^:figwheel-always harnocode.core
  (:require [goog.dom :as dom]
            [goog.events :as events]
            [goog.object :as obj]
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
    

(let [code      "var a = 42; var b = 'hello';"
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

