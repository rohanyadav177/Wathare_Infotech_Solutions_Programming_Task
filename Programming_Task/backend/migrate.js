const mongoose = require('mongoose');
const sampleData = require('./sample-data.json'); // Assuming sample data in JSON file

// Replace with your MongoDB connection string
const mongoURI = "mongodb://localhost:27017/task";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected');
    // Seed data into MongoDB on server start
    SampleData.deleteMany({}, (err) => {
      if (err) console.error(err);
      SampleData.insertMany(sampleData, (err) => {
        if (err) console.error(err);
        console.log('Sample data imported');
        mongoose.connection.close(); // Close the connection after importing data
      });
    });
  })
  .catch(err => console.error(err));
