document.getElementById('create-db').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'createNewDB' });
});