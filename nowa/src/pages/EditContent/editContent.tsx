import React, { useEffect, useState, ChangeEvent, DragEvent } from 'react'
import '@/styles/MakeContent/makeContent.css'
import Textarea from '@/components/TextArea/textArea'
import Button from '@/components/Button/button'
import Select from '@/components/Select/select'
import { getPostById, updateContent, Post } from '@/services/editContent'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

interface EditContentProps {
  onClose: () => void
  refreshPost: () => void
  postId?: Number
}

const EditContent: React.FC<EditContentProps> = ({
  onClose,
  refreshPost,
  postId,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewSrcs, setPreviewSrcs] = useState<string[]>([])
  const [existingUrls, setExistingUrls] = useState<string[]>([])
  const [removeMedia, setRemoveMedia] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('PHOTO')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  const photoOptions = [
    { id: 'PHOTO', label: '사진' },
    { id: 'VIDEO', label: '동영상' },
    { id: 'MP3', label: '음악' },
  ]

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData: Post = await getPostById(Number(postId))
        setContent(postData.content || '')
        setTags(postData.hashtags || [])
        setSelectedOption(postData.category || 'PHOTO')
        setPreviewSrcs(postData.mediaUrls || [])
        setExistingUrls(postData.mediaUrls || [])

        // 기존 영상 썸네일 생성
        postData.mediaUrls?.forEach((url, index) => {
          if (url.match(/\.(mp4|avi)$/)) {
            generateThumbnail(null, url, index)
          }
        })
      } catch (error) {
        console.error('게시물 데이터를 가져오는 데 실패했습니다:', error)
      }
    }

    fetchPostData()
  }, [postId])

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (files) {
      const totalFilesCount =
        existingUrls.length + newFiles.length + files.length
      if (totalFilesCount > 10) {
        alert('최대 10개의 파일만 업로드할 수 있습니다.')
        return
      }

      const validFileArray: File[] = []
      const invalidFileNames: string[] = []

      Array.from(files).forEach((file) => {
        if (selectedOption === 'PHOTO' && file.type.startsWith('image/')) {
          validFileArray.push(file)
        } else if (
          selectedOption === 'VIDEO' &&
          (file.type === 'video/mp4' || file.type === 'video/x-msvideo')
        ) {
          validFileArray.push(file)
        } else if (selectedOption === 'MP3' && file.type === 'audio/mpeg') {
          validFileArray.push(file)
        } else {
          invalidFileNames.push(file.name)
        }
      })

      if (invalidFileNames.length > 0) {
        alert(
          `다음 파일 형식은 허용되지 않습니다: ${invalidFileNames.join(', ')}`
        )
      }

      setNewFiles((prevFiles) => [...prevFiles, ...validFileArray])

      validFileArray.forEach((file, index) => {
        if (file.type.startsWith('video/')) {
          generateThumbnail(file, undefined, existingUrls.length + index)
        } else {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onloadend = () => {
            if (reader.result) {
              setPreviewSrcs((prevSrcs) => {
                const newSrcs = [...prevSrcs, reader.result as string]
                // 새로 추가된 파일의 미리보기를 선택된 이미지로 설정
                setSelectedImage(newSrcs[newSrcs.length - 1])
                return newSrcs
              })
            }
          }
        }
      })
    }
  }

  const generateThumbnail = (
    file: File | null,
    url?: string,
    index?: number
  ) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous' // crossOrigin 속성 설정
    video.src = url || URL.createObjectURL(file!)
    video.currentTime = 1

    video.addEventListener('canplay', () => {
      const canvas = document.createElement('canvas')
      // 비디오 원본 크기를 가져와서 캔버스 크기를 설정
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnail = canvas.toDataURL('image/png')

        // 썸네일이 생성된 후에 프리뷰 목록 업데이트
        setPreviewSrcs((prevSrcs) => {
          const newSrcs = [...prevSrcs]
          if (index !== undefined) {
            newSrcs[index] = thumbnail // 특정 인덱스에 썸네일 추가
          } else {
            newSrcs.push(thumbnail) // 인덱스가 정의되지 않으면 새 썸네일 추가
          }
          return newSrcs
        })

        // 새로 추가된 파일의 미리보기를 선택된 이미지로 설정
        setSelectedImage((prevSelectedImage) =>
          prevSelectedImage === null ? thumbnail : prevSelectedImage
        )
      }
      URL.revokeObjectURL(video.src)
    })

    video.addEventListener('error', (e) => {
      console.error('비디오 로드 중 오류 발생:', e)
    })
  }

  const handleRemoveFile = (index: number) => {
    const removedSrc = previewSrcs[index]

    if (index < existingUrls.length) {
      const urlToRemove = existingUrls[index]
      setExistingUrls((prevUrls) => prevUrls.filter((_, i) => i !== index))
      setRemoveMedia((prevUrls) => [...prevUrls, urlToRemove])
    } else {
      const adjustedIndex = index - existingUrls.length
      setNewFiles((prevFiles) =>
        prevFiles.filter((_, i) => i !== adjustedIndex)
      )
    }

    setPreviewSrcs((prevSrcs) => prevSrcs.filter((_, i) => i !== index))

    // 만약 제거된 작은 미리보기가 현재 선택된 큰 미리보기라면, 큰 미리보기를 초기화
    if (selectedImage === removedSrc) {
      setSelectedImage(null)
    }
  }

  useEffect(() => {
    // 미리보기가 삭제될 때 큰 미리보기를 업데이트합니다.
    if (!previewSrcs.includes(selectedImage as string)) {
      setSelectedImage(previewSrcs.length > 0 ? previewSrcs[0] : null)
    }
  }, [previewSrcs, selectedImage])

  const handleContextMenu = (
    event: React.MouseEvent<
      HTMLImageElement | HTMLVideoElement | HTMLAudioElement
    >
  ) => {
    event.preventDefault()
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prevTags) => prevTags.filter((t) => t !== tag))
  }

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let inputValue = e.target.value

    const tagPattern = /(?:^|\s)(#[a-zA-Z0-9가-힣]+)\s/g
    const newTags: string[] = []
    let match

    while ((match = tagPattern.exec(inputValue)) !== null) {
      newTags.push(match[1].trim())
      inputValue = inputValue.replace(match[0], ' ')
    }

    const updatedTags = Array.from(new Set([...tags, ...newTags])).slice(0, 5)
    setTags(updatedTags)
    setContent(inputValue)
  }

  const handleOptionChange = (selected: string) => {
    setSelectedOption(selected)
  }

  const handleSubmit = async () => {
    if (!content) {
      alert('내용을 입력해주세요.')
      return
    }

    if (existingUrls.length === 0 && newFiles.length === 0) {
      alert('최소 하나의 파일을 업로드해주세요.')
      return
    }

    const isValid = previewSrcs.every((url, index) => {
      const isExistingUrl = index < existingUrls.length
      if (isExistingUrl) {
        if (selectedOption === 'PHOTO') {
          return /\.(jpg|jpeg|png|gif)$/i.test(url)
        } else if (selectedOption === 'VIDEO') {
          return /\.(mp4|avi)$/i.test(url)
        } else if (selectedOption === 'MP3') {
          return /\.(mp3)$/i.test(url)
        }
      } else {
        const file = newFiles[index - existingUrls.length]
        if (selectedOption === 'PHOTO') {
          return file.type.startsWith('image/')
        } else if (selectedOption === 'VIDEO') {
          return file.type === 'video/mp4' || file.type === 'video/x-msvideo'
        } else if (selectedOption === 'MP3') {
          return file.type === 'audio/mpeg'
        }
      }
      return false
    })

    if (!isValid) {
      alert('선택한 카테고리와 일치하지 않는 파일이 있습니다.')
      return
    }

    const confirmed = window.confirm('게시글을 수정하시겠습니까?')
    if (!confirmed) {
      return
    }

    const token = localStorage.getItem('token')
    try {
      const response = await updateContent(
        Number(postId),
        newFiles,
        content,
        tags,
        selectedOption,
        token,
        removeMedia
      )
      if (response.success) {
        refreshPost()
        onClose()
      }
    } catch (error) {
      console.error('콘텐츠를 업데이트하는 중 오류가 발생했습니다:', error)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handlePreviewClick = (src: string) => {
    setSelectedImage(src)
  }

  const addEmoji = (emoji: { native: string }) => {
    setContent(content + emoji.native)
  }

  if (!content && !tags.length && !selectedOption && !previewSrcs.length) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div id="upload_content" onDragOver={handleDragOver} onDrop={handleDrop}>
        <div id="upload_close_btn">
          <button onClick={onClose}>
            <img
              src="https://cdn-icons-png.flaticon.com/128/25/25298.png"
              alt="close Icon"
            />
          </button>
        </div>
        <div id="upload_content_header">
          <div id="content_title">컨텐츠 수정</div>
          <Button
            id={'upload_btn'}
            children={'수정하기'}
            onClick={handleSubmit}
          />
        </div>
        <hr />
        <div id="upload_content_body">
          <div id="upload_img_btn">
            <div id="upload_category_select">
              <Select
                options={photoOptions}
                classN={'upload_select'}
                value={selectedOption}
                onChange={handleOptionChange}
              />
            </div>

            <div id="upload_img_btn">
              <img
                id="upload_img"
                src="https://cdn-icons-png.flaticon.com/128/401/401061.png"
                alt="Upload Icon"
                onClick={handleImageClick}
                style={{ cursor: 'pointer' }}
              />

              <input
                id="img_upload_input"
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
                accept={
                  selectedOption === 'PHOTO'
                    ? 'image/*'
                    : selectedOption === 'VIDEO'
                      ? 'video/mp4, video/x-msvideo'
                      : selectedOption === 'MP3'
                        ? 'audio/mpeg'
                        : ''
                }
              />
            </div>
          </div>

          <div id="upload_explanation">
            <p>최대 10개의 파일 첨부가 가능합니다</p>
          </div>

          <div id="upload_image">
            <div id="content_dev"></div>

            <div id="upload_preview_container">
              {previewSrcs.map((src, index) => (
                <div
                  key={index}
                  className="file_preview_wrapper"
                  onClick={() => handlePreviewClick(src)}
                >
                  <div className="image_preview_wrapper">
                    <img
                      id="image_preview"
                      src={src}
                      alt={`Image Preview ${index + 1}`}
                      onContextMenu={handleContextMenu}
                    />
                    <button
                      className="remove_image_button"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/25/25298.png"
                        alt="Remove Icon"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedImage && (
            <div id="selected_image_preview">
              <img
                src={selectedImage}
                alt="Selected Preview"
                onContextMenu={handleContextMenu}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          )}

          <div id="upload_content">
            <div id="tag_previews">
              {tags.map((tag, index) => (
                <span key={index} className="tag_preview">
                  {tag}
                  <button
                    className="remove_tag_button"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/25/25298.png"
                      alt="Remove Icon"
                    />
                  </button>
                </span>
              ))}
            </div>
            <div id="Make_text_box">
              <Textarea
                id={'upload_content_dis'}
                placeholder={'내용을 입력해주세요'}
                value={content}
                onChange={handleContentChange}
              />
              <button
                id="make_imoji"
                onClick={() => setShowPicker(!showPicker)}
              >
                {showPicker ? '' : ''}{' '}
                <img
                  src="https://cdn-icons-png.flaticon.com/128/569/569501.png"
                  alt="이모티콘"
                ></img>
              </button>
              <div id="imoji_box_box">
                {showPicker && <Picker data={data} onEmojiSelect={addEmoji} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditContent
