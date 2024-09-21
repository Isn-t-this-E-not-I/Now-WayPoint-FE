import React, { ChangeEvent, useState, DragEvent, useEffect } from 'react'
import '@/styles/MakeContent/makeContent.css'
import Textarea from '@/components/TextArea/textArea'
import Button from '@/components/Button/button'
import Select from '@/components/Select/select'
import { uploadContent } from '@/services/makeContent'
import { useNavigate } from 'react-router-dom'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files

    if (!selectedFiles) return

    // 선택된 파일들의 해시값을 계산
    const selectedFileHashes = await Promise.all(
      Array.from(selectedFiles).map((file) => hashFile(file))
    )

    // 이미 업로드된 파일들의 해시값을 미리 계산
    const uploadedFileHashes = await Promise.all(
      files.map((file) => hashFile(file))
    )

    // 중복된 파일 확인
    const duplicateFiles = Array.from(selectedFiles).filter((file, index) => {
      const fileHash = selectedFileHashes[index]
      return uploadedFileHashes.includes(fileHash)
    })

    // 중복된 파일이 있으면 경고 메시지 출력
    if (duplicateFiles.length > 0) {
      alert(
        `이미 업로드된 파일입니다: ${duplicateFiles.map((f) => f.name).join(', ')}`
      )
      return
    }

    // 중복이 없는 파일만 처리
    handleFiles(selectedFiles)

    // 업로드 완료 후 파일 선택창 초기화
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

  //동일한 해시태그 불가능
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let inputValue = e.target.value

    // 태그가 공백 또는 문자열의 시작으로부터 시작하는지 확인
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
          break
        }
      }
    }

    while ((match = tagPattern.exec(inputValue)) !== null) {
      const tag = match[1].trim()

      if (tag.length > 31) {
        invalidTagFound = true
        alert(`태그는 최대 30글자까지 입력할 수 있습니다: ${tag}`)
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

  // //배열 동일한 태그 입력 가능
  // const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
  //   let inputValue = e.target.value

  //   // 태그가 공백 또는 문자열의 시작으로부터 시작하는지 확인
  //   const tagPattern = /(?:^|\s)(#[a-zA-Z0-9가-힣]+)\s/g
  //   const newTags: string[] = []
  //   let match
  //   let invalidTagFound = false

  //   const currentTags = inputValue.match(/#[a-zA-Z0-9가-힣]+/g)
  //   if (currentTags) {
  //     for (const tag of currentTags) {
  //       if (tag.length > 31) {
  //         invalidTagFound = true
  //         alert(`태그는 최대 30글자까지 입력할 수 있습니다: ${tag}`)
  //         break
  //       }
  //     }
  //   }

  //   while ((match = tagPattern.exec(inputValue)) !== null) {
  //     const tag = match[1].trim()

  //     if (tag.length > 31) {
  //       invalidTagFound = true
  //       alert(`태그는 최대 30글자까지 입력할 수 있습니다: ${tag}`)
  //     } else {
  //       newTags.push(tag)
  //     }

  //     inputValue = inputValue.replace(match[0], ' ')
  //   }

  //   // 기존 태그와 새로운 태그를 합쳐서 업데이트
  //   const combinedTags = [...tags, ...newTags]

  //   if (combinedTags.length > 30) {
  //     alert('태그는 최대 30개까지 입력할 수 있습니다.')
  //   } else if (!invalidTagFound) {
  //     setTags(combinedTags)
  //     setContent(inputValue)
  //   }
  // }

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
  const hashFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer() // 파일의 내용을 ArrayBuffer로 읽음
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer) // SHA-256 해시값 생성
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // 해시값을 Uint8Array로 변환
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // 16진수 문자열로 변환
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFiles = e.dataTransfer.files

    // 파일이 있는지 확인
    if (droppedFiles.length === 0) {
      return
    }

    // 드래그된 파일들의 해시값을 미리 계산
    const droppedFileHashes = await Promise.all(
      Array.from(droppedFiles).map((file) => hashFile(file))
    )

    // 이미 업로드된 파일들의 해시값을 미리 계산
    const uploadedFileHashes = await Promise.all(
      files.map((file) => hashFile(file))
    )

    // 중복된 파일 확인
    const duplicateFiles = Array.from(droppedFiles).filter((file, index) => {
      const fileHash = droppedFileHashes[index]
      return uploadedFileHashes.includes(fileHash)
    })

    // 중복된 파일이 있으면 경고 메시지 출력
    if (duplicateFiles.length > 0) {
      alert(
        `이미 업로드된 파일입니다: ${duplicateFiles.map((f) => f.name).join(', ')}`
      )
      return
    }

    // 중복되지 않은 파일을 처리
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

export default MakeContent
