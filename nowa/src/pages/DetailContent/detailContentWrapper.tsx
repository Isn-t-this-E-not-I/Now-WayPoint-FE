import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import DetailContent from './DetailContent' // 게시글 상세 컴포넌트

// 전체 페이지 레이아웃 정의
const PageWrapper = styled.div`
  display: flex;
  justify-content: space-between; /* 사이드바와 중앙 콘텐츠 분리 */
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

  // 전체 페이지인지 여부를 결정 (post 경로에 따라)
  const isFullPage = window.location.pathname.startsWith('/post/')

  return (
    <PageWrapper>
      <ContentArea isFullPage={isFullPage}>
        <DetailContent postId={Number(postId)} />
      </ContentArea>
    </PageWrapper>
  )
}

export default DetailContentWrapper
