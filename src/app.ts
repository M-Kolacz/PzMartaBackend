import express from 'express';
import mongoose from 'mongoose';
import sgMail from '@sendgrid/mail';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';

dotenv.config();
sgMail.setApiKey(process.env.SEND_GRID_API!);

import { corsMiddleware } from './middleware/cors';
import { errorMiddleware } from './middleware/error';

import { USER_ROUTES } from './routes/paths/appPaths';

import userRouter from './routes/user';

const app = express();

app.use(bodyParser.json());

app.use(corsMiddleware);

app.use(USER_ROUTES, userRouter);

app.use(errorMiddleware);

(async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.log(err);
    }
    app.listen(8080);
})();
