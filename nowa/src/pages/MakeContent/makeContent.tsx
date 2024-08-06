import React, { ChangeEvent, useState, DragEvent, useEffect } from 'react'
import '@/styles/MakeContent/makeContent.css'
import Textarea from '@/components/TextArea/textArea'
import Button from '@/components/Button/button'
import Select from '@/components/Select/select'
import { uploadContent } from '@/services/makeContent'
import { useNavigate } from 'react-router-dom'

interface MakeContentProps {
  onClose: () => void
}

const MakeContent: React.FC<MakeContentProps> = ({ onClose }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewSrcs, setPreviewSrcs] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('PHOTO')
  const [files, setFiles] = useState<File[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const navigate = useNavigate()

  const photoOptions = [
    { id: 'PHOTO', label: '사진' },
    { id: 'VIDEO', label: '동영상' },
    { id: 'MP3', label: '음악' },
  ]

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (files) {
      const currentFileCount = files.length + previewSrcs.length
      if (currentFileCount > 10) {
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

      setFiles((prevFiles) => [...prevFiles, ...validFileArray])

      validFileArray.forEach((file) => {
        if (file.type.startsWith('video/')) {
          generateThumbnail(file)
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
        setPreviewSrcs((prevSrcs) => {
          const newSrcs = [...prevSrcs, thumbnail]
          // 새로 추가된 파일의 미리보기를 선택된 이미지로 설정
          setSelectedImage(newSrcs[newSrcs.length - 1])
          return newSrcs
        })
      }
      URL.revokeObjectURL(video.src)
    })
  }

  const handleRemoveFile = (index: number) => {
    const removedSrc = previewSrcs[index]
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
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

    // 태그가 공백 또는 문자열의 시작으로부터 시작하는지 확인
    const tagPattern = /(?:^|\s)(#[a-zA-Z0-9가-힣]+)\s/g
    const newTags: string[] = []
    let match

    while ((match = tagPattern.exec(inputValue)) !== null) {
      newTags.push(match[1].trim())
      inputValue = inputValue.replace(match[0], ' ')
    }

    // 기존 태그와 새로운 태그를 합쳐서 업데이트
    const updatedTags = Array.from(new Set([...tags, ...newTags])).slice(0, 5)
    setTags(updatedTags)
    setContent(inputValue)
  }

  const handleOptionChange = (selected: string) => {
    setSelectedOption(selected)
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')

    // 파일 타입과 카테고리를 검사
    const isValid = files.every((file) => {
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

    if (content == '') {
      alert('내용을 입력해주세요!')
    }

    try {
      const response = await uploadContent(
        files,
        content,
        tags,
        selectedOption,
        token
      )
      const id = response.id
      if (id) {
        navigate(`/mypage`)
        onClose() // 게시가 완료되면 모달을 닫습니다.
      }
    } catch (error) {
      console.error('Error uploading content:', error)
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
    if (src.startsWith('data:image/')) {
      setSelectedImage(src)
    }
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
          <div id="content_title">컨텐츠 작성</div>
          <Button id={'upload_btn'} children={'작성'} onClick={handleSubmit} />
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

export default MakeContent
