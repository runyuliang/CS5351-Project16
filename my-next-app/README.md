## Step 1: Install Node.js and Docker
Node.js: https://nodejs.org/en/download

Docker: https://www.docker.com/

After the installation is complete, execute the following commands in the command line:
```bash
node -v
docker -v
```
You should see:
- `v22.19.0` 
- `Docker version 28.4.0, build d8eb465`

## Step 2: Setup and Launch the Application

```bash
docker-compose up -d   # Start the database
npx prisma migrate dev # Update the database
npm run dev            # Run Next.js
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
