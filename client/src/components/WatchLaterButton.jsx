// WatchLaterButton.jsx
import styled from 'styled-components';

const WatchLaterButton = styled.button`
  background: transparent;
  border: none;
  font-size: 2rem;
  color: ${props => props.$isAdded ? "gold" : "white"};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative; // Add this
  top: 20px; // Add this

  &:hover {
    color: gold;
    
    &::before {
      content: "${props => props.$isAdded ? 'Remove from Watch Later' : 'Add to Watch Later'}";
      position: absolute;
      top: -30%;
      left: 200%;
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

export default WatchLaterButton;