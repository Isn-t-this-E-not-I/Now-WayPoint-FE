import React from 'react'
import styled from 'styled-components'

const SearchWrapper = styled.div`
  .input {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 283px;
    height: 40px;
    margin-bottom: 10px;
  }

  .input input {
    flex-grow: 1;
    margin-left: -25px;
  }

  .input svg {
    height: 1rem;
    width: 3rem;
    opacity: 0.7;
  }
`

const Search: React.FC = () => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const query = event.currentTarget.value
      performSearch(query)
    }
  }

  const performSearch = (query: string) => {
    console.log('Searching for:', query)
    // 여기에 검색 로직을 구현하세요.
    // 예를 들어, 상태를 업데이트하거나 API를 호출하거나 검색 결과 페이지로 이동하는 로직 등을 작성할 수 있습니다.
  }

  return (
    <SearchWrapper>
      <label className="input input-bordered">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 16"
          fill="currentColor"
          className="icon"
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          className="grow"
          placeholder="Search"
          onKeyDown={handleKeyDown}
        />
      </label>
    </SearchWrapper>
  )
}

export default Search
