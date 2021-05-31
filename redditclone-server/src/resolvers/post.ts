import { Post } from '../entities/Post';
import { Arg, Query, Resolver, Mutation, InputType, Field, Ctx, UseMiddleware, Int } from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';

@InputType() 

class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}

@Resolver()
export class PostResolver {

    // GET ALL POSTS
   @Query(() => [Post])
   async posts(
       @Arg("limit", () => Int, {defaultValue: null}) limit: number, 
       @Arg("cursor", () => String, {nullable: true}) cursor: string | null
   ): Promise<Post[]> {

        const realLimit = Math.min(50, limit);  
        const qb = getConnection()
                .getRepository(Post)
                .createQueryBuilder("p")
                .orderBy('"createdAt"', "DESC")
                .limit(realLimit)
    
        if (cursor) {
            qb.where('"createdAt" <= :cursor', {
            cursor: new Date(parseInt(cursor)),  
         }); 
        }

        return qb.getMany(); 
    }


    // GET ONE POST
    @Query(() => Post, { nullable: true })
    post(
        @Arg("id") id: number
    ): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    // CREATE A POST
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput, 
        @Ctx() { req }: MyContext
        ): Promise<Post> { 
        return Post.create({
            ...input,
            creatorId: req.session.userId, 
        }).save();
    }

    // UPDATE POST
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
    ): Promise<Post | null> {
        const post = await Post.findOne({where: {id}});
        if (!post) {
            return null; 
        }
        if (typeof title != 'undefined') {
            await Post.update({id}, {title})
        }
        return post;
    }


    // DELETE POST
    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number
    ): Promise<boolean> {
        await Post.delete(id);
        return true; 
    }
}

