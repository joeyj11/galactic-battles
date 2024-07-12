import axios from 'axios';
export async function admin(token: string){
    let isAdmin: boolean = false;
    try {
      const response = await axios.get('/api/validateAdmin', {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with the user's Firebase ID token
        },
      });
  
      if (response.data.message) {
        console.log('User is an admin');
        isAdmin = true;

      } else {
        console.log('User is not an admin');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    return isAdmin;
  }