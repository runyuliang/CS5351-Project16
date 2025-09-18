FROM node:18-alpine
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制项目文件
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD npx prisma migrate deploy && npm run dev
