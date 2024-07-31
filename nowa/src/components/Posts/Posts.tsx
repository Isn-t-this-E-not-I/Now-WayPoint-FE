import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const PostsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
  justify-content: center;
`;

const PostWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
`;

const PostThumbnail = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

interface Post {
  id: number;
  mediaUrls: string[];
  createdAt: string;
}

interface PostsProps {
  posts: Post[];
}

const Posts: React.FC<PostsProps> = ({ posts }) => {
  const navigate = useNavigate();

  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  console.log('Sorted Posts:', sortedPosts); // 정렬 확인

  const handlePostClick = (postId: number) => {
    console.log('Navigating to post:', postId);
    navigate(`/detailContent/${postId}`);
  };

  return (
    <PostsContainer>
      {sortedPosts.map((post, index) => {
        const imageUrl = post.mediaUrls && post.mediaUrls[0] ? post.mediaUrls[0] : ''; // 첫 번째 URL 썸네일로 사용
        return (
          <PostWrapper key={index} onClick={() => handlePostClick(post.id)}>
            {imageUrl && <PostThumbnail src={imageUrl} alt={`Post ${index + 1}`} />}
          </PostWrapper>
        );
      })}
    </PostsContainer>
  );
};

export default Posts;
