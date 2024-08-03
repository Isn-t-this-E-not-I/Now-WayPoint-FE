import React, { useEffect, useState } from 'react';
import { useWebSocket, FollowContent } from '@/components/WebSocketProvider/WebSocketProvider';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const FollowContentWrapper = styled.div`
  text-align: left;
  max-height: 90vh;
  padding: 20px;
  width: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background-color: #f5f5f5;
`;

const ContentItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  position: relative;
`;

const ProfilePic = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
`;

const Username = styled.span`
  font-weight: bold;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
`;

const InnerImageWrapper = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 300px; /* 필요한 최대 높이 설정 */
  overflow: hidden; /* 콘텐츠가 넘치는 것을 숨김 */
  border-radius: 12px;
`;

const InnerImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  margin: auto;
  object-fit: contain;
  cursor: pointer; /* 이미지를 포함하도록 설정 */
`;

const ContentText = styled.div`
  margin-top: 10px;
  font-size: 14px;
`;

const HashTags = styled.div`
  color: #129fe1;
  margin-top: 5px;
  font-size: 12px;
`;

const TimeAgo = styled.span`
  font-size: 12px;
  color: #aaa;
  margin-top: 5px;
  margin-left: 90px;
`;

const LikeCount = styled.span`
  font-size: 14px;
  color: #333;
  margin-top: 10px;
  font-weight: bold;
`;

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
`;

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
`;

const FollowContentsPage: React.FC = () => {
  const { followContents, isLoading } = useWebSocket();
  const [displayFollowContents, setDisplayFollowContents] = useState<FollowContent[]>([]);
  const navigate = useNavigate();

  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}?tab=posts`);
  };

  const handleContentImageClick = (id: number) => {
    navigate(`/detailContent/${id}`);
  };

  useEffect(() => {
    if (!isLoading) {
      setDisplayFollowContents(followContents);
      console.log(followContents);
    }
  }, [followContents, isLoading]);

  return (
    <FollowContentWrapper>
      {isLoading ? (
        <div>Loading...</div> // 로딩 상태 표시
      ) : (
        displayFollowContents.map((followContent) => (
          <ContentItem key={followContent.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ProfilePic
                src={followContent.profileImageUrl}
                alt="Profile"
                onClick={() => handleProfileClick(followContent.username)}
              />
              <CategoryLabel>{followContent.category}</CategoryLabel>
              <Username onClick={() => handleProfileClick(followContent.username)}>
                {followContent.username}
              </Username>
            </div>
            {followContent.mediaUrls.length > 0 && (
              <InnerImageWrapper>
                <InnerImage 
                  src={followContent.mediaUrls[0]} 
                  alt="Content" 
                  onClick={() => handleContentImageClick(followContent.id)}
                />
              </InnerImageWrapper>
            )}
            <ContentDisplay content={followContent.content} />
            <HashTags>
              {followContent.hashtags.map((hashtag, index) => (
                <span key={index}>{hashtag} </span>
              ))}
            </HashTags>
            <LikeCount>❤ {followContent.likeCount}</LikeCount>
            <TimeAgo>{followContent.createdAt}</TimeAgo>
          </ContentItem>
        ))
      )}
    </FollowContentWrapper>
  );
};

const ContentDisplay: React.FC<{ content: string }> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const limit = 30; // 표시할 최대 글자 수

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (content.length <= limit) {
    return <ContentText>{content}</ContentText>;
  }

  return (
    <ContentText>
      {isExpanded ? content : `${content.substring(0, limit)}...`}
      <ShowMoreButton onClick={toggleExpanded}>
        {isExpanded ? '접기' : '더보기'}
      </ShowMoreButton>
    </ContentText>
  );
};

export default FollowContentsPage;