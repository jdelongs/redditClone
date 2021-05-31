import 'reflect-metadata';
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis'
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import {createConnection} from 'typeorm'; 
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from "path"; 
const main = async () => {
    //TYPEORM
    const connectTypeorm = await createConnection({
        type: 'postgres', 
        database: 'redditClone2', 
        username: 'postgres', 
        password: '1234', 
        logging: true, 
        synchronize: true, 
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User]
    });  
    await connectTypeorm.runMigrations(); 
    //express
    const app = express();

    //REDIS
    const RedisStore = connectRedis(session);
    const redis = new Redis();

    redis.on("error", function (error) {
        console.error("Redis Error: ", error)
    });

    app.use(cors({
        origin: 'http://localhost:3000', 
        credentials: true
    })); 

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis as any,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__ //cookie only works in https
            },
            saveUninitialized: false,
            secret: "dsadfsadfasdfs",
            resave: false
        })
    )

    //Apollo graphql Setup
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({req, res, redis}),
    });

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(3001, () => {
        console.log('server has started on port 3001');
    })
}

main().catch(err => {
    console.error(err);
});


