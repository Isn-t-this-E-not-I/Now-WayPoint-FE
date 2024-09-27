const CustomGoogleLoginButton = () => {
  const location = import.meta.env.VITE_APP_API
  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('token', 'zzz')
      window.location.href = `${location}/user/login/google`
    } catch (error) {
      console.error('Kakao login failed:', error)
    }
  }

  return (
    <button
      onClick={() => handleGoogleLogin()}
      style={{
        backgroundColor: 'white',
        color: 'black',
        padding: '10px 20px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '21.5rem',
        marginTop: 5,
      }}
    >
      구글 로그인
    </button>
  )
}

export default CustomGoogleLoginButton
