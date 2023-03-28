import app from './app';
import * as config from 'config';

const PORT = process.env.HTTP_PORT || config.get('port');
const NODE_ENV = process.env.NODE_ENV || 'default';

app.listen(PORT, function () {
    console.log(`[${NODE_ENV}]Server success run at %d port`, PORT);
});
