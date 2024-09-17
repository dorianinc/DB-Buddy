chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'createNewDB') {
        // Here, you'll execute the Playwright script
        // This could be done through an external service or a Node.js server
        fetch('http://localhost:3001/createNewDB')
          .then(response => response.json())
          .then(data => console.log('Database created:', data))
          .catch(error => console.error('Error:', error));
    }
});