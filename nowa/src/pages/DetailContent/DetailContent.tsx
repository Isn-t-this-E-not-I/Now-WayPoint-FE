import React, { useEffect, useState } from 'react'
import '@/styles/DetailContent/detailContent.css'
import DropDown from '@/components/DropDown/dropDown'
import {
  getPostById,
  Post,
  deletePostById,
  likePostById,
} from '@/services/detailContent'
import {
  getCommentsByPostId,
  deleteCommentById,
  createComment,
  toggleCommentLike,
  getAllUsers,
  Comment,
  User,
} from '@/services/comments'
import { getAddressFromCoordinates } from '@/services/getAddress'
import { useParams, useNavigate } from 'react-router-dom'
import { Carousel } from 'react-responsive-carousel'
import TextArea from '@/components/TextArea/textArea'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

// 현재 로그인한 유저의 닉네임을 가져오는 함수
const getCurrentUser = (): string | null => {
  return localStorage.getItem('nickname')
}

const DetailContent: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [address, setAddress] = useState<string>('')
  const [newComment, setNewComment] = useState<string>('')
  const [replyCommentId, setReplyCommentId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([]) // 모든 유저 상태
  const [mentionList, setMentionList] = useState<User[]>([]) // 멘션 목록 상태
  const [newMentionList, setNewMentionList] = useState<User[]>([]) // 새로운 댓글 멘션 목록 상태
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postData = await getPostById(Number(id))
        setPost(postData)
        const commentsData = await getCommentsByPostId(Number(id))
        setComments(buildCommentTree(commentsData))

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

    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers()
        setUsers(usersData)
      } catch (error) {
        console.error('Failed to fetch users data:', error)
      }
    }

    fetchUsers()

    const user = getCurrentUser()
    setCurrentUser(user)
  }, [id])

  // 댓글을 트리 구조로 변환하는 함수
  const buildCommentTree = (comments: Comment[]): Comment[] => {
    const map: { [key: number]: Comment } = {}
    const roots: Comment[] = []

    comments.forEach((comment) => {
      map[comment.id] = { ...comment, children: [] }
    })

    comments.forEach((comment) => {
      if (comment.parentId) {
        if (map[comment.parentId]) {
          map[comment.parentId].children?.push(map[comment.id])
        }
      } else {
        roots.push(map[comment.id])
      }
    })

    return roots
  }

  // 댓글 목록을 갱신하는 함수
  const fetchComments = async () => {
    try {
      const commentsData = await getCommentsByPostId(Number(id))
      setComments(buildCommentTree(commentsData))
    } catch (error) {
      console.error('Failed to fetch comments data:', error)
    }
  }

  // 댓글을 삭제하는 함수
  const handleCommentDelete = async (commentId: number) => {
    try {
      const result = await deleteCommentById(Number(id), commentId)
      if (typeof result === 'string') {
        alert(result)
      } else {
        await fetchComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('댓글을 삭제하는 중 오류가 발생했습니다.')
    }
  }

  // 게시글을 삭제하는 함수
  const handlePostDelete = async () => {
    const confirmed = window.confirm('정말로 게시글을 삭제하시겠습니까?')
    if (confirmed) {
      try {
        await deletePostById(Number(id))
        alert('게시글이 삭제되었습니다.')
        navigate('/mypage') // 삭제 후 메인 페이지로 리다이렉트
      } catch (error) {
        console.error('Failed to delete post:', error)
        alert('게시글을 삭제하는 중 오류가 발생했습니다.')
      }
    }
  }

  // 새로운 댓글을 작성하는 함수
  const handleCommentSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault()
    try {
      const newCommentData = await createComment(Number(id), newComment)
      await fetchComments()
      setNewComment('')
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('댓글 작성에 실패했습니다.')
    }
  }

  // 대댓글을 작성하는 함수
  const handleReplySubmit = async (
    parentCommentId: number,
    e?: React.FormEvent<HTMLFormElement>
  ) => {
    if (e) e.preventDefault()
    try {
      const newReplyData = await createComment(
        Number(id),
        replyContent,
        parentCommentId
      )
      await fetchComments()
      setReplyContent('')
      setReplyCommentId(null)
    } catch (error) {
      console.error('Failed to submit reply:', error)
      alert('답글 작성에 실패했습니다.')
    }
  }

  // 게시글 좋아요를 토글하는 함수
  const handleLikeToggle = async () => {
    try {
      await likePostById(Number(id))
      setPost((prevPost) =>
        prevPost
          ? {
              ...prevPost,
              likedByUser: !prevPost.likedByUser,
              likeCount: prevPost.likedByUser
                ? prevPost.likeCount - 1
                : prevPost.likeCount + 1,
            }
          : null
      )
    } catch (error) {
      console.error('Failed to like/unlike post:', error)
      alert('좋아요/좋아요 취소에 실패했습니다.')
    }
  }

  // 댓글 좋아요를 토글하는 함수
  const handleCommentLikeToggle = async (commentId: number) => {
    try {
      await toggleCommentLike(Number(id), commentId)
      await fetchComments()
    } catch (error) {
      console.error('Failed to like/unlike comment:', error)
      alert('댓글 좋아요/좋아요 취소에 실패했습니다.')
    }
  }

  // 유저 프로필 클릭 시 프로필 페이지로 이동하는 함수
  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}`)
  }

  // 대댓글 입력 창을 토글하는 함수
  const toggleReplyComment = (commentId: number) => {
    setReplyCommentId((prevReplyCommentId) =>
      prevReplyCommentId === commentId ? null : commentId
    )
  }

  // 멘션 입력 시 자동 완성 목록을 업데이트하는 함수 (대댓글 작성 시)
  const handleMention = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setReplyContent(value)

    const lastWord = value.split(' ').pop()
    if (lastWord?.startsWith('@')) {
      const query = lastWord.slice(1)
      setMentionList(
        users.filter((user) =>
          user.nickname.toLowerCase().includes(query.toLowerCase())
        )
      )
    } else {
      setMentionList([])
    }
  }

  // 멘션 입력 시 자동 완성 목록을 업데이트하는 함수 (새 댓글 작성 시)
  const handleNewCommentMention = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    setNewComment(value)

    const lastWord = value.split(' ').pop()
    if (lastWord?.startsWith('@')) {
      const query = lastWord.slice(1)
      setNewMentionList(
        users.filter((user) =>
          user.nickname.toLowerCase().includes(query.toLowerCase())
        )
      )
    } else {
      setNewMentionList([])
    }
  }

  // 멘션을 댓글 내용에 추가하는 함수 (대댓글 작성 시)
  const addMention = (nickname: string) => {
    const words = replyContent.split(' ')
    words.pop()
    const newContent = [...words, ` @${nickname} `].join(' ')
    setReplyContent(newContent)
    setMentionList([])
  }

  // 멘션을 댓글 내용에 추가하는 함수 (새 댓글 작성 시)
  const addNewCommentMention = (nickname: string) => {
    const words = newComment.split(' ')
    words.pop()
    const newContent = [...words, ` @${nickname} `].join(' ')
    setNewComment(newContent)
    setNewMentionList([])
  }

  // 댓글 내용에서 @멘션 부분을 파란색으로 표시하는 함수
  const formatContentWithMentions = (content: string) => {
    const parts = content.split(/(\s@\w+\s)/g) // '@'로 시작하는 단어를 기준으로 문자열을 분할
    return parts.map((part, index) =>
      part.startsWith(' @') && part.endsWith(' ') ? (
        <span key={index} className="mention">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  // 엔터키 눌렀을 때 댓글 작성 함수 호출
  const handleCommentKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCommentSubmit()
    }
  }

  // 엔터키 눌렀을 때 대댓글 작성 함수 호출
  const handleReplyKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    commentId: number
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReplySubmit(commentId)
    }
  }

  if (!post) {
    return (
      <div id="detail_not_found_error">
        해당 게시글은 존재하지 않거나 조회할 수 없습니다.
      </div>
    )
  }

  const con_Text = '='
  const con_drop = ['게시글 수정', '게시글 삭제']

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}.${month}.${day}`
  }

  const renderComments = (comments: Comment[]) => {
    return comments.map((comment) => (
      <div key={comment.id} id="detail_coment_deep">
        <div
          id="test_coment_img"
          onClick={() => handleProfileClick(comment.nickname)}
        >
          <img id="d_d" alt="프로필 이미지" src={comment.profileImageUrl} />
        </div>
        <div>
          <div id="detail_coment_id">{comment.nickname}</div>
          <div id="detail_coment_content">
            {formatContentWithMentions(comment.content)}
          </div>
          <div id="detail_coment_edit_line">
            <div id="detail_coment_date">{formatDate(comment.createdAt)}</div>
            <div
              id="detail_coment_recoment"
              onClick={() => toggleReplyComment(comment.id)}
            >
              답글 달기
            </div>
            <div id="detail_coment_delete">
              {currentUser === comment.nickname && (
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault()
                    handleCommentDelete(comment.id)
                  }}
                >
                  삭제
                </a>
              )}
            </div>
          </div>
          <div id="detail_comment_like">
            <img
              src={
                comment.likedByUser
                  ? 'https://cdn-icons-png.flaticon.com/128/4397/4397571.png'
                  : 'https://cdn-icons-png.flaticon.com/128/7476/7476962.png'
              }
              alt="좋아요"
              onClick={() => handleCommentLikeToggle(comment.id)}
            />
            <div id="detail_comment_like_count">{comment.likeCount}</div>
          </div>
          {replyCommentId === comment.id && (
            <form
              id="detail_reply_write"
              onSubmit={(e) => handleReplySubmit(comment.id, e)}
            >
              <TextArea
                id="detail_reply_content"
                value={replyContent}
                onChange={handleMention}
                onKeyDown={(e) => handleReplyKeyPress(e, comment.id)} // 엔터키 눌렀을 때 대댓글 작성
              ></TextArea>
              {mentionList.length > 0 && (
                <div className="mention-list">
                  {mentionList.map((user) => (
                    <div
                      key={user.id}
                      className="mention-item"
                      onClick={() => addMention(user.nickname)}
                    >
                      <div className="mention_profile">
                        <img src={`${user.profileImageUrl}`}></img>
                        <div className="mention_name">{user.nickname}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div id="detail_reply_write_button">
                <button type="submit">답글 게시</button>
              </div>
            </form>
          )}
          {comment.children && comment.children.length > 0 && (
            <div className="comment-children">
              {renderComments(comment.children)}
            </div>
          )}
        </div>
      </div>
    ))
  }

  return (
    <div>
      <div className="detail_container">
        <div id="detail_picture">
          <div id="detail_picture_item1">
            {Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 ? (
              <Carousel showThumbs={false} infiniteLoop useKeyboardArrows>
                {post.mediaUrls.map((url: string, index: number) => (
                  <div id="preview_container" key={index}>
                    {url.endsWith('.mp4') ? (
                      <video controls>
                        <source src={url} type="video/mp4" />
                      </video>
                    ) : url.endsWith('.mp3') ? (
                      <audio controls>
                        <source src={url} type="audio/mp3" />
                      </audio>
                    ) : (
                      <img alt="이미지" src={url} />
                    )}
                  </div>
                ))}
              </Carousel>
            ) : (
              <div>이미지가 없습니다</div>
            )}
          </div>
        </div>

        <div id="detail_content_story">
          <div id="detail_right_profile">
            <div id="detail_content_profile">
              <div
                id="test_profile_img"
                onClick={() => handleProfileClick(post.nickname)}
              >
                <img alt="프로필 이미지" src={post.profileImageUrl}></img>
              </div>

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
            {comments.length > 0 ? (
              renderComments(comments)
            ) : (
              <div id="no_comments">댓글이 존재하지 않습니다</div>
            )}
          </div>

          <div id="detail_content_heart">
            <div id="detail_heart_count">{post.likeCount}</div>
            <div id="detail_heart_write_date">{formatDate(post.createdAt)}</div>
            <div id="detail_like_button" onClick={handleLikeToggle}>
              <img
                src={
                  post.likedByUser
                    ? 'https://cdn-icons-png.flaticon.com/128/4397/4397571.png'
                    : 'https://cdn-icons-png.flaticon.com/128/7476/7476962.png'
                }
                alt="좋아요"
              />
            </div>
          </div>

          <form id="detail_coment_write" onSubmit={handleCommentSubmit}>
            <textarea
              id="detail_coment_content_content"
              value={newComment}
              onChange={handleNewCommentMention}
              onKeyDown={handleCommentKeyPress} // 엔터키 눌렀을 때 댓글 작성
            ></textarea>
            {newMentionList.length > 0 && (
              <div className="mention-list-parent">
                {newMentionList.map((user) => (
                  <div
                    key={user.id}
                    className="mention-item"
                    onClick={() => addNewCommentMention(user.nickname)}
                  >
                    <div className="mention_profile">
                      <img src={`${user.profileImageUrl}`}></img>
                      <div className="mention_name">{user.nickname}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {currentUser === post.nickname && (
              <div id="detail_content_edit">
                <DropDown
                  id={'detail_Dropdown'}
                  buttonText={con_Text}
                  items={con_drop}
                  onItemSelect={(item) => {
                    if (item === '게시글 삭제') {
                      handlePostDelete()
                    } else if (item === '게시글 수정') {
                      navigate(`/editContent/${id}`) // 게시글 수정 페이지로 이동
                    }
                  }}
                />
              </div>
            )}
            <div id="detail_coment_write_button">
              <button type="submit">게시</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DetailContent
