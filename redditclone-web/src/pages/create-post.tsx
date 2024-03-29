import { Box, Button } from "@chakra-ui/react"
import { Formik, Form } from "formik"
import React from "react"
import { InputField } from "../components/InputField"
import { useCreatePostMutation } from "../generated/graphql"
import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../utils/createUrqlClient"
import { Layout } from "../components/Layout"
import { useIsAuth } from "../utils/useIsAuth"
import { useRouter } from "next/router"
const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter()
  useIsAuth()
  const [, createPost] = useCreatePostMutation()
  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values })
          console.log("error: ", error)
          if (!error) {
            router.push("/")
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name='title' placeholder='title' label='Title' />
            <Box mt={4}>
              <InputField
                textarea
                name='text'
                placeholder='text...'
                label='Body'
              />
            </Box>
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              colorScheme='teal'
            >
              create post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient)(CreatePost)
