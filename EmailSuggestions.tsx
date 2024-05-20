import React, { ChangeEvent, useEffect, useState } from 'react';

const EmailSuggestions: React.FC = () => {
  const containerStyle = {
    backgroundColor: '#f7f7f7',
    padding: '20px',
    width: '525px',
    margin: '-12px',
    paddingBottom: '17em',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '17px',
    fontWeight: 'bold',
    marginBottom: '10px',
    marginTop: '10px',
    marginLeft: '12px',
  };

  const header = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  };

  const logoHeader = {
    display: 'flex',
    alignItems: 'center',
  };

  const toneHeader = {
    display:'flex'
  };

  const toneHeaderText = {
    width: '100%',
    padding: '7px 0px 0px 3px',
    marginTop: '10px',
    fontSize: '15px',
  };

  const dividerStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    margin: '18px 0px 10px 0px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const selectContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cfcfcf',
    borderRadius: '5px',
    marginRight: '15px',
  };

  const selectStyle = {
    width: '60%',
    padding: '10px 24px 10px 18px',
    borderRadius: '10px',
    border: 'none',
    margin: '0px',
    backgroundColor: '#deedff',
    fontSize: '15px',
  };

  const selectorStyle = {
    marginRight: '0px',
  };
  
  const iconStyle = {
    display:'flex',
    marginRight: '5px',
    marginLeft: '10px',
    alignItems: 'center',
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
    marginTop: '0px',
    height: '25px',
    fontSize: '20px',
    color: '#87150b',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const [responseText, setResponseText] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('formal');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'receiveEmailText') {
        const emailText = `Please add give a formal reply to this email and don't add prompt like here is you email and all stuff just give me the proper response in a good way \n ${message?.response}\nalso remember not to add Dear [Recipient's Name], or best regards in the reply or any other irrelevent things and make sure the reply should be short and simple not of big length`;
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
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Authorization':
            'Bearer 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-123',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: modifiedEmailText,
            },
          ],
          model: 'mixtral-8x7b-32768',
        }),
      });

      const dataJson = await response.json();
      const data = dataJson.choices[0].message.content;
      console.log(data,'DATA FROM THE API::::');
      
      if (data) {
        console.log(data, 'API response DATA contain result');
        setResponseText(data);
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
      }}
    >
      <div>
        <div style={header}>
          <div style={logoHeader}>
            <img
              src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"
              height={'28px'}
              width={'28px'}
              style={{ borderRadius: '50%' }}
            ></img>
            <p style={headingStyle}>Email Reply Tone</p>
          </div>
          <div style={toneHeader}>
          <div style={selectContainerStyle}>
          <div style={selectorStyle}>
            <span role="img" aria-label="Bulb" style={iconStyle}>
            <img src='https://image.similarpng.com/very-thumbnail/2020/08/Shining-bright-idea-light-bulb-with-cogs-on-transparent-background-PNG.png' height={'20px'} width={'20px'}></img>
            <p style={toneHeaderText}>Tone</p>
            </span>
          </div>
          <select
            id="toneSelect"
            style={{...selectStyle, WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none'}}
            onChange={handleToneChange}
          >
            <option value="formal">👔 Formal</option>
            <option value="professional">💼 Professional</option>
            <option value="enthusiastic">🌟 Enthusiastic</option>
            <option value="not_interested">🚫 Not Interested</option>
            <option value="impower">💪 Empower</option>
            <option value="attractive">😍 Attractive</option>
          </select>
        </div>
            <button
              className="close_button"
              style={closeButton}
              onClick={() => handleCloseButton()}
            >
              &#x2715;
            </button>
          </div>
        </div>
        <hr style={dividerStyle} />
        <div>
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
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6e6e6';
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
  border: 3px solid rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  border-top: 3px solid #87150b;
  width: 25px;
  height: 25px;
  animation: spin 1s linear infinite;
  margin: 9em auto;
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
