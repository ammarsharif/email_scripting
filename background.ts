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
          const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: textFinder,
             files: ['contentScript.js'],
          });
          if (result && result[0] && result[0].result) {
            const emailText = result[0].result;
            console.log('Response is generating Please wait....');
            clickHandler(emailText);
          }
        } else {
          console.log('No active tab found');
        }
      } catch (error) {
        console.log('Error querying tabs:' + error);
      }
    }
  );

});

const textFinder = () => {
  const parentDiv = document.querySelector('.ii.gt') as HTMLElement | null;
  if (parentDiv) {
    const innerDiv = parentDiv.querySelector('.a3s.aiL') as HTMLElement | null;
    if (innerDiv) {
      const emailText = innerDiv.innerText.trim();
      return `Please add give a formal reply to this email and don't add prompt like here is you email and all stuff just give me the proper response in a good way \n ${emailText}`;
    } else {
      console.log('Inner div not found.');
    }
  } else {
    console.log('Parent div not found.');
  }
};

const clickHandler = async (emailText: any) => {
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

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  console.log(message,'MESSAGE FROM THE HANDLETOKEN:::::');
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
      } catch (error) {
        console.error('Error fetching message details:', error);
      }
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
