const { exec } = require('child_process');
const fs = require('fs').promises;

async function build() {
  try {
    // 编译 TypeScript 代码
    await runCommand('npx tsc');

    // 复制 config 文件
    await fs.copyFile('config.json', 'dist/config.json');

    console.log('构建和运行成功完成');
  } catch (error) {
    console.error('构建过程中出错:', error);
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行命令时出错: ${error}`);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
}

build();
