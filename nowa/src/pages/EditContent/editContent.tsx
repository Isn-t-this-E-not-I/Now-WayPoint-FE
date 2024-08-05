import React, { useEffect, useState, ChangeEvent, DragEvent } from 'react'
import '@/styles/MakeContent/makeContent.css'
import Textarea from '@/components/TextArea/textArea'
import Button from '@/components/Button/button'
import Select from '@/components/Select/select'
import { getPostById, updateContent, Post } from '@/services/editContent'
import { useParams } from 'react-router-dom'

interface EditContentProps {
  onClose: () => void
  refreshPost: () => void
}

const EditContent: React.FC<EditContentProps> = ({ onClose, refreshPost }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewSrcs, setPreviewSrcs] = useState<string[]>([])
  const [existingUrls, setExistingUrls] = useState<string[]>([])
  const [removeMedia, setRemoveMedia] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('PHOTO')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { id } = useParams<{ id: string }>()

  const photoOptions = [
    { id: 'PHOTO', label: '사진' },
    { id: 'VIDEO', label: '동영상' },
    { id: 'MP3', label: '음악' },
  ]

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData: Post = await getPostById(Number(id))
        setContent(postData.content || '')
        setTags(postData.hashtags || [])
        setSelectedOption(postData.category || 'PHOTO')
        setPreviewSrcs(postData.mediaUrls || [])
        setExistingUrls(postData.mediaUrls || [])
      } catch (error) {
        console.error('게시물 데이터를 가져오는 데 실패했습니다:', error)
      }
    }

    fetchPostData()
  }, [id])

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
        } else {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onloadend = () => {
            if (reader.result) {
              setPreviewSrcs((prevSrcs) => [
                ...prevSrcs,
                reader.result as string,
              ])
            }
          }
        }
      })
    }
  }

  const generateThumbnail = (file: File) => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(file)
    video.currentTime = 1
    video.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnail = canvas.toDataURL('image/png')
        setPreviewSrcs((prevSrcs) => [...prevSrcs, thumbnail])
      }
      URL.revokeObjectURL(video.src)
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
    if (selectedImage === removedSrc) {
      setSelectedImage(null)
    }
  }

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
        Number(id),
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
            <div
              id="selected_image_preview"
              onClick={() => setSelectedImage(null)}
            >
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
            <Textarea
              id={'upload_content_dis'}
              placeholder={'내용을 입력해주세요'}
              value={content}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditContent
