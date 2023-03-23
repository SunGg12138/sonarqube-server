import app from './app';
import * as config from 'config';

const PORT = process.env.HTTP_PORT || config.get('port');

app.listen(PORT, function () {
    console.log('Server success run at %d port', PORT);
});
