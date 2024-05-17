import React, { ChangeEvent, useEffect, useState } from 'react';

const EmailSuggestions: React.FC = () => {
  const containerStyle = {
    backgroundColor: '#f7f7f7',
    padding: '20px',
    width: '265px',
    margin: '-12px',
    paddingBottom: '105px',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '24px',
    marginBottom: '10px',
  };

  const selectStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '10px',
  };
  const responseItemStyle = {
    cursor: 'pointer',
    padding: '8px',
    marginBottom: '2px',
    backgroundColor: '#eaeaea',
    borderRadius: '4px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  };

  const closeButton = {
    marginTop: '8px',
    height: '23px',
    fontSize: '13px',
    color: '#ffffff',
    backgroundColor: '#87150b',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
  };

  const [responseText, setResponseText] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('formal');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'receiveEmailText') {
        const emailText = `Please add give a formal reply to this email and don't add prompt like here is you email and all stuff just give me the proper response in a good way \n ${message?.response}`;
        const modifiedEmailText = emailText?.replace('formal', selectedTone);
        if (modifiedEmailText && modifiedEmailText.includes(selectedTone)) {
          generateResponse(modifiedEmailText);
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [selectedTone]);

  const handleToneChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const tone = event.target.value;
    setSelectedTone(tone);
    chrome.runtime.sendMessage({ action: 'generateEmailText' });
  };

  const generateResponse = async (modifiedEmailText: string) => {
    try {
      setLoading(true);
      console.log(
        'Generating Response of ' + modifiedEmailText + '. Please wait...'
      );
      const response = await fetch('https://chatgpt-42.p.rapidapi.com/gpt4', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key':
            '198bada44amshd95219dc04db750p14af07jsne52453168165-123',
          'X-RapidAPI-Host': 'chatgpt-42.p.rapidapi.com',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: modifiedEmailText,
            },
          ],
          web_access: false,
        }),
      });

      const data = await response.json();
      if (data.result) {
        console.log(data.result, 'API response DATA contain result');
        setResponseText(data.result);
      } else {
        console.log('API response does not contain result');
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const replyDiv = document.querySelector('.response');
    if (replyDiv && responseText) {
      replyDiv.innerHTML = responseText;
    }
  }, [responseText]);

  const handleResponseClick = (response: string) => {
    chrome.runtime.sendMessage({
      action: 'suggestedText',
      suggestion: response,
    });
    console.log(response);
  };

  const handleCloseButton = () => {
    chrome.runtime.sendMessage({ action: 'closeIframe' });
  };

  return (
    <div
      style={{
        ...containerStyle,
        display: 'flex',
        flexDirection: 'row-reverse',
      }}
    >
      <button
        className="close_button"
        style={closeButton}
        onClick={() => handleCloseButton()}
      >
        &#x2715;
      </button>
      <div>
        <h1 style={headingStyle}>Select Email Tone</h1>
        <select id="toneSelect" style={selectStyle} onChange={handleToneChange}>
          <option value="professional">formal</option>
          <option value="professional">Professional</option>
          <option value="professional">enthusiastic</option>
          <option value="not_interested">Not Interested</option>
          <option value="impower">Impower</option>
          <option value="attractive">Attractive</option>
        </select>
        <div>
          <img src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"></img>
          <p style={{ marginTop: '20px' }}>Select a response:</p>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  ...responseItemStyle,
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() =>
                  handleResponseClick(responseText || 'No response available')
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6e6e6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
              >
                {responseText || 'No response available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const spinnerStyle = `
.spinner {
  border: 3px solid rgba(255, 0, 0, 0.3); /* Red border */
  border-radius: 50%;
  border-top: 3px solid #87150b;
  width: 15px;
  height: 15px;
  animation: spin 1s linear infinite;
  margin: 4em auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = spinnerStyle;
document.head.appendChild(styleElement);

export default EmailSuggestions;
