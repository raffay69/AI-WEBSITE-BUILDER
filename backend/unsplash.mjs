export const fetchImage = async (query) => {
    const ACCESS_KEY = 'DG0IiMw_i1Ng-QIfr8HAQMNrjR-ccYXVFWE5jDr85uY'; // Replace with Unsplash API Key
    const url = `https://api.unsplash.com/photos/random?query=${query}&client_id=${ACCESS_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      // console.log(data.urls.regular); // Image URL
      return data.urls.regular;
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };
  
  fetchImage();
  