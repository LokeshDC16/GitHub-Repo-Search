document.addEventListener('DOMContentLoaded', function () {
    // Initial page number
    let currentPage = 1;

    // Function to fetch data from the server
    async function fetchDataFromServer(username, page) {
        try {
            const response = await axios.get(`/api/repositories?username=${username}&page=${page}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching data from server:', error);
            throw error;
        }
    }

    // Function to fetch user's profile information
    async function fetchProfileInfo(username) {
        try {
            const response = await axios.get(`https://api.github.com/users/${username}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching profile information:', error);
            throw error;
        }
    }

    // Function to update user's profile on the frontend
    function updateProfile(profile) {
        const profileImage = document.getElementById('profile-image');
        const profileName = document.getElementById('profile-name');
        const profileBio = document.getElementById('profile-bio');
        const profileLocation = document.getElementById('profile-location');
        const profileTwitter = document.getElementById('profile-twitter');
        const profileGithub = document.getElementById('profile-github');

        profileImage.src = profile.avatar_url || ''; // Set the profile image source
        profileName.textContent = profile.name || 'Name not available';
        profileBio.textContent = profile.bio || 'Bio not available';
        profileLocation.textContent = profile.location ? `Location: ${profile.location}` : '';
        profileTwitter.href = profile.twitter_username ? `https://twitter.com/${profile.twitter_username}` : '#';
        profileGithub.href = profile.html_url || '#';
    }

    // Function to update repositories on the frontend
    function updateRepositories(repositories) {
        const repositoriesContainer = document.getElementById('repositories');
        repositoriesContainer.innerHTML = '';

        if (repositories.error) {
            // Display error message
            repositoriesContainer.innerHTML = `<p>${repositories.error}</p>`;
        } else {
            repositories.forEach(repository => {
                const repositoryElement = document.createElement('div');
                repositoryElement.classList.add('repository');
                repositoryElement.innerHTML = `
                    <h3>${repository.name}</h3>
                    <p>${repository.description || 'No description available.'}</p>
                    <p>Topics: ${repository.topics.join(', ') || 'No topics available.'}</p>
                    <!-- Add other relevant details -->
                `;
                repositoriesContainer.appendChild(repositoryElement);
            });
        }
    }

    // Function to handle pagination on the frontend
    function updatePagination() {
        document.getElementById('page-number').textContent = `Page ${currentPage}`;
    }

    // Function to handle search button click
    window.searchRepositories = async function () {
        const usernameInput = document.getElementById('username');
        const usernameValidationMessage = document.getElementById('username-validation-message');
        const username = usernameInput.value.trim();

        if (username) {
            try {
                const [profile, repositories] = await Promise.all([
                    fetchProfileInfo(username),
                    fetchDataFromServer(username, 1)
                ]);

                updateProfile(profile);
                updateRepositories(repositories);
                updatePagination();

                // Clear any previous validation messages
                usernameInput.setCustomValidity('');
                usernameValidationMessage.textContent = '';
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // User not found or has no public repositories
                    console.error('User not found or has no public repositories');
                    // Display an error message to the user
                    usernameInput.setCustomValidity('Incorrect username or no public repositories.');
                    usernameValidationMessage.textContent = 'Incorrect username or no public repositories.';
                } else {
                    // Handle other errors
                    console.error('Error handling search:', error);
                }
            }
        }
    };

    // Function to handle previous page button click
    window.previousPage = async function () {
        if (currentPage > 1) {
            currentPage--;
            const username = document.getElementById('username').value.trim();
            const repositories = await fetchDataFromServer(username, currentPage);
            updateRepositories(repositories);
            updatePagination();
        }
    };

    // Function to handle next page button click
    window.nextPage = async function () {
        currentPage++;
        const username = document.getElementById('username').value.trim();
        const repositories = await fetchDataFromServer(username, currentPage);
        updateRepositories(repositories);
        updatePagination();
    };
});
