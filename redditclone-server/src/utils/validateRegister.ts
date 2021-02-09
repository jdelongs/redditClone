import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

 export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'email is invalid'
            }
        ]

    }

    if (options.username.length <= 2) {
        return  [
            {
                field: 'username',
                message: 'username cannot be empty or less than 2 characters long'
            }
        ]
    }

    if (options.username.includes('@')) {
        return  [
            {
                field: 'username',
                message: 'username cannot contain an @ symbol'
            }
        ]
    }

    if (options.password.length <= 3) {
        return  [
            {
                field: 'password',
                message: 'password cannot be empty or less than 3 characters long'
            }
        ]

    }

    return null;
 }