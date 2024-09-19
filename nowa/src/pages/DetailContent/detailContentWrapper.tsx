import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import DetailContent from './DetailContent' // 게시글 상세 컴포넌트

// 전체 페이지 레이아웃 정의
const PageWrapper = styled.div`
  display: flex;
  justify-content: space-between; /* 사이드바와 중앙 콘텐츠 분리 */
`

// 사이드바 영역 스타일
const Sidebar = styled.div`
  width: 250px; /* 사이드바 고정 너비 */
  background-color: #f0f0f0; /* 임의 색상 */
`

// 중앙 콘텐츠 영역 스타일
const ContentArea = styled.div<{ isFullPage: boolean }>`
  flex-grow: 1;
  padding: ${({ isFullPage }) => (isFullPage ? '5rem' : '0')};
  display: flex;
  justify-content: center;
  align-items: center;
`

const DetailContentWrapper: React.FC = () => {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()

  // 전체 페이지인지 여부를 결정 (post 경로에 따라)
  const isFullPage = window.location.pathname.startsWith('/post/')

  // 닫기 버튼 클릭 시 뒤로 이동
  const handleClose = () => {
    navigate(-1) // 뒤로 가기
  }

  return (
    <PageWrapper>
      <ContentArea isFullPage={isFullPage}>
        <DetailContent postId={Number(postId)} onClose={handleClose} />
      </ContentArea>
    </PageWrapper>
  )
}

export default DetailContentWrapper
