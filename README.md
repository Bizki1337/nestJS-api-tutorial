# NestJs REST API tutorial


### Run the API in development mode
```javascript
npm run // install
npm run db:dev:restart // start postgres in docker and push migrations
npm run start:dev // start api in dev mode
```

### .env file
```env
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public"
JWT_SECRET="nestjs-api-tutorial-secret"
```
