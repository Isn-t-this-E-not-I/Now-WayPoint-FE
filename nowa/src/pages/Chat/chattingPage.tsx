import {
  AddMemberIcon as OriginalAddMemberIcon,
  EditChatNameIcon as OriginalEditChatNameIcon,
  ExitIcon as OriginalExitIcon,
} from '@/components/icons/icons'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Modal from '../../components/Modal/modal'
import ChatBubble from '../../components/ChatBubble/chatBubble'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  background-color: #f7f7f7;
  padding-top: 70px;
`

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  top: 10px;
  position: fixed;
  width: 80%;
  height: 55px;
  margin-left: 10px;
  border-bottom: 1px solid #2d2e2f;
`

const HeaderMember = styled.div`
  background-color: lightcoral;
  display: flex;
  align-items: center;
  padding: 10px;
  margin-top: -8px;
  font-weight: bold;
`

const HeaderButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  flex: 1;
`

const HeaderEditAddButton = styled.div`
  display: flex;
  background-color: lightseagreen;
  align-items: center;
  margin-top: -28px;
  gap: 5px;
`

const HeaderExitButton = styled.div`
  display: flex;
  background-color: lightsalmon;
  align-items: center;
  margin-top: -28px;
  margin-left: auto;
`

const ProfilePic = styled.img`
  margin-right: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
`

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`

const Button = styled.button<{ themeMode: string }>`
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) => (props.themeMode === 'dark' ? '#f7f7f7' : '#2d2e2f')};
  background-color: ${(props) =>
    props.themeMode === 'dark' ? '#444' : '#fff'};

  &:hover {
    color: #2d2e2f;
    background-color: #ffeb6b;
  }
`

const CloseButton = styled.button<{ color: string }>`
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  color: ${(props) => props.color};

  &:hover {
    color: #ff0000;
  }

  &:focus {
    outline: none;
  }
`

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  width: 80%;
  margin-top: 60px;
  padding: 20px;
`

const ChatForm = styled.form`
  display: flex;
  width: 80%;
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #ccc;
`

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`

const SendButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 10px;
`

interface ChattingPageProps {
  chatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
  }
  onChatRoomNameChange: (id: number, newName: string) => void
}

const ChattingPage: React.FC<ChattingPageProps> = ({
  chatRoom,
  onChatRoomNameChange,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [currentChatName, setCurrentChatName] = useState(chatRoom.name)
  const [newChatName, setNewChatName] = useState(chatRoom.name)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [theme, setTheme] = useState('light')
  const [messages, setMessages] = useState<
    {
      avatarSrc: string
      header: string
      time: string
      message: string
      footer: string
      alignment: 'start' | 'end'
    }[]
  >([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    if (currentTheme) {
      setTheme(currentTheme)
    }
  }, [])

  useEffect(() => {
    setCurrentChatName(chatRoom.name)
    setNewChatName(chatRoom.name)
  }, [chatRoom])

  const openEditModal = () => setIsEditModalOpen(true)
  const closeEditModal = () => setIsEditModalOpen(false)

  const openAddMemberModal = () => setIsAddMemberModalOpen(true)
  const closeAddMemberModal = () => setIsAddMemberModalOpen(false)

  const openConfirmModal = () => setIsConfirmOpen(true)
  const closeConfirmModal = () => setIsConfirmOpen(false)

  const handleChatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewChatName(e.target.value)
  }

  const handleMemberEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberEmail(e.target.value)
  }

  const handleEditChatName = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentChatName(newChatName)
    onChatRoomNameChange(chatRoom.id, newChatName)
    closeEditModal()
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`Add member ${newMemberEmail} to chat room ${chatRoom.id}`)
    closeAddMemberModal()
  }

  const handleExitChatRoom = () => {
    console.log(`Exit chat room ${chatRoom.id}`)
    // 여기에 실제 채팅방 나가기 로직을 추가하세요.
    closeConfirmModal()
  }

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const newMessageObject = {
      avatarSrc: chatRoom.profilePic,
      header: currentChatName,
      time: new Date().toLocaleTimeString(),
      message: newMessage,
      footer: 'Seen at ' + new Date().toLocaleTimeString(),
      alignment: 'end' as 'end',
    }
    setMessages([...messages, newMessageObject])
    setNewMessage('')
  }

  const closeButtonColor = theme === 'dark' ? '#f7f7f7' : '#2d2e2f'

  return (
    <>
      <Wrapper>
        <HeaderWrapper>
          <HeaderMember>
            <ProfilePic src={chatRoom.profilePic} alt="profile" />
            <h1>{currentChatName}</h1>
          </HeaderMember>
          <HeaderButtonWrapper>
            <HeaderEditAddButton>
              <IconButton onClick={openEditModal}>
                <OriginalEditChatNameIcon theme={'light'} />
              </IconButton>
              <IconButton onClick={openAddMemberModal}>
                <OriginalAddMemberIcon theme={'light'} />
              </IconButton>
            </HeaderEditAddButton>
            <HeaderExitButton>
              <IconButton onClick={openConfirmModal}>
                <OriginalExitIcon theme={'light'} />
              </IconButton>
            </HeaderExitButton>
          </HeaderButtonWrapper>
        </HeaderWrapper>
        <ChatContainer>
          {messages.map((msg, index) => (
            <ChatBubble
              key={index}
              alignment={msg.footer.startsWith('Delivered') ? 'start' : 'end'}
              avatarSrc={msg.avatarSrc}
              header={msg.header}
              time={msg.time}
              message={msg.message}
              footer={msg.footer}
            />
          ))}
        </ChatContainer>
        <ChatForm onSubmit={handleSendMessage}>
          <ChatInput
            type="text"
            value={newMessage}
            onChange={handleNewMessageChange}
            placeholder="메시지를 입력하세요"
          />
          <SendButton type="submit">전송</SendButton>
        </ChatForm>

        {isEditModalOpen && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            showCloseButton={false}
          >
            <div>
              <CloseButton onClick={closeEditModal} color={closeButtonColor}>
                &times;
              </CloseButton>
              <h3 className="font-bold text-lg">채팅방명 수정</h3>
              <Form onSubmit={handleEditChatName}>
                <Input
                  type="text"
                  value={newChatName}
                  onChange={handleChatNameChange}
                  placeholder="새 채팅방 이름 입력"
                />
                <Button
                  type="submit"
                  themeMode={theme === 'dark' ? 'dark' : 'light'}
                >
                  수정
                </Button>
              </Form>
            </div>
          </Modal>
        )}

        {isAddMemberModalOpen && (
          <Modal
            isOpen={isAddMemberModalOpen}
            onClose={closeAddMemberModal}
            showCloseButton={false}
          >
            <div>
              <CloseButton
                onClick={closeAddMemberModal}
                color={closeButtonColor}
              >
                &times;
              </CloseButton>
              <h3 className="font-bold text-lg">멤버 초대</h3>
              <Form onSubmit={handleAddMember}>
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={handleMemberEmailChange}
                  placeholder="새 멤버 이메일 입력"
                />
                <Button
                  type="submit"
                  themeMode={theme === 'dark' ? 'dark' : 'light'}
                >
                  초대
                </Button>
              </Form>
            </div>
          </Modal>
        )}

        {isConfirmOpen && (
          <Modal
            isOpen={isConfirmOpen}
            onClose={closeConfirmModal}
            showCloseButton={false}
          >
            <div>
              <CloseButton onClick={closeConfirmModal} color={closeButtonColor}>
                &times;
              </CloseButton>
              <h3 className="font-bold text-lg">채팅방 나가기</h3>
              <p>
                해당 채팅방에서 나가시겠습니까? 확인을 누를 시, 더 이상 해당
                채팅방의 내용을 확인할 수 없게 됩니다.
              </p>
              <div className="modal-action">
                <button className="btn" onClick={handleExitChatRoom}>
                  확인
                </button>
                <button className="btn" onClick={closeConfirmModal}>
                  취소
                </button>
              </div>
            </div>
          </Modal>
        )}
      </Wrapper>
    </>
  )
}

export default ChattingPage
