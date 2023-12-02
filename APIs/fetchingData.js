export default function DataFetching(latt, lngg) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const apiUrl = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latt}&longitude=${lngg}`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            throw error; 
        });
}
