import React, { useEffect } from 'react'

interface KakaoShareButtonProps {
  title: string
  description: string
  imageUrl: string
  url: string
}

const loadKakaoSDK = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.kakao) {
      resolve()
    } else {
      const script = document.createElement('script')
      script.src = 'https://developers.kakao.com/sdk/js/kakao.js'
      script.onload = () => {
        if (window.kakao) {
          window.kakao.init('YOUR_APP_KEY') // 발급받은 카카오 앱 키로 초기화
          resolve()
        } else {
          reject(new Error('Kakao SDK failed to load.'))
        }
      }
      script.onerror = () => reject(new Error('Kakao SDK failed to load.'))
      document.head.appendChild(script)
    }
  })
}

const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  title,
  description,
  imageUrl,
  url,
}) => {
  useEffect(() => {
    loadKakaoSDK().catch((error) =>
      console.error('Failed to load Kakao SDK:', error)
    )
  }, [])

  const handleKakaoShare = () => {
    if (window.kakao) {
      window.kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description,
          imageUrl,
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
        buttons: [
          {
            title: '웹으로 보기',
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
        ],
      })
    }
  }

  return <button onClick={handleKakaoShare}>카카오톡 공유하기</button>
}

export default KakaoShareButton
