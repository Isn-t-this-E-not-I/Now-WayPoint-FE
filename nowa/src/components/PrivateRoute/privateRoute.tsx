import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const PrivateRoute: React.FC = () => {
<<<<<<< HEAD
  const token = localStorage.getItem('token')
  const cookie_token = document.cookie

  return token ? <Outlet /> : <Navigate to="/login" />
=======
    const token = localStorage.getItem('token')

    return token ? <Outlet /> : <Navigate to="/login" />
>>>>>>> 0f3ac01f177f4e78644581a05a8f419c8be10099
}

export default PrivateRoute
