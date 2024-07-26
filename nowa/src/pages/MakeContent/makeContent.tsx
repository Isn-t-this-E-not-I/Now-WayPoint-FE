import React, { useState } from 'react'
import '@/styles/MakeContent/makeContent.css'
import TextArea from '@/components/TextArea/textArea'
import Button from '@/components/Button/button'
import { text } from 'stream/consumers'

const makeContent = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewSrcs, setPreviewSrcs] = useState<string[]>([])

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
            <TextArea id={'upload_content_dis'} text={'내용을 입력해주세요'} />
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
            {/* <input
              className="upload_input"
              type="text"
              defaultValue={'태그 입력하기'}
            /> */}
            {/* <input
              className="upload_input"
              type="text"
              value={'공개 범위 설정'}
            /> */}

            <div id="upload_button_list">
              {/* <button id="upload_btn_1" className="upload_btn">
                임시 저장
              </button>
              <button id="upload_btn_2" className="upload_btn">
                게시 하기
              </button> */}

              <Button id={'upload_btn_1'} text={'태그 입력하기'} />
              <Button id={'upload_btn_2'} text={'태그 입력하기'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default makeContent
