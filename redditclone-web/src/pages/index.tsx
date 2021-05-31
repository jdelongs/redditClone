import React from "react"
import { Navbar } from "../components/NavBar"
import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../utils/createUrqlClient"
import { usePostsQuery } from "../generated/graphql"
import { Layout } from "../components/Layout"
import { Link } from "@chakra-ui/react"
import NextLink from "next/link"

const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  })
  return (
    <Layout>
      <NextLink href='/create-post'>
        <Link>create post</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
