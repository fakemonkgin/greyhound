const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
app.use(express.json()); // 解析 JSON 请求体

// 使用 multer 进行文件上传处理
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 上传文件并存储在 Greyhound 的 contracts 文件夹
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileNames = [];

    // 确保 contracts 文件夹存在
    const contractsDir = path.join(__dirname, 'contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    // 将文件保存到 Greyhound 的 contracts 文件夹
    files.forEach(file => {
      const filePath = path.join(contractsDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer); // 将文件写入 contracts 文件夹
      fileNames.push(file.originalname);
    });

    // 将文件名写入 scope.example.txt 文件
    const scopeFilePath = path.join(contractsDir, 'scope.example.txt');
    fs.writeFileSync(scopeFilePath, fileNames.join('\n')); // 写入文件名到 scope.example.txt

    // 调用原有的 analyze 脚本
    await new Promise((resolve, reject) => {
      exec('yarn analyze contracts scope.example.txt', (error, stdout, stderr) => {
        if (error) {
          console.error('Audit error:', stderr);
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
    console.error('Error processing files:', error);
    return res.status(500).json({ message: 'Error processing files', error: error.toString() });
  }
});

// 启动服务器并监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Greyhound API is running on port ${PORT}`);
});
