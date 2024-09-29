import React, { ChangeEvent, useState, DragEvent, useEffect } from 'react'
import '@/styles/MakeContent/makeContent.css'
import Textarea from '@/components/TextArea/textArea'
import Button from '@/components/Button/button'
import Select from '@/components/Select/select'
import { uploadContent } from '@/services/makeContent'
import { useNavigate } from 'react-router-dom'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import DraggableFile from '@/components/DragFile/dragFile' // 새로 만들 DraggableFile 컴포넌트

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
  const [showPicker, setShowPicker] = useState(false)

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
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    // 이름, 크기, 마지막 수정 시간을 기준으로 중복 체크
    const duplicateFiles = Array.from(selectedFiles).filter((file) =>
      files.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      )
    )

    if (duplicateFiles.length > 0) {
      alert(
        `이미 업로드된 파일입니다: ${duplicateFiles.map((f) => f.name).join(', ')}`
      )
      return
    }

    // 중복되지 않은 파일들을 처리
    handleFiles(selectedFiles)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFiles = (fileList: FileList | null) => {
    if (fileList) {
      const newPreviewSrcs: string[] = []
      const validFiles: File[] = []

      const filePromises = Array.from(fileList).map((file, index) => {
        return new Promise<void>((resolve) => {
          if (
            (selectedOption === 'PHOTO' && file.type.startsWith('image/')) ||
            (selectedOption === 'VIDEO' &&
              (file.type === 'video/mp4' || file.type === 'video/x-msvideo')) ||
            (selectedOption === 'MP3' && file.type === 'audio/mpeg')
          ) {
            validFiles.push(file)

            // 이미지 파일 처리
            if (file.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onloadend = () => {
                if (reader.result) {
                  newPreviewSrcs[index] = reader.result as string
                }
                resolve() // 파일 읽기가 끝나면 resolve 호출
              }
            }
            // 비디오 파일 처리
            else if (file.type.startsWith('video/')) {
              generateThumbnail(file, index, newPreviewSrcs)
                .then(() => resolve())
                .catch(() => resolve())
            } else if (file.type.startsWith('audio/')) {
              newPreviewSrcs[index] = file.name
              resolve() // 오디오 파일 처리 완료 후 resolve
            }
          } else {
            resolve() // 유효하지 않은 파일은 바로 resolve
          }
        })
      })

      // 모든 파일이 처리된 후 한 번에 상태를 업데이트
      Promise.all(filePromises).then(() => {
        setFiles((prevFiles) => [...prevFiles, ...validFiles])
        setPreviewSrcs((prevSrcs) => [...prevSrcs, ...newPreviewSrcs])
      })
    }
  }

  const generateThumbnail = (
    file: File,
    index: number,
    previewArray: string[]
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
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
          previewArray[index] = thumbnail

          // 성공적으로 완료되면 resolve 호출
          resolve()
        } else {
          // 캔버스 컨텍스트를 가져오지 못한 경우 reject 호출
          reject(new Error('Failed to create thumbnail'))
        }

        URL.revokeObjectURL(video.src)
      })

      video.onerror = () => reject(new Error('Failed to load video'))
    })
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    setPreviewSrcs((prevSrcs) => prevSrcs.filter((_, i) => i !== index))

    if (selectedImage === previewSrcs[index]) {
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
    const tagPattern = /(?:^|\s)(#[a-zA-Z0-9가-힣_]+)\s/g
    const newTags: string[] = []
    let match

    const currentTags = inputValue.match(/#[a-zA-Z0-9가-힣_]+/g)
    if (currentTags) {
      for (const tag of currentTags) {
        if (tag.length > 31) {
          alert(`태그는 최대 30글자까지 입력할 수 있습니다: ${tag}`)
          break
        }
      }
    }

    while ((match = tagPattern.exec(inputValue)) !== null) {
      const tag = match[1].trim()

      if (tag.length > 31) {
        alert(`태그는 최대 30글자까지 입력할 수 있습니다: ${tag}`)
      } else if (newTags.includes(tag) || tags.includes(tag)) {
        alert(`동일한 태그가 이미 존재합니다: ${tag}`)
      } else {
        newTags.push(tag)
      }

      inputValue = inputValue.replace(match[0], ' ')
    }

    const updatedTags = Array.from(new Set([...tags, ...newTags])).slice(0, 31)

    if (updatedTags.length >= 30) {
      alert('태그는 최대 30개까지 입력할 수 있습니다.')
    } else {
      setTags(updatedTags)
      setContent(inputValue)
    }
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
        window.location.reload()
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
    e.stopPropagation()

    const droppedFiles = e.dataTransfer.files

    if (droppedFiles.length === 0) {
      return
    }

    // 중복 파일 필터링
    const duplicateFiles = Array.from(droppedFiles).filter((file) =>
      files.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      )
    )

    if (duplicateFiles.length > 0) {
      alert(
        `이미 업로드된 파일이 있습니다: ${duplicateFiles.map((f) => f.name).join(', ')}`
      )
      return
    }

    // 중복되지 않은 파일만 처리
    handleFiles(droppedFiles)
  }

  const handlePreviewClick = (src: string) => {
    if (
      src.startsWith('data:image/') ||
      src.startsWith('https://cdn-icons-png.flaticon.com/128/1014/1014333.png')
    ) {
      setSelectedImage(src)
    }
  }

  const addEmoji = (emoji: { native: string }) => {
    setContent(content + emoji.native)
  }

  const moveFile = (dragIndex: number, hoverIndex: number) => {
    const draggedFile = files[dragIndex]
    const updatedFiles = [...files]
    updatedFiles.splice(dragIndex, 1)
    updatedFiles.splice(hoverIndex, 0, draggedFile)
    setFiles(updatedFiles)

    const draggedPreview = previewSrcs[dragIndex]
    const updatedPreviews = [...previewSrcs]
    updatedPreviews.splice(dragIndex, 1)
    updatedPreviews.splice(hoverIndex, 0, draggedPreview)
    setPreviewSrcs(updatedPreviews)
  }

  useEffect(() => {
    // 파일 순서가 변경되었는지 콘솔에서 확인
    console.log('Updated file order:', files)
  }, [files]) // files 상태가 변경될 때마다 실행

  useEffect(() => {
    // 미리보기가 삭제될 때 큰 미리보기를 업데이트합니다.
    if (!previewSrcs.includes(selectedImage as string)) {
      setSelectedImage(previewSrcs.length > 0 ? previewSrcs[0] : null)
    }
  }, [previewSrcs, selectedImage])

  return (
    <div onClick={onClose} style={{ position: 'relative' }}>
      <div
        id="upload_content"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={(e) => e.stopPropagation()}
      >
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
                <DraggableFile
                  key={index}
                  index={index}
                  src={src}
                  moveFile={moveFile}
                  handleRemoveFile={handleRemoveFile}
                  handlePreviewClick={handlePreviewClick}
                  selectedOption={selectedOption}
                />
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
                <div key={index} className="tag_preview">
                  <div>
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
                  </div>
                </div>
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

export default MakeContent
