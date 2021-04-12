import { Box, Flex, Link, Button } from "@chakra-ui/react"
import { Form, Formik } from "formik"
import router from "next/router"
import React, { useState } from "react"
import { InputField } from "../components/InputField"
import { Wrapper } from "../components/Wrapper"
import { toErrorMap } from "../utils/toErrorMap"
import login from "./login"

import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../utils/createUrqlClient"
import { useForgotPasswordMutation } from "../generated/graphql"

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false)
  const [, forgotPassword] = useForgotPasswordMutation()
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values, { setErrors }) => {
          await forgotPassword(values)
          setComplete(true)
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box> Check your Email!</Box>
          ) : (
            <Form>
              <InputField name='email' placeholder='email' label='Email' />
              <Button
                mt={4}
                type='submit'
                isLoading={isSubmitting}
                colorScheme='teal'
              >
                Submit
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)
