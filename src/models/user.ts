import { Schema, Model, Document, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface IUser extends Document {
    id: string;
    email: string;
    password: string;
}

const UserSchema: Schema = new Schema({
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

UserSchema.plugin(uniqueValidator);

const User: Model<IUser> = model<IUser>('User', UserSchema);

export default User;
