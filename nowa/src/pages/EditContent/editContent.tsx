import React, { useEffect, useState, ChangeEvent } from 'react'
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
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('PHOTO')
  const [files, setFiles] = useState<File[]>([])
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
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files).filter(
        (file) =>
          file.type.startsWith('image/') ||
          file.type.startsWith('video/') ||
          file.type === 'audio/mpeg' ||
          file.type === 'audio/mp3' ||
          file.type === 'video/mp4'
      )
      setFiles((prevFiles) => [...prevFiles, ...fileArray])
      const fileReaders = fileArray.map((file) => {
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
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    setPreviewSrcs((prevSrcs) => prevSrcs.filter((_, i) => i !== index))
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
    const token = localStorage.getItem('token')
    try {
      const response = await updateContent(
        Number(id),
        files,
        content,
        tags,
        selectedOption,
        token
      )
      if (response.success) {
        navigate(`/detailContent/${id}`)
      }
    } catch (error) {
      console.error('Error updating content:', error)
    }
  }

  if (!content && !tags.length && !selectedOption && !previewSrcs.length) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div id="upload_content">
        <div id="upload_image">
          <div id="content_title">컨텐츠 수정</div>
          <hr />
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
              />

              {previewSrcs.map((src, index) => (
                <div key={index} className="file_preview_wrapper">
                  {src.startsWith('data:image/') ? (
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
                  ) : src.startsWith('data:video/') ? (
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
                  ) : src.startsWith('data:audio/') ? (
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
