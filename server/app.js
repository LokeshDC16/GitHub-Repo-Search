const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/repositories', async (req, res) => {
    try {
        const username = req.query.username;
        const page = req.query.page || 1;
        const perPage = 10;

        const githubResponse = await axios.get(`https://api.github.com/users/${username}/repos`, {
            params: {
                page,
                per_page: perPage,
            },
        });

        const repositories = githubResponse.data.map(repo => ({
            name: repo.name,
            description: repo.description,
            topics: repo.topics || [],
        }));

        res.json(repositories);
    } catch (error) {
        console.error('Error fetching GitHub data:', error);

        // Send an appropriate response to the client
        res.status(error.response ? error.response.status : 500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
