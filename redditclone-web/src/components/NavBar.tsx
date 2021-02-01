import { Box, Link, Flex, Button } from "@chakra-ui/react"
import NextLink from "next/link"
import { useMeQuery } from "../generated/graphql"

interface NavBarProps {}

export const Navbar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery()
  let body = null

  // loading data
  if (fetching) {
  } else if (!data?.me) {
    //user not logged in check
    body = (
      <>
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link>Register</Link>
        </NextLink>
      </>
    )
  } else {
    //user is logged in
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button variant='link'>Logout</Button>
      </Flex>
    )
  }

  return (
    <Flex bg='tomato' p={4} ml={"auto"}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  )
}
