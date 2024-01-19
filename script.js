
let currentPage = 1;
let repositoriesPerPage = 10;

function getUserDetails() {
    showLoader();
    const username = document.getElementById('username').value;
    const apiUrl = `https://api.github.com/users/${username}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(user => {
            displayUserDetails(user);
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
        })
        .finally(() => {
            hideLoader();
        });
}

function displayUserDetails(user) {
    const userDetailsContainer = document.getElementById('user-details');
    userDetailsContainer.innerHTML = `
    <div class="row ">
        <div id="div-1" class="col-sm-3 m-5 d-flex align-items-center">
        <img src="${user.avatar_url}" alt="Profile Picture"
        class="col-sm-8 shadow-lg bg-body profile-pic">
    </div>
        <div class="col-sm-4">
        <h2 >${user.name || user.login} </h2>
            <p class="text-dark ">${user.login}</p>
            <p class=""><strong><span class="material-symbols-outlined">edit</span> ${user.bio}</strong> </p>
            <p class=""><strong><span class="material-symbols-outlined">group</span>
            ${user.followers} </strong> Followers
            <strong> ${user.following}</strong> Following </p>
            <p class="mt-2 "><strong> <span class="material-symbols-outlined">location_on </span> ${user.location} </strong>
            <p class=""><strong><span class="material-symbols-outlined">stacks</span> ${user.public_repos} </strong> Public Repositories </p>
            </div>
        <p class="col-sm-8 align-items-center"><strong> <span class="material-symbols-outlined"> link </span>
        </strong> <a href="${user.html_url}" target="_blank">${user.html_url}</a></p>
        
    </div>
    `;
}

function getRepositories() {
    showLoader();
    const username = document.getElementById('username').value;
    repositoriesPerPage = parseInt(document.getElementById('perPage').value);
    const pageOffset = (currentPage - 1) * repositoriesPerPage; // Calculate the correct page offset

    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${repositoriesPerPage}&page=${currentPage}`;

    fetch(apiUrl)
        .then(response => {
            const linkHeader = response.headers.get('Link');
            parseLinkHeader(linkHeader);
            return response.json();
        })
        .then(data => {
            displayRepositories(data);
            updatePaginationButtons();
        })
        .catch(error => {
            console.error('Error fetching repositories:', error);
        })
        .finally(() => {
            hideLoader();
        });
}


let totalPages = 1;
function parseLinkHeader(linkHeader) {
    hasNextPage = false;

    if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)&/);

        if (match) {
            hasNextPage = true;
            currentPage = parseInt(match[1]);
        }

        // Extract total pages from the last page link
        const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
        totalPages = lastPageMatch ? parseInt(lastPageMatch[1]) : 1;
    }
}

function displayRepositories(repositories) {
    const repositoriesList = document.getElementById('repositories');
    repositoriesList.innerHTML = '';

    const numColumns = 2;
    const reposPerColumn = Math.ceil(repositories.length / numColumns);

    for (const repo of repositories) {
        const listItem = document.createElement('li');
        listItem.classList.add('repository', 'col-sm-5', 'shadow', 'bg-white', 'px-3', 'rounded');
        const language = repo.language || 'Not specified';

        listItem.innerHTML = `
            <h4 class="text-primary">${repo.name}</h4>
            <p>${repo.description || 'No description available'}</p>
            <p><strong>Language:</strong> <button class="btn btn-primary btn-sm">${language}</button></p>
            <p><strong> GitHub Link:</strong>
            <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
        `;

        repositoriesList.appendChild(listItem);
    }
}


function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        getRepositories();
    }
}

function nextPage() {
    if (!hasNextPage) {
        currentPage++;
        getRepositories();
    }
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const paginationButtons = document.getElementById('pagination-buttons');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages; // Disable "Next Page" when on the last page

    // Clear existing pagination buttons
    paginationButtons.innerHTML = '';

    // Add buttons for each page
    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement('button');
        button.innerText = page;
        button.classList.add('btn', 'btn-outline-primary', 'mr-1','m-2');
        button.onclick = () => goToPage(page);
        paginationButtons.appendChild(button);
    }
}

function goToPage(page) {
    currentPage = page;
    getRepositories();
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

