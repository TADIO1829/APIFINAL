import app from './src/server.js'
import connection from './src/database.js';

app.listen(app.get('port'),()=>{
    console.log(`Server ok on http://localhost:${app.get('port')}`);
})
connection()