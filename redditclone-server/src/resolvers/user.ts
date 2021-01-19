import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}
@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => User, { nullable: true })
    user?: User
}


// Get the current user logged in
@Resolver()
export class UserResolver {

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, em }: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }
        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }

    // Register a user
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req, em }: MyContext
    ): Promise<UserResponse> {

        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username cannot be empty or less than 2 charachers long'
                }]
            };
        }

        if (options.password.length <= 3) {
            return {
                errors: [{
                    field: 'username',
                    message: 'password cannot be empty or less than 3 charachers long'
                }]
            };
        }

        // hashed password
        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username,
            password: hashedPassword
        });
        try {
            await em.persistAndFlush(user);
        } catch (err) {
            if (err.code === '23505') {
                //duplicate username error
                return {
                    errors: [{ field: 'username', message: 'username already exists!' }]
                }
            }
        }

        // sets cookie for the user logged in
        req.session.userId = user.id;
        return { user };
    }

    // User Login
    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {

        //username validation
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: "username does not exist"
                }]
            }
        }

        // password validation
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "username or password is incorrect"
                    }
                ]
            }
        }

        //logins the user
        req.session.userId = user.id;

        return {
            user,
        };
    }
}