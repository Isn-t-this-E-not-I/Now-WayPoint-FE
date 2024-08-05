import React, { useEffect, useState } from 'react'
import {
  useWebSocket,
  selectContent,
} from '@/components/WebSocketProvider/WebSocketProvider'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import moment from 'moment-timezone'
import DetailContentModal from '@/components/Modal/ContentModal' // DetailContentModal 컴포넌트 가져오기

const FollowContentWrapper = styled.div`
  text-align: left;
  max-height: 80vh;
  padding: 20px;
  width: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background-color: #f8faff;
`

const ContentItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  position: relative;
  div {
    display: flex;
  }
`

const ProfilePic = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
`

const Username = styled.span`
  font-weight: bold;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
`

const InnerImageWrapper = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 300px; /* 필요한 최대 높이 설정 */
  overflow: hidden; /* 콘텐츠가 넘치는 것을 숨김 */
  border-radius: 12px;
`

const InnerImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  margin: auto;
  object-fit: contain;
  cursor: pointer; /* 이미지를 포함하도록 설정 */
`

const ContentText = styled.div`
  margin-top: 10px;
  font-size: 14px;
`

const HashTags = styled.div`
  color: #129fe1;
  margin-top: 5px;
  font-size: 12px;
`

const TimeAgo = styled.span`
  font-size: 12px;
  color: #aaa;
  margin-top: 5px;
  margin-left: auto;
`

const LikeCount = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: bold;
`

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: #129fe1;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    color: #07476f;
  }
`

const CategoryLabel = styled.div`
  position: absolute;
  top: 1px;
  opacity: 0.8;
  right: 15px;
  font-size: 12px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 3px;
`

const MainSidebarPage: React.FC = () => {
  const { selectContents, isLoading } = useWebSocket()
  const [displaySelectContents, setDisplaySelectContents] = useState<
    selectContent[]
  >([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const navigate = useNavigate()

  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}?tab=posts`)
  }

  const handleContentImageClick = (id: number) => {
    setSelectedPostId(id)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPostId(null)
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date().getTime()
    const time = new Date(timestamp).getTime()
    const diff = now - time

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return `${days}일 전`
    } else if (hours > 0) {
      return `${hours}시간 전`
    } else if (minutes > 0) {
      return `${minutes}분 전`
    } else {
      return '방금 전'
    }
  }

  useEffect(() => {
    if (!isLoading) {
      setDisplaySelectContents(
        selectContents.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      )
      console.log(selectContents);
    }
  }, [selectContents, isLoading])

  return (
    <FollowContentWrapper>
      {isLoading ? (
        <div>Loading...</div> // 로딩 상태 표시
      ) : (
        displaySelectContents.map((selectContent) => (
          <ContentItem key={selectContent.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ProfilePic
                src={selectContent.profileImageUrl}
                alt="Profile"
                onClick={() => handleProfileClick(selectContent.username)}
              />
              <CategoryLabel>{selectContent.category}</CategoryLabel>
              <Username
                onClick={() => handleProfileClick(selectContent.username)}
              >
                {selectContent.username}
              </Username>
            </div>
            {selectContent.mediaUrls.length > 0 && (
              <InnerImageWrapper>
                <InnerImage
                  src={selectContent.mediaUrls[0]}
                  alt="Content"
                  onClick={() => handleContentImageClick(selectContent.id)}
                />
              </InnerImageWrapper>
            )}
            <ContentDisplay content={selectContent.content} />
            <HashTags>
              {selectContent?.hashtags && selectContent.hashtags.length > 0 ? (
                selectContent.hashtags.map((hashtag, index) => (
                  <span key={index}>{hashtag} </span>
                ))
              ) : (
                <span></span>
              )}
            </HashTags>
            <div>
              <LikeCount>❤ {selectContent.likeCount}</LikeCount>
              <TimeAgo>{formatRelativeTime(selectContent.createdAt)}</TimeAgo>
            </div>
          </ContentItem>
        ))
      )}
      <DetailContentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        postId={selectedPostId}
      />
    </FollowContentWrapper>
  )
}

const ContentDisplay: React.FC<{ content: string }> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const limit = 30 // 표시할 최대 글자 수

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  if (content.length <= limit) {
    return <ContentText>{content}</ContentText>
  }

  return (
    <ContentText>
      {isExpanded ? content : `${content.substring(0, limit)}...`}
      <ShowMoreButton onClick={toggleExpanded}>
        {isExpanded ? '접기' : '더보기'}
      </ShowMoreButton>
    </ContentText>
  )
}

export default MainSidebarPage
