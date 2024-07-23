import React, { useEffect, useState } from 'react'
import '@/styles/DetailContent/detailContent.css'
import DropDown from '@/components/DropDown/dropDown'
import { getPostById, Post } from '@/services/detailContent'

interface DetailContentProps {
  postId: number
}

const DetailContent: React.FC<DetailContentProps> = ({ postId }) => {
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await getPostById(7)
        setPost(postData)
      } catch (error) {
        console.error('Failed to fetch post data:', error)
      }
    }

    fetchPost()
  }, [postId])

  if (!post) {
    return <div>게시글 출력 중</div>
  }

  const con_Text = '='
  const con_drop = ['게시글 수정', '게시글 삭제']

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // getMonth()는 0부터 시작하므로 +1 필요
    const day = date.getDate()
    return `${year}.${month}.${day}`
  }

  return (
    <div>
      <div className="detail_container">
        <div id="detail_picture">
          <div id="detail_picture_item1">
            <img alt="이미지" src={post.mediaUrl} />
          </div>
        </div>

        <div id="detail_content_story">
          <div id="detail_right_profile">
            <div id="detail_content_profile">
              <div id="test_profile_img"></div>

              <div id="detail_profile_id">
                <p>{post.username}</p>

                <div id="detail_profile_address">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/8211/8211159.png"
                    alt="마커이미지"
                  />
                  <span>{post.locationTag}</span>
                </div>
              </div>
            </div>
          </div>

          <div id="detail_user_content">
            <div id="detail_user_write_content">{post.content}</div>
            <div id="hashtag">
              {post.hashtags.map((tag, index) => (
                <span key={index}>#{tag} </span>
              ))}
            </div>
          </div>

          <div id="detail_content_coment">
            <div id="detail_coment_deep">
              <div id="test_coment_img"></div>
              <div>
                <div id="detail_coment_id">test_Id_789</div>
                <div id="detail_coment_content">
                  김수한무 거북이와 두루미 삼천갑자 동방삭 치치카포 사리사리센타
                  워리워리 세브리깡 무두셀라 구름이 허리케인에 담벼락 담벼락에
                  서생원 서생원에 고양이 고양이엔 바둑이 바둑이는 돌돌이
                </div>
              </div>
            </div>
            <div id="detail_content_edit">
              <DropDown buttonText={con_Text} items={con_drop} />
            </div>
          </div>

          <div id="detail_content_heart">
            <div id="detail_heart_count">♥ {post.likeCount}</div>
            <div id="detail_heart_write_date">{formatDate(post.createdAt)}</div>
          </div>

          <form id="detail_coment_write">
            <textarea id="detail_coment_content_content"></textarea>
            <div id="detail_coment_write_button">
              <button>게시</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DetailContent
