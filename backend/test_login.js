const login = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: '9999999999',
                password: 'password123'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login Successful:', data);
        } else {
            console.error('Login Failed:', data);
        }
    } catch (error) {
        console.error('Network Error:', error.message);
    }
};

login();
