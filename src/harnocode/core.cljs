(ns ^:figwheel-always harnocode.core
    (:require [goog.dom :as dom]
              [clojure.string :as string]))

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
    (comment apply str (interleave ts (repeat " ")))
    (arrange-tokens ts img)         ; img must be resized by now, no need in w
    ))

(defn arrange-tokens [ts img]
  (arrange-tokens-line ts (first img)))

(defn arrange-tokens-line [ts line]
  (let [groups (partition-by identity line)]
    (reductions
      (fn [group tokens]
        (string/join (if (== (first group) 0)
                       (repeat (count group) " ")
                       (repeat (count group) " "))))
      ts groups)))

(let [code      "var answer = 42;"
      img       [[0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]
                 [0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1]]
      width     (count (first img))
      harnocode (harnify code img width)]
  (show-harnocode! harnocode))
