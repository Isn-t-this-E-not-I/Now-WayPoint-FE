import React, { useState } from 'react'
import '@/styles/MakeContent/makeContent.css'
import Textarea from '@/components/TextArea/textArea'
import Button from '@/components/Button/button'
import Select from '@/components/Select/select'
import Modal from '@/components/Modal/modals'
import { uploadContent } from '@/service/makeContent'

const MakeContent = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewSrcs, setPreviewSrcs] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('PHOTO')
  const [files, setFiles] = useState<File[]>([])

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
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

  const handleContextMenu = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault()
  }

  const handleAddTag = (tag: string) => {
    setTags((prevTags) => [...prevTags, `#${tag}`])
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const handleOptionChange = (selected: string) => {
    setSelectedOption(selected)
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')
    try {
      const result = await uploadContent(
        files,
        content,
        tags,
        selectedOption,
        token
      )
      console.log('Upload successful:', result)
    } catch (error) {
      console.error('Error uploading content:', error)
    }
  }

  return (
    <div>
      <div id="upload_content">
        <div id="upload_image">
          <div id="content_title">컨텐츠 작성</div>
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
                <img
                  key={index}
                  id="image_preview"
                  src={src}
                  alt={`Image Preview ${index + 1}`}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
          </div>
          <p>최대 10개의 파일 첨부가 가능합니다</p>
          <div id="content_dev">
            <Textarea
              id={'upload_content_dis'}
              text={'내용을 입력해주세요'}
              value={content}
              onChange={handleContentChange}
            />
            <div id="tag_previews">
              {tags.map((tag, index) => (
                <span key={index} className="tag_preview">
                  {tag}
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
                text={'게시 하기'}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MakeContent
