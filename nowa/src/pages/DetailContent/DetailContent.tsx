import React from 'react'
import '@/styles/DetailContent/detailContent.css'
import DropDown from '@/components/DropDown/dropDown'

const DetailContent = () => {
  const con_Text = '='
  const con_drop = ['게시글 수정', '게시글 삭제']

  return (
    <div>
      <div className="detail_container">
        <div id="detail_picture">
          <div id="detail_picture_item1">
            <img
              alt="이미지"
              src="https://cdn.inflearn.com/public/files/pages/68eaac51-7fde-40f9-99be-0011c00c042c/%EB%B0%B0%EA%B2%BD%ED%99%94%EB%A9%B4-long_1920x1280.png"
            />
          </div>
        </div>

        <div id="detail_content_story">
          <div id="detail_right_profile">
            <div id="detail_content_profile">
              <div id="test_profile_img"></div>

              <div id="detail_profile_id">
                <p>test_Id_123</p>

                <div id="detail_profile_address">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/8211/8211159.png"
                    alt="마커이미지"
                  ></img>
                  <span>서울시 서북구 동남쪽 백길따라 이백리</span>
                </div>
              </div>

              {/* <img alt="프로필 이미지" src="" /> */}
            </div>
          </div>

          <div id="detail_user_content">
            <div id="detail_user_write_content">내용</div>
            <div id="hashtag">#태그</div>
          </div>

          <div id="detail_content_coment">
            <div id="detail_coment_deep">
              <div id="test_coment_img"></div>
              <div>
                <div id="detail_coment_id">test_Id_789</div>
                <div id="detail_coment_content">
                  김수한무 거북이와 두루미 삼천갑자 동방삭 치치카포 사리사리센타
                  워리워리 세브리깡 무두셀라 구름이 허리케인에 담벼락 담벼락에
                  서생원 서생원에 고양이 고양이엔 바둑이 바둑이는 돌돌이
                </div>
              </div>
            </div>
            <div id="detail_content_edit">
              <DropDown buttonText={con_Text} items={con_drop} />
            </div>
          </div>

          <div id="detail_content_heart">
            <div id="detail_heart_count">♥</div>
            <div id="detail_heart_write_date">3일전</div>
          </div>

          <form id="detail_coment_write">
            <textarea id="detail_coment_content_content"></textarea>
            <div id="detail_coment_write_button">
              <button>게시</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DetailContent
