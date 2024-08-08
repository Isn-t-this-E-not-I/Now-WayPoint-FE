import React, { useState } from 'react'
import styled from 'styled-components'
import DetailContentModal from '@/components/Modal/ContentModal'

const PostsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  justify-content: center;
  max-height: 90vh;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
`

const PostWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  &:hover .overlay {
    opacity: 1;
  }
`

const PostThumbnail = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`

const PostVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`

const PostOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0 0 8px 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
`

const OverlayText = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 30px;
  margin: auto 10px;
`

interface Post {
  id: number
  mediaUrls: string[]
  createdAt: string
  category: string
  likeCount: number
  commentCount: number
}

interface PostsProps {
  posts: Post[]
}

const Posts: React.FC<PostsProps> = ({ posts }) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedPostId(null)
  }

  const handleVideoHover = (videoElement: HTMLVideoElement, play: boolean) => {
    if (play) {
      videoElement.play()
    } else {
      videoElement.pause()
    }
  }

  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <>
      <PostsContainer>
        {sortedPosts.map((post, index) => {
          const imageUrl = post.mediaUrls && post.mediaUrls[0]

          return (
            <PostWrapper
              key={index}
              onClick={() => handlePostClick(post.id)}
              onMouseEnter={(e) => {
                const videoElement = e.currentTarget.querySelector('video')
                if (videoElement) handleVideoHover(videoElement, true)
              }}
              onMouseLeave={(e) => {
                const videoElement = e.currentTarget.querySelector('video')
                if (videoElement) handleVideoHover(videoElement, false)
              }}
            >
              {post.category === 'VIDEO' ? (
                <PostVideo
                  src={imageUrl}
                  muted
                  controls={false}
                  onContextMenu={preventContextMenu}
                />
              ) : (
                <PostThumbnail
                  src={imageUrl}
                  alt={`Post ${index + 1}`}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://cdn-icons-png.flaticon.com/128/4456/4456159.png'
                  }}
                  onContextMenu={preventContextMenu}
                />
              )}
              <PostOverlay className="overlay">
                <OverlayText>
                  <img
                    style={{ width: 40, height: 40 }}
                    src="https://cdn-icons-png.flaticon.com/128/833/833472.png"
                    alt="좋아요"
                  ></img>
                  {post.likeCount}
                </OverlayText>
                <OverlayText>
                  <img
                    style={{ width: 45, height: 45 }}
                    src="https://cdn-icons-png.flaticon.com/128/7579/7579686.png"
                    alt="댓글 수"
                  ></img>
                  {post.commentCount}
                </OverlayText>
              </PostOverlay>
            </PostWrapper>
          )
        })}
      </PostsContainer>
      {selectedPostId !== null && (
        <DetailContentModal
          showCloseButton={true}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          postId={selectedPostId}
        />
      )}
    </>
  )
}

export default Posts
