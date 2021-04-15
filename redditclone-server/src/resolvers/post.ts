import { Post } from '../entities/Post';
import { Arg, Query, Resolver, Mutation, InputType, Field, Ctx, UseMiddleware } from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';

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
   async posts(): Promise<Post[]> {
        return Post.find();
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

