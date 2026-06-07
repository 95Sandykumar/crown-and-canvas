// Crown & Canvas — Instagram post queue helpers.
//
// Pure, immutable helpers over content/instagram-queue.json. Mirrors the
// pickNextBrief/markPublished pattern from the blog content engine
// (docs/superpowers/plans/2026-06-05-phase2-auto-content-engine.md), kept in
// plain .mjs here so the worker scripts can share it without a build step.

import { readFileSync, writeFileSync } from "node:fs";

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} category
 * @property {string} question
 * @property {string} answer
 * @property {string} hook
 * @property {string} cta
 * @property {string} image
 * @property {"pending"|"posted"} status
 * @property {string|null} postedAt
 */

/** @param {string} path @returns {{posts: Post[]}} */
export function readQueue(path) {
  const parsed = JSON.parse(readFileSync(path, "utf-8"));
  if (!parsed || !Array.isArray(parsed.posts)) {
    throw new Error(`Invalid Instagram queue at ${path}`);
  }
  return parsed;
}

/** @param {string} path @param {{posts: Post[]}} queue */
export function writeQueue(path, queue) {
  writeFileSync(path, JSON.stringify(queue, null, 2) + "\n", "utf-8");
}

/** First pending post, or null if none remain. @param {readonly Post[]} posts */
export function pickNextPending(posts) {
  return posts.find((p) => p.status === "pending") ?? null;
}

/** New array with the matching post flipped to posted (immutable). */
export function markPosted(posts, id, postedAt = new Date().toISOString()) {
  return posts.map((p) =>
    p.id === id ? { ...p, status: "posted", postedAt } : p
  );
}

/** @param {readonly Post[]} posts */
export function pendingCount(posts) {
  return posts.filter((p) => p.status === "pending").length;
}
