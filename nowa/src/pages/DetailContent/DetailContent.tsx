// import React, { useEffect, useState } from 'react'
// import '@/styles/DetailContent/detailContent.css'
// import DropDown from '@/components/DropDown/dropDown'
// import { getPostById, Post } from '@/services/detailContent'
// import { verify } from 'crypto'
// import { useParams } from 'react-router-dom'
// import { getCommentsByPostId } from '@/services/comments'

// const DetailContent: React.FC = () => {
//   const [post, setPost] = useState<Post | null>(null)
//   const [comments, setComments] = useState<Comment[]>([])
//   const { id } = useParams()

//   useEffect(() => {
//     const fetchPost = async () => {
//       try {
//         const postData = await getPostById(Number(id))
//         setPost(postData)

//         const commentsData = await getCommentsByPostId(Number(id))
//       } catch (error) {
//         console.error('Failed to fetch post data:', error)
//       }
//     }

//     fetchPost()
//   }, [id])

//   if (!post) {
//     return <div id="detail_not_found_error">조회된 게시글이 없습니다</div>
//   }

//   const con_Text = '='
//   const con_drop = ['게시글 수정', '게시글 삭제']

//   const formatDate = (dateString: string): string => {
//     const date = new Date(dateString)
//     const year = date.getFullYear()
//     const month = date.getMonth() + 1 // getMonth()는 0부터 시작하므로 +1 필요
//     const day = date.getDate()
//     return `${year}.${month}.${day}`
//   }

//   return (
//     <div>
//       <div className="detail_container">
//         <div id="detail_picture">
//           <div id="detail_picture_item1">
//             <img alt="이미지" src={post.mediaUrl} />
//           </div>
//         </div>

//         <div id="detail_content_story">
//           <div id="detail_right_profile">
//             <div id="detail_content_profile">
//               <div id="test_profile_img"></div>

//               <div id="detail_profile_id">
//                 <p>{post.nickname}</p>

//                 <div id="detail_profile_address">
//                   <img
//                     src="https://cdn-icons-png.flaticon.com/128/8211/8211159.png"
//                     alt="마커이미지"
//                   />
//                   <span>{post.locationTag}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div id="detail_user_content">
//             <div id="detail_user_write_content">{post.content}</div>
//             <div id="hashtag">
//               {post.hashtags.map((tag, index) => (
//                 <span key={index}>{tag} </span>
//               ))}
//             </div>
//           </div>

//           <div id="detail_content_coment">
//             {/* 월요일 댓글부분 처리 */}
//             {/* {comments.map((comment) => (
//               <div key={comment.id} id="detail_coment_deep">
//                 <div id="test_coment_img"></div>
//                 <div>
//                   <div id="detail_coment_id">{comment.userId}</div>
//                   <div id="detail_coment_content">{comment.content}</div>
//                 </div>
//               </div>
//             ))} */}
//             <div id="detail_content_edit">
//               <DropDown buttonText={con_Text} items={con_drop} />
//             </div>
//           </div>

//           <div id="detail_content_heart">
//             <div id="detail_heart_count">♥ {post.likeCount}</div>
//             <div id="detail_heart_write_date">{formatDate(post.createdAt)}</div>
//           </div>

//           <form id="detail_coment_write">
//             <textarea id="detail_coment_content_content"></textarea>
//             <div id="detail_coment_write_button">
//               <button>게시</button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default DetailContent

import React, { useEffect, useState } from 'react'
import '@/styles/DetailContent/detailContent.css'
import DropDown from '@/components/DropDown/dropDown'
import { getPostById, Post } from '@/services/detailContent'
import { getCommentsByPostId, Comment } from '@/services/comments'
import { getAddressFromCoordinates } from '@/services/getAddress'
import { useParams } from 'react-router-dom'

const DetailContent: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [address, setAddress] = useState<string>('')
  const { id } = useParams()

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postData = await getPostById(Number(id))
        setPost(postData)

        const commentsData = await getCommentsByPostId(Number(id))
        setComments(commentsData)

        if (postData.locationTag) {
          const [longitude, latitude] = postData.locationTag
            .split(',')
            .map(Number)
          const address = await getAddressFromCoordinates(latitude, longitude)
          setAddress(address)
        }
      } catch (error) {
        console.error('Failed to fetch post or comments data:', error)
      }
    }

    fetchPostAndComments()
  }, [id])

  if (!post) {
    return <div id="detail_not_found_error">조회된 게시글이 없습니다</div>
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
                <p>{post.nickname}</p>

                <div id="detail_profile_address">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/8211/8211159.png"
                    alt="마커이미지"
                  />
                  <span>{address}</span>
                </div>
              </div>
            </div>
          </div>

          <div id="detail_user_content">
            <div id="detail_user_write_content">{post.content}</div>
            <div id="hashtag">
              {post.hashtags.map((tag, index) => (
                <span key={index}>{tag} </span>
              ))}
            </div>
          </div>

          <div id="detail_content_coment">
            {/* {comments.map((comment) => (
              <div key={comment.id} id="detail_coment_deep">
                <div id="test_coment_img"></div>
                <div>
                  <div id="detail_coment_id">{comment.userId}</div>
                  <div id="detail_coment_content">{comment.content}</div>
                </div>
              </div>
            ))} */}
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
