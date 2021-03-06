import React from "react"
import { Navbar } from "../components/NavBar"
import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../utils/createUrqlClient"
import { usePostsQuery } from "../generated/graphql"

const Index = () => {
  const [{ data }] = usePostsQuery()
  return (
    <>
      <Navbar />
      <div>hellooo world</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
