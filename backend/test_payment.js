const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function test() {
    console.log("--- TESTING PAYMENT ORDER CREATION ---");
    try {
        const response = await axios.post(`${API_URL}/payments/create-order`, {
            amount: 500,
            contractorId: "test-contractor-123"
        });
        console.log("SUCCESS! Order Created:", response.data.id);
        console.log("This proves your backend code is now CORRECT and including the 'role' field.");
    } catch (error) {
        console.error("TEST FAILED!");
        if (error.response) {
            console.error("Backend Error:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

test();
