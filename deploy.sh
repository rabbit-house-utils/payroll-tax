#!/bin/bash

# 构建项目
echo "Building project..."
npm run build

# 进入构建目录
cd dist

# 创建CNAME文件用于自定义域名
echo "payroll-tax.rabbit-house.cafe" > CNAME

# 初始化git仓库
git init
git add -A
git commit -m "Deploy to GitHub Pages"

# 推送到gh-pages分支
# 请先在GitHub创建仓库，然后替换下面的仓库地址
# git push -f git@github.com:rabbit-house-utils/payroll-tax.git main:gh-pages

echo "Build completed!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub repository (can be private)"
echo "2. Uncomment and update the git push command above with your repo URL"
echo "3. Run this script again to deploy"
echo "4. In GitHub repo settings, enable GitHub Pages from gh-pages branch"
echo "5. Configure your DNS to point payroll-tax.rabbit-house.cafe to GitHub Pages"

cd ..
