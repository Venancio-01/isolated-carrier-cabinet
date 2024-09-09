#!/bin/bash

# 编译 TypeScript 代码
npx tsc

# 复制 config 文件
cp config.json dist/config.json

# 运行编译后的 JavaScript 代码
node dist/index.js



