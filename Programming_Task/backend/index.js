const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;


const mongoURI = "mongodb://localhost:27017/WathareInfotechSolutions";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const SampleData = mongoose.model('programmingtask', new mongoose.Schema({
    ts: { type: String, required: true },
    machine_status: { type: Number, required: true }, 
    vibration: { type: Number, required: true } 
}));

app.use(cors());
app.use(bodyParser.json());


app.get('/data', async (req, res) => {
    const startTime = req.query.start_time ? new Date(req.query.start_time) : null;
    const endTime = req.query.end_time ? new Date(req.query.end_time) : null;

    let query = {};
    if (startTime && endTime) {
        query.ts = { $gte: startTime.toISOString(), $lte: endTime.toISOString() };
    }

    try {
        const data = await SampleData.find(query);
        const summary = calculateSummary(data); 
        res.json({ data, summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

app.get('/alldata', async (req, res) => {
    try {
        const allData = await SampleData.find();
        res.json(allData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching all data' });
    }
});

function calculateSummary(data) {
    const numOnes = data.filter(d => d.sample === 1).length;
    const numZeros = data.length - numOnes;
    // Implement logic to calculate continuous stretches (optional)
    return { numOnes, numZeros }; // Add continuous stretches data if implemented
}

app.listen(port, () => console.log(`Server running on port ${port}`));

