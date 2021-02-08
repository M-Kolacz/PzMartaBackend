import { Schema, model, Document } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface UserInterface extends Document {
    email: string;
    password: string;
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
});

userSchema.plugin(uniqueValidator);

export default model<UserInterface>('User', userSchema);
