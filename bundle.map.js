{
  "version": 3,
  "sources": [
    "../../../../../usr/local/lib/node_modules/browserify/node_modules/browser-pack/_prelude.js",
    "main.js"
  ],
  "names": [],
  "mappings": "AAAA;ACAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA",
  "file": "generated.js",
  "sourceRoot": "",
  "sourcesContent": [
    "(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})",
    "\"use strict\";\n\nvar text = \"Injected from Javascript\";\n\ndocument.getElementById('response').innerHTML = text;\n\n\n"
  ]
}