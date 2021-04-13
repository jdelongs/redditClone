import { Redis } from 'ioredis';
import { Request, Response} from 'express';
export type MyContext = {
    req: Request & { session: {userId: number } };
    redis: Redis;
    res: Response;
}