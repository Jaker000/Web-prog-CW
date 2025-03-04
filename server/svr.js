import express from 'express';
const app = express();
app.use(express.static('./client'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/CW.html');
  });  
app.listen(8080);
