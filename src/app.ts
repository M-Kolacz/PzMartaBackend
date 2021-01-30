import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import { corsMiddleware } from './middleware/cors';
import { errorMiddleware } from './middleware/error';

import userRouter from './routes/user';

const app = express();

app.use(bodyParser.json());

app.use(corsMiddleware);

app.use('/api/users', userRouter);

app.use(errorMiddleware);

(async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://M-Kolacz:dNzVmXMUmKPdiz3G@pzmarta.lsirx.mongodb.net/pzMarta?retryWrites=true&w=majority',
            { useNewUrlParser: true, useUnifiedTopology: true },
        );
    } catch (err) {
        console.log(err);
    }
    app.listen(8080);
})();
