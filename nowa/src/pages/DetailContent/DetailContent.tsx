import React, { useEffect, useState, useRef, useCallback } from 'react'
import '@/styles/DetailContent/detailContent.css'
import DropDown from '@/components/DropDown/dropDown'
import { FaBookmark, FaRegBookmark } from 'react-icons/fa'
import {
  getPostById,
  Post,
  deletePostById,
  likePostById,
  getLikeListUsers,
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
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'react-responsive-carousel'
import TextArea from '@/components/TextArea/textArea'
import Modal from '@/components/Modal/modal'
import EditContent from '@/pages/EditContent/editContent'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { styled } from 'styled-components'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import KakaoShareButton from '@/components/KaKaoShare/kakaoshare'

interface DetailContentProps {
  postId: number
  onClose?: () => void // 추가: 모달을 닫는 함수
}

// declare global {
//   interface Window {
//     Kakao: any
//   }
// }

// 현재 로그인한 유저의 닉네임을 가져오는 함수
const getCurrentUser = (): string | null => {
  return localStorage.getItem('nickname')
}

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
`

const DetailContent: React.FC<DetailContentProps> = ({ postId, onClose }) => {
  // const location = useLocation()
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
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false) // Edit modal 상태 추가
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  ) // 댓글 확장 상태
  const [isContentExpanded, setIsContentExpanded] = useState<boolean>(false) // 글 내용 확장 상태 추가
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false) // 북마크 상태
  const navigate = useNavigate()
  // const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false) // 댓글 이모지 선택기 상태
  const [activeReplyEmojiPicker, setActiveReplyEmojiPicker] = useState<
    number | null
  >(null) // 대댓글 이모지 선택기 상태
  const emojiPickerRef = useRef<HTMLDivElement | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]) // 비디오 참조 저장
  const [isLikeListOpen, setIsLikeListOpen] = useState(false)
  const [isHoveringLikeList, setIsHoveringLikeList] = useState(false)
  const [likedUsers, setLikedUsers] = useState<User[]>([])
  const [viewCount, setViewCount] = useState<number>(0) // 조회수

  const handleCloseModal = () => {
    // 닫기 버튼
    setIsEditModalOpen(false)
  }

  const [id, setId] = useState<number>()

  const generatePostUrl = () => {
    const baseUrl = window.location.origin // 현재 도메인 가져오기
    return `${baseUrl}/post/${postId}` // 동적으로 게시글 URL 생성
  }

  const fetchPostAndComments = async () => {
    try {
      const postData = await getPostById(postId)
      setPost(postData)
      setViewCount(postData.viewCount) // 조회수
      setIsBookmarked(postData.isBookmarked)
      setId(postData.id)
      const commentsData = await getCommentsByPostId(postId)
      const parentComments = commentsData.filter((comment) => !comment.parentId)
      const sortedParentComments = parentComments.sort(
        (a, b) => b.likeCount - a.likeCount
      )

      const childComments = commentsData.filter((comment) => comment.parentId)
      const sortedChildComments = childComments.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

      const combinedComments = sortedParentComments.flatMap((parent) => [
        parent,
        ...sortedChildComments.filter((child) => child.parentId === parent.id),
      ])

      setComments(combinedComments)

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

  const fetchBookmarkStatus = async () => {
    const apiUrl = import.meta.env.VITE_APP_API
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다.')
        return
      }

      const response = await fetch(`${apiUrl}/bookmarks/${postId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      console.log(data)
      if (response.ok) {
        setIsBookmarked(data) // 북마크 상태를 서버에서 받아옴
      } else {
        console.error(
          `Failed to fetch bookmark status: ${response.status}`,
          data
        )
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleBookmark = async () => {
    const apiUrl = import.meta.env.VITE_APP_API
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다.')
        return
      }

      const response = await fetch(`${apiUrl}/bookmarks/${postId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.text()

      if (response.ok) {
        setIsBookmarked((prev) => !prev) // 북마크 상태를 토글
        // alert(result);
      } else {
        console.error(`Failed to toggle bookmark: ${response.status}`, result)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    fetchPostAndComments()
    fetchBookmarkStatus() // 컴포넌트 로드 시 북마크 상태 확인

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
  }, [postId])

  // 댓글 목록을 갱신하는 함수
  const fetchComments = async () => {
    try {
      const commentsData = await getCommentsByPostId(postId)
      const parentComments = commentsData.filter((comment) => !comment.parentId)
      const sortedParentComments = parentComments.sort(
        (a, b) => b.likeCount - a.likeCount
      )

      const childComments = commentsData.filter((comment) => comment.parentId)
      const sortedChildComments = childComments.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

      const combinedComments = sortedParentComments.flatMap((parent) => [
        parent,
        ...sortedChildComments.filter((child) => child.parentId === parent.id),
      ])

      setComments(combinedComments)
    } catch (error) {
      console.error('Failed to fetch comments data:', error)
    }
  }

  // 댓글을 삭제하는 함수
  const handleCommentDelete = async (commentId: number) => {
    try {
      const result = await deleteCommentById(postId, commentId)
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
        await deletePostById(postId)
        alert('게시글이 삭제되었습니다.')
        navigate('/mypage') // 삭제 후 메인 페이지로 리다이렉트
        if (onClose) {
          onClose() // 모달 창 닫기
        }
        window.location.reload()
      } catch (error) {
        console.error('Failed to delete post:', error)
        alert('게시글을 삭제하는 중 오류가 발생했습니다.')
      }
    }
  }

  // 새로운 댓글을 작성하는 함수
  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newComment.trim() === '') {
      alert('내용을 입력해주세요.')
      return
    }
    try {
      await createComment(postId, newComment)
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
    if (replyContent.trim() === '') {
      alert('내용을 입력해주세요.')
      return
    }
    try {
      await createComment(postId, replyContent, parentCommentId)
      await fetchComments()
      setReplyContent('')
      setReplyCommentId(null)
    } catch (error) {
      console.error('Failed to submit reply:', error)
      alert('답글 작성에 실패했습니다.')
    }
  }

  // 댓글 작성 시 Enter 키 핸들러
  const handleCommentKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCommentSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  // 답글 작성 시 Enter 키 핸들러
  const handleReplyKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    parentCommentId: number
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReplySubmit(parentCommentId)
    }
  }

  // 게시글 좋아요를 토글하는 함수
  const handleLikeToggle = async () => {
    try {
      await likePostById(postId)
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

  // const handleLikeListToggle = async () => {
  //   if (isLikeListOpen) {
  //     // 이미 열려 있는 경우 닫기
  //     setIsLikeListOpen(false)
  //   } else {
  //     // 열려 있지 않은 경우 사용자 목록을 가져오고 열기
  //     try {
  //       const users = await getLikeListUsers(postId)
  //       setLikedUsers(users)
  //       setIsLikeListOpen(true)
  //     } catch (error) {
  //       console.error('Failed to fetch liked users:', error)
  //       alert('좋아요한 사용자 목록을 불러오는 데 실패했습니다.')
  //     }
  //   }
  // }

  const handleMouseEnter = async () => {
    if (!isLikeListOpen) {
      try {
        const users = await getLikeListUsers(postId)
        setLikedUsers(users)
        setIsLikeListOpen(true)
      } catch (error) {
        console.error('유저못가져왔음', error)
      }
    }
  }

  const handleMouseLeave = () => {
    if (!isHoveringLikeList) {
      setIsLikeListOpen(false)
    }
  }

  const handleLikeListMouseEnter = () => {
    setIsHoveringLikeList(true)
  }

  const handleLikeListMouseLeave = () => {
    setIsHoveringLikeList(false)
    setIsLikeListOpen(false)
  }

  // 댓글 좋아요를 토글하는 함수
  const handleCommentLikeToggle = async (commentId: number) => {
    try {
      await toggleCommentLike(postId, commentId)
      await fetchComments()
    } catch (error) {
      console.error('Failed to like/unlike comment:', error)
      alert('댓글 좋아요/좋아요 취소에 실패했습니다.')
    }
  }

  const handleProfileClick = (nickname: string) => {
    const decodedPathname = decodeURIComponent(window.location.pathname)
    if (decodedPathname === `/user/${nickname}`) {
      window.location.reload()
    } else {
      navigate(`/user/${nickname}`)
      window.location.reload()
    }
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

  // 상대적인 시간 형식으로 변환하는 함수
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

  // 댓글 확장/축소 핸들러
  const handleToggleExpand = (commentId: number) => {
    setExpandedComments((prev) => {
      const newExpandedComments = new Set(prev)
      if (newExpandedComments.has(commentId)) {
        newExpandedComments.delete(commentId)
      } else {
        newExpandedComments.add(commentId)
      }
      return newExpandedComments
    })
  }

  // 슬라이드 전환 시 비디오 정지 핸들러
  const handleSlideChange = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause()
      }
    })
  }

  const setMediaVolume = useCallback((element: HTMLMediaElement | null) => {
    if (element) {
      element.volume = 0.5
    }
  }, [])

  const handleClickOutside = (event: MouseEvent) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target as Node)
    ) {
      setActiveReplyEmojiPicker(null)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!post) {
    return (
      <div id="detail_not_found_error">
        해당 게시글은 존재하지 않거나 조회할 수 없습니다.
      </div>
    )
  }

  const con_Text = '='
  const con_drop = ['게시글 수정', '게시글 삭제']

  const renderContent = () => {
    if (!post) return null

    const contentToShow = isContentExpanded
      ? post.content
      : post.content.slice(0, 100)

    return (
      <div>
        <div id="detail_user_write_content">
          {contentToShow}
          {post.content.length > 100 && (
            <span
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              style={{ color: 'rgb(87, 193, 255)', cursor: 'pointer' }}
            >
              {isContentExpanded ? '...접기' : '...더보기'}
            </span>
          )}
        </div>
      </div>
    )
  }

  const renderComments = (comments: Comment[]) => {
    return comments.map((comment) => {
      const isExpanded = expandedComments.has(comment.id)
      const content = isExpanded
        ? comment.content
        : comment.content.slice(0, 100)

      return (
        <div
          key={comment.id}
          id="detail_coment_deep"
          style={{ marginLeft: comment.parentId ? '20px' : '0' }} // 들여쓰기 적용
        >
          <div
            id="test_coment_img"
            onClick={() => handleProfileClick(comment.nickname)}
          >
            <img id="d_d" alt="프로필 이미지" src={comment.profileImageUrl} />
          </div>
          <div>
            <div id="detail_coment_id">{comment.nickname}</div>
            <div id="detail_coment_content">
              {formatContentWithMentions(content)}
              {comment.content.length > 100 && !isExpanded && (
                <span
                  onClick={() => handleToggleExpand(comment.id)}
                  style={{ color: 'rgb(87, 193, 255)', cursor: 'pointer' }}
                >
                  ...더보기
                </span>
              )}
              {isExpanded && (
                <span
                  onClick={() => handleToggleExpand(comment.id)}
                  style={{ color: 'rgb(87, 193, 255)', cursor: 'pointer' }}
                >
                  ...접기
                </span>
              )}
            </div>
            <div id="detail_coment_edit_line">
              <div id="detail_coment_date">
                {formatRelativeTime(comment.createdAt)}
              </div>

              {comment.parentId === null && (
                <div
                  id="detail_coment_recoment"
                  onClick={() => toggleReplyComment(comment.id)}
                >
                  답글 달기
                </div>
              )}
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
                <div id="test">
                  <TextArea
                    id="detail_reply_content"
                    value={replyContent}
                    onChange={handleMention}
                    onKeyDown={(e) => handleReplyKeyDown(e, comment.id)}
                  ></TextArea>
                  <div
                    id="write_comment_comment_emoji"
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveReplyEmojiPicker(
                        activeReplyEmojiPicker === comment.id
                          ? null
                          : comment.id
                      )
                    }}
                  >
                    <img
                      alt="이모티콘"
                      src="https://cdn-icons-png.flaticon.com/128/3129/3129275.png"
                    ></img>
                  </div>
                </div>
                {activeReplyEmojiPicker === comment.id && (
                  <div id="reply_comment_picker">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: { native: string }) =>
                        setReplyContent((prev) => prev + emoji.native)
                      }
                    />
                  </div>
                )}
                <div id="detail_reply_write_button">
                  <button type="submit">답글 게시</button>
                </div>
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
              </form>
            )}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="detail_container">
      <div id="detail_picture">
        <div id="detail_picture_item1">
          {Array.isArray(post?.mediaUrls) && post.mediaUrls.length > 0 ? (
            <Carousel
              showThumbs={false}
              infiniteLoop={false}
              useKeyboardArrows
              showStatus={false}
              onChange={handleSlideChange}
              renderArrowPrev={(onClickHandler, hasPrev, label) =>
                hasPrev && (
                  <button
                    id="left"
                    type="button"
                    onClick={onClickHandler}
                    title={label}
                    onMouseOver={(e) => {
                      const img = e.currentTarget.querySelector('img')
                      if (img) {
                        img.style.transform = 'scale(1.2)'
                      }
                    }}
                    onMouseOut={(e) => {
                      const img = e.currentTarget.querySelector('img')
                      if (img) {
                        img.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    <img
                      style={{
                        width: 23,
                        height: 23,
                        transition: 'transform 0.3s ease',
                      }}
                      src="https://cdn-icons-png.freepik.com/256/17212/17212714.png?ga=GA1.1.1373474384.1723176329"
                      alt="right"
                    />
                  </button>
                )
              }
              renderArrowNext={(onClickHandler, hasNext, label) =>
                hasNext && (
                  <button
                    id="right"
                    type="button"
                    onClick={onClickHandler}
                    title={label}
                    onMouseOver={(e) => {
                      const img = e.currentTarget.querySelector('img')
                      if (img) {
                        img.style.transform = 'scale(1.2)'
                      }
                    }}
                    onMouseOut={(e) => {
                      const img = e.currentTarget.querySelector('img')
                      if (img) {
                        img.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    <img
                      style={{
                        width: 23,
                        height: 23,
                        transition: 'transform 0.3s ease',
                      }}
                      src="https://cdn-icons-png.freepik.com/256/17212/17212717.png?ga=GA1.1.1373474384.1723176329"
                      alt="left"
                    />
                  </button>
                )
              }
            >
              {post.mediaUrls.map((url: string, index: number) => (
                <div id="preview_container" key={index}>
                  {url.endsWith('.mp4') ? (
                    <video
                      controls
                      controlsList="nodownload"
                      ref={(el) => {
                        videoRefs.current[index] = el
                        setMediaVolume(el)
                      }}
                    >
                      <source src={url} type="video/mp4" />
                    </video>
                  ) : url.endsWith('.mp3') ? (
                    <audio
                      controls
                      controlsList="nodownload"
                      ref={(el) => setMediaVolume(el)}
                    >
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
          <div
            id="detail_content_edit"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {isBookmarked ? (
              <FaBookmark
                size={24}
                style={{
                  cursor: 'pointer',
                  color: 'blue',
                  marginRight: '10px',
                }}
                onClick={toggleBookmark} // 북마크 토글 함수
              />
            ) : (
              <FaRegBookmark
                size={24}
                style={{
                  cursor: 'pointer',
                  color: 'gray',
                  marginRight: '10px',
                }}
                onClick={toggleBookmark} // 북마크 토글 함수
              />
            )}
            {currentUser === post.nickname && (
              <DropDown
                id={'detail_Dropdown'}
                buttonText={con_Text}
                items={con_drop}
                onItemSelect={(item) => {
                  if (item === '게시글 삭제') {
                    handlePostDelete()
                  } else if (item === '게시글 수정') {
                    setIsEditModalOpen(true)
                  }
                }}
              />
            )}
          </div>
        </div>

        <div id="detail_user_content">
          {renderContent()}
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
          <div
            id="detail_like_button"
            onClick={handleLikeToggle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={
                post.likedByUser
                  ? 'https://cdn-icons-png.flaticon.com/128/4397/4397571.png'
                  : 'https://cdn-icons-png.flaticon.com/128/7476/7476962.png'
              }
              alt="좋아요"
            />
          </div>
          <div
            id="detail_heart_count"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {post.likeCount}
          </div>
          {/* 조회수 추가 */}
          <div id="detail_view_count">조회수: {viewCount}</div>
          <div id="detail_heart_write_date">
            {formatRelativeTime(post.createdAt)}
          </div>
          {isLikeListOpen && likedUsers.length > 0 && (
            <div
              className="like-list"
              onMouseEnter={handleLikeListMouseEnter}
              onMouseLeave={handleLikeListMouseLeave}
            >
              {likedUsers.map((user) => (
                <div key={user.id} className="like-list-item">
                  <img src={user.profileImageUrl} alt={user.nickname} />
                  <div>{user.nickname}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <form id="detail_coment_write" onSubmit={handleCommentSubmit}>
            <TextArea
              id="detail_coment_content_content"
              value={newComment}
              onChange={handleNewCommentMention}
              onKeyDown={handleCommentKeyDown}
              showCharCount={false}
            ></TextArea>
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
            <div id="detail_coment_write_button">
              <button type="submit">게시</button>
            </div>
          </form>
          <div id="write_content_emoji">
            <button onClick={() => setIsEmojiPickerOpen((prev) => !prev)}>
              <img
                alt="이모티콘"
                src="https://cdn-icons-png.flaticon.com/128/3129/3129275.png"
              ></img>
            </button>
          </div>
        </div>

        {post && (
          <div id="detail_kakao_share">
            <KakaoShareButton
              title={post.content.slice(0, 10) || '게시글'}
              description={post.content.slice(0, 50)}
              imageUrl={post.mediaUrls[0] || ''}
              linkUrl={generatePostUrl()}
            />
          </div>
        )}

        {isEmojiPickerOpen && (
          <div id="detail_write_picker">
            <Picker
              data={data}
              onEmojiSelect={(emoji: { native: string }) =>
                setNewComment((prev) => prev + emoji.native)
              }
            />
          </div>
        )}
      </div>
      {isEditModalOpen && (
        <CloseButton onClick={handleCloseModal}>×</CloseButton>
      )}
      <Modal
        showCloseButton={false}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        disableOverlayClick={true}
      >
        <EditContent
          postId={id}
          onClose={() => setIsEditModalOpen(false)}
          refreshPost={fetchPostAndComments}
        />
      </Modal>
    </div>
  )
}

export default DetailContent
