import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useLocation } from 'react-router'
import { useAuth } from '../context/AuthProvider.tsx'
import ConnectLayout from '../layout/ConnectLayout.tsx'
import Layout from '../layout/Layout.tsx'
import LoginPage from './user/Login.page.tsx'

const AuthenticatedRouteWrapper = () => {
  const { authToken, isAuthenticated } = useAuth()
  const location = useLocation()

  // const route = useMatches()
  //
  // const renderNotAuthenticated = () => {
  //   return (
  //     <div>
  //       Not authenticated <Link to={`/auth/login?goto=${''}`}>Go to Login</Link>
  //     </div>
  //   )
  // }

  const redirectToLogin = () => {
    return (
      <div>
        Redirecting to login...
        <Navigate to={`/auth/login?goto=${location.pathname}`} />
      </div>
    )
  }

  if (!isAuthenticated) {
    //return renderNotAuthenticated()
    //return redirectToLogin()
    return (
      <ConnectLayout>
        <LoginPage />
      </ConnectLayout>
    )
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default AuthenticatedRouteWrapper
