* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #0f172a;
    color: #f8fafc;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.card {
    background-color: #1e293b;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    text-align: center;
    max-width: 450px;
    width: 90%;
}

h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #38bdf8;
}

p {
    margin-bottom: 1.5rem;
    color: #94a3b8;
    line-height: 1.5;
}

button {
    background-color: #0284c7;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
}

button:hover {
    background-color: #0369a1;
}

#mensagem {
    margin-top: 1rem;
    color: #4ade80;
    font-weight: bold;
}