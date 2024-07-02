const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const API_URLS = {
    'p': 'http://20.244.56.144/test/primes',
    'f': 'http://20.244.56.144/test/fibonacci',
    'e': 'http://20.244.56.144/test/even',
    'r': 'http://20.244.56.144/test/random'
};

const AUTH_HEADER = {
    headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE5ODk3OTM2LCJpYXQiOjE3MTk4OTc2MzYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImE5ZDM1ZTg5LTZkMDQtNDcxMS05ZTZhLWI1M2U5YzhmMGJmZSIsInN1YiI6Im5hZ2FtYW5pa2FudGEyMDE1QGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6InNlc2hhZHJpIHJhbyBndWRsYXZhbGxlcnUgZW5naW5lZXJpbmcgY29sbGVnZSIsImNsaWVudElEIjoiYTlkMzVlODktNmQwNC00NzExLTllNmEtYjUzZTljOGYwYmZlIiwiY2xpZW50U2VjcmV0IjoieUdwQ2FKVmZSRm9kdGFzbSIsIm93bmVyTmFtZSI6Im5hZ2EgbWFuaWthbnRhIG1hbmFtIiwib3duZXJFbWFpbCI6Im5hZ2FtYW5pa2FudGEyMDE1QGdtYWlsLmNvbSIsInJvbGxObyI6IjIxNDgxYTU0NzYifQ.7oXIEzDVhbt6voOpFqV2njqGQ5ibVE3e3rNh3aMg6_4'
    }
};

let numberWindow = [];

app.get('/numbers/:type', async (req, res) => {
    const type = req.params.type;
    const apiUrl = API_URLS[type];

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid number type' });
    }

    try {
        const response = await axios.get(apiUrl, { timeout: 500, ...AUTH_HEADER });
        const numbers = response.data.numbers;
        const uniqueNumbers = Array.from(new Set(numbers));

        const windowPrevState = [...numberWindow];
        uniqueNumbers.forEach(number => {
            if (!numberWindow.includes(number)) {
                if (numberWindow.length >= WINDOW_SIZE) {
                    numberWindow.shift();
                }
                numberWindow.push(number);
            }
        });

        const windowCurrState = [...numberWindow];
        const avg = numberWindow.length > 0 
            ? (numberWindow.reduce((acc, num) => acc + num, 0) / numberWindow.length).toFixed(2)
            : 0.00;

        res.json({
            windowPrevState,
            windowCurrState,
            numbers: uniqueNumbers,
            avg: parseFloat(avg)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch numbers from third-party API' });
    }
});

app.listen(PORT, () => {
    console.log(`Average Calculator Microservice running on port ${PORT}`);
});
