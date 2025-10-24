import moongoose from 'mongoose';

const userSchema = new moongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
}, { timestamps: true });

const User = moongoose.model('User', userSchema);

export default User;