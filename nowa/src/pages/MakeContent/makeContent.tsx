// import React, { useState } from 'react'
// import '@/styles/MakeContent/makeContent.css'

// const makeContent = () => {
//   const fileInputRef = React.useRef<HTMLInputElement>(null)
//   const [previewSrcs, setPreviewSrcs] = useState<string[]>([])

//   const handleImageClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click()
//     }
//   }

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files
//     if (files) {
//       const fileArray = Array.from(files).filter((file) =>
//         file.type.startsWith('image/')
//       )
//       const fileReaders = fileArray.map((file) => {
//         const reader = new FileReader()
//         reader.readAsDataURL(file)
//         return reader
//       })

//       const promises = fileReaders.map((reader) => {
//         return new Promise<string>((resolve, reject) => {
//           reader.onloadend = () => {
//             if (reader.result) {
//               resolve(reader.result as string)
//             } else {
//               reject(new Error('Failed to read file'))
//             }
//           }
//         })
//       })

//       Promise.all(promises)
//         .then((results) => {
//           setPreviewSrcs((prevSrcs) => [...prevSrcs, ...results])
//         })
//         .catch((error) => {
//           console.error(error)
//         })
//     }
//   }

//   const handleContextMenu = (event: React.MouseEvent<HTMLImageElement>) => {
//     event.preventDefault()
//   }

//   return (
//     <div>
//       <div id="upload_content">
//         <div id="upload_image">
//           <div id="content_title">컨텐츠 작성</div>

//           <img
//             id="upload_img"
//             src="https://cdn-icons-png.flaticon.com/128/401/401061.png"
//             alt="Upload Icon"
//             onClick={handleImageClick}
//             style={{ cursor: 'pointer' }}
//           />

//           <hr />
//           <input
//             id="img_upload_input"
//             type="file"
//             ref={fileInputRef}
//             style={{ display: 'none' }}
//             onChange={handleFileChange}
//             multiple
//           />

//           <div id="image_preview_container">
//             {previewSrcs.map((src, index) => (
//               <img
//                 key={index}
//                 id="image_preview"
//                 src={src}
//                 alt={`Image Preview ${index + 1}`}
//                 style={{ marginTop: '20px', maxWidth: '100%' }}
//                 onContextMenu={handleContextMenu}
//               />
//             ))}
//           </div>
//         </div>

//         <div id="upload_content_detail">
//           <div id="upload_content_right_logo">
//             <img
//               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC3-kxZlPzhbz0xONeHwz0aoiM1GytsRzXxw&usqp=CAU"
//               alt="이미지"
//             />
//           </div>

//           <div>
//             <input
//               className="upload_input"
//               type="text"
//               defaultValue={'태그 입력하기'}
//             />
//             {/* <input
//               className="upload_input"
//               type="text"
//               value={'공개 범위 설정'}
//             /> */}

//             <div id="upload_button_list">
//               <button id="upload_btn_1" className="upload_btn">
//                 임시 저장
//               </button>
//               <button id="upload_btn_2" className="upload_btn">
//                 게시 하기
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default makeContent

import React, { useState, useRef } from 'react'
import '@/styles/MakeContent/makeContent.css'

const makeContent = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewSrcs, setPreviewSrcs] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
      )
      const textFiles = Array.from(files).filter(
        (file) => file.type === 'text/plain'
      )

      // 이미지 파일 처리
      const imageReaders = imageFiles.map((file) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        return reader
      })

      const imagePromises = imageReaders.map((reader) => {
        return new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string)
            } else {
              reject(new Error('Failed to read image file'))
            }
          }
        })
      })

      // 텍스트 파일 처리
      const textReaders = textFiles.map((file) => {
        const reader = new FileReader()
        reader.readAsText(file)
        return reader
      })

      const textPromises = textReaders.map((reader) => {
        return new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result) {
              // 텍스트를 캔버스에 렌더링하여 이미지 데이터 URL로 변환
              const canvas = canvasRef.current
              if (canvas) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                  const text = reader.result as string
                  const lines = text.split('\n')
                  const lineHeight = 20
                  canvas.width = 800
                  canvas.height = lines.length * lineHeight + 20
                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                  ctx.font = '16px Arial'
                  ctx.fillStyle = 'black'
                  lines.forEach((line, index) => {
                    ctx.fillText(line, 10, 20 + index * lineHeight)
                  })
                  const imageUrl = canvas.toDataURL('image/png')
                  resolve(imageUrl)
                } else {
                  reject(new Error('Failed to get canvas context'))
                }
              } else {
                reject(new Error('Canvas is not available'))
              }
            } else {
              reject(new Error('Failed to read text file'))
            }
          }
        })
      })

      Promise.all([...imagePromises, ...textPromises])
        .then((results) => {
          const newImageSrcs = results.slice(0, imageFiles.length)
          const newFileUrls = results.slice(imageFiles.length)
          setPreviewSrcs((prevSrcs) => [
            ...prevSrcs,
            ...newImageSrcs,
            ...newFileUrls,
          ])
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

          <img
            id="upload_img"
            src="https://cdn-icons-png.flaticon.com/128/401/401061.png"
            alt="Upload Icon"
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />

          <hr />
          <input
            id="img_upload_input"
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />

          <div id="image_preview_container">
            {previewSrcs.map((src, index) => (
              <img
                key={index}
                id="image_preview"
                src={src}
                alt={`Image Preview ${index + 1}`}
                style={{ marginTop: '20px', maxWidth: '100%' }}
                onContextMenu={handleContextMenu}
              />
            ))}
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
            <input
              className="upload_input"
              type="text"
              defaultValue={'태그 입력하기'}
            />
            {/* <input
              className="upload_input"
              type="text"
              value={'공개 범위 설정'}
            /> */}

            <div id="upload_button_list">
              {/* <button id="upload_btn_1" className="upload_btn">
                임시 저장
              </button> */}
              <button id="upload_btn_2" className="upload_btn">
                게시 하기
              </button>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default makeContent
