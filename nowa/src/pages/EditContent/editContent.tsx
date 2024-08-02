import React, { useEffect, useState, ChangeEvent, DragEvent } from 'react'
import '@/styles/MakeContent/makeContent.css'
import Textarea from '@/components/TextArea/textArea'
import Button from '@/components/Button/button'
import Select from '@/components/Select/select'
import Modal from '@/components/Modal/modals'
import { getPostById, updateContent, Post } from '@/services/editContent'
import { useParams, useNavigate } from 'react-router-dom'

const EditContent = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewSrcs, setPreviewSrcs] = useState<string[]>([])
  const [existingUrls, setExistingUrls] = useState<string[]>([]) // 기존 이미지 URL 관리
  const [deletedUrls, setDeletedUrls] = useState<string[]>([]) // 삭제된 이미지 URL 관리
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('PHOTO')
  const [newFiles, setNewFiles] = useState<File[]>([]) // 새로 추가된 파일 관리
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

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
        setExistingUrls(postData.mediaUrls || []) // 기존 이미지 URL 설정
      } catch (error) {
        console.error('Failed to fetch post data:', error)
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
  }

  const handleFiles = (files: FileList | null) => {
    if (files) {
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
      const fileReaders = validFileArray.map((file) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        return reader
      })

      const promises = fileReaders.map((reader) => {
        return new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string)
            } else {
              reject(new Error('Failed to read file'))
            }
          }
        })
      })

      Promise.all(promises)
        .then((results) => {
          setPreviewSrcs((prevSrcs) => [...prevSrcs, ...results])
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }

  const handleRemoveFile = (index: number) => {
    if (index < existingUrls.length) {
      // 기존 파일을 제거하는 경우
      const urlToRemove = existingUrls[index]
      setExistingUrls((prevUrls) => prevUrls.filter((_, i) => i !== index))
      setDeletedUrls((prevUrls) => [...prevUrls, urlToRemove]) // 삭제된 URL 추가
      setPreviewSrcs((prevSrcs) => prevSrcs.filter((_, i) => i !== index))
    } else {
      // 새 파일을 제거하는 경우
      const adjustedIndex = index - existingUrls.length
      setNewFiles((prevFiles) =>
        prevFiles.filter((_, i) => i !== adjustedIndex)
      )
      setPreviewSrcs((prevSrcs) => prevSrcs.filter((_, i) => i !== index))
    }
  }

  const handleContextMenu = (
    event: React.MouseEvent<
      HTMLImageElement | HTMLVideoElement | HTMLAudioElement
    >
  ) => {
    event.preventDefault()
  }

  const handleAddTag = (tag: string) => {
    if (tags.length >= 5) {
      alert('태그는 최대 5개까지 입력할 수 있습니다.')
      return
    }
    setTags((prevTags) => [...prevTags, `#${tag}`])
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prevTags) => prevTags.filter((t) => t !== tag))
  }

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const handleOptionChange = (selected: string) => {
    setSelectedOption(selected)
  }

  const handleSubmit = async () => {
    if (!content) {
      alert('내용을 입력해주세요.')
      return
    }

    // 각 미디어 URL의 파일 확장자를 확인하여 카테고리와 일치하는지 확인
    const allMediaUrls = [
      ...existingUrls,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]
    const isValid = allMediaUrls.every((url) => {
      if (selectedOption === 'PHOTO') {
        return /\.(jpg|jpeg|png|gif)$/i.test(url)
      } else if (selectedOption === 'VIDEO') {
        return /\.(mp4|avi)$/i.test(url)
      } else if (selectedOption === 'MP3') {
        return /\.(mp3)$/i.test(url)
      }
      return false
    })

    if (!isValid) {
      alert('선택한 카테고리와 일치하지 않는 파일이 있습니다.')
      return
    }

    const confirmed = window.confirm('정말로 게시글을 수정하시겠습니까?')
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
        deletedUrls
      )
      if (response.success) {
        navigate(`/detailContent/${id}`)
      }
    } catch (error) {
      console.error('Error updating content:', error)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  if (!content && !tags.length && !selectedOption && !previewSrcs.length) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div id="upload_content" onDragOver={handleDragOver} onDrop={handleDrop}>
        <div id="upload_image">
          <div id="content_title">컨텐츠 수정</div>
          <hr />

          <div id="content_dev">
            <Textarea
              id={'upload_content_dis'}
              placeholder={'내용을 입력해주세요'}
              value={content}
              onChange={handleContentChange}
            />
            <div id="tag_previews">
              {tags.map((tag, index) => (
                <span key={index} className="tag_preview">
                  {tag}
                  <button
                    className="remove_tag_button"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div id="upload_forder">
            <div id="image_preview_container">
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

              {previewSrcs.map((src, index) => (
                <div key={index} className="file_preview_wrapper">
                  {src.startsWith('data:image/') ||
                  src.endsWith('.jpg') ||
                  src.endsWith('.jpeg') ||
                  src.endsWith('.png') ? (
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
                        x
                      </button>
                    </div>
                  ) : src.startsWith('data:video/') ||
                    src.endsWith('.mp4') ||
                    src.endsWith('.avi') ? (
                    <div className="image_preview_wrapper">
                      <img
                        id="video_preview"
                        src="https://cdn-icons-png.flaticon.com/128/16296/16296287.png"
                        alt="Video Icon"
                        onContextMenu={handleContextMenu}
                      />
                      <button
                        className="remove_image_button"
                        onClick={() => handleRemoveFile(index)}
                      >
                        x
                      </button>
                    </div>
                  ) : src.startsWith('data:audio/') || src.endsWith('.mp3') ? (
                    <div className="image_preview_wrapper">
                      <img
                        id="audio_preview"
                        src="https://cdn-icons-png.flaticon.com/128/6119/6119310.png"
                        alt="Audio Icon"
                        onContextMenu={handleContextMenu}
                      />
                      <button
                        className="remove_image_button"
                        onClick={() => handleRemoveFile(index)}
                      >
                        x
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <p>최대 10개의 파일 첨부가 가능합니다</p>
        </div>

        <div id="upload_content_detail">
          <div id="upload_content_right_logo">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC3-kxZlPzhbz0xONeHwz0aoiM1GytsRzXxw&usqp=CAU"
              alt="이미지"
            />
          </div>

          <div>
            <div id="upload_button_list">
              <Select
                options={photoOptions}
                classN={'upload_select'}
                value={selectedOption}
                onChange={handleOptionChange}
              />
              <Modal
                id={'upload_btn_1'}
                title={'태그 입력'}
                onAddTag={handleAddTag}
              />
              <Button
                id={'upload_btn_2'}
                children={'수정 하기'}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditContent
