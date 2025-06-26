// HeartButton.jsx
import styled from 'styled-components';

const HeartButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.$isAdded ? "red" : "white"};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative; // Add this
  top: 14px; // Add this

  &:hover {
    color: red;
    
    &::before {
      content: "${props => props.$isAdded ? 'Remove from Favourites' : 'Add to Favourites'}";
      position: absolute;
      top: -60%;
      left: 190%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      pointer-events: none;
      opacity: 1;
    }
  }
`;

export default HeartButton;