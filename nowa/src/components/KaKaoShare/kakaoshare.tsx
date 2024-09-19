import React, { useEffect } from 'react'

declare global {
  interface Window {
    Kakao: any
  }
}

interface KakaoShareButtonProps {
  title: string
  description: string
  imageUrl: string
  linkUrl: string
}

const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  title,
  description,
  imageUrl,
  linkUrl,
}) => {
  useEffect(() => {
    // 카카오 SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init('7428359e58a3e7f2291b25f32cd32b95') // 자신의 Kakao 앱 키로 대체
    }
  }, [])

  const shareKakao = () => {
    if (window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: title,
          description: description,
          imageUrl: imageUrl, // 공유할 이미지 URL
          link: {
            mobileWebUrl: linkUrl,
            webUrl: linkUrl,
          },
        },
        buttons: [
          {
            title: '웹으로 보기',
            link: {
              mobileWebUrl: linkUrl,
              webUrl: linkUrl,
            },
          },
        ],
      })
    }
  }

  return (
    <button onClick={shareKakao} id="kakao-share-btn">
      카카오톡 공유하기
    </button>
  )
}

export default KakaoShareButton
