const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(express.json()); // 解析 JSON 请求体

// 上传文件并启动分析
app.post('/api/analyze', async (req, res) => {
  try {
    const { fileNames } = req.body;
    
    if (!fileNames || fileNames.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    // 将文件名写入 scope.example.txt 文件
    const scopeFilePath = path.join(__dirname, 'contracts', 'scope.example.txt');
    fs.writeFileSync(scopeFilePath, fileNames.join('\n'));

    // 调用原有的 analyze 脚本
    await new Promise((resolve, reject) => {
      exec('yarn analyze contracts scope.example.txt', (error, stdout, stderr) => {
        if (error) {
          return reject(`Audit error: ${stderr}`);
        }
        resolve(stdout);
      });
    });

    // 检查是否生成了审计报告
    const reportPath = path.join(__dirname, 'report.md');
    if (fs.existsSync(reportPath)) {
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      return res.status(200).json({ report: reportContent });
    } else {
      return res.status(500).json({ message: 'Audit failed to generate report' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error processing audit', error: error.toString() });
  }
});

// 启动服务器并监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Greyhound API is running on port ${PORT}`);
});
