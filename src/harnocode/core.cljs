(ns ^:figwheel-always harnocode.core
    (:require [goog.dom :as dom]))

(enable-console-print!)

;; define your app data so that it doesn't get over-written on reload

(defonce app-state (atom {:text "Hello world!"}))

(defn show-harnocode! [harnocode]
  (let [output-area (dom/getElement "output")]
    (set! (.-value output-area) harnocode)))

;; Tries hard to make piece of code look like img
;; code -- string
;; img  -- 2d matrix of 0's and 1's
;; w    -- int, width of output, in chars
(defn harnify [code img w]
  (let [tokens (js->clj (js/esprima.tokenize code) :keywordize-keys true)
        ts     (map :value tokens)]
    (println tokens)
    (println "Tokens:" ts)
    (apply str (interleave ts (repeat " ")))))
  

(let [code      "var answer = 42;"
      img       ()
      width     80
      harnocode (harnify code img width)]
  (show-harnocode! harnocode))
