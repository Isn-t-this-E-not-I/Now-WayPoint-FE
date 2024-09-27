import styled from 'styled-components'

const getColor = (theme: 'light' | 'dark', _active: boolean, color?: string) =>
  color ? color : theme === 'dark' ? '#F8FAFF' : '#2D2E2F'

const IconWrapper = styled.div`
  margin-top: 23px;
`

const LogoWrapper = styled.div`
  margin-top: 10px;
`

const NowaWrapper = styled.div`
  margin-top: -15px;
  padding-left: 16px;
  width: 19.9rem;
  /* background-color: #f8faff; */
`

const CreateChatButtonIconWrapper = styled.div`
  margin-bottom: 7px;
`

export const ChatIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="34px"
      viewBox="0 -960 960 960"
      width="34px"
      fill={getColor(theme, false, color)}
    >
      <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
    </svg>
  </IconWrapper>
)

export const ContentsIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="34px"
      viewBox="0 -960 960 960"
      width="34px"
      fill={getColor(theme, false, color)}
    >
      <path d="M160-80q-33 0-56.5-23.5T80-160v-400q0-33 23.5-56.5T160-640h640q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H160Zm0-80h640v-400H160v400Zm240-40 240-160-240-160v320ZM160-680v-80h640v80H160Zm120-120v-80h400v80H280ZM160-160v-400 400Z" />
    </svg>
  </IconWrapper>
)

export const MainIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="34px"
      viewBox="0 -960 960 960"
      width="34px"
      fill={getColor(theme, false, color)}
    >
      <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
    </svg>
  </IconWrapper>
)

export const MyPageIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="34px"
      viewBox="0 -900 960 960"
      width="34px"
      fill={getColor(theme, false, color)}
    >
      <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360Zm0 360Z" />
    </svg>
  </IconWrapper>
)

export const NewCreateIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="32px"
      viewBox="0 -960 960 960"
      width="32px"
      fill={getColor(theme, false, color)}
    >
      <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
    </svg>
  </IconWrapper>
)

export const NotificationsIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="34px"
      viewBox="0 -960 960 960"
      width="34px"
      fill={getColor(theme, false, color)}
    >
      <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
    </svg>
  </IconWrapper>
)

export const FollowContentsIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="34px"
      viewBox="0 -960 960 960"
      width="34px"
      fill={getColor(theme, false, color)}
    >
      <path d="m160-840 80 160h120l-80-160h80l80 160h120l-80-160h80l80 160h120l-80-160h120q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840Zm0 240v400h640v-400H160Zm0 0v400-400Zm160 360h320v-22q0-44-44-71t-116-27q-72 0-116 27t-44 71v22Zm160-160q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Z" />
    </svg>
  </IconWrapper>
)

export const LogoIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <LogoWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32.63 5"
      height="34px"
      width="34px"
      fill={getColor(theme, false, color)}
    >
      <defs>
        <style>
          {`
          .cls-1 {
            fill: ${getColor(theme, false, color)};
            stroke: #fff;
            stroke-miterlimit: 10;
            stroke-width: .13px;
          }
          `}
        </style>
      </defs>
      <g data-name="레이어 2">
        <g>
          <polygon
            className="cls-1"
            points=".61 12.74 24.32 1.54 32.42 5.24 .61 12.74"
          />
          <polygon
            className="cls-1"
            points="1.35 12.46 20.29 .08 23.27 1.57 1.35 12.46"
          />
          <polygon
            className="cls-1"
            points="23.27 1.57 23.34 2 .92 12.67 23.27 1.57"
          />
          <polygon
            className="cls-1"
            points="26.04 6.74 26.55 9.92 1.35 12.46 26.04 6.74"
          />
        </g>
      </g>
    </svg>
  </LogoWrapper>
)

export const NowaIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <NowaWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 34 30"
      height="80px"
      width="80px"
      fill={getColor(theme, false, color)}
    >
      <defs>
        <style>
          {`
          .cls-1 {
            stroke-width: 0px;
            fill: ${getColor(theme, false, color)};
          }
          `}
        </style>
      </defs>
      <path
        className="cls-1"
        d="M12.62,12.04c-1.74.12-3.13,1.47-3.22,3.13-.03.65.13,1.26.44,1.78h0l2.66,5.41c.15.31.61.31.76,0l2.66-5.41c.28-.48.45-1.03.45-1.62,0-1.9-1.7-3.43-3.74-3.29ZM12.88,17.77c-1.16,0-2.1-1-2.1-2.24s.94-2.24,2.1-2.24,2.1,1,2.1,2.24-.94,2.24-2.1,2.24Z"
      />
      <path
        className="cls-1"
        d="M6.88,22.21l-3.17-4.76v4.76H1.48v-9.81h2.11l3.17,4.83v-4.83h2.22v9.81h-2.11Z"
      />
      <path
        className="cls-1"
        d="M22.15,22.73l-.86-5.84h-.04l-.87,5.84h-2.02l-2.01-10.49h2.23l.83,6.2h.07l.87-6.2h2.06l.83,6.2h.07l.84-6.2h2.02l-2.02,10.49h-2.02Z"
      />
      <path
        className="cls-1"
        d="M30.69,22.56l-.31-1.45h-2.61l-.31,1.45h-2.45l2.72-10.25h2.79l2.72,10.25h-2.54ZM28.26,18.82h1.62l-.78-3.65h-.04l-.79,3.65Z"
      />
    </svg>
  </NowaWrapper>
)

export const CreateChatButtonIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <CreateChatButtonIconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30px"
      height="30px"
      viewBox="0 -960 960 960"
      fill={getColor(theme, false, color)}
    >
      <defs>
        <style>
          {`
          .cls-1 {
            stroke-width: 0px;
            fill: ${getColor(theme, false, color)};
          }
          `}
        </style>
      </defs>
      <path d="m40-40 78-268q-19-41-28.5-84T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80q-45 0-88-9.5T308-118L40-40Zm118-118 128-38q14-4 28.5-3t27.5 7q32 16 67 24t71 8q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 36 8 71t24 67q7 13 7.5 27.5T196-286l-38 128Zm282-162h80v-120h120v-80H520v-120h-80v120H320v80h120v120Zm39-159Z" />
    </svg>
  </CreateChatButtonIconWrapper>
)

export const ExitIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill={getColor(theme, false, color)}
    >
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
    </svg>
  </IconWrapper>
)

export const EditChatNameIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill={getColor(theme, false, color)}
    >
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
    </svg>
  </IconWrapper>
)

export const AddMemberIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill={getColor(theme, false, color)}
    >
      <path d="M500-482q29-32 44.5-73t15.5-85q0-44-15.5-85T500-798q60 8 100 53t40 105q0 60-40 105t-100 53Zm220 322v-120q0-36-16-68.5T662-406q51 18 94.5 46.5T800-280v120h-80Zm80-280v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Zm-480-40q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM0-160v-112q0-34 17.5-62.5T64-378q62-31 126-46.5T320-440q66 0 130 15.5T576-378q29 15 46.5 43.5T640-272v112H0Zm320-400q33 0 56.5-23.5T400-640q0-33-23.5-56.5T320-720q-33 0-56.5 23.5T240-640q0 33 23.5 56.5T320-560ZM80-240h480v-32q0-11-5.5-20T540-306q-54-27-109-40.5T320-360q-56 0-111 13.5T100-306q-9 5-14.5 14T80-272v32Zm240-400Zm0 400Z" />
    </svg>
  </IconWrapper>
)

export const EditIcon = ({ theme }: { theme: 'light' | 'dark' }) => (
  <IconWrapper>
    <svg
      fill={getColor(theme, false)}
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 528.899 528.899"
      stroke={getColor(theme, false)}
      width="24px"
      height="24px"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path>
        </g>
      </g>
    </svg>
  </IconWrapper>
)

export const SearchIcon = ({
  theme,
  color,
}: {
  theme: 'light' | 'dark'
  color?: string
}) => (
  <IconWrapper>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="34px"
      viewBox="0 0 72 72" // 뷰포트 값을 맞춤
      width="34px"
      fill={getColor(theme, false, color)}
    >
      <path d="M 31 11 C 19.973 11 11 19.973 11 31 C 11 42.027 19.973 51 31 51 C 34.974166 51 38.672385 49.821569 41.789062 47.814453 L 54.726562 60.751953 C 56.390563 62.415953 59.088953 62.415953 60.751953 60.751953 C 62.415953 59.087953 62.415953 56.390563 60.751953 54.726562 L 47.814453 41.789062 C 49.821569 38.672385 51 34.974166 51 31 C 51 19.973 42.027 11 31 11 z M 31 19 C 37.616 19 43 24.384 43 31 C 43 37.616 37.616 43 31 43 C 24.384 43 19 37.616 19 31 C 19 24.384 24.384 19 31 19 z"></path>
    </svg>
  </IconWrapper>
)
