(ns ^:figwheel-always harnocode.core
    (:require [goog.dom :as dom]))

(enable-console-print!)

(println "edits to this text should show up in your developer console.")

;; define your app data so that it doesn't get over-written on reload

(defonce app-state (atom {:text "Hello world!"}))

(defn show-harnocode! [harnocode]
  (let [output-area (dom/getElement "output")]
    (set! (.-value output-area) harnocode)))

(let [code "var answer = 42;"
      harnocode (js/esprima.tokenize code)]
  (println harnocode)
  (show-harnocode! harnocode))



