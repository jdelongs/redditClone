import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Redis } from 'ioredis';
import { Request, Response } from 'express';
export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    req: Request & { session: Express.Session };
    redis: Redis;
    res: Response;
}