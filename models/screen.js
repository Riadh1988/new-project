import { Schema, model, models } from 'mongoose';

const screenSchema = new Schema({
    screen: { type: String, required: true }
});

const Screen = models.Screen || model('Screen', screenSchema);
export default Screen;