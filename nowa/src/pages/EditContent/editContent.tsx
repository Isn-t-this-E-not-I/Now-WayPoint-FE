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
        setExistingUrls(postData.mediaUrls || [])

        if (postData.mediaUrls) {
          // 기존 미디어 처리
          const initialPreviews = postData.mediaUrls
            .map((url) => {
              if (url.match(/\.(mp4|avi)$/)) {
                generateThumbnail(null, url)
                return url // URL을 반환하여 미리보기 생성 대기
              } else if (url.match(/\.(mp3)$/)) {
                return url.split('/').pop()?.split('.')[0] || url
              } else {
                return url
              }
            })
            .filter(Boolean) as string[]

          setPreviewSrcs(initialPreviews)
          if (initialPreviews.length > 0) {
            setSelectedImage(initialPreviews[0])
          }
        }
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

      validFileArray.forEach((file) => {
        if (file.type.startsWith('video/')) {
          generateThumbnail(file)
        } else if (file.type.startsWith('audio/')) {
          setPreviewSrcs((prevSrcs) => {
            const fileName =
              file.name.split('/').pop()?.split('.')[0] || file.name
            const newSrcs = [...prevSrcs, fileName]
            setSelectedImage(newSrcs[newSrcs.length - 1])
            return newSrcs
          })
        } else {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onloadend = () => {
            if (reader.result) {
              setPreviewSrcs((prevSrcs) => {
                const newSrcs = [...prevSrcs, reader.result as string]
                setSelectedImage(newSrcs[newSrcs.length - 1])
                return newSrcs
              })
            }
          }
        }
      })
    }
  }

  const generateThumbnail = (file: File | null, url?: string) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.src = url || URL.createObjectURL(file!)

    video.addEventListener('loadeddata', () => {
      video.currentTime = 1 // 비디오의 첫 번째 프레임이 로드된 후 특정 시점으로 이동
    })

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnail = canvas.toDataURL('image/png')

        setPreviewSrcs((prevSrcs) => {
          const newSrcs = url
            ? prevSrcs.map((src) => (src === url ? thumbnail : src))
            : [...prevSrcs, thumbnail]
          setSelectedImage(thumbnail)
          return newSrcs
        })

        // 메모리 정리를 위해 비디오 객체와 URL 객체를 해제
        URL.revokeObjectURL(video.src)
        video.remove()
      }
    })

    video.addEventListener('error', (e) => {
      console.error('비디오 로드 중 오류 발생:', e)
      const defaultVideoThumbnail =
        'https://path-to-default-video-thumbnail.png'
      setPreviewSrcs((prevSrcs) => {
        const newSrcs = url
          ? prevSrcs.map((src) => (src === url ? defaultVideoThumbnail : src))
          : [...prevSrcs, defaultVideoThumbnail]
        setSelectedImage(defaultVideoThumbnail)
        return newSrcs
      })

      video.remove()
    })

    video.load()
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

    if (selectedImage === removedSrc) {
      setSelectedImage(null)
    }
  }

  useEffect(() => {
    if (!previewSrcs.includes(selectedImage as string)) {
      setSelectedImage(previewSrcs.length > 0 ? previewSrcs[0] : null)
    }
  }, [previewSrcs, selectedImage])

  const handleContextMenu = (
    event: React.MouseEvent<
      HTMLImageElement | HTMLVideoElement | HTMLAudioElement | HTMLDivElement
    >
  ) => {
    event.preventDefault()
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prevTags) => prevTags.filter((t) => t !== tag))
  }

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let inputValue = e.target.value

    const tagPattern = /(?:^|\s)(#[a-zA-Z0-9가-힣_]+)\s/g
    const newTags: string[] = []
    let match
    let invalidTagFound = false

    const currentTags = inputValue.match(/#[a-zA-Z0-9가-힣_]+/g)
    if (currentTags) {
      for (const tag of currentTags) {
        if (tag.length > 31) {
          invalidTagFound = true
          alert(`태그는 최대 30글자까지 입력할 수 있습니다: ${tag}`)
          return
        }
      }
    }

    while ((match = tagPattern.exec(inputValue)) !== null) {
      const tag = match[1].trim()

      if (tag.length > 31) {
        alert(`태그는 최대 30글자까지 입력할 수 있습니다: ${tag}`)
        invalidTagFound = true
        break
      } else {
        newTags.push(tag)
      }

      inputValue = inputValue.replace(match[0], ' ')
    }

    const updatedTags = Array.from(new Set([...tags, ...newTags])).slice(0, 31)
    if (updatedTags.length > 31) {
      alert('태그는 최대 30개까지 입력할 수 있습니다.')
    } else if (!invalidTagFound) {
      setTags(updatedTags)
      setContent(inputValue)
    }
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

    const isValid = previewSrcs.every((_url, index) => {
      const isExistingUrl = index < existingUrls.length

      // 기존 파일 URL은 이미 올바른 형식이라고 가정
      if (isExistingUrl) {
        return true
      }

      const file = newFiles[index - existingUrls.length]
      if (selectedOption === 'PHOTO') {
        return file.type.startsWith('image/')
      } else if (selectedOption === 'VIDEO') {
        return file.type === 'video/mp4' || file.type === 'video/x-msvideo'
      } else if (selectedOption === 'MP3') {
        return file.type === 'audio/mpeg'
      }
      return false
    })

    if (!isValid) {
      alert('선택한 카테고리와 일치하지 않는 파일이 있습니다.')
      return
    }

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
                    {selectedOption === 'MP3' && !src.startsWith('data:') ? (
                      <div className="audio_preview">{src}</div>
                    ) : (
                      <img
                        id="image_preview"
                        src={src}
                        alt={`Image Preview ${index + 1}`}
                        onContextMenu={handleContextMenu}
                      />
                    )}
                    <button
                      className="remove_image_button"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <img
                        src="https://www.iconarchive.com/download/i103472/paomedia/small-n-flat/sign-delete.1024.png"
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
              {selectedOption === 'MP3' &&
              !selectedImage.startsWith('data:') ? (
                <div className="audio_preview">{selectedImage}</div>
              ) : (
                <img
                  src={selectedImage}
                  alt="Selected Preview"
                  onContextMenu={handleContextMenu}
                  onDragStart={(e) => e.preventDefault()}
                />
              )}
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
                      src="https://www.iconarchive.com/download/i103472/paomedia/small-n-flat/sign-delete.1024.png"
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
                showCharCount={false}
              />
              <button
                id="make_imoji"
                onClick={() => setShowPicker(!showPicker)}
              >
                {showPicker ? '' : ''}{' '}
                <img
                  src="https://cdn-icons-png.flaticon.com/128/3129/3129275.png"
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
