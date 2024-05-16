let emailText = null;
export async function getAuthToken(): Promise<string | undefined> {
  return new Promise((resolve) => {
    chrome?.identity?.getAuthToken({ interactive: true }, (token) => {
      console.log(token,'token::::::');
      
      if (token) {
        resolve(token);
      } else {
        console.error("Error obtaining token:", chrome.runtime.lastError);
        resolve(undefined);
      }
    });
  });
}

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'getMessageDetails') {
    const {messageId, accessToken} = message
    {
      try {
        const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const messageDetails = await response.json();
        console.log('Message Details::::::', messageDetails.snippet);
        emailText = messageDetails.snippet;
      } catch (error) {
        console.error('Error fetching message details:', error);
      }
    } 
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  chrome?.tabs?.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      try {
        const [tab] = await chrome?.tabs?.query({
          active: true,
          currentWindow: true,
        });

        if (tab && tab.id) {
            clickHandler();          
        } else {
          console.log('No active tab found');
        }
      } catch (error) {
        console.log('Error querying tabs:' + error);
      }
    }
  );

});

const clickHandler = async () => {
      const tabs = await chrome?.tabs?.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'clickReplyButton' });
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'receiveEmailText',
          response: emailText,
        });
      } else {
        console.log('No active tab found');
      }
      console.log('API response does not contain result');
};

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'generateEmailText') {
    const suggestedText = message.selectedTone;
    const tabs = await chrome?.tabs?.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'generateEmailText',
        suggestedText: suggestedText,
      });
    }
  }
});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'suggestedText') {
    const suggestedText = message.suggestion;
    const tabs = await chrome?.tabs?.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'suggestedText',
        suggestedText: suggestedText,
      });
    }
  }
});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'closeIframe') {
    const tabs = await chrome?.tabs?.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'closeIframe' });
    }
  }
});



chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  
  if (message.action === 'authenticateWithGoogle') {
    const token = await getAuthToken();
      if (!chrome.runtime.lastError && token) {
        const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        const data = await response.json();
        console.log("Gmail Messages:", data);
        if(sender?.tab?.id)
        chrome.tabs.sendMessage(sender.tab.id, { action: 'handleAuthToken', token: token });
      } else {
        console.error("Error obtaining token:", chrome.runtime.lastError);
      }
  }
});
