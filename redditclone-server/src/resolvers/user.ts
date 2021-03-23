import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql'; 
import { COOKIE_NAME } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';

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

    @Mutation(() => Boolean)
    async forgotPassword(
        //@ts-ignore
        @Arg('email') email: string, 
        //@ts-ignore
        @Ctx() {em} : MyContext
    ) {
        //const user = await em.findOne(User, { email}); 
        return true
    }

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
        const errors = validateRegister(options);
        if(errors) {
            return {errors};
        }
        // hashed password
        const hashedPassword = await argon2.hash(options.password);
        let user; 
        try {
            const result = await (em as EntityManager)
                .createQueryBuilder(User)
                .getKnexQuery()
                .insert(
                {
                    username: options.username,
                    email: options.email,
                    password: hashedPassword, 
                    created_at: new Date(), 
                    updated_at: new Date()
                })
                .returning("*"); 
            user = result[0]
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
        @Arg('usernameOrEmail') userNameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {

        //username validations
        const user = await em.findOne(User, 
            userNameOrEmail.includes('@') ? 
            {email: userNameOrEmail} : 
            {username: userNameOrEmail});
        if (!user) {
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: "username does not exist"
                }]
            }
        }

        // password validation
        const valid = await argon2.verify(user.password, password);
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

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
     return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);

          return;
        }

        return resolve(true);
      })
    );
  }
}