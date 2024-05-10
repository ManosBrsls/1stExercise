import React, { useState } from 'react';
import Sidebar from './Sidebar';

function Upload(){
  
    const [firstButtonClicked, setFirstButtonClicked] = useState(false);

    const handleFirstButtonClick = () => {
      setFirstButtonClicked(true);
    };

    const handleSecondButtonClick = () => {
      // Only allow the second button click if the first button has been clicked
      if (firstButtonClicked) {
        // Handle second button click logic here
        console.log("Second button clicked");
      } else {
        // Inform user to click the first button first
        console.log("Please click the first button first");
      }
    };

    return (
      <div style={{display: "flex"}}>
        <Sidebar />
        <button onClick={handleFirstButtonClick}>First Button</button>
        <button onClick={handleSecondButtonClick} disabled={!firstButtonClicked}>Second Button</button>
      </div>
    );
}

  export default Upload;
