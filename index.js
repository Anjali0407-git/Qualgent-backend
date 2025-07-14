const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const categoryRoutes = require('./routes/Category');
const authRoutes = require('./routes/auth');
const testCaseRoutes = require("./routes/testCase");
const fileRoutes = require("./routes/files");


const app = express();
app.use(express.json());
// enable CORS for _any_ origin
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.get('/', (req, res) => {
  res.send('Server working');
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/testcases", testCaseRoutes);
app.use("/api/files", fileRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch(err => console.log(err));
