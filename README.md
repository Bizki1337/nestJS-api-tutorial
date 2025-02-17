# NestJs REST API tutorial


### Run the API in development mode
```javascript
yarn // install
yarn db:dev:restart // start postgres in docker and push migrations
yarn start:dev // start api in dev mode
```

### .env file
```env
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public"
JWT_SECRET="nestjs-api-tutorial-secret"
```
