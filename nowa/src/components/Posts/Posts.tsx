import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

const PostsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  justify-content: center;
  max-height: 88vh;
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
  const navigate = useNavigate()

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handlePostClick = (postId: number) => {
    navigate(`/detailContent/${postId}`)
  }

  const getImageUrl = (post: Post) => {
    if (post.category === 'PHOTO') {
      return post.mediaUrls && post.mediaUrls[0]
        ? post.mediaUrls[0]
        : 'https://cdn-icons-png.flaticon.com/128/4456/4456159.png'
    } else if (post.category === 'VIDEO') {
      return 'https://cdn-icons-png.flaticon.com/128/9327/9327129.png'
    } else if (post.category === 'MUSIC') {
      return 'https://cdn-icons-png.flaticon.com/128/1187/1187534.png'
    } else {
      return 'https://cdn-icons-png.flaticon.com/128/4456/4456159.png'
    }
  }

  return (
    <PostsContainer>
      {sortedPosts.map((post, index) => {
        const imageUrl = getImageUrl(post)
        return (
          <PostWrapper key={index} onClick={() => handlePostClick(post.id)}>
            <PostThumbnail
              src={imageUrl}
              alt={`Post ${index + 1}`}
              onError={(e) => {
                if (post.category === 'PHOTO') {
                  e.currentTarget.src =
                    'https://cdn-icons-png.flaticon.com/128/4456/4456159.png'
                }
              }}
            />
            <PostOverlay className="overlay">
              <OverlayText>
                <span>❤️{post.likeCount}</span>
              </OverlayText>
              <OverlayText>
                <span>💬{post.commentCount}</span>
              </OverlayText>
            </PostOverlay>
          </PostWrapper>
        )
      })}
    </PostsContainer>
  )
}

export default Posts
