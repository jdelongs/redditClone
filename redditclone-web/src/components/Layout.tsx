import React from "react"
import { Navbar } from "./NavBar"
import { Wrapper, WrapperVariant } from "./Wrapper"

interface LayoutProps {
  variant?: WrapperVariant
}
export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  )
}
