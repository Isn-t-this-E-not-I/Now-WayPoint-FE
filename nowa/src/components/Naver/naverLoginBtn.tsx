const CustomNaverLoginButton = () => {
  const naver_Client_Id = import.meta.env.VITE_APP_NAVER_KEY
  const naver_Callback_URL = import.meta.env.VITE_APP_NAVER_CALLBACK_URL

  const handleNaverLogin = () => {
    const state = Math.random().toString(36).substr(2, 11)
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naver_Client_Id}&redirect_uri=${encodeURI(
      naver_Callback_URL
    )}&state=${state}`
    window.location.href = naverAuthUrl
  }

  return (
    <button
      onClick={handleNaverLogin}
      style={{
        backgroundColor: '#03C75A',
        color: 'white',
        padding: '10px 20px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '21.5rem',
        marginTop: 5,
      }}
    >
      네이버 로그인
    </button>
  )
}

export default CustomNaverLoginButton
