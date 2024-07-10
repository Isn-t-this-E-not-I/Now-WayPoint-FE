import React from 'react'
import '@/styles/MakeContent/makeContent.css'

const makeContent = () => {
  return (
    <div>
      <div id="upload_content">
        <div id="upload_image">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj0EV4XUuhv_DB98RKbayxPX0RSeZ20sv7rw&usqp=CAU"
            alt="이미지 업로드"
          ></img>
        </div>

        <div id="upload_content_detail">
          <div id="upload_content_right_logo">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC3-kxZlPzhbz0xONeHwz0aoiM1GytsRzXxw&usqp=CAU"
              alt="이미지"
            ></img>
          </div>

          <div id="upload_button_list">
            <button id="upload_btn_1" className="upload_btn">
              임시 저장
            </button>
            <button id="upload_btn_2" className="upload_btn">
              게시 하기
            </button>
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
            <input className="upload_input" type="text" value={''} />
            <div id="upload_set">
              <table>
                <th>
                  <td>item1</td>
                  <td>item2</td>
                  <td>item3</td>
                </th>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default makeContent
