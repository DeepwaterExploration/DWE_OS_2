#!/bin/bash

build_frontend() {
  npm install typescript
  # Run TypeScript compiler
  npx tsc
  # Run Vite build
  npx vite build
}

build_frontend
