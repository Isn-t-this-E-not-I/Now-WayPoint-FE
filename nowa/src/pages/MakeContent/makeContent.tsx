import React from 'react'
import '@/styles/MakeContent/makeContent.css'

const makeContent = () => {
  return (
    <div>
      <div id="upload_content">
        <div id="upload_image">
          <div id="content_title">컨텐츠 작성</div>
          <p>이미지 추가</p>
          <hr></hr>
          <input id="img_upload_input" type="file" />

          <div id="upload_image_detail">dada</div>
        </div>

        <div id="upload_content_detail">
          <div id="upload_content_right_logo">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC3-kxZlPzhbz0xONeHwz0aoiM1GytsRzXxw&usqp=CAU"
              alt="이미지"
            ></img>
          </div>

          <div>
            <input
              className="upload_input"
              type="text"
              value={'장소 태그하기'}
            />
            <input
              className="upload_input"
              type="text"
              value={'태그 입력하기'}
            />
            <input
              className="upload_input"
              type="text"
              value={'공개 범위 설정'}
            />

            <div id="upload_button_list">
              <button id="upload_btn_1" className="upload_btn">
                임시 저장
              </button>
              <button id="upload_btn_2" className="upload_btn">
                게시 하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default makeContent
