import React, { useEffect } from 'react';

function App() {
  const onButtonClick = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id || 0, '');
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (
      message,
      sender,
      sendResponse
    ) {
      console.log('BUTTON FROM THE APP>TSX::::::::');

      if (message.action === 'addButton') {
        const emailText = message.emailText;
      }
    });
    setTimeout(() => {
      onButtonClick();
    }, 0);
  }, []);

  return (
    <div style={{ padding: '1em', margin: '1em' }}>
      <div>
        <h3>Add Button to Webpage</h3>
        <button
          id="webButton"
          onClick={onButtonClick}
          style={{
            padding: '10px 30px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none',
          }}
          className="webButton"
        >
          Add Button
        </button>
      </div>
    </div>
  );
}

export default App;
