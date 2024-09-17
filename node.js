const express = require('express');
const { createNewDB } = require('./playwright-script');
const app = express();

app.get('/', async (req, res) => {
    try {
        const dbDetails = await createNewDB();
        res.json({ success: true, dbDetails });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});